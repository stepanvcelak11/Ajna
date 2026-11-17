import { Check, ChevronRight, Hand, Keyboard, Mic, RotateCcw, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { HeardAs, TypeAnswer } from '../components/answer';
import { Choice, GameEnd, GameHeader, type ChoiceState } from '../components/game';
import { MicRecorder } from '../components/MicRecorder';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, ModeHeader, cx } from '../components/ui';
import { answerOf, CONFUSABLE, fullSentence, GROUPS, hintOf, TENSE_ITEMS, TENSES, tenseById, type TenseId, type TenseItem } from '../data/tenses';
import { sample, shuffle } from '../data/wordbank';
import { canTranscribe } from '../lib/llm';
import { words } from '../lib/match';
import { navigate } from '../lib/router';
import { sfx } from '../lib/sfx';
import { speak, sttSupported } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';
import { useOnline } from '../lib/ui';
import { openTense } from './Tenses';

type Kind = 'pick' | 'write' | 'speak' | 'identify';
const ROUND = 10;
const SAVE = 'ajna-tense-drill';

const KINDS: { id: Kind; title: string; desc: string; icon: typeof Hand }[] = [
  { id: 'pick', title: 'Vyber tvar', desc: 'Ze 4 možností ťukneš správný tvar slovesa', icon: Hand },
  { id: 'write', title: 'Napiš tvar', desc: 'Doplníš sloveso ve správném čase na klávesnici', icon: Keyboard },
  { id: 'speak', title: 'Řekni větu', desc: 'Celou větu se správným tvarem řekneš nahlas', icon: Mic },
  { id: 'identify', title: 'Poznej čas', desc: 'Přečteš větu a určíš, jaký je to čas', icon: Search },
];

function load(): { sel: TenseId[]; kind: Kind } {
  let saved: { sel?: TenseId[]; kind?: Kind } = {};
  try {
    saved = JSON.parse(localStorage.getItem(SAVE) ?? '{}');
  } catch {
    /* ignore */
  }
  let sel = (saved.sel ?? []).filter((id) => TENSES.some((t) => t.id === id));
  try {
    const pick = JSON.parse(sessionStorage.getItem('ajna-tense-pick') ?? 'null');
    sessionStorage.removeItem('ajna-tense-pick');
    if (Array.isArray(pick) && pick.length) sel = pick;
  } catch {
    /* ignore */
  }
  if (!sel.length) sel = ['ps', 'pc', 'pas'];
  return { sel, kind: saved.kind ?? 'pick' };
}

/** Same tokens, allowing "he's done" (= has) and "I'd gone" (= had) for spoken answers. */
function sameWords(said: string, right: string) {
  const a = words(said);
  const b = words(right);
  return a.length === b.length && a.every((w, i) => w === b[i] || (w === 'is' && b[i] === 'has') || (w === 'would' && b[i] === 'had'));
}
const accepted = (it: TenseItem) => [it.tense, ...it.also];

interface Q {
  it: TenseItem;
  options: string[]; // pick: verb phrases · identify: tense ids
}

function build(sel: TenseId[], kind: Kind): Q[] {
  // spread the round evenly over the chosen tenses
  const per = Math.ceil(ROUND / sel.length);
  const items = shuffle(sel.flatMap((t) => sample(TENSE_ITEMS.filter((x) => x.tense === t), per))).slice(0, ROUND);
  return items.map((it) => {
    if (kind === 'identify') {
      const wrong = shuffle([...CONFUSABLE[it.tense], ...sel].filter((t) => !accepted(it).includes(t)));
      return { it, options: shuffle([it.tense, ...[...new Set(wrong)].slice(0, 3)]) };
    }
    const ok = accepted(it).map((t) => answerOf(it, t));
    const pool = [...sel, ...CONFUSABLE[it.tense], ...TENSES.map((t) => t.id)].filter((t) => !accepted(it).includes(t));
    const wrong: string[] = [];
    for (const t of pool) {
      const f = answerOf(it, t);
      if (!ok.includes(f) && !wrong.includes(f)) wrong.push(f);
      if (wrong.length >= 3) break;
    }
    return { it, options: shuffle([answerOf(it), ...wrong]) };
  });
}

/** Procvičování časů: choose the tenses and the way to practise. */
export default function TenseDrill() {
  const level = useStore((s) => s.settings.level);
  const online = useOnline();
  const canSpeak = sttSupported || (online && canTranscribe());
  const [init] = useState(load);
  const [sel, setSel] = useState<TenseId[]>(init.sel);
  const [kind, setKind] = useState<Kind>(init.kind === 'speak' && !canSpeak ? 'pick' : init.kind);
  const [playing, setPlaying] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(SAVE, JSON.stringify({ sel, kind }));
    } catch {
      /* optional */
    }
  }, [sel, kind]);

  if (playing) return <Play key={round} sel={sel} kind={kind} onBack={() => setPlaying(false)} onAgain={() => setRound((r) => r + 1)} />;

  const toggle = (id: TenseId) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const presets: [string, TenseId[]][] = [
    ['Moje úroveň', TENSES.filter((t) => t.level <= Math.max(1, Math.min(level, 4))).map((t) => t.id)],
    ['Přítomné', TENSES.filter((t) => t.group === 'present').map((t) => t.id)],
    ['Minulé', TENSES.filter((t) => t.group === 'past').map((t) => t.id)],
    ['Budoucí', TENSES.filter((t) => t.group === 'future').map((t) => t.id)],
    ['Všechny', TENSES.map((t) => t.id)],
  ];
  const same = (a: TenseId[], b: TenseId[]) => a.length === b.length && a.every((x) => b.includes(x));
  const needTwo = kind === 'identify' && sel.length < 2;

  return (
    <div className="space-y-5 pb-4">
      <ModeHeader title="Procvičování časů" subtitle="Vyber časy a způsob procvičování" onBack={() => navigate('tenses')} />

      <section className="space-y-2">
        <Label>1. Které časy</Label>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(([name, ids]) => (
            <button
              key={name}
              onClick={() => setSel(ids)}
              className={cx('rounded-full border px-3 py-1.5 text-xs font-semibold', same(sel, ids) ? 'border-accent bg-accent text-white' : 'border-line bg-surface')}
            >
              {name}
            </button>
          ))}
        </div>
        {GROUPS.map((g) => (
          <div key={g.id}>
            <div className="mb-1 mt-2 text-[11px] font-bold text-muted">{g.cz}</div>
            <div className="grid grid-cols-2 gap-1.5">
              {TENSES.filter((t) => t.group === g.id).map((t) => {
                const on = sel.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggle(t.id)}
                    className={cx(
                      'flex items-center gap-2 rounded-xl border-2 px-2.5 py-2 text-left transition',
                      on ? 'border-accent bg-accent/10' : 'border-line bg-surface',
                    )}
                  >
                    <span className={cx('grid size-5 shrink-0 place-items-center rounded-md border-2', on ? 'border-accent bg-accent text-white' : 'border-line')}>
                      {on && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold leading-tight">{t.en}</span>
                      <span className="block truncate text-[10px] text-muted">{t.cz}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <Label>2. Jak</Label>
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map((k) => {
            const disabled = k.id === 'speak' && !canSpeak;
            return (
              <button
                key={k.id}
                disabled={disabled}
                onClick={() => setKind(k.id)}
                className={cx('rounded-2xl border-2 p-3 text-left transition disabled:opacity-40', kind === k.id ? 'border-accent bg-accent/10' : 'border-line bg-surface')}
              >
                <k.icon className={cx('mb-1 size-5', kind === k.id ? 'text-accent' : 'text-muted')} />
                <div className="text-sm font-bold">{k.title}</div>
                <div className="text-[11px] leading-snug text-muted">{disabled ? 'Mikrofon tu není dostupný' : k.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="sticky bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-10">
        <Btn variant="primary" className="h-13 w-full text-base shadow-lg" disabled={!sel.length || needTwo} onClick={() => setPlaying(true)}>
          {!sel.length ? 'Vyber aspoň jeden čas' : needTwo ? 'Na „Poznej čas“ vyber aspoň 2 časy' : `Začít · ${ROUND} úkolů z ${sel.length} ${sel.length === 1 ? 'času' : 'časů'}`}
        </Btn>
      </div>
    </div>
  );
}

function Play({ sel, kind, onBack, onAgain }: { sel: TenseId[]; kind: Kind; onBack: () => void; onAgain: () => void }) {
  const qs = useMemo(() => build(sel, kind), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [res, setRes] = useState<{ said: string; ok: boolean } | null>(null);
  const [again, setAgain] = useState(false);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [stats, setStats] = useState<Record<string, [number, number]>>({});
  const [result, setResult] = useState<{ best: boolean } | null>(null);
  const showTense = sel.length === 1;
  const title = KINDS.find((k) => k.id === kind)!.title;

  useEffect(() => {
    if (qs.length && i === qs.length && !result) setResult({ best: recordGame('tenses', score, qs.length) });
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = qs[i];
  if (!q)
    return (
      <div>
        <GameHeader title={title} i={qs.length} total={qs.length} combo={0} onBack={onBack} />
        <GameEnd score={score} total={qs.length} xp={xp} best={result?.best} icon="book" tone="violet" extra="napoprvé správně" onAgain={onAgain} onContinue={onBack}>
          <div className="space-y-1.5 text-left">
            <Label>Jak ti jdou jednotlivé časy</Label>
            {Object.entries(stats).map(([id, [ok, n]]) => {
              const t = tenseById(id as TenseId);
              const pct = ok / n;
              return (
                <button key={id} onClick={() => openTense(t.id)} className="flex w-full items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-left">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{t.en}</span>
                    <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <span className={cx('block h-full rounded-full', pct >= 0.8 ? 'bg-emerald-500' : pct >= 0.5 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${pct * 100}%` }} />
                    </span>
                  </span>
                  <span className="text-sm font-bold tabular-nums">
                    {ok}/{n}
                  </span>
                  <ChevronRight className="size-4 text-muted" />
                </button>
              );
            })}
            <div className="text-[11px] text-muted">Ťukni na čas a zopakuj si pravidla.</div>
          </div>
        </GameEnd>
      </div>
    );

  const it = q.it;
  const t = tenseById(it.tense);
  const done = kind === 'pick' || kind === 'identify' ? picked !== null : res !== null;
  const right = done && (kind === 'pick' || kind === 'identify' ? isRight(picked!) : res!.ok);

  function isRight(p: string) {
    if (kind === 'identify') return accepted(it).includes(p as TenseId);
    return accepted(it).some((tt) => answerOf(it, tt) === p);
  }

  const score1 = (ok: boolean) => {
    speak(fullSentence(it));
    if (again) {
      if (ok) sfx.correct(1);
      else sfx.wrong();
      return;
    }
    setStats((s) => {
      const [a, n] = s[it.tense] ?? [0, 0];
      return { ...s, [it.tense]: [a + (ok ? 1 : 0), n + 1] };
    });
    if (ok) {
      const c = combo + 1;
      const gain = (kind === 'pick' || kind === 'identify' ? 3 : 5) + (c >= 3 ? 1 : 0);
      setCombo(c);
      setScore((x) => x + 1);
      setXp((x) => x + gain);
      recordActivity('tense-drill', gain);
      sfx.correct(c);
    } else {
      setCombo(0);
      recordActivity('tense-drill', 0);
      sfx.wrong();
    }
  };
  const choose = (p: string) => {
    if (picked !== null) return;
    setPicked(p);
    score1(isRight(p));
  };
  const submit = (said: string) => {
    const ok = kind === 'speak' ? accepted(it).some((tt) => sameWords(said, it.tpl.replace('_', answerOf(it, tt)))) : accepted(it).some((tt) => sameWords(said, answerOf(it, tt)));
    setRes({ said, ok });
    score1(ok);
  };
  const next = () => {
    setPicked(null);
    setRes(null);
    setAgain(false);
    setI((x) => x + 1);
  };
  const [before, after] = it.tpl.split('_');
  const state = (o: string): ChoiceState => (picked === null ? 'idle' : isRight(o) ? 'correct' : o === picked ? 'wrong' : 'dim');

  return (
    <div>
      <GameHeader title={title} subtitle={`${score} správně · ${xp} XP`} i={i} total={qs.length} combo={combo} onBack={onBack} />
      <Card key={i} className="mb-4 space-y-3 animate-up">
        <div className="flex items-center justify-between gap-2">
          <Label>{kind === 'identify' ? 'Jaký je to čas?' : kind === 'speak' ? 'Řekni celou větu' : 'Doplň sloveso'}</Label>
          {(showTense || done) && kind !== 'identify' && <span className={cx('rounded-full bg-gradient-to-br px-2 py-0.5 text-[10px] font-bold text-white', t.color)}>{t.en}</span>}
        </div>
        {kind === 'identify' ? (
          <div className="text-xl font-semibold leading-relaxed">{fullSentence(it)}</div>
        ) : (
          <div className="text-xl font-semibold leading-relaxed">
            {before}
            <span
              className={cx(
                'mx-0.5 inline-block min-w-16 rounded-md border-b-2 px-1 text-center',
                !done ? 'border-accent text-accent/80' : 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
              )}
            >
              {done ? answerOf(it) : <span className="text-sm font-bold">({hintOf(it)})</span>}
            </span>
            {after}
          </div>
        )}
        <div className="text-sm text-muted">{it.cz}</div>
      </Card>

      {kind === 'pick' || kind === 'identify' ? (
        <div className="space-y-2.5">
          {q.options.map((o) => (
            <Choice key={o} state={state(o)} onClick={() => choose(o)}>
              {kind === 'identify' ? (
                <span>
                  <b>{tenseById(o as TenseId).en}</b> <span className="text-xs opacity-70">· {tenseById(o as TenseId).cz}</span>
                </span>
              ) : (
                o
              )}
            </Choice>
          ))}
        </div>
      ) : !res ? (
        kind === 'write' ? (
          <TypeAnswer resetKey={`${i}-${again}`} placeholder={it.pol === '?' ? 'Napiš i podmět…' : 'Napiš tvar slovesa…'} onSubmit={submit} />
        ) : (
          <MicRecorder speakOnly resetKey={`${i}-${again}`} submitLabel="Ověřit" hint="Řekni celou větu anglicky" onSubmit={submit} />
        )
      ) : null}

      {done && (
        <div className="mt-3 space-y-3 animate-up">
          <Card className={cx('space-y-2', right ? 'border-emerald-500/50' : 'border-red-500/40')}>
            <div className={cx('flex items-center gap-1.5 text-sm font-bold', right ? 'text-emerald-500' : 'text-red-500')}>
              {right ? <Check className="size-4" /> : <X className="size-4" />}
              {right ? 'Správně!' : 'Správně je:'}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-1 text-[15px] font-semibold">{fullSentence(it)}</span>
              <SpeakButton text={fullSentence(it)} compact />
            </div>
            <button onClick={() => openTense(t.id)} className="block w-full rounded-xl bg-surface-2 px-3 py-2 text-left text-xs">
              <b>{t.en}</b> ({t.cz}): {t.when}. <span className="font-semibold text-accent">Pravidla ›</span>
            </button>
            {it.also.length > 0 && <div className="text-[11px] text-muted">Šlo by i: {it.also.map((x) => answerOf(it, x)).join(', ')}</div>}
          </Card>
          {res && !res.ok && <HeardAs mode={kind === 'speak' ? 'speak' : 'write'} said={res.said} />}
          <div className="flex gap-2">
            {res && !res.ok && (
              <Btn className="flex-1 text-xs" onClick={() => (setRes(null), setAgain(true))}>
                <RotateCcw className="size-4" /> Zkusit znovu
              </Btn>
            )}
            <Btn variant="primary" className="h-12 flex-1" onClick={next}>
              {i + 1 < qs.length ? 'Další' : 'Výsledky'} <ChevronRight className="size-4" />
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
