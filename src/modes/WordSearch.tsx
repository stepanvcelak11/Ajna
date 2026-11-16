import { Lightbulb, Timer } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GameEnd } from '../components/game';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, ModeHeader, cx } from '../components/ui';
import { makeWordSearch, puzzleWords, type Placed } from '../data/puzzles';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';

const COLORS = ['bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-sky-400', 'bg-violet-400', 'bg-pink-400', 'bg-lime-400', 'bg-orange-400', 'bg-teal-400', 'bg-indigo-400'];

function setup(level: number) {
  const lv = Math.min(level, 4);
  const size = lv === 1 ? 8 : 10;
  const n = lv === 1 ? 6 : lv === 2 ? 8 : 9;
  const dirs: [number, number][] =
    lv === 1
      ? [
          [0, 1],
          [1, 0],
        ]
      : lv === 2
        ? [
            [0, 1],
            [1, 0],
            [1, 1],
          ]
        : [
            [0, 1],
            [1, 0],
            [1, 1],
            [-1, 1],
            [0, -1],
            [-1, 0],
          ];
  return { size, ...makeWordSearch(puzzleWords(level, n, 3, size), size, dirs) };
}

type Cell = [number, number];

/** Line of cells from a to b if they are in a straight row, column or diagonal. */
function line(a: Cell, b: Cell): Cell[] | null {
  const dr = Math.sign(b[0] - a[0]);
  const dc = Math.sign(b[1] - a[1]);
  const len = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
  if (dr !== 0 && dc !== 0 && Math.abs(b[0] - a[0]) !== Math.abs(b[1] - a[1])) return null;
  return Array.from({ length: len + 1 }, (_, k) => [a[0] + dr * k, a[1] + dc * k] as Cell);
}

/** Osmisměrka: find the English words for the Czech clues. Drag across the letters, or tap the first and the last one. */
export default function WordSearch() {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const { size, grid, placed } = useMemo(() => setup(level), [level, round]);
  const [found, setFound] = useState<string[]>([]);
  const [anchor, setAnchor] = useState<Cell | null>(null);
  const [hover, setHover] = useState<Cell | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const [wrong, setWrong] = useState(false);
  const [secs, setSecs] = useState(0);
  const [result, setResult] = useState<{ best: boolean; xp: number } | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    setFound([]);
    setAnchor(null);
    setHover(null);
    setHints({});
    setSecs(0);
    setResult(null);
  }, [grid]);

  const done = placed.length > 0 && found.length === placed.length;
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [done, grid]);

  useEffect(() => {
    if (done && !result) {
      const clean = placed.filter((p) => !hints[p.en]).length;
      const xp = clean * 3 + (placed.length - clean);
      recordActivity('wordsearch', xp);
      setResult({ best: recordGame('wordsearch', clean, placed.length, clean === placed.length ? secs : undefined), xp });
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const colorOf = useMemo(() => {
    const m = new Map<string, string>();
    found.forEach((en) => {
      const p = placed.find((x) => x.en === en)!;
      const col = COLORS[placed.indexOf(p) % COLORS.length];
      for (let k = 0; k < p.en.length; k++) m.set(`${p.r + p.dr * k},${p.c + p.dc * k}`, col);
    });
    return m;
  }, [found, placed]);

  const sel = anchor && hover ? line(anchor, hover) : anchor ? [anchor] : null;
  const selSet = new Set((sel ?? []).map(([r, c]) => `${r},${c}`));
  const hintCells = new Set(
    placed.filter((p) => hints[p.en] && !found.includes(p.en)).map((p) => `${p.r},${p.c}`),
  );

  const check = (cells: Cell[]) => {
    const word = cells.map(([r, c]) => grid[r][c]).join('');
    const rev = [...word].reverse().join('');
    const p = placed.find((x) => !found.includes(x.en) && (x.en === word || x.en === rev) && cells.length === x.en.length);
    // also require the exact position (a word can appear by accident elsewhere)
    const exact =
      p &&
      ((cells[0][0] === p.r && cells[0][1] === p.c) || (cells[cells.length - 1][0] === p.r && cells[cells.length - 1][1] === p.c));
    if (p && exact) {
      setFound((f) => [...f, p.en]);
      sfx.correct(found.length + 1);
      speak(p.orig);
      return true;
    }
    if (cells.length > 1) {
      sfx.wrong();
      setWrong(true);
      setTimeout(() => setWrong(false), 350);
    }
    return false;
  };

  const cellAt = (x: number, y: number): Cell | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const r = el?.dataset.r;
    const c = el?.dataset.c;
    return r !== undefined && c !== undefined ? [+r, +c] : null;
  };

  const onDown = (e: React.PointerEvent) => {
    const cell = cellAt(e.clientX, e.clientY);
    if (!cell) return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    moved.current = false;
    if (anchor && !(anchor[0] === cell[0] && anchor[1] === cell[1])) {
      // second tap of tap-tap selection
      const l = line(anchor, cell);
      if (l) check(l);
      setAnchor(null);
      setHover(null);
      return;
    }
    setAnchor(cell);
    setHover(cell);
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging || !anchor) return;
    const cell = cellAt(e.clientX, e.clientY);
    if (!cell) return;
    if (cell[0] !== anchor[0] || cell[1] !== anchor[1]) moved.current = true;
    if (line(anchor, cell)) setHover(cell);
  };
  const onUp = () => {
    setDragging(false);
    if (!anchor) return;
    if (moved.current && sel && sel.length > 1) {
      check(sel);
      setAnchor(null);
      setHover(null);
    }
    // otherwise keep the anchor for a tap-tap selection
  };

  const hint = () => {
    const p = placed.find((x) => !found.includes(x.en) && !hints[x.en]);
    if (p) setHints((h) => ({ ...h, [p.en]: true }));
  };

  if (done && result)
    return (
      <div>
        <ModeHeader title="Osmisměrka" />
        <GameEnd
          score={placed.filter((p) => !hints[p.en]).length}
          total={placed.length}
          xp={result.xp}
          best={result.best}
          icon="sparkle"
          extra={`slov bez nápovědy · čas ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`}
          onAgain={() => setRound((r) => r + 1)}
        >
          <WordList placed={placed} found={found} />
        </GameEnd>
      </div>
    );

  return (
    <div className="select-none">
      <ModeHeader
        title="Osmisměrka"
        subtitle={`${found.length}/${placed.length} slov`}
        right={
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1 text-xs font-bold tabular-nums">
            <Timer className="size-3.5" /> {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
          </span>
        }
      />
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className={cx('mb-4 grid touch-none gap-1 rounded-2xl border border-line bg-surface p-2', wrong && 'animate-shake')}
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {grid.map((row, r) =>
          row.map((ch, c) => {
            const k = `${r},${c}`;
            const col = colorOf.get(k);
            return (
              <div
                key={k}
                data-r={r}
                data-c={c}
                className={cx(
                  'grid aspect-square place-items-center rounded-lg text-[15px] font-extrabold transition-colors sm:text-lg',
                  selSet.has(k) ? 'scale-105 bg-accent text-white' : col ? `${col} text-white` : hintCells.has(k) ? 'bg-amber-300/60 text-amber-950 ring-2 ring-amber-400' : 'bg-surface-2',
                )}
              >
                {ch}
              </div>
            );
          }),
        )}
      </div>
      <div className="mb-3 flex items-center justify-between">
        <Label>Najdi anglicky</Label>
        <Btn variant="ghost" className="h-8 px-2 text-xs" onClick={hint}>
          <Lightbulb className="size-4" /> Nápověda
        </Btn>
      </div>
      <WordList placed={placed} found={found} />
      <div className="mt-3 text-center text-[11px] text-muted">Táhni prstem přes písmena, nebo ťukni na první a pak na poslední písmeno.</div>
    </div>
  );
}

function WordList({ placed, found }: { placed: Placed[]; found: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-left">
      {placed.map((p, i) => {
        const f = found.includes(p.en);
        return (
          <Card key={p.en} className={cx('flex items-center gap-2 px-3 py-2', f && 'border-emerald-500/40')}>
            <span className={cx('size-2.5 shrink-0 rounded-full', f ? COLORS[i % COLORS.length] : 'bg-surface-3')} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs text-muted">{p.cz}</span>
              <span className={cx('block text-sm font-bold', !f && 'tracking-widest text-muted')}>{f ? p.orig : `${p.en.length} písmen`}</span>
            </span>
            {f && <SpeakButton text={p.orig} compact />}
          </Card>
        );
      })}
    </div>
  );
}
