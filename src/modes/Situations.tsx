import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Choice, GameEnd, GameHeader, type ChoiceState } from '../components/game';
import { Icon } from '../components/icons';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label } from '../components/ui';
import { situationsFor, type Situation } from '../data/situations';
import { sample, shuffle } from '../data/wordbank';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';

const ROUND = 8;

/** "Co řekneš?" – choose the natural English reaction to an everyday situation. */
export default function Situations() {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const qs = useMemo(() => sample(situationsFor(level), ROUND).map((s) => ({ s, options: shuffle([s.right, ...s.wrong]) })), [level, round]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [missed, setMissed] = useState<Situation[]>([]);
  const [result, setResult] = useState<{ best: boolean } | null>(null);

  useEffect(() => {
    setI(0);
    setPicked(null);
    setScore(0);
    setXp(0);
    setCombo(0);
    setMissed([]);
    setResult(null);
  }, [qs]);
  useEffect(() => {
    if (qs.length && i === qs.length && !result) setResult({ best: recordGame('situations', score, qs.length) });
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = qs[i];
  if (!q)
    return (
      <div>
        <GameHeader title="Co řekneš?" i={qs.length} total={qs.length} combo={0} />
        <GameEnd score={score} total={qs.length} xp={xp} best={result?.best} extra="přirozených reakcí" onAgain={() => setRound((r) => r + 1)}>
          {missed.length > 0 && (
            <div className="space-y-1.5 text-left">
              <Label>Zapamatuj si</Label>
              {missed.map((m) => (
                <div key={m.cz} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="text-xs text-muted">{m.cz}</div>
                    <div className="font-semibold">{m.right}</div>
                  </div>
                  <SpeakButton text={m.right} compact />
                </div>
              ))}
            </div>
          )}
        </GameEnd>
      </div>
    );

  const choose = (o: string) => {
    if (picked) return;
    setPicked(o);
    speak(q.s.right);
    if (o === q.s.right) {
      const c = combo + 1;
      const gain = 4 + (c >= 3 ? 1 : 0);
      setCombo(c);
      setScore((s) => s + 1);
      setXp((x) => x + gain);
      recordActivity('situations', gain);
      sfx.correct(c);
    } else {
      setCombo(0);
      setMissed((m) => [...m, q.s]);
      recordActivity('situations', 0);
      sfx.wrong();
    }
  };
  const stateOf = (o: string): ChoiceState => (!picked ? 'idle' : o === q.s.right ? 'correct' : o === picked ? 'wrong' : 'dim');

  return (
    <div>
      <GameHeader title="Co řekneš?" subtitle="Vyber nejpřirozenější reakci" i={i} total={qs.length} combo={combo} />
      <Card key={i} className="mb-4 animate-up">
        <Label className="flex items-center gap-1.5">
          <Icon name="dialog" className="size-4 text-accent" /> Situace
        </Label>
        <div className="mt-2 text-xl font-bold leading-snug">{q.s.cz}</div>
      </Card>
      <div className="space-y-2.5">
        {q.options.map((o) => (
          <Choice key={o} state={stateOf(o)} onClick={() => choose(o)}>
            {o}
          </Choice>
        ))}
      </div>
      {picked && (
        <Card className="mt-4 space-y-3 animate-up">
          <div className="flex gap-2 text-sm">
            <Icon name="bulb" className="size-5 text-amber-500" />
            <span>{q.s.why}</span>
          </div>
          <Btn variant="primary" className="h-12 w-full" onClick={() => (setPicked(null), setI((x) => x + 1))}>
            {i + 1 < qs.length ? 'Další' : 'Výsledky'} <ChevronRight className="size-4" />
          </Btn>
        </Card>
      )}
    </div>
  );
}
