import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GameEnd, GameHeader } from '../components/game';
import { Icon } from '../components/icons';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, cx } from '../components/ui';
import { PREP_GROUPS, prepsFor, type Prep } from '../data/preps';
import { sample, shuffle } from '../data/wordbank';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';

const ROUND = 10;
const full = (p: Prep) => p.s.replace('_', p.a);

function build(level: number) {
  return sample(prepsFor(level), ROUND).map((p) => {
    const basic = ['in', 'on', 'at'];
    const group = level <= 1 && p.g !== 'other' ? basic : PREP_GROUPS[p.g];
    const others = shuffle(group.filter((x) => x !== p.a));
    // in / on / at are the main confusion, so keep them in when they fit
    const preferred = others.filter((x) => basic.includes(x));
    const rest = others.filter((x) => !basic.includes(x));
    return { p, options: shuffle([p.a, ...[...preferred, ...rest].slice(0, 3)]) };
  });
}

/** in / on / at and friends – tap the right preposition. */
export default function Preps() {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const qs = useMemo(() => build(level), [level, round]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [missed, setMissed] = useState<Prep[]>([]);
  const [result, setResult] = useState<{ best: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setI(0);
    setPicked(null);
    setScore(0);
    setXp(0);
    setCombo(0);
    setMissed([]);
    setResult(null);
  }, [qs]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (qs.length && i === qs.length && !result) setResult({ best: recordGame('preps', score, qs.length) });
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = qs[i];
  if (!q)
    return (
      <div>
        <GameHeader title="Předložky" i={qs.length} total={qs.length} combo={0} />
        <GameEnd score={score} total={qs.length} xp={xp} best={result?.best} extra="správně napoprvé" onAgain={() => setRound((r) => r + 1)}>
          {missed.length > 0 && (
            <div className="space-y-1.5 text-left">
              <Label>Zapamatuj si</Label>
              {missed.map((m) => (
                <div key={m.s} className="rounded-xl bg-surface-2 px-3 py-2 text-sm">
                  <div className="font-semibold">{full(m)}</div>
                  <div className="text-xs text-muted">{m.why}</div>
                </div>
              ))}
            </div>
          )}
        </GameEnd>
      </div>
    );

  const next = () => {
    clearTimeout(timer.current);
    setPicked(null);
    setI((x) => x + 1);
  };
  const choose = (o: string) => {
    if (picked) return;
    setPicked(o);
    speak(full(q.p));
    if (o === q.p.a) {
      const c = combo + 1;
      const gain = 3 + (c >= 3 ? 1 : 0);
      setCombo(c);
      setScore((s) => s + 1);
      setXp((x) => x + gain);
      recordActivity('preps', gain);
      sfx.correct(c);
      timer.current = setTimeout(next, 1500);
    } else {
      setCombo(0);
      setMissed((m) => [...m, q.p]);
      recordActivity('preps', 0);
      sfx.wrong();
    }
  };
  const [before, after] = q.p.s.split('_');
  const ok = picked === q.p.a;

  return (
    <div>
      <GameHeader title="Předložky" subtitle={`${score} správně · ${xp} XP`} i={i} total={qs.length} combo={combo} />
      <Card key={i} className="mb-5 animate-up">
        <Label>Doplň předložku</Label>
        <div className="mt-3 text-2xl font-semibold leading-relaxed">
          {before}
          <span
            className={cx(
              'mx-1 inline-block min-w-14 rounded-lg border-b-4 px-2 text-center',
              !picked ? 'border-accent bg-accent/10 text-transparent' : ok ? 'border-emerald-500 bg-emerald-500/12 text-emerald-600 animate-pop dark:text-emerald-300' : 'border-red-500 bg-red-500/10 text-red-500 animate-shake',
            )}
          >
            {picked ? q.p.a : '___'}
          </span>
          {after}
        </div>
        <div className="mt-2 text-sm text-muted">{q.p.cz}</div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {q.options.map((o) => (
          <button
            key={o}
            disabled={!!picked}
            onClick={() => choose(o)}
            className={cx(
              'h-16 rounded-2xl border-2 border-b-[5px] text-xl font-extrabold transition active:translate-y-0.5 active:border-b-2',
              !picked && 'border-line bg-surface',
              picked && o === q.p.a && 'border-emerald-500 bg-emerald-500/12 text-emerald-600 dark:text-emerald-300',
              picked && o === picked && o !== q.p.a && 'border-red-500 bg-red-500/10 text-red-500',
              picked && o !== picked && o !== q.p.a && 'border-line bg-surface opacity-40',
            )}
          >
            {o}
          </button>
        ))}
      </div>

      {picked && (
        <Card className={cx('mt-4 space-y-3 animate-up', ok ? 'border-emerald-500/40' : 'border-amber-500/40')}>
          <div className="flex items-center gap-2">
            <div className="flex-1 font-semibold">{full(q.p)}</div>
            <SpeakButton text={full(q.p)} compact />
          </div>
          <div className="flex gap-2 text-sm">
            <Icon name="bulb" className="size-5 text-amber-500" />
            <span>{q.p.why}</span>
          </div>
          {!ok && (
            <Btn variant="primary" className="h-12 w-full" onClick={next}>
              {i + 1 < qs.length ? 'Další' : 'Výsledky'} <ChevronRight className="size-4" />
            </Btn>
          )}
        </Card>
      )}
    </div>
  );
}
