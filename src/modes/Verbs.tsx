import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Choice, GameEnd, GameHeader, type ChoiceState } from '../components/game';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, cx } from '../components/ui';
import { verbsFor, wrongForms, type Verb } from '../data/verbs';
import { sample, shuffle } from '../data/wordbank';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';

const ROUND = 10;

interface Q {
  verb: Verb;
  past: string[];
  pp: string[];
}

function build(level: number): Q[] {
  return sample(verbsFor(level), ROUND).map((verb) => ({
    verb,
    past: shuffle([verb.past, ...shuffle(wrongForms(verb, 'past')).slice(0, 3)]),
    pp: shuffle([verb.pp, ...shuffle(wrongForms(verb, 'pp')).slice(0, 3)]),
  }));
}

/** Irregular verbs: pick the past simple, then the past participle. */
export default function Verbs() {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const qs = useMemo(() => build(level), [level, round]);
  const [i, setI] = useState(0);
  const [step, setStep] = useState<'past' | 'pp' | 'done'>('past');
  const [picked, setPicked] = useState<{ past?: string; pp?: string }>({});
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wrong, setWrong] = useState<Verb[]>([]);
  const [result, setResult] = useState<{ best: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setI(0);
    setStep('past');
    setPicked({});
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

  const q = qs[i];
  if (!q)
    return (
      <div>
        <GameHeader title="Nepravidelná slovesa" i={qs.length} total={qs.length} combo={0} />
        <GameEnd score={score} total={qs.length} xp={xp} best={result?.best} extra="sloves se všemi tvary správně" onAgain={() => setRound((r) => r + 1)}>
          {wrong.length > 0 && (
            <div className="space-y-1.5 text-left">
              <Label>Zopakuj si</Label>
              {wrong.map((v) => (
                <div key={v.base} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm">
                  <span className="flex-1">
                    <b>{v.base}</b> – <b>{v.past}</b> – <b>{v.pp}</b> <span className="text-xs text-muted">· {v.cz}</span>
                  </span>
                  <SpeakButton text={`${v.base}, ${v.past.replace('/', ', ')}, ${v.pp}`} compact />
                </div>
              ))}
            </div>
          )}
        </GameEnd>
      </div>
    );

  const options = step === 'pp' || (step === 'done' && picked.pp) ? q.pp : q.past;
  const current = step === 'done' ? 'pp' : step;
  const answer = current === 'past' ? q.verb.past : q.verb.pp;
  const chosen = picked[current];

  const next = () => {
    clearTimeout(timer.current);
    setStep('past');
    setPicked({});
    setI((x) => x + 1);
  };

  const choose = (o: string) => {
    if (chosen) return;
    const ok = o === answer;
    setPicked((p) => ({ ...p, [current]: o }));
    if (ok) sfx.correct(combo + 1);
    else sfx.wrong();
    if (current === 'past') {
      if (!ok) setWrong((w) => [...w, q.verb]);
      timer.current = setTimeout(() => setStep('pp'), ok ? 650 : 1600);
      return;
    }
    // finished this verb
    const allOk = ok && picked.past === q.verb.past;
    if (!ok && picked.past === q.verb.past) setWrong((w) => [...w, q.verb]);
    setStep('done');
    speak(`${q.verb.base}, ${q.verb.past.replace('/', ', ')}, ${q.verb.pp}`);
    if (allOk) {
      const c = combo + 1;
      const gain = 4 + (c >= 3 ? 1 : 0);
      setCombo(c);
      setScore((s) => s + 1);
      setXp((x) => x + gain);
      recordActivity('verbs', gain);
      timer.current = setTimeout(next, 1700);
    } else {
      setCombo(0);
      recordActivity('verbs', 0);
    }
  };

  const stateOf = (o: string): ChoiceState => (!chosen ? 'idle' : o === answer ? 'correct' : o === chosen ? 'wrong' : 'dim');
  const slot = (label: string, value: string | undefined, active: boolean, ok?: boolean) => (
    <div
      className={cx(
        'flex-1 rounded-xl border-2 px-2 py-2 text-center transition',
        active ? 'border-accent bg-accent/8' : value ? (ok ? 'border-emerald-500/60 bg-emerald-500/8' : 'border-red-500/50 bg-red-500/5') : 'border-dashed border-line',
      )}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-0.5 min-h-6 text-base font-bold">{value ?? '?'}</div>
    </div>
  );

  return (
    <div>
      <GameHeader title="Nepravidelná slovesa" subtitle={`${score} správně · ${xp} XP`} i={i} total={qs.length} combo={combo} />
      <Card key={i} className="mb-4 space-y-4 animate-up">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-3xl font-extrabold">{q.verb.base}</div>
            <div className="text-sm text-muted">{q.verb.cz}</div>
          </div>
          <SpeakButton text={q.verb.base} compact />
        </div>
        <div className="flex gap-2">
          {slot('infinitiv', q.verb.base, false, true)}
          {slot('minulý čas', picked.past ? q.verb.past : undefined, current === 'past' && !chosen, picked.past === q.verb.past)}
          {slot('příčestí', picked.pp ? q.verb.pp : undefined, current === 'pp' && !chosen, picked.pp === q.verb.pp)}
        </div>
      </Card>

      <Label className="mb-2">{current === 'past' ? 'Vyber minulý čas (I … yesterday)' : 'Vyber příčestí (I have …)'}</Label>
      <div className="grid grid-cols-2 gap-2.5">
        {options.map((o) => (
          <Choice key={`${current}-${o}`} state={stateOf(o)} onClick={() => choose(o)}>
            <span className="block text-center text-lg">{o}</span>
          </Choice>
        ))}
      </div>

      {step === 'done' && !(picked.past === q.verb.past && picked.pp === q.verb.pp) && (
        <Card className="mt-4 space-y-3 border-amber-500/30 animate-up">
          <div className="text-center text-lg">
            <b>{q.verb.base}</b> – <b className="text-accent">{q.verb.past}</b> – <b className="text-accent">{q.verb.pp}</b>
          </div>
          <div className="text-center text-xs text-muted">
            Yesterday I <b>{q.verb.past.split('/')[0]}</b>… · I have <b>{q.verb.pp}</b>…
          </div>
          <Btn variant="primary" className="h-12 w-full" onClick={next}>
            Další <ChevronRight className="size-4" />
          </Btn>
        </Card>
      )}
    </div>
  );
}
