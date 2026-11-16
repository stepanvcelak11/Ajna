import { ChevronRight, Lightbulb } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Choice, GameEnd, GameHeader, type ChoiceState } from '../components/game';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, cx } from '../components/ui';
import { trapsFor } from '../data/traps';
import { sample, shuffle } from '../data/wordbank';
import { sfx } from '../lib/sfx';
import { getState, recordActivity, recordGame, useStore } from '../lib/store';

const ROUND = 10;

interface Item {
  right: string;
  options: string[];
  cz: string;
  mine?: boolean;
}

const norm = (x: string) => x.toLowerCase().replace(/[^a-z' ]/g, '').trim();

/** Built-in typical Czech mistakes + the learner's own mistakes from the Mistake Bank. */
function build(level: number): Item[] {
  const own: Item[] = getState()
    .mistakes.filter((m) => m.fix && m.user_text && norm(m.fix) !== norm(m.user_text) && m.user_text.split(' ').length <= 16)
    .slice(0, 30)
    .map((m) => ({
      right: m.fix,
      options: shuffle([m.fix, m.user_text]),
      cz: m.warnings[0]?.tip_cz ?? 'Tohle je tvoje dřívější chyba z tréninku.',
      mine: true,
    }));
  const builtIn: Item[] = trapsFor(level).map((x) => ({ right: x.right, options: shuffle([x.right, ...x.wrong]), cz: x.cz }));
  const mineCount = Math.min(own.length, 4);
  return shuffle([...sample(own, mineCount), ...sample(builtIn, ROUND - mineCount)]);
}

export default function Traps() {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const items = useMemo(() => build(level), [level, round]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [result, setResult] = useState<{ best: boolean } | null>(null);

  useEffect(() => {
    setI(0);
    setPicked(null);
    setScore(0);
    setXp(0);
    setCombo(0);
    setResult(null);
  }, [items]);

  useEffect(() => {
    if (items.length && i === items.length && !result) setResult({ best: recordGame('traps', score, items.length) });
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const it = items[i];
  if (!it)
    return (
      <div>
        <GameHeader title="Chytáky" i={items.length} total={items.length} combo={0} />
        <GameEnd score={score} total={items.length} xp={xp} best={result?.best} icon="target" tone="rose" extra="chytáků odhaleno" onAgain={() => setRound((r) => r + 1)} />
      </div>
    );

  const choose = (o: string) => {
    if (picked) return;
    setPicked(o);
    if (o === it.right) {
      const c = combo + 1;
      const gain = 3 + (c >= 3 ? 1 : 0) + (it.mine ? 1 : 0);
      setCombo(c);
      setScore((s) => s + 1);
      setXp((x) => x + gain);
      recordActivity('traps', gain);
      sfx.correct(c);
    } else {
      setCombo(0);
      recordActivity('traps', 0);
      sfx.wrong();
    }
  };
  const st = (o: string): ChoiceState => (!picked ? 'idle' : o === it.right ? 'correct' : o === picked ? 'wrong' : 'dim');

  return (
    <div>
      <GameHeader title="Chytáky" subtitle="Najdi větu, která je správně" i={i} total={items.length} combo={combo} />
      <Card key={i} className="mb-4 flex items-center justify-between animate-up">
        <Label>Která věta je správně?</Label>
        {it.mine && <span className="rounded-full bg-rose-500/12 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-300">tvoje chyba</span>}
      </Card>
      <div className="space-y-2.5">
        {it.options.map((o) => (
          <Choice key={o} state={st(o)} onClick={() => choose(o)}>
            {o}
          </Choice>
        ))}
      </div>
      {picked && (
        <Card className={cx('mt-4 space-y-3 animate-up', picked === it.right ? 'border-emerald-500/40' : 'border-amber-500/40')}>
          <div className="flex items-start gap-2 text-sm">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <span>{it.cz}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="flex-1">{it.right}</span>
            <SpeakButton text={it.right} compact />
          </div>
          <Btn variant="primary" className="h-12 w-full" onClick={() => (setPicked(null), setI((x) => x + 1))}>
            {i + 1 < items.length ? 'Další' : 'Výsledky'} <ChevronRight className="size-4" />
          </Btn>
        </Card>
      )}
    </div>
  );
}
