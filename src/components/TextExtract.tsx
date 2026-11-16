import { Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { extractVocab, type ExtractedWord } from '../lib/ai';
import { hasKey } from '../lib/llm';
import { addVocab, hasVocab } from '../lib/store';
import { toast, useOnline } from '../lib/ui';
import { Btn, ErrorBox, ExampleText, Sheet, Spinner, cx } from './ui';

/** Paste any English text (article, lyrics, email) and pick the words worth learning. */
export function TextExtract({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState('');
  const [words, setWords] = useState<ExtractedWord[] | null>(null);
  const [pick, setPick] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const online = useOnline();

  const run = async () => {
    setBusy(true);
    setErr(null);
    try {
      const w = (await extractVocab(text)).filter((x) => !hasVocab(x.en));
      setWords(w);
      setPick(new Set(w.map((x) => x.en)));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const save = () => {
    let n = 0;
    for (const w of words ?? [])
      if (pick.has(w.en) && addVocab({ en: w.en, cz: w.cz, pos: w.pos, example: w.example.includes('{') ? w.example : `{${w.en}}`, collocation: w.collocation || undefined, source: 'click' })) n++;
    toast(`Přidáno ${n} slovíček`);
    setWords(null);
    setText('');
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Slovíčka z vlastního textu">
      {!words ? (
        <div className="space-y-3">
          <div className="text-xs text-muted">Vlož anglický text: článek, e-mail z práce, text písničky… AI vybere slovíčka, která se vyplatí naučit.</div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder="Sem vlož anglický text…"
            className="w-full resize-none rounded-2xl border border-line bg-surface-2 px-3 py-2.5 text-[16px] outline-none focus:border-accent/60"
          />
          {busy && <Spinner label="Vybírám slovíčka…" />}
          {err && <ErrorBox error={err} />}
          <Btn variant="primary" className="h-12 w-full" disabled={text.trim().length < 40 || busy || !online || !hasKey()} onClick={run}>
            <Sparkles className="size-4" /> Najít slovíčka
          </Btn>
          {(!online || !hasKey()) && <div className="text-center text-[11px] text-muted">Potřebuje internet a API klíč.</div>}
        </div>
      ) : (
        <div className="space-y-3">
          {words.length === 0 && <div className="text-sm text-muted">Nic nového jsem nenašel, vše už máš ve slovíčkách.</div>}
          <div className="max-h-[50dvh] space-y-2 overflow-y-auto">
            {words.map((w) => {
              const on = pick.has(w.en);
              return (
                <button
                  key={w.en}
                  onClick={() => setPick((p) => (p.has(w.en) ? new Set([...p].filter((x) => x !== w.en)) : new Set(p).add(w.en)))}
                  className={cx('flex w-full items-start gap-3 rounded-2xl border p-3 text-left', on ? 'border-accent/50 bg-accent/8' : 'border-line')}
                >
                  <span className={cx('mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border', on ? 'border-accent bg-accent text-white' : 'border-line')}>
                    {on && <Check className="size-3.5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {w.en} <span className="font-normal text-muted">· {w.cz}</span>
                    </span>
                    <span className="block text-xs text-muted">
                      <ExampleText text={w.example} />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Btn className="flex-1" onClick={() => setWords(null)}>
              Zpět
            </Btn>
            <Btn variant="primary" className="flex-1" disabled={!pick.size} onClick={save}>
              Přidat ({pick.size})
            </Btn>
          </div>
        </div>
      )}
    </Sheet>
  );
}
