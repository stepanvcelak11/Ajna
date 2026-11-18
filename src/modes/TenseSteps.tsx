import { BookOpen, Check, ChevronRight, Crown, Keyboard, Lightbulb, Lock, Mic, PenLine, RotateCcw, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AnswerBox, type InputMode } from '../components/answer';
import { GameEnd, GameHeader } from '../components/game';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, ModeHeader, cx } from '../components/ui';
import { detectTenses, FREE, FREE_STEP, PASS, stepItems, STEPS, type StepItem } from '../data/tenseSteps';
import { GROUPS, TENSES, tenseById, type Tense, type TenseId } from '../data/tenses';
import { sample, shuffle } from '../data/wordbank';
import { evaluate } from '../lib/ai';
import type { Evaluation } from '../lib/types';
import { canTranscribe, hasKey } from '../lib/llm';
import { words } from '../lib/match';
import { navigate } from '../lib/router';
import { sfx } from '../lib/sfx';
import { sttSupported } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';
import { useOnline } from '../lib/ui';
import { openTense } from './Tenses';

const SAVE = 'ajna-tense-steps';
const MODE = 'ajna-steps-mode';
const OPEN = 'ajna-steps-open'; // set by openSteps() in Tenses
const FREE_COUNT = 3;

type Progress = Partial<Record<TenseId, number>>; // steps passed, 0..STEPS.length

function loadProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem(SAVE) ?? '{}') ?? {};
  } catch {
    return {};
  }
}
function passStep(t: TenseId, step: number) {
  const p = loadProgress();
  p[t] = Math.max(p[t] ?? 0, step + 1);
  try {
    localStorage.setItem(SAVE, JSON.stringify(p));
  } catch {
    /* optional */
  }
}

/** Same words, allowing "she's done" (= has) and "I'd gone" (= had). */
function same(a: string[], b: string[]) {
  return a.length === b.length && a.every((w, i) => w === b[i] || (w === 'is' && b[i] === 'has') || (w === 'has' && b[i] === 'is') || (w === 'would' && b[i] === 'had') || (w === 'had' && b[i] === 'would'));
}
function wdist(a: string[], b: string[]) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (same([a[i - 1]], [b[j - 1]]) ? 0 : 1));
  return dp[a.length][b.length];
}
/** ok + the accepted sentence closest to what was said */
function check(it: StepItem, said: string) {
  const a = words(said);
  let best = it.en[0];
  let d = Infinity;
  for (const e of it.en) {
    const b = words(e);
    if (same(a, b)) return { ok: true, target: e };
    const x = wdist(a, b);
    if (x < d) [d, best] = [x, e];
  }
  return { ok: false, target: best };
}

/** Schody: one tense at a time, from short sentences to long ones and then your own. */
export default function TenseSteps() {
  const level = useStore((s) => s.settings.level);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [open, setOpen] = useState<TenseId | null>(() => {
    try {
      const id = sessionStorage.getItem(OPEN) as TenseId | null;
      sessionStorage.removeItem(OPEN);
      return id && TENSES.some((t) => t.id === id) ? id : null;
    } catch {
      return null;
    }
  });
  const [play, setPlay] = useState<{ step: number; run: number } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [open, play]);

  if (open && play) {
    const t = tenseById(open);
    const done = () => {
      setProgress(loadProgress());
      setPlay(null);
    };
    const nextStep = () => {
      setProgress(loadProgress());
      setPlay((p) => (p && p.step + 1 < STEPS.length ? { step: p.step + 1, run: p.run + 1 } : null));
    };
    const again = () => setPlay((p) => p && { ...p, run: p.run + 1 });
    return play.step === FREE_STEP ? (
      <Free key={play.run} t={t} onBack={done} onAgain={again} />
    ) : (
      <Round key={play.run} t={t} step={play.step} onBack={done} onAgain={again} onNext={nextStep} />
    );
  }
  if (open) return <Ladder t={tenseById(open)} passed={progress[open] ?? 0} onBack={() => setOpen(null)} onPlay={(step) => setPlay({ step, run: 0 })} />;

  const mastered = TENSES.filter((t) => (progress[t.id] ?? 0) >= STEPS.length).length;
  const suggest = TENSES.find((t) => t.level <= Math.max(1, level) && (progress[t.id] ?? 0) < STEPS.length) ?? TENSES.find((t) => (progress[t.id] ?? 0) < STEPS.length);

  return (
    <div className="space-y-5 pb-4">
      <ModeHeader title="Schody časů" subtitle="Jeden čas: od krátkých vět po dlouhé, až ho umíš" onBack={() => navigate('tenses')} />
      <Card className="space-y-1 text-sm leading-snug">
        <div className="font-bold">Jak to funguje</div>
        <div className="text-muted">
          Každý čas má {STEPS.length} schodů: krátké věty → zápor a otázka → věty s podrobnostmi → souvětí → vlastní věty. Další schod se odemkne, když dáš aspoň {PASS} vět ze 6 bez chyby. Čas je zvládnutý, až vyjdeš všechny schody.
        </div>
        <div className="pt-1 text-xs font-semibold text-accent">
          Zvládnuto: {mastered} z {TENSES.length}
        </div>
      </Card>
      {suggest && (
        <button
          onClick={() => setOpen(suggest.id)}
          className={cx('relative flex w-full items-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-br p-4 text-left text-white shadow-md active:scale-[0.99]', suggest.color)}
        >
          <span className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full bg-white/15" />
          <span className="relative min-w-0 flex-1">
            <span className="block text-xs font-semibold text-white/80">{(progress[suggest.id] ?? 0) > 0 ? 'Pokračuj' : 'Začni tady'}</span>
            <span className="block text-lg font-extrabold">{suggest.en}</span>
            <span className="block text-xs text-white/85">
              Schod {Math.min((progress[suggest.id] ?? 0) + 1, STEPS.length)}: {STEPS[Math.min(progress[suggest.id] ?? 0, STEPS.length - 1)].title}
            </span>
          </span>
          <ChevronRight className="relative size-5" />
        </button>
      )}
      {GROUPS.map((g) => (
        <section key={g.id} className="space-y-2">
          <Label>{g.cz}</Label>
          {TENSES.filter((t) => t.group === g.id).map((t) => (
            <TenseRow key={t.id} t={t} passed={progress[t.id] ?? 0} onClick={() => setOpen(t.id)} />
          ))}
        </section>
      ))}
    </div>
  );
}

function TenseRow({ t, passed, onClick }: { t: Tense; passed: number; onClick: () => void }) {
  const full = passed >= STEPS.length;
  return (
    <Card onClick={onClick} className="flex items-center gap-3">
      <span className={cx('grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white', t.color)}>{full ? <Crown className="size-5" /> : <span className="text-sm font-extrabold">{passed}</span>}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold">{t.en}</div>
        <div className="truncate text-xs text-muted">{t.cz}</div>
        <div className="mt-1.5 flex gap-1">
          {STEPS.map((_, k) => (
            <span key={k} className={cx('h-1.5 flex-1 rounded-full', k < passed ? 'bg-emerald-500' : 'bg-surface-3')} />
          ))}
        </div>
      </div>
      <ChevronRight className="size-4 text-muted" />
    </Card>
  );
}

function Ladder({ t, passed, onBack, onPlay }: { t: Tense; passed: number; onBack: () => void; onPlay: (step: number) => void }) {
  return (
    <div className="space-y-4 pb-4">
      <ModeHeader title={t.en} subtitle={`Schody · ${t.cz}`} onBack={onBack} />
      <FormCard t={t} />
      <div className="space-y-2">
        {STEPS.map((s, k) => {
          // the ladder is drawn top-down from the hardest step
          const done = k < passed;
          const open = k <= passed;
          return (
            <button
              key={k}
              disabled={!open}
              onClick={() => onPlay(k)}
              style={{ marginLeft: `${k * 6}%` }}
              className={cx(
                'flex w-[76%] items-center gap-3 rounded-2xl border-2 p-3 text-left transition active:scale-[0.99] disabled:opacity-50',
                done ? 'border-emerald-500/50 bg-emerald-500/8' : open ? 'border-accent bg-accent/8' : 'border-line bg-surface',
              )}
            >
              <span className={cx('grid size-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold', done ? 'bg-emerald-500 text-white' : open ? 'bg-accent text-white' : 'bg-surface-3 text-muted')}>
                {done ? <Check className="size-5" /> : open ? k + 1 : <Lock className="size-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{s.title}</span>
                <span className="block text-[11px] leading-snug text-muted">{s.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
      {passed >= STEPS.length && (
        <Card className="flex items-center gap-3 border-emerald-500/40">
          <Crown className="size-6 shrink-0 text-amber-500" />
          <div className="text-sm">
            <b>{t.en} máš zvládnutý.</b> Schody si můžeš kdykoli zopakovat, nebo ho přidej do míchaného procvičování časů.
          </div>
        </Card>
      )}
      <Btn variant="ghost" className="w-full text-xs" onClick={() => openTense(t.id)}>
        <BookOpen className="size-4" /> Celý přehled: kdy a jak se {t.en} používá
      </Btn>
    </div>
  );
}

function FormCard({ t, compact }: { t: Tense; compact?: boolean }) {
  return (
    <div className={cx('rounded-2xl bg-gradient-to-br p-3 text-white', t.color, compact && 'text-xs')}>
      <div className="text-xs font-semibold text-white/80">{t.when}</div>
      <div className="mt-1 space-y-0.5 font-mono text-[12px] font-semibold">
        <div>+ {t.forms.plus[0]}</div>
        <div>− {t.forms.minus[0]}</div>
        <div>? {t.forms.q[0]}</div>
      </div>
    </div>
  );
}

function useInputMode() {
  const online = useOnline();
  const canSpeak = sttSupported || (online && canTranscribe());
  const [mode, setMode] = useState<InputMode>(() => (localStorage.getItem(MODE) === 'speak' ? 'speak' : 'write'));
  const pick = (m: InputMode) => {
    setMode(m);
    try {
      localStorage.setItem(MODE, m);
    } catch {
      /* optional */
    }
  };
  const real: InputMode = mode === 'speak' && canSpeak ? 'speak' : 'write';
  const toggle = canSpeak ? (
    <div className="flex rounded-full border border-line bg-surface p-0.5 text-[11px] font-semibold">
      {(
        [
          ['write', Keyboard, 'Psát'],
          ['speak', Mic, 'Mluvit'],
        ] as const
      ).map(([m, Ico, name]) => (
        <button key={m} onClick={() => pick(m)} className={cx('flex items-center gap-1 rounded-full px-2.5 py-1', real === m ? 'bg-accent text-white' : 'text-muted')}>
          <Ico className="size-3.5" /> {name}
        </button>
      ))}
    </div>
  ) : null;
  return { mode: real, toggle };
}

/** Steps 1–4: translate six Czech sentences into the tense. */
function Round({ t, step, onBack, onAgain, onNext }: { t: Tense; step: number; onBack: () => void; onAgain: () => void; onNext: () => void }) {
  const items = useMemo(() => shuffle(stepItems(t.id, step)), [t.id, step]);
  const { mode, toggle } = useInputMode();
  const [i, setI] = useState(0);
  const [res, setRes] = useState<{ ok: boolean; said: string; target: string; own?: boolean } | null>(null);
  const [help, setHelp] = useState(false);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [log, setLog] = useState<{ it: StepItem; ok: boolean; said: string }[]>([]);
  const [end, setEnd] = useState<{ best: boolean; passed: boolean } | null>(null);
  const it = items[i];

  const finish = (sc: number) => {
    const passed = sc >= PASS;
    if (passed) passStep(t.id, step);
    setEnd({ best: recordGame('tense-steps', sc, items.length), passed });
  };

  const submit = (said: string) => {
    const r = check(it, said);
    setRes({ ...r, said });
    if (r.ok) {
      sfx.correct(1);
      const gain = help ? 1 : 3;
      if (!help) setScore((s) => s + 1);
      setXp((x) => x + gain);
      recordActivity('tense-steps', gain);
    } else {
      sfx.wrong();
      recordActivity('tense-steps', 0);
    }
  };
  const own = () => {
    // "my answer was right too": count it
    if (!res || res.ok) return;
    setRes({ ...res, ok: true, own: true });
    if (!help) setScore((s) => s + 1);
    setXp((x) => x + 2);
  };
  const next = () => {
    const ok = !!res?.ok && !help;
    setLog((l) => [...l, { it, ok, said: res?.said ?? '' }]);
    if (i + 1 >= items.length) finish(score);
    else {
      setI(i + 1);
      setRes(null);
      setHelp(false);
    }
  };

  if (end)
    return (
      <div>
        <GameHeader title={`${t.en} · schod ${step + 1}`} i={items.length} total={items.length} combo={0} onBack={onBack} />
        <GameEnd score={score} total={items.length} xp={xp} best={end.best} icon="ladder" tone="violet" extra="vět bez chyby" onAgain={onAgain} onContinue={onBack}>
          <Card className={cx('mb-3 text-left text-sm', end.passed ? 'border-emerald-500/40' : 'border-amber-500/40')}>
            {end.passed ? (
              <>
                <b>Schod {step + 1} máš!</b> {step + 1 < STEPS.length ? `Odemkl se schod ${step + 2}: ${STEPS[step + 1].title}.` : ''}
              </>
            ) : (
              <>
                Na další schod potřebuješ aspoň {PASS} ze {items.length}. Zkus to ještě jednou, věty se zamíchají.
              </>
            )}
          </Card>
          {end.passed && step + 1 < STEPS.length && (
            <Btn variant="primary" className="mb-3 h-12 w-full" onClick={onNext}>
              Další schod: {STEPS[step + 1].title} <ChevronRight className="size-4" />
            </Btn>
          )}
          <div className="space-y-1.5 text-left">
            {log.map((l, k) => (
              <div key={k} className="flex items-start gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs">
                {l.ok ? <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" /> : <X className="mt-0.5 size-3.5 shrink-0 text-red-500" />}
                <div>
                  <div className="text-muted">{l.it.cz}</div>
                  <div className="font-semibold">{l.it.en[0]}</div>
                </div>
              </div>
            ))}
          </div>
        </GameEnd>
      </div>
    );

  return (
    <div className="space-y-3">
      <GameHeader title={`${t.en} · schod ${step + 1}`} subtitle={`${STEPS[step].title} · ${xp} XP`} i={i} total={items.length} combo={0} onBack={onBack} />
      <Card className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label>Přelož do {t.en}</Label>
          {toggle}
        </div>
        <div data-cz className="text-xl font-bold leading-snug">{it.cz}</div>
        {!res && !help && (
          <button onClick={() => setHelp(true)} className="flex items-center gap-1 text-xs font-semibold text-accent">
            <Lightbulb className="size-3.5" /> Připomenout, jak se tvoří
          </button>
        )}
        {help && !res && <FormCard t={t} compact />}
      </Card>

      {!res ? (
        <AnswerBox mode={mode} onSubmit={submit} resetKey={`${i}-${mode}`} placeholder="Napiš větu anglicky…" hint="Ťukni na mikrofon a řekni větu anglicky" />
      ) : (
        <div className="space-y-3 animate-up">
          <Card className={cx('space-y-1.5', res.ok ? 'border-emerald-500/50 bg-emerald-500/6' : 'border-red-500/40 bg-red-500/5')}>
            <div className={cx('flex items-center gap-1.5 text-sm font-bold', res.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
              {res.ok ? <Check className="size-4" /> : <X className="size-4" />}
              {res.ok ? (res.own ? 'Uznáno' : help ? 'Správně (s nápovědou)' : 'Správně!') : 'Ještě ne'}
            </div>
            {!res.ok && (
              <div className="text-xs">
                {mode === 'speak' ? 'Mikrofon slyšel' : 'Napsal jsi'}: <span className="text-muted">„{res.said}“</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex-1 text-[15px] font-semibold">{res.ok && !res.own ? res.target : res.target}</div>
              <SpeakButton text={res.target} compact />
            </div>
            {it.en.length > 1 && !res.ok && <div className="text-[11px] text-muted">Jde říct i jinak, tohle je nejbližší tvé odpovědi.</div>}
          </Card>
          <div className="flex gap-2">
            {!res.ok && (
              <Btn className="flex-1 text-xs" onClick={own}>
                <Check className="size-4" /> Měl jsem to dobře
              </Btn>
            )}
            <Btn variant="primary" className="h-12 flex-1" onClick={next}>
              {i + 1 >= items.length ? 'Výsledek' : 'Další'} <ChevronRight className="size-4" />
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/** Step 5: write (or say) your own sentences in the tense. */
function Free({ t, onBack, onAgain }: { t: Tense; onBack: () => void; onAgain: () => void }) {
  const prompts = useMemo(() => sample(FREE[t.id], FREE_COUNT), [t.id]);
  const online = useOnline();
  const ai = online && hasKey();
  const { mode, toggle } = useInputMode();
  const [i, setI] = useState(0);
  const [said, setSaid] = useState<string | null>(null);
  const [found, setFound] = useState<TenseId[]>([]);
  const [ev, setEv] = useState<Evaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [tries, setTries] = useState(0);
  const [done, setDone] = useState<{ p: string; s: string }[]>([]);
  const [xp, setXp] = useState(0);
  const [end, setEnd] = useState<{ best: boolean } | null>(null);

  const accept = (ok: boolean, s: string) => {
    setAccepted(ok);
    if (ok) {
      sfx.correct(1);
      setXp((x) => x + 5);
      recordActivity('tense-steps', 5);
    } else {
      sfx.wrong();
      recordActivity('tense-steps', 0);
    }
    void s;
  };

  const submit = async (s: string) => {
    setSaid(s);
    setTries((x) => x + 1);
    const f = [...detectTenses(s)];
    setFound(f);
    setEv(null);
    setErr('');
    if (ai) {
      setBusy(true);
      try {
        const e = await evaluate({
          task: `Tense practice. The learner had to write their OWN sentence in the ${t.en} tense, on this topic (Czech): "${prompts[i]}". Judge grammar and whether ${t.en} is used correctly and naturally for the meaning. Any reasonable content on the topic is fine.`,
          answer: s,
          passRule: `true only if the sentence is grammatical (small slips in articles or prepositions are fine) AND its main verb is correctly in ${t.en}${t.id === 'pc' || t.id === 'going' || t.id === 'will' ? ' (other future forms are not accepted)' : ''}.`,
        });
        setEv(e);
        accept(e.passed, s);
      } catch (x) {
        setErr((x as Error).message);
        accept(f.includes(t.id), s);
      } finally {
        setBusy(false);
      }
    } else accept(f.includes(t.id), s);
  };

  const reset = () => {
    setSaid(null);
    setAccepted(null);
    setEv(null);
    setErr('');
    setFound([]);
  };
  const next = () => {
    const d = [...done, { p: prompts[i], s: said ?? '' }];
    setDone(d);
    reset();
    setTries(0);
    if (i + 1 >= prompts.length) {
      passStep(t.id, FREE_STEP);
      setEnd({ best: recordGame('tense-steps', d.length, prompts.length) });
    } else setI(i + 1);
  };

  if (end)
    return (
      <div>
        <GameHeader title={`${t.en} · vlastní věty`} i={prompts.length} total={prompts.length} combo={0} onBack={onBack} />
        <GameEnd score={done.length} total={prompts.length} xp={xp} best={end.best} icon="ladder" tone="violet" extra="vlastních vět" onAgain={onAgain} onContinue={onBack}>
          <Card className="mb-3 flex items-center gap-3 border-emerald-500/40 text-left text-sm">
            <Crown className="size-6 shrink-0 text-amber-500" />
            <div>
              <b>Vyšel jsi všechny schody: {t.en} umíš!</b> Zkus teď další čas nebo ho míchej s ostatními v Procvičování časů.
            </div>
          </Card>
          <div className="space-y-1.5 text-left">
            {done.map((d, k) => (
              <div key={k} className="rounded-xl bg-surface-2 px-3 py-2 text-xs">
                <div className="text-muted">{d.p}</div>
                <div className="font-semibold">{d.s}</div>
              </div>
            ))}
          </div>
        </GameEnd>
      </div>
    );

  const other = found.filter((x) => x !== t.id);
  return (
    <div className="space-y-3">
      <GameHeader title={`${t.en} · vlastní věty`} subtitle={`Schod ${STEPS.length} · ${xp} XP`} i={i} total={prompts.length} combo={0} onBack={onBack} />
      <Card className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="flex items-center gap-1.5">
            <PenLine className="size-3.5" /> Tvoje věta v {t.en}
          </Label>
          {toggle}
        </div>
        <div className="text-lg font-bold leading-snug">{prompts[i]}</div>
        <div className="text-xs text-muted">Vymysli vlastní větu, klidně jednoduchou. Důležitý je správný čas.</div>
      </Card>
      <FormCard t={t} compact />

      {said === null ? (
        <AnswerBox mode={mode} onSubmit={(s) => void submit(s)} resetKey={`${i}-${tries}-${mode}`} placeholder="Napiš svou větu…" hint="Ťukni na mikrofon a řekni svou větu" />
      ) : busy ? (
        <Card className="flex items-center gap-2 text-sm text-muted">
          <Sparkles className="size-4 animate-pulse text-accent" /> AI kontroluje tvou větu…
        </Card>
      ) : (
        <div className="space-y-3 animate-up">
          <Card className={cx('space-y-2', accepted ? 'border-emerald-500/50 bg-emerald-500/6' : 'border-amber-500/50 bg-amber-500/6')}>
            <div className="text-[15px] font-semibold">„{said}“</div>
            {ev ? (
              <>
                <div className={cx('flex items-center gap-1.5 text-sm font-bold', accepted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600')}>
                  {accepted ? <Check className="size-4" /> : <X className="size-4" />}
                  {accepted ? 'Výborně, správný čas!' : 'Ještě to není ono'}
                </div>
                {ev.grammatical_fix && words(ev.grammatical_fix).join(' ') !== words(said).join(' ') && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex-1">
                      <span className="text-xs text-muted">Oprava: </span>
                      <b>{ev.grammatical_fix}</b>
                    </span>
                    <SpeakButton text={ev.grammatical_fix} compact />
                  </div>
                )}
                {ev.explanation_cz.map((x) => (
                  <div key={x} className="text-xs leading-snug text-muted">
                    • {x}
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className={cx('flex items-center gap-1.5 text-sm font-bold', accepted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600')}>
                  {accepted ? <Check className="size-4" /> : <X className="size-4" />}
                  {accepted ? `Vidím tam ${t.en}.` : `Nevidím tam ${t.en}.`}
                </div>
                {!accepted && other.length > 0 && <div className="text-xs">Vypadá to spíš na {other.map((x) => tenseById(x).en).join(' / ')}.</div>}
                {!accepted && <div className="text-xs text-muted">Tvar: {t.forms.plus[0]}, třeba „{t.forms.plus[1]}“</div>}
                <div className="text-[11px] text-muted">
                  {err ? `AI teď nejde (${err}), kontroluju jen tvar slovesa.` : 'Bez AI kontroluju jen tvar slovesa, ne celou gramatiku. S API klíčem v Nastavení ti větu opraví AI.'}
                </div>
              </>
            )}
          </Card>
          <div className="flex gap-2">
            {!accepted && (
              <Btn className="flex-1 text-xs" onClick={reset}>
                <RotateCcw className="size-4" /> Zkusit znovu
              </Btn>
            )}
            {!accepted && !ev && (
              <Btn className="flex-1 text-xs" onClick={() => accept(true, said)}>
                <Check className="size-4" /> Je to dobře
              </Btn>
            )}
            {accepted && (
              <Btn variant="primary" className="h-12 flex-1" onClick={next}>
                {i + 1 >= prompts.length ? 'Hotovo' : 'Další zadání'} <ChevronRight className="size-4" />
              </Btn>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
