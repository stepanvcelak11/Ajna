import { Check, ChevronRight, RotateCcw, SkipForward, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FeedbackCard } from '../components/FeedbackCard';
import { MicRecorder } from '../components/MicRecorder';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, ErrorBox, ExampleText, Label, ModeHeader, Spinner, cx } from '../components/ui';
import { evaluate } from '../lib/ai';
import { hasKey } from '../lib/llm';
import { useOnline } from '../lib/ui';
import { navigate } from '../lib/router';
import { formatInterval, isDue, review } from '../lib/srs';
import { getState, setState } from '../lib/store';
import type { Evaluation, VocabCard } from '../lib/types';
import { IconTile, LangBadge } from '../components/icons';

const SESSION_MAX = 20;

/** Ensure the example contains a {gap}; if not, try to find the target word in it. */
export function withGap(card: VocabCard) {
  if (card.example.includes('{')) return card.example;
  const i = card.example.toLowerCase().indexOf(card.en.toLowerCase());
  if (i >= 0) return `${card.example.slice(0, i)}{${card.example.slice(i, i + card.en.length)}}${card.example.slice(i + card.en.length)}`;
  return `${card.example} → {${card.en}}`;
}

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lev(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

export function recallMatches(card: VocabCard, answer: string) {
  const gap = withGap(card).match(/\{([^}]+)\}/)?.[1] ?? card.en;
  const a = norm(answer);
  const targets = [norm(gap), norm(card.en)];
  for (const t of targets) {
    if (!t) continue;
    if (` ${a} `.includes(` ${t} `)) return true;
    if (lev(a, t) <= Math.max(1, Math.floor(t.length / 6))) return true;
  }
  // all content words of the base form present (e.g. "turned out" vs "turn out")
  const parts = norm(card.en).split(' ').filter((w) => w.length > 2);
  return parts.length > 0 && parts.every((p) => a.split(' ').some((w) => w.startsWith(p.slice(0, Math.max(3, p.length - 2)))));
}

function grade(id: string, quality: number) {
  setState((s) => ({
    ...s,
    vocab: s.vocab.map((v) => (v.id === id ? { ...v, srs: review(v.srs, quality) } : v)),
  }));
}

export default function VocabReview() {
  const queue = useMemo(
    () =>
      getState()
        .vocab.filter((v) => isDue(v.srs.dueDate))
        .sort((a, b) => a.srs.dueDate.localeCompare(b.srs.dueDate))
        .slice(0, SESSION_MAX),
    [],
  );
  const [i, setI] = useState(0);
  const [step, setStep] = useState<1 | 2>(1);
  const [recall, setRecall] = useState<{ answer: string; ok: boolean } | null>(null);
  const [ev, setEv] = useState<Evaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [stats, setStats] = useState({ pass: 0, fail: 0 });
  const [attempt, setAttempt] = useState(0);
  const [selfCheck, setSelfCheck] = useState<string | null>(null);
  const online = useOnline();
  // Without internet (or without an API key) step 2 is self-graded.
  const aiAvailable = online && hasKey();
  const card = queue[i];

  const next = () => {
    setI((x) => x + 1);
    setStep(1);
    setRecall(null);
    setEv(null);
    setErr(null);
    setAttempt(0);
    setSelfCheck(null);
  };

  const finish = (q: number) => {
    grade(card.id, q);
    setStats((s) => (q >= 3 ? { ...s, pass: s.pass + 1 } : { ...s, fail: s.fail + 1 }));
    next();
  };

  const submitSentence = async (text: string) => {
    setBusy(true);
    setErr(null);
    try {
      setEv(
        await evaluate({
          task: `Vocabulary production test. The learner must say a BRAND NEW, ORIGINAL English sentence using the target "${card.en}" (${card.pos}; Czech: ${card.cz}${
            card.collocation ? `; pattern: ${card.collocation}` : ''
          }). Any grammatical form of the target is fine. Check especially prepositions, collocations and that the meaning fits. Do not penalise if the sentence is simple.`,
          answer: text,
          passRule: `true only if the sentence uses "${card.en}" (any form) naturally with correct prepositions/collocation and correct meaning, and is not just a copy of: "${card.example.replace(/[{}]/g, '')}". Minor grammar slips elsewhere may still pass.`,
        }),
      );
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!queue.length)
    return (
      <div>
        <ModeHeader title="Opakování slovíček" />
        <Card className="text-center py-10 space-y-3">
          <div className="flex justify-center"><IconTile name="sparkle" tone="violet" size="lg" /></div>
          <div className="font-medium">Nic k opakování</div>
          <div className="text-sm text-muted">Přidej balíček nebo ulož slova během tréninku.</div>
          <Btn variant="primary" onClick={() => navigate('vocab')}>
            Otevřít slovíčka
          </Btn>
        </Card>
      </div>
    );

  if (!card)
    return (
      <div>
        <ModeHeader title="Opakování slovíček" />
        <Card className="text-center py-10 space-y-3">
          <div className="flex justify-center"><IconTile name="trophy" tone="emerald" size="lg" /></div>
          <div className="font-medium">Hotovo!</div>
          <div className="text-sm text-muted">
            Prošlo: <span className="text-emerald-500 font-semibold">{stats.pass}</span> · Znovu:{' '}
            <span className="text-amber-500 font-semibold">{stats.fail}</span>
          </div>
          <Btn variant="primary" onClick={() => navigate('home')}>
            Zpět domů
          </Btn>
        </Card>
      </div>
    );

  const gapped = withGap(card);
  const previews = [5, 4, 3].map((q) => ({ q, srs: review(card.srs, q) }));

  return (
    <div>
      <ModeHeader
        title="Opakování slovíček"
        subtitle={`${i + 1} / ${queue.length} · krok ${step}/2`}
        right={
          <Btn variant="ghost" className="h-10 px-3" onClick={next} aria-label="Přeskočit">
            <SkipForward className="size-4" />
          </Btn>
        }
      />
      <div className="h-1.5 rounded-full bg-surface-3 mb-4 overflow-hidden">
        <div className="h-full bg-accent transition-all" style={{ width: `${(i / queue.length) * 100}%` }} />
      </div>

      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between">
            <Label>{card.pos}</Label>
            <span className="text-[10px] text-muted">{card.source === 'starter' ? card.pack : card.source === 'rescue' ? 'záchranný slovník' : 'uloženo'}</span>
          </div>
          <div className="mt-2 text-2xl font-semibold flex items-center gap-2"><LangBadge code="CZ" className="text-xs" /> {card.cz}</div>
          <div className="mt-3 text-[17px] leading-relaxed">
            <ExampleText text={gapped} blank={!recall} />
          </div>
          {recall && (
            <div className="mt-3 flex items-center justify-between gap-2 animate-up">
              <div>
                <div className={cx('text-sm font-medium flex items-center gap-1.5', recall.ok ? 'text-emerald-500' : 'text-red-500')}>
                  {recall.ok ? <Check className="size-4" /> : <X className="size-4" />}
                  {recall.ok ? 'Správně' : `Řekl jsi: „${recall.answer}“`}
                </div>
                <div className="text-lg font-semibold mt-1">{card.en}</div>
                {card.collocation && <div className="text-xs text-muted">{card.collocation}</div>}
              </div>
              <SpeakButton text={gapped} />
            </div>
          )}
        </Card>

        {step === 1 && !recall && (
          <MicRecorder
            resetKey={`${card.id}-1`}
            submitLabel="Ověřit"
            placeholder="Řekni chybějící slovo / frázi…"
            hint="Řekni chybějící výraz (nebo celou větu)"
            onSubmit={(t) => setRecall({ answer: t, ok: recallMatches(card, t) })}
          />
        )}

        {step === 1 && recall && (
          <div className="space-y-2">
            {!recall.ok && (
              <button className="text-xs text-muted underline" onClick={() => setRecall({ ...recall, ok: true })}>
                Měl jsem to správně (rozpoznávání se spletlo)
              </button>
            )}
            <Btn variant="primary" className="w-full" onClick={() => setStep(2)}>
              Krok 2: vlastní věta <ChevronRight className="size-4" />
            </Btn>
          </div>
        )}

        {step === 2 && (
          <>
            <Card className="py-3">
              <Label>Krok 2 · Aktivní produkce</Label>
              <div className="mt-1 text-sm">
                Řekni <b>úplně novou</b> vlastní větu s výrazem <span className="text-accent font-semibold">{card.en}</span>.
              </div>
            </Card>
            {!ev && !selfCheck && (
              <MicRecorder
                resetKey={`${card.id}-2-${attempt}`}
                onSubmit={(t) => (aiAvailable ? submitSentence(t) : setSelfCheck(t))}
                busy={busy}
                submitLabel={aiAvailable ? 'Vyhodnotit' : 'Hotovo'}
              />
            )}
            {selfCheck && (
              <Card className="space-y-3 animate-up">
                <Label>Offline · ohodnoť se sám</Label>
                <div className="text-sm">“{selfCheck}”</div>
                <div className="flex items-start gap-2 text-sm text-muted">
                  <div className="flex-1">
                    Vzor: <ExampleText text={card.example} />
                    {card.collocation && <div className="text-xs mt-1">Vazba: {card.collocation}</div>}
                  </div>
                  <SpeakButton text={card.example} compact />
                </div>
                <div className="text-xs text-muted">Použil jsi „{card.en}“ přirozeně a se správnou předložkou/vazbou?</div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, ...previews.map((p) => p.q).reverse()].map((q) => (
                    <Btn
                      key={q}
                      variant={q === 4 ? 'primary' : 'secondary'}
                      className="flex-col h-14 gap-0 px-1 text-xs"
                      onClick={() => finish(recall?.ok ? q : Math.min(q, 2))}
                    >
                      <span>{q === 1 ? 'Znovu' : q === 3 ? 'Těžké' : q === 4 ? 'Dobré' : 'Snadné'}</span>
                      <span className="text-[10px] opacity-70">{formatInterval(review(card.srs, recall?.ok ? q : Math.min(q, 2)).interval)}</span>
                    </Btn>
                  ))}
                </div>
              </Card>
            )}
            {busy && <Spinner label="Hodnotím použití…" />}
            {err && <ErrorBox error={err} />}
            {ev && (
              <>
                <FeedbackCard evaluation={ev} mode="vocab" showVerdict="passed" />
                {ev.passed && recall?.ok ? (
                  <div className="grid grid-cols-3 gap-2">
                    {previews.map(({ q, srs }) => (
                      <Btn key={q} variant={q === 4 ? 'primary' : 'secondary'} className="flex-col h-14 gap-0" onClick={() => finish(q)}>
                        <span>{q === 5 ? 'Snadné' : q === 4 ? 'Dobré' : 'Těžké'}</span>
                        <span className="text-[10px] opacity-70">{formatInterval(srs.interval)}</span>
                      </Btn>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Btn
                      className="flex-1"
                      onClick={() => {
                        setEv(null);
                        setAttempt((a) => a + 1);
                      }}
                    >
                      <RotateCcw className="size-4" /> Zkusit znovu
                    </Btn>
                    <Btn variant="primary" className="flex-1" onClick={() => finish(ev.passed ? 2 : 1)}>
                      Opakovat brzy <ChevronRight className="size-4" />
                    </Btn>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
