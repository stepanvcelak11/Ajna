import { ArrowDown, ArrowRight, Delete, Lightbulb } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { GameEnd } from '../components/game';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, ModeHeader, cx } from '../components/ui';
import { makeCrossword, puzzleWords, type CrossWord } from '../data/puzzles';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';
import { isTypingTarget } from '../lib/ui';

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const k = (r: number, c: number) => `${r},${c}`;
const cellsOf = (w: CrossWord) => Array.from({ length: w.en.length }, (_, i) => (w.across ? k(w.r, w.c + i) : k(w.r + i, w.c)));

function setup(level: number) {
  const lv = Math.min(level, 4);
  const target = lv === 1 ? 5 : lv === 2 ? 7 : 8;
  return makeCrossword(puzzleWords(level, 26, 3, 9), target);
}

/** Křížovka: Czech clues, type the English words with the on-screen keyboard. */
export default function Crossword() {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const { words, rows, cols } = useMemo(() => setup(level), [level, round]);
  const [letters, setLetters] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [cur, setCur] = useState(0); // index of the selected word
  const [pos, setPos] = useState(0); // position within the selected word
  const [solved, setSolved] = useState<string[]>([]);
  const [result, setResult] = useState<{ best: boolean; xp: number } | null>(null);

  useEffect(() => {
    setLetters({});
    setRevealed({});
    setCur(0);
    setPos(0);
    setSolved([]);
    setResult(null);
  }, [words]);

  const solution = useMemo(() => {
    const m = new Map<string, string>();
    for (const w of words) cellsOf(w).forEach((c, i) => m.set(c, w.en[i]));
    return m;
  }, [words]);
  const numAt = useMemo(() => {
    const m = new Map<string, number>();
    for (const w of words) m.set(k(w.r, w.c), w.num);
    return m;
  }, [words]);

  const w = words[cur];
  const active = new Set(w ? cellsOf(w) : []);
  const done = words.length > 0 && solved.length === words.length;

  // check words whenever letters change
  useEffect(() => {
    const now = words.filter((x) => cellsOf(x).every((c) => letters[c] === solution.get(c))).map((x) => `${x.num}${x.across ? 'a' : 'd'}`);
    const fresh = now.filter((id) => !solved.includes(id));
    if (fresh.length) {
      sfx.correct(now.length);
      const fw = words.find((x) => `${x.num}${x.across ? 'a' : 'd'}` === fresh[0]);
      if (fw) speak(fw.orig);
      setSolved(now);
      // jump to the next unsolved word
      const next = words.findIndex((x, i) => i > cur && !now.includes(`${x.num}${x.across ? 'a' : 'd'}`));
      const any = words.findIndex((x) => !now.includes(`${x.num}${x.across ? 'a' : 'd'}`));
      if (next >= 0 || any >= 0) {
        const ni = next >= 0 ? next : any;
        setCur(ni);
        setPos(Math.max(0, cellsOf(words[ni]).findIndex((c) => !letters[c])));
      }
    }
  }, [letters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (done && !result) {
      const clean = words.filter((x) => !cellsOf(x).some((c) => revealed[c])).length;
      const xp = clean * 4 + (words.length - clean);
      recordActivity('crossword', xp);
      setResult({ best: recordGame('crossword', clean, words.length), xp });
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const type = (key: string) => {
    if (!w || done) return;
    const cells = cellsOf(w);
    if (key === 'back') {
      // delete the current letter, or the previous one if empty
      let p = pos;
      if (!letters[cells[p]] || revealed[cells[p]]) p = Math.max(0, p - 1);
      if (revealed[cells[p]]) {
        setPos(p);
        return;
      }
      setLetters((l) => ({ ...l, [cells[p]]: '' }));
      setPos(p);
      return;
    }
    const cell = cells[pos];
    if (!revealed[cell]) setLetters((l) => ({ ...l, [cell]: key.toUpperCase() }));
    sfx.tap();
    // move to the next empty cell of this word
    let p = pos + 1;
    while (p < cells.length && revealed[cells[p]]) p++;
    setPos(Math.min(p, cells.length - 1));
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey) return;
      if (/^[a-z]$/i.test(e.key)) type(e.key.toLowerCase());
      else if (e.key === 'Backspace') type('back');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const tapCell = (r: number, c: number) => {
    const id = k(r, c);
    const owners = words.map((x, i) => ({ x, i })).filter(({ x }) => cellsOf(x).includes(id));
    if (!owners.length) return;
    // tapping a crossing cell of the current word switches direction
    const other = owners.find(({ i }) => i !== cur);
    const pick = owners.some(({ i }) => i === cur) && other && active.has(id) && cellsOf(w).indexOf(id) === pos ? other : (owners.find(({ i }) => i === cur) ?? owners[0]);
    setCur(pick.i);
    setPos(cellsOf(pick.x).indexOf(id));
  };

  const hint = () => {
    if (!w) return;
    const cells = cellsOf(w);
    const c = cells.find((x) => letters[x] !== solution.get(x));
    if (!c) return;
    setRevealed((r) => ({ ...r, [c]: true }));
    setLetters((l) => ({ ...l, [c]: solution.get(c)! }));
  };

  if (!words.length)
    return (
      <div>
        <ModeHeader title="Křížovka" />
        <Card className="text-center text-sm text-muted">Na křížovku je potřeba víc slovíček. Přidej si balíček ve Slovíčkách.</Card>
      </div>
    );

  if (done && result)
    return (
      <div>
        <ModeHeader title="Křížovka" />
        <GameEnd
          score={words.filter((x) => !cellsOf(x).some((c) => revealed[c])).length}
          total={words.length}
          xp={result.xp}
          best={result.best}
          icon="layers"
          extra="slov bez nápovědy"
          onAgain={() => setRound((r) => r + 1)}
        >
          <div className="space-y-1.5 text-left">
            {words.map((x) => (
              <div key={`${x.num}${x.across}`} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-1.5 text-sm">
                <span className="flex-1">
                  <b>{x.orig}</b> <span className="text-muted">= {x.cz}</span>
                </span>
                <SpeakButton text={x.orig} compact />
              </div>
            ))}
          </div>
        </GameEnd>
      </div>
    );

  const isSolved = (x: CrossWord) => solved.includes(`${x.num}${x.across ? 'a' : 'd'}`);
  const solvedCells = new Set(words.filter(isSolved).flatMap(cellsOf));
  const curCell = w ? cellsOf(w)[pos] : '';

  return (
    <div className="select-none">
      <ModeHeader title="Křížovka" subtitle={`${solved.length}/${words.length} slov`} />

      {/* grid */}
      <div className="mx-auto mb-3 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: `${Math.min(100, cols * 11)}%` }}>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const id = k(r, c);
            if (!solution.has(id)) return <div key={id} className="aspect-square" />;
            const n = numAt.get(id);
            return (
              <button
                key={id}
                onClick={() => tapCell(r, c)}
                className={cx(
                  'relative grid aspect-square place-items-center rounded-[5px] border text-[15px] font-extrabold uppercase transition-colors',
                  id === curCell ? 'border-accent bg-accent text-white' : active.has(id) ? 'border-accent/50 bg-accent/15' : solvedCells.has(id) ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'border-line bg-surface',
                  revealed[id] && id !== curCell && 'text-amber-600',
                )}
              >
                {n && <span className={cx('absolute left-0.5 top-0 text-[8px] font-bold leading-none', id === curCell ? 'text-white/80' : 'text-muted')}>{n}</span>}
                {letters[id]}
              </button>
            );
          }),
        )}
      </div>

      {/* all clues */}
      <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
        {[true, false].map((across) => (
          <div key={String(across)}>
            <Label className="mb-1.5 flex items-center gap-1">
              {across ? <ArrowRight className="size-3.5" /> : <ArrowDown className="size-3.5" />} {across ? 'Vodorovně' : 'Svisle'}
            </Label>
            <div className="space-y-1">
              {words
                .map((x, i) => ({ x, i }))
                .filter(({ x }) => x.across === across)
                .sort((a, b) => a.x.num - b.x.num)
                .map(({ x, i }) => (
                  <button
                    key={i}
                    onClick={() => (setCur(i), setPos(Math.max(0, cellsOf(x).findIndex((c) => !letters[c]))))}
                    className={cx('block w-full rounded-lg px-2 py-1 text-left', i === cur ? 'bg-accent/12 font-semibold' : '', isSolved(x) && 'text-muted line-through')}
                  >
                    <b>{x.num}.</b> {x.cz}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 -mx-4 border-t border-line bg-bg/95 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      {/* current clue */}
      {w && (
        <Card className="mb-2 flex items-center gap-2 border-accent/40 bg-surface px-3 py-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-sm font-bold text-white">{w.num}</span>
          {w.across ? <ArrowRight className="size-4 text-accent" /> : <ArrowDown className="size-4 text-accent" />}
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold">{w.cz}</div>
            <div className="text-[11px] text-muted">{w.en.length} písmen · anglicky</div>
          </div>
          <Btn variant="ghost" className="h-9 px-2" onClick={hint} aria-label="Nápověda: odkrýt písmeno">
            <Lightbulb className="size-4" />
          </Btn>
        </Card>
      )}

      {/* keyboard */}
      <div className="space-y-1.5">
        {ROWS.map((row, r) => (
          <div key={row} className="flex justify-center gap-1">
            {[...row].map((ch) => (
              <button key={ch} onClick={() => type(ch)} className="h-11 min-w-0 max-w-9 flex-1 rounded-lg border border-line bg-surface-2 text-sm font-bold uppercase active:scale-95">
                {ch}
              </button>
            ))}
            {r === 2 && (
              <button onClick={() => type('back')} aria-label="Smazat" className="grid h-11 w-12 place-items-center rounded-lg border border-line bg-surface-2 active:scale-95">
                <Delete className="size-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      </div>
    </div>
  );
}
