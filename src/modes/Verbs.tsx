import { Check, ChevronRight, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnswerBox, HeardAs, ModeBadge, ModePicker, type InputMode } from '../components/answer';
import { GameEnd, GameHeader } from '../components/game';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, cx } from '../components/ui';
import { verbsFor, type Verb } from '../data/verbs';
import { sample } from '../data/wordbank';
import { words } from '../lib/match';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';

const ROUND = 10;
const forms = (x: string) => x.split('/');
const sayAll = (v: Verb) => `${v.base}, ${v.past.replace('/', ' or ')}, ${v.pp}`;

/** Check "went gone" (spoken or typed): both forms, in this order, exact words. */
function check(v: Verb, answer: string) {
  let a = words(answer).filter((w) => w !== 'and' && w !== 'or');
  // the infinitive said first is fine too ("go went gone")
  if (a.length >= 3 && a[0] === v.base) a = a.slice(1);
  const pastOk = forms(v.past).some((f) => a[0] === f) || (a.length > 2 && forms(v.past).some((f) => a.slice(0, -1).includes(f)));
  const ppOk = a.length >= 2 && a[a.length - 1] === v.pp;
  return { pastOk, ppOk, ok: pastOk && ppOk };
}

/** Irregular verbs: say or write the past simple and the past participle. */
export default function Verbs() {
  const level = useStore((s) => s.settings.level);
  const [mode, setMode] = useState<InputMode | null>(null);
  const [round, setRound] = useState(0);
  const qs = useMemo(() => sample(verbsFor(level), ROUND), [level, round]);
  const [i, setI] = useState(0);
  const [res, setRes] = useState<{ said: string; pastOk: boolean; ppOk: boolean; ok: boolean } | null>(null);
  const [again, setAgain] = useState(false);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wrong, setWrong] = useState<Verb[]>([]);
  const [result, setResult] = useState<{ best: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setI(0);
    setRes(null);
    setAgain(false);
    setScore(0);
    setXp(0);
    setCombo(0);
    setWrong([]);
    setResult(null);
  }, [qs]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (qs.length && i === qs.length && !result) setResult({ best: recordGame('verbs', score, qs.length) });
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mode)
    return (
      <ModePicker
        game="verbs"
        title="Nepravidelná slovesa"
        subtitle="go → went, gone: řekni nebo napiš oba tvary"
        onPick={(m) => {
          setMode(m);
          setRound((r) => r + 1);
        }}
      />
    );

  const q = qs[i];
  if (!q)
    return (
      <div>
        <GameHeader title="Nepravidelná slovesa" i={qs.length} total={qs.length} combo={0} onBack={() => setMode(null)} />
        <GameEnd score={score} total={qs.length} xp={xp} best={result?.best} extra="sloves správně napoprvé" onAgain={() => setRound((r) => r + 1)}>
          {wrong.length > 0 && (
            <div className="space-y-1.5 text-left">
              <Label>Zopakuj si</Label>
              {wrong.map((v) => (
                <div key={v.base} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm">
                  <span className="flex-1">
                    <b>{v.base}</b> – <b>{v.past}</b> – <b>{v.pp}</b> <span className="text-xs text-muted">· {v.cz}</span>
                  </span>
                  <SpeakButton text={sayAll(v)} compact />
                </div>
              ))}
            </div>
          )}
        </GameEnd>
      </div>
    );

  const next = () => {
    clearTimeout(timer.current);
    setRes(null);
    setAgain(false);
    setI((x) => x + 1);
  };
  const submit = (said: string) => {
    const r = check(q, said);
    setRes({ said, ...r });
    if (!(mode === 'speak')) speak(sayAll(q));
    if (again) {
      if (r.ok) sfx.correct(1);
      else sfx.wrong();
      return;
    }
    if (r.ok) {
      const c = combo + 1;
      const gain = 5 + (c >= 3 ? 1 : 0);
      setCombo(c);
      setScore((s) => s + 1);
      setXp((x) => x + gain);
      recordActivity('verbs', gain);
      sfx.correct(c);
      timer.current = setTimeout(next, 1800);
    } else {
      setCombo(0);
      setWrong((w) => [...w, q]);
      recordActivity('verbs', 0);
      sfx.wrong();
    }
  };

  const slot = (label: string, value: string, state: boolean | null) => (
    <div
      className={cx(
        'flex-1 rounded-xl border-2 px-2 py-2 text-center',
        state === null ? 'border-dashed border-line' : state ? 'border-emerald-500/60 bg-emerald-500/8' : 'border-red-500/50 bg-red-500/5',
      )}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-0.5 min-h-6 text-base font-bold">{state === null ? '?' : value}</div>
    </div>
  );

  return (
    <div>
      <GameHeader title="Nepravidelná slovesa" subtitle={`${score} správně · ${xp} XP`} i={i} total={qs.length} combo={combo} onBack={() => setMode(null)} />
      <Card key={i} className="mb-4 space-y-4 animate-up">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-3xl font-extrabold">{q.base}</div>
            <div className="text-sm text-muted">{q.cz}</div>
          </div>
          <ModeBadge mode={mode} />
        </div>
        <div className="flex gap-2">
          {slot('infinitiv', q.base, true)}
          {slot('minulý čas', q.past, res ? res.pastOk : null)}
          {slot('příčestí', q.pp, res ? res.ppOk : null)}
        </div>
        {!res && (
          <div className="text-xs text-muted">
            {mode === 'speak' ? 'Řekni oba tvary za sebou, třeba „went, gone“.' : 'Napiš oba tvary za sebou, třeba „went gone“.'}
          </div>
        )}
      </Card>

      {!res ? (
        <AnswerBox mode={mode} resetKey={`${round}-${i}-${again}`} placeholder="minulý čas  příčestí" hint="Řekni oba tvary nahlas" onSubmit={submit} />
      ) : (
        <div className="space-y-3 animate-up">
          <div className={cx('flex items-center gap-1.5 text-sm font-bold', res.ok ? 'text-emerald-500' : 'text-red-500')}>
            {res.ok ? <Check className="size-4" /> : <X className="size-4" />}
            {res.ok ? 'Správně!' : 'Správně je:'}
            <span className="ml-1 text-fg">
              {q.base} – {q.past} – {q.pp}
            </span>
            <SpeakButton text={sayAll(q)} compact />
          </div>
          {!res.ok && <HeardAs mode={mode} said={res.said} />}
          <div className="flex gap-2">
            {!res.ok && (
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
