import { BookmarkCheck, BookmarkPlus, ChevronRight, Plus, RefreshCw, Repeat, Sparkles, Timer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Warnings } from '../components/FeedbackCard';
import { MicRecorder } from '../components/MicRecorder';
import { SpeakButton } from '../components/Speak';
import { ClickableText } from '../components/WordPopover';
import { Btn, Card, ErrorBox, Label, ModeHeader, Spinner, cx } from '../components/ui';
import { MONOLOGUE_PROMPTS } from '../data/content';
import { reformulate, type Reformulation } from '../lib/ai';
import { speak } from '../lib/speech';
import { addVocab, hasVocab, isMistakeSaved, saveMistake, useStore } from '../lib/store';
import type { Evaluation } from '../lib/types';
import { toast, useAction } from '../lib/ui';

const LIMIT = 60;

function words(s: string) {
  return s.toLowerCase().replace(/[^a-z'\s]/g, ' ').split(/\s+/).filter(Boolean);
}
/** % of reference words reproduced in order (LCS / reference length). */
function similarity(ref: string, said: string) {
  const a = words(ref);
  const b = words(said);
  if (!a.length) return 0;
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return Math.round((dp[a.length][b.length] / a.length) * 100);
}

export default function Monologue() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * MONOLOGUE_PROMPTS.length));
  const [left, setLeft] = useState(LIMIT);
  const [running, setRunning] = useState(false);
  const [stopSig, setStopSig] = useState<number | undefined>(undefined);
  const [transcript, setTranscript] = useState('');
  const [res, setRes] = useState<Reformulation | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [shadow, setShadow] = useState<{ said: string; score: number } | null>(null);
  const [shadowMode, setShadowMode] = useState(false);
  const autoSave = useStore((s) => s.settings.autoSaveMistakes);
  useStore((s) => s.vocab.length + s.mistakes.length);
  const prompt = MONOLOGUE_PROMPTS[idx];

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(t);
          setRunning(false);
          setStopSig(Date.now());
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const asEval = useMemo<Evaluation | null>(
    () =>
      res && {
        user_transcript: transcript,
        grammatical_fix: res.corrected,
        native_version: res.native_b2,
        czenglish_warnings: res.czenglish_warnings,
        explanation_cz: res.explanation_cz,
        is_correct: !res.czenglish_warnings.length,
        passed: true,
        main_pattern: res.main_pattern,
      },
    [res, transcript],
  );

  useEffect(() => {
    if (asEval && autoSave && asEval.czenglish_warnings.length && !isMistakeSaved(asEval.user_transcript)) {
      saveMistake(asEval, 'monologue', prompt.cz);
      toast('Automaticky uloženo do Banky chyb');
    }
  }, [asEval]); // eslint-disable-line react-hooks/exhaustive-deps

  useAction('replay', res ? () => speak(res.native_b2) : null);
  useAction('save', asEval ? () => saveMistake(asEval, 'monologue', prompt.cz) && toast('Uloženo do Banky chyb') : null);

  const newPrompt = () => {
    setIdx((i) => (i + 1 + Math.floor(Math.random() * (MONOLOGUE_PROMPTS.length - 1))) % MONOLOGUE_PROMPTS.length);
    setLeft(LIMIT);
    setRunning(false);
    setRes(null);
    setTranscript('');
    setShadow(null);
    setShadowMode(false);
    setErr(null);
  };

  const submit = async (text: string) => {
    setRunning(false);
    setTranscript(text);
    setBusy(true);
    setErr(null);
    try {
      setRes(await reformulate(prompt.en, text));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const pct = (left / LIMIT) * 100;
  const saved = asEval ? isMistakeSaved(asEval.user_transcript) : false;

  return (
    <div>
      <ModeHeader
        title="60s monolog"
        subtitle="Mluv volně – chyby nevadí"
        right={
          <Btn variant="ghost" className="h-10 px-3" onClick={newPrompt} aria-label="Jiné téma">
            <RefreshCw className="size-4" />
          </Btn>
        }
      />
      <div className="space-y-4">
        <Card>
          <Label>Téma</Label>
          <div className="mt-2 text-xl font-medium leading-snug">{prompt.en}</div>
          <div className="text-sm text-muted">{prompt.cz}</div>
        </Card>

        {!res && (
          <>
            <div className="flex items-center gap-3">
              <div className="relative size-14">
                <svg viewBox="0 0 36 36" className="size-14 -rotate-90">
                  <circle cx="18" cy="18" r="16" className="stroke-surface-3" strokeWidth="3" fill="none" />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    className={cx('transition-all', left <= 10 ? 'stroke-red-500' : 'stroke-accent')}
                    strokeDasharray={`${(pct / 100) * 100.5} 100.5`}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-sm font-semibold tabular-nums">{left}</div>
              </div>
              <div className="text-xs text-muted flex-1">
                <Timer className="inline size-3.5 mr-1" />
                Časovač se spustí, jakmile začneš mluvit. Pauzy jsou v pořádku – prostě pokračuj.
              </div>
            </div>
            <MicRecorder
              resetKey={idx}
              onSubmit={submit}
              busy={busy}
              stopSignal={stopSig}
              placeholder="Tvůj monolog se objeví tady…"
              onListeningChange={(l) => l && left > 0 && setRunning(true)}
              submitLabel="Přeformulovat"
            />
            {busy && <Spinner label="Píšu rodilou verzi…" />}
          </>
        )}
        {err && <ErrorBox error={err} onRetry={() => submit(transcript)} />}

        {res && asEval && (
          <Card className="space-y-4 animate-up">
            <div className="flex justify-end">
              <Btn variant="ghost" className="h-9 px-2.5" onClick={() => saveMistake(asEval, 'monologue', prompt.cz) && toast('Uloženo')}>
                {saved ? <BookmarkCheck className="size-4 text-accent" /> : <BookmarkPlus className="size-4" />}
                <span className="text-xs">{saved ? 'V Bance chyb' : 'Uložit'}</span>
              </Btn>
            </div>
            <div>
              <Label>1 · Tvoje slova, lehce opravená</Label>
              <div className="mt-1 text-[15px] leading-relaxed">{res.corrected}</div>
            </div>
            <div className="rounded-xl bg-accent/8 border border-accent/25 p-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <Label className="flex items-center gap-1.5 text-accent">
                  <Sparkles className="size-3.5" /> 2 · Native B2 Reformulation
                </Label>
                <SpeakButton text={res.native_b2} />
              </div>
              <ClickableText text={res.native_b2} className="text-[16px] leading-relaxed" />
            </div>

            <Warnings items={res.czenglish_warnings} />

            {res.explanation_cz.length > 0 && (
              <ul className="space-y-1 text-sm">
                {res.explanation_cz.map((x, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-accent">•</span>
                    {x.replace(/^[-•]\s*/, '')}
                  </li>
                ))}
              </ul>
            )}

            {res.key_phrases.length > 0 && (
              <div className="space-y-1.5">
                <Label>Užitečné fráze</Label>
                {res.key_phrases.map((k) => (
                  <div key={k.en} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{k.en}</div>
                      <div className="text-xs text-muted">{k.cz}</div>
                    </div>
                    <SpeakButton text={k.en} compact />
                    <button
                      aria-label="Uložit"
                      disabled={hasVocab(k.en)}
                      onClick={() =>
                        addVocab({ en: k.en, cz: k.cz, pos: 'phrase', example: res.native_b2.includes(k.en) ? sentenceWith(res.native_b2, k.en) : `{${k.en}}`, source: 'click' }) &&
                        toast('Uloženo do slovíček')
                      }
                      className="size-8 grid place-items-center rounded-lg border border-line text-muted hover:text-fg disabled:opacity-40"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-line pt-4 space-y-3">
              <Label className="flex items-center gap-1.5">
                <Repeat className="size-3.5" /> 3 · Shadowing
              </Label>
              {!shadowMode ? (
                <Btn
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setShadowMode(true);
                    speak(res.native_b2, { rate: 0.8 });
                  }}
                >
                  <Repeat className="size-4" /> Shadowing Practice
                </Btn>
              ) : (
                <>
                  <div className="text-xs text-muted">
                    Poslechni si text (0.8×) a pak ho nahlas zopakuj. Můžeš mluvit současně s nahrávkou.
                  </div>
                  <MicRecorder
                    resetKey={`shadow-${idx}`}
                    submitLabel="Porovnat"
                    placeholder="Zopakuj rodilou verzi…"
                    onSubmit={(t) => setShadow({ said: t, score: similarity(res.native_b2, t) })}
                  />
                  {shadow && (
                    <div className="rounded-xl border border-line p-3 text-sm animate-up">
                      <div className="flex items-center justify-between">
                        <span>Shoda s předlohou</span>
                        <span
                          className={cx(
                            'text-lg font-semibold tabular-nums',
                            shadow.score >= 80 ? 'text-emerald-500' : shadow.score >= 55 ? 'text-amber-500' : 'text-red-500',
                          )}
                        >
                          {shadow.score}%
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted">
                        {shadow.score >= 80 ? 'Výborně! Zkus to ještě jednou rychleji.' : 'Pusť si to znovu a zkus to po kouskách.'}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        )}
        {res && (
          <Btn variant="primary" className="w-full" onClick={newPrompt}>
            Další téma <ChevronRight className="size-4" />
          </Btn>
        )}
      </div>
    </div>
  );
}

function sentenceWith(text: string, phrase: string) {
  const s = text.split(/(?<=[.!?])\s+/).find((x) => x.toLowerCase().includes(phrase.toLowerCase())) ?? text;
  const i = s.toLowerCase().indexOf(phrase.toLowerCase());
  return i < 0 ? s : `${s.slice(0, i)}{${s.slice(i, i + phrase.length)}}${s.slice(i + phrase.length)}`;
}
