import { CornerDownLeft, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { rescueWord, type Rescue } from '../lib/ai';
import { addVocab } from '../lib/store';
import { insertIntoAnswer, isTypingTarget, setUi, toast, useUi } from '../lib/ui';
import { SpeakButton } from './Speak';
import { Btn, ErrorBox, ExampleText, Label, Sheet, Spinner } from './ui';

/** Global Ctrl+K / "/" shortcut + sheet. Rendered once in App. */
export function WordRescue() {
  const open = useUi((s) => s.rescueOpen);
  const context = useUi((s) => s.context);
  const [q, setQ] = useState('');
  const [res, setRes] = useState<Rescue | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setUi({ rescueOpen: true });
      } else if (e.key === '/' && !isTypingTarget(e.target)) {
        e.preventDefault();
        setUi({ rescueOpen: true });
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    if (open) {
      setQ('');
      setRes(null);
      setErr(null);
      setTimeout(() => input.current?.focus(), 50);
    }
  }, [open]);

  const go = async () => {
    const w = q.trim();
    if (!w) return;
    setLoading(true);
    setErr(null);
    setRes(null);
    try {
      const r = await rescueWord(w, context);
      setRes(r);
      const added = addVocab({
        en: r.best_en,
        cz: r.cz || w,
        pos: r.pos,
        example: r.example,
        collocation: r.collocation,
        source: 'rescue',
      });
      if (added) toast(`„${r.best_en}“ přidáno do slovíček`);
    } catch (e) {
      setErr(String((e as Error).message ?? e));
    } finally {
      setLoading(false);
    }
  };

  const close = () => setUi({ rescueOpen: false });
  const insert = (t: string) => {
    if (insertIntoAnswer(t)) {
      toast('Vloženo do odpovědi');
      close();
    }
  };

  return (
    <Sheet open={open} onClose={close} title="Nevím slovo – záchranný slovník">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="České slovo… (např. odložit)"
            enterKeyHint="search"
            autoCapitalize="off"
            className="w-full h-11 rounded-xl border border-line bg-surface-2 pl-9 pr-3 text-[16px] outline-none focus:border-accent/60"
          />
        </div>
        <Btn variant="primary" type="submit" loading={loading}>
          Najít
        </Btn>
      </form>
      {context && (
        <div className="mt-2 text-[11px] text-muted truncate">
          Kontext: „{context}“
        </div>
      )}

      <div className="mt-4">
        {loading && <Spinner label="Hledám nejlepší výraz…" />}
        {err && <ErrorBox error={err} onRetry={go} />}
        {res && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-2xl font-semibold">{res.best_en}</div>
                <div className="text-xs text-muted">
                  {res.pos} · {res.cz}
                </div>
              </div>
              <SpeakButton text={res.best_en} />
            </div>
            <Btn variant="secondary" className="w-full" onClick={() => insert(res.best_en)}>
              <CornerDownLeft className="size-4" /> Vložit do mé odpovědi
            </Btn>
            {res.options.length > 1 && (
              <div className="space-y-1.5">
                <Label>Další možnosti</Label>
                {res.options
                  .filter((o) => o.en.toLowerCase() !== res.best_en.toLowerCase())
                  .map((o) => (
                    <button
                      key={o.en}
                      onClick={() => insert(o.en)}
                      className="w-full text-left flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2 hover:bg-surface-2"
                    >
                      <span>
                        <span className="font-medium">{o.en}</span>
                        <span className="text-xs text-muted"> – {o.when_cz}</span>
                      </span>
                      <SpeakButton text={o.en} compact />
                    </button>
                  ))}
              </div>
            )}
            {res.collocation && (
              <div>
                <Label>Kolokace</Label>
                <div className="mt-1 text-sm">{res.collocation}</div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <ExampleText text={res.example} className="text-sm flex-1" />
              <SpeakButton text={res.example} compact />
            </div>
            <div className="text-[11px] text-muted">Automaticky uloženo do slovíček k procvičení.</div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
