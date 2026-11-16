import { Plus, Send, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { IconTile } from '../components/icons';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, ErrorBox, ModeHeader, Spinner, cx } from '../components/ui';
import { askTutor, type TutorAnswer } from '../lib/ai';
import { hasKey } from '../lib/llm';
import { navigate } from '../lib/router';
import { addVocab, hasVocab, recordActivity } from '../lib/store';
import { toast, useOnline } from '../lib/ui';

interface Turn {
  q: string;
  a?: TutorAnswer;
}

const KEY = 'ajna-tutor-chat';
const SUGGESTIONS = [
  'Jaký je rozdíl mezi make a do?',
  'Kdy použít „the“ a kdy „a“?',
  'Rozdíl mezi present perfect a minulým časem?',
  'Jak se řekne „mít rád“ a „líbit se“?',
  'Kdy je „for“ a kdy „since“?',
  'Jak zdvořile o něco požádat?',
];

function load(): Turn[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

/** Ask an AI English tutor anything, in Czech. History is kept on this device only. */
export default function Tutor() {
  const [turns, setTurns] = useState<Turn[]>(load);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const online = useOnline();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(turns.slice(-30)));
    } catch {
      /* optional */
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, busy]);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || busy) return;
    setQ('');
    setErr(null);
    const history = turns.filter((t) => t.a).map((t) => ({ q: t.q, a: t.a!.answer_cz }));
    setTurns((t) => [...t, { q: text }]);
    setBusy(true);
    try {
      const a = await askTutor(text, history);
      setTurns((t) => t.map((x, i) => (i === t.length - 1 ? { ...x, a } : x)));
      recordActivity('tutor', 2);
    } catch (e) {
      setErr((e as Error).message);
      setTurns((t) => t.slice(0, -1));
      setQ(text);
    } finally {
      setBusy(false);
    }
  };

  const ready = online && hasKey();

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col">
      <ModeHeader
        title="Zeptej se"
        subtitle="AI učitel odpoví česky s příklady"
        right={
          turns.length > 0 ? (
            <Btn variant="ghost" className="h-9 px-2" aria-label="Smazat konverzaci" onClick={() => setTurns([])}>
              <Trash2 className="size-4" />
            </Btn>
          ) : undefined
        }
      />

      <div className="flex-1 space-y-4">
        {turns.length === 0 && (
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <IconTile name="bulb" tone="amber" />
              <div className="text-sm">Zeptej se na gramatiku, slovíčka, rozdíly mezi slovy nebo jak něco říct přirozeně.</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} disabled={!ready} onClick={() => ask(s)} className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-left text-xs hover:border-accent/50 disabled:opacity-50">
                  {s}
                </button>
              ))}
            </div>
          </Card>
        )}

        {turns.map((t, i) => (
          <div key={i} className="space-y-2">
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-sm text-white">{t.q}</div>
            {t.a && (
              <Card className="max-w-[95%] space-y-3 rounded-bl-md animate-up">
                <div className="whitespace-pre-line text-[15px] leading-relaxed">{t.a.answer_cz}</div>
                {t.a.examples.length > 0 && (
                  <div className="space-y-2 border-t border-line pt-3">
                    {t.a.examples.map((e) => (
                      <div key={e.en} className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{e.en}</div>
                          <div className="text-xs text-muted">{e.cz}</div>
                        </div>
                        <SpeakButton text={e.en} compact />
                      </div>
                    ))}
                  </div>
                )}
                {t.a.words.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 border-t border-line pt-3">
                    {t.a.words.map((w) => {
                      const has = hasVocab(w.en);
                      return (
                        <button
                          key={w.en}
                          disabled={has}
                          onClick={() => {
                            if (addVocab({ en: w.en, cz: w.cz, pos: w.pos, example: w.example.includes('{') ? w.example : `{${w.en}}`, source: 'click' })) toast(`Uloženo: ${w.en}`);
                            setTurns((x) => [...x]);
                          }}
                          className={cx(
                            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs',
                            has ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400' : 'border-accent/40 text-accent',
                          )}
                        >
                          {!has && <Plus className="size-3" />} {w.en} <span className="text-muted">· {w.cz}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}
          </div>
        ))}
        {busy && <Spinner label="Přemýšlím…" />}
        {err && <ErrorBox error={err} />}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 -mx-4 mt-4 border-t border-line bg-bg/90 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        {!ready ? (
          <div className="text-center text-xs text-muted">
            Potřebuje internet a API klíč.{' '}
            <button className="text-accent underline" onClick={() => navigate('settings')}>
              Nastavení
            </button>
          </div>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(q);
            }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Napiš otázku…"
              className="h-12 flex-1 rounded-2xl border border-line bg-surface-2 px-4 text-[16px] outline-none focus:border-accent/60"
            />
            <Btn variant="primary" type="submit" className="h-12 w-12 px-0" disabled={!q.trim() || busy} aria-label="Odeslat">
              <Send className="size-5" />
            </Btn>
          </form>
        )}
      </div>
    </div>
  );
}

