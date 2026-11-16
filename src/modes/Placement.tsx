import { useMemo, useState } from 'react';
import { Choice, GameHeader, type ChoiceState } from '../components/game';
import { IconTile } from '../components/icons';
import { Btn, Card, Label, cx } from '../components/ui';
import { GRAMMAR } from '../data/grammar';
import { getLevel } from '../data/levels';
import { sample, shuffle } from '../data/wordbank';
import { navigate } from '../lib/router';
import { sfx } from '../lib/sfx';
import { updateSettings } from '../lib/store';
import { celebrate } from '../lib/ui';
import { GapSentence } from './Grammar';

const PER_LEVEL = 4;
const PASS = 3;

/**
 * Short placement test: 4 grammar questions per level, starting at A1.
 * A level counts as passed with 3 of 4 correct; the test stops at the first level that is not passed.
 */
export default function Placement() {
  const [seed, setSeed] = useState(0);
  const byLevel = useMemo(
    () => [1, 2, 3, 4].map((l) => sample(GRAMMAR.filter((q) => q.level === l), PER_LEVEL).map((q) => ({ q, order: shuffle(q.options.map((_, n) => n)) }))),
    [seed],
  );
  const [lv, setLv] = useState(0); // index into byLevel
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [passed, setPassed] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const recommended = (() => {
    const top = passed.length ? Math.max(...passed) : 0;
    if (top === 4) return 5; // aced B2 questions → try C1
    return Math.max(1, top) as 1 | 2 | 3 | 4 | 5;
  })();

  if (done) {
    const L = getLevel(recommended);
    return (
      <div>
        <GameHeader title="Rozřazovací test" i={1} total={1} combo={0} />
        <Card className="space-y-4 py-7 text-center animate-up">
          <div className="flex justify-center">
            <span className="grid size-16 place-items-center rounded-3xl bg-accent text-3xl font-extrabold text-white shadow-lg shadow-accent/30 animate-pop">{recommended}</span>
          </div>
          <div>
            <div className="text-sm text-muted">Doporučená úroveň</div>
            <div className="text-2xl font-extrabold">
              {L.name} <span className="text-base font-semibold text-muted">{L.cefr}</span>
            </div>
            <div className="mx-auto mt-1 max-w-xs text-sm text-muted">{L.desc}</div>
          </div>
          <div className="flex justify-center gap-1.5">
            {[1, 2, 3, 4].map((l) => (
              <span
                key={l}
                className={cx(
                  'rounded-full px-2.5 py-1 text-[11px] font-bold',
                  passed.includes(l) ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' : 'bg-surface-3 text-muted',
                )}
              >
                {['A1', 'A2', 'B1', 'B2'][l - 1]} {passed.includes(l) ? '✓' : ''}
              </span>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Btn className="flex-1" onClick={() => (setSeed((x) => x + 1), setLv(0), setI(0), setOk(0), setPassed([]), setDone(false))}>
              Znovu
            </Btn>
            <Btn
              variant="primary"
              className="flex-1"
              onClick={() => {
                updateSettings({ level: recommended });
                navigate('home');
              }}
            >
              Nastavit úroveň {recommended}
            </Btn>
          </div>
        </Card>
      </div>
    );
  }

  const { q, order } = byLevel[lv][i];
  const total = PER_LEVEL * 4;
  const pos = lv * PER_LEVEL + i;
  const choose = (n: number) => {
    if (picked !== null) return;
    setPicked(n);
    const right = n === q.a;
    if (right) sfx.correct();
    else sfx.wrong();
    const okNow = ok + (right ? 1 : 0);
    setTimeout(() => {
      setPicked(null);
      if (i + 1 < PER_LEVEL) {
        setOk(okNow);
        setI(i + 1);
        return;
      }
      // level finished
      const level = lv + 1;
      if (okNow >= PASS) {
        const np = [...passed, level];
        setPassed(np);
        if (lv + 1 < 4) {
          setLv(lv + 1);
          setI(0);
          setOk(0);
        } else {
          setDone(true);
          celebrate();
          sfx.win();
        }
      } else setDone(true);
    }, 650);
  };
  const state = (n: number): ChoiceState => (picked === null ? 'idle' : n === q.a ? 'correct' : n === picked ? 'wrong' : 'dim');

  return (
    <div>
      <GameHeader title="Rozřazovací test" subtitle={`Část ${lv + 1}/4 · ${['A1', 'A2', 'B1', 'B2'][lv]}`} i={pos} total={total} combo={0} />
      {pos === 0 && (
        <Card className="mb-4 flex items-center gap-3 py-3">
          <IconTile name="target" tone="violet" size="sm" />
          <div className="text-xs text-muted">Odpovídej bez nápovědy. Test se sám zastaví, jakmile otázky začnou být moc těžké.</div>
        </Card>
      )}
      <Card key={pos} className="mb-4 animate-up">
        <Label>Doplň správný tvar</Label>
        <div className="mt-3 text-xl font-semibold leading-relaxed">
          <GapSentence q={q} chosen={picked === null ? null : q.options[picked]} />
        </div>
      </Card>
      <div className="space-y-2.5">
        {order.map((n) => (
          <Choice key={n} state={state(n)} onClick={() => choose(n)}>
            {q.options[n]}
          </Choice>
        ))}
      </div>
      <div className="mt-4 text-center">
        <button className="text-xs text-muted underline" onClick={() => choose(-1)}>
          Nevím
        </button>
      </div>
    </div>
  );
}
