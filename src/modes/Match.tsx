import { Timer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { GameEnd, GameHeader } from '../components/game';
import { Card, cx } from '../components/ui';
import { sample, shortCz, shuffle, wordBank, type Word } from '../data/wordbank';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { getState, recordActivity, recordGame, useStore } from '../lib/store';

const BOARDS = 3;
const PAIRS = 5;

interface Cell {
  key: string;
  idx: number; // pair index on the board
  text: string;
  side: 'en' | 'cz';
}

function boards(bank: Word[]): Word[][] {
  // avoid two pairs with the same Czech label on one board
  const words = sample(bank, BOARDS * PAIRS * 2);
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    if (cur.some((x) => shortCz(x.cz) === shortCz(w.cz) || x.en === w.en)) continue;
    cur.push(w);
    if (cur.length === PAIRS) {
      out.push(cur);
      cur = [];
      if (out.length === BOARDS) break;
    }
  }
  return out;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function Match() {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const all = useMemo(() => boards(wordBank(level)), [level, round]);
  const [b, setB] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [sel, setSel] = useState<Cell | null>(null);
  const [bad, setBad] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [start, setStart] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [end, setEnd] = useState<{ time: number; best: boolean; xp: number } | null>(null);
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    setB(0);
    setDone(new Set());
    setSel(null);
    setMistakes(0);
    setStart(Date.now());
    setEnd(null);
    setCombo(0);
  }, [all]);

  useEffect(() => {
    if (end) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [end]);

  const board = all[b];
  const cells = useMemo(() => {
    if (!board) return { en: [] as Cell[], cz: [] as Cell[] };
    return {
      en: shuffle(board.map((w, idx) => ({ key: `e${idx}`, idx, text: w.en, side: 'en' as const }))),
      cz: shuffle(board.map((w, idx) => ({ key: `c${idx}`, idx, text: shortCz(w.cz), side: 'cz' as const }))),
    };
  }, [board]);

  if (all.length < BOARDS)
    return (
      <div>
        <GameHeader title="Párování" i={0} total={1} combo={0} />
        <Card className="text-sm text-muted">Na párování potřebuješ víc slovíček. Přidej si balíček ve Slovíčkách.</Card>
      </div>
    );

  const total = BOARDS * PAIRS;

  if (end)
    return (
      <div>
        <GameHeader title="Párování" i={BOARDS} total={BOARDS} combo={0} />
        <GameEnd
          score={Math.max(0, total - mistakes)}
          total={total}
          xp={end.xp}
          best={end.best}
          icon="layers"
          tone="teal"
          extra={`čas ${fmt(end.time)} · ${mistakes} ${mistakes === 1 ? 'chyba' : mistakes >= 2 && mistakes <= 4 ? 'chyby' : 'chyb'}${
            getState().games.match?.bestTime ? ` · rekord ${fmt(getState().games.match!.bestTime!)}` : ''
          }`}
          onAgain={() => setRound((r) => r + 1)}
        />
      </div>
    );

  const tap = (c: Cell) => {
    if (done.has(c.idx)) return;
    if (!sel || sel.side === c.side) {
      sfx.tap();
      if (c.side === 'en') speak(c.text);
      setSel(sel?.key === c.key ? null : c);
      return;
    }
    if (sel.idx === c.idx) {
      const nd = new Set(done).add(c.idx);
      const cmb = combo + 1;
      setCombo(cmb);
      setDone(nd);
      setSel(null);
      recordActivity('match', 2);
      sfx.correct(cmb);
      if (nd.size === PAIRS) {
        if (b + 1 >= BOARDS) {
          const time = Math.round((Date.now() - start) / 1000);
          const xp = total * 2 + (mistakes === 0 ? 10 : 0);
          if (mistakes === 0) recordActivity('match', 10);
          setEnd({ time, best: recordGame('match', Math.max(0, total - mistakes), total, time), xp });
        } else
          setTimeout(() => {
            setB((x) => x + 1);
            setDone(new Set());
          }, 450);
      }
    } else {
      setMistakes((m) => m + 1);
      setCombo(0);
      setBad([sel.key, c.key]);
      setSel(null);
      sfx.wrong();
      setTimeout(() => setBad([]), 450);
    }
  };

  const cellCls = (c: Cell) =>
    cx(
      'min-h-14 w-full rounded-2xl border-2 px-2 py-2 text-center text-[15px] font-semibold leading-tight transition active:scale-95',
      done.has(c.idx)
        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600/60 dark:text-emerald-300/50 scale-95 opacity-60'
        : bad.includes(c.key)
          ? 'border-red-500 bg-red-500/10 animate-shake'
          : sel?.key === c.key
            ? 'border-accent bg-accent/12 text-accent'
            : 'border-line bg-surface hover:border-accent/40',
    );

  return (
    <div>
      <GameHeader title="Párování" subtitle={`Tabule ${b + 1} z ${BOARDS}`} i={b} total={BOARDS} combo={combo} />
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
          <Timer className="size-4 text-accent" /> {fmt((now - start) / 1000)}
        </span>
        <span className="text-xs text-muted">Chyby: {mistakes}</span>
      </div>
      <div key={b} className="grid grid-cols-2 gap-2.5 animate-up">
        <div className="space-y-2.5">
          {cells.en.map((c) => (
            <button key={c.key} disabled={done.has(c.idx)} onClick={() => tap(c)} className={cellCls(c)}>
              {c.text}
            </button>
          ))}
        </div>
        <div className="space-y-2.5">
          {cells.cz.map((c) => (
            <button key={c.key} disabled={done.has(c.idx)} onClick={() => tap(c)} className={cellCls(c)}>
              {c.text}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-muted">Ťukni na anglické slovo a pak na jeho český význam.</div>
    </div>
  );
}
