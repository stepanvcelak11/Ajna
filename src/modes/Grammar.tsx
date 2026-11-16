import { ChevronRight, Lightbulb } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Choice, GameEnd, GameHeader, type ChoiceState } from '../components/game';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, cx } from '../components/ui';
import { grammarFor, type GrammarQ } from '../data/grammar';
import { getLevel } from '../data/levels';
import { sample, shuffle } from '../data/wordbank';
import { sfx } from '../lib/sfx';
import { recordActivity, recordGame, useStore } from '../lib/store';

const ROUND = 10;

export const filled = (q: GrammarQ, opt = q.options[q.a]) => q.q.replace('___', opt === '—' ? '' : opt).replace(/\s+/g, ' ').replace(/\s\(.*\)$/, '');

/** Sentence with the gap shown as a blank or the chosen word. */
export function GapSentence({ q, chosen }: { q: GrammarQ; chosen?: string | null }) {
  const [a, b] = q.q.split('___');
  return (
    <span>
      {a}
      <span
        className={cx(
          'mx-0.5 inline-block min-w-14 rounded-md border-b-2 px-1 text-center',
          !chosen ? 'border-accent text-transparent' : chosen === q.options[q.a] ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500',
        )}
      >
        {chosen ?? '___'}
      </span>
      {b}
    </span>
  );
}

export default function Grammar() {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const qs = useMemo(() => sample(grammarFor(level), ROUND).map((q) => ({ q, order: shuffle(q.options.map((_, n) => n)) })), [level, round]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
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
  }, [qs]);

  useEffect(() => {
    if (qs.length && i === qs.length && !result) setResult({ best: recordGame('grammar', score, qs.length) });
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = qs[i];
  if (!cur)
    return (
      <div>
        <GameHeader title="Gramatika" i={qs.length} total={qs.length} combo={0} />
        <GameEnd score={score} total={qs.length} xp={xp} best={result?.best} icon="book" tone="indigo" onAgain={() => setRound((r) => r + 1)} />
      </div>
    );

  const { q, order } = cur;
  const choose = (n: number) => {
    if (picked !== null) return;
    setPicked(n);
    if (n === q.a) {
      const c = combo + 1;
      const gain = 3 + (c >= 3 ? 1 : 0);
      setCombo(c);
      setScore((s) => s + 1);
      setXp((x) => x + gain);
      recordActivity('grammar', gain);
      sfx.correct(c);
    } else {
      setCombo(0);
      recordActivity('grammar', 0);
      sfx.wrong();
    }
  };
  const state = (n: number): ChoiceState => (picked === null ? 'idle' : n === q.a ? 'correct' : n === picked ? 'wrong' : 'dim');

  return (
    <div>
      <GameHeader title="Gramatika" subtitle={`Úroveň ${level} · ${getLevel(level).name}`} i={i} total={qs.length} combo={combo} />
      <Card key={i} className="mb-4 animate-up">
        <Label>Doplň správný tvar</Label>
        <div className="mt-3 text-xl font-semibold leading-relaxed">
          <GapSentence q={q} chosen={picked === null ? null : q.options[picked]} />
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-2.5">
        {order.map((n) => (
          <Choice key={n} state={state(n)} onClick={() => choose(n)}>
            {q.options[n]}
          </Choice>
        ))}
      </div>
      {picked !== null && (
        <Card className={cx('mt-4 space-y-3 animate-up', picked === q.a ? 'border-emerald-500/40' : 'border-amber-500/40')}>
          <div className="flex items-start gap-2 text-sm">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <span>{q.cz}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="flex-1">{filled(q)}</span>
            <SpeakButton text={filled(q)} compact />
          </div>
          <Btn variant="primary" className="h-12 w-full" onClick={() => (setPicked(null), setI((x) => x + 1))}>
            {i + 1 < qs.length ? 'Další' : 'Výsledky'} <ChevronRight className="size-4" />
          </Btn>
        </Card>
      )}
    </div>
  );
}
