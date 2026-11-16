// Word puzzles: word search grid and crossword layout generators, fed by the learner's words.
import { shortCz, shuffle, wordBank } from './wordbank';

export interface PuzzleWord {
  en: string; // uppercase letters only
  cz: string;
  orig: string;
}

/** Single English words of a suitable length; the learner's own words first. */
export function puzzleWords(level: number, n: number, min = 3, max = 9): PuzzleWord[] {
  const bank = wordBank(level as 1 | 2 | 3 | 4 | 5).filter((w) => /^[a-z]+$/i.test(w.en) && w.en.length >= min && w.en.length <= max);
  const mine = shuffle(bank.filter((w) => w.mine));
  const rest = shuffle(bank.filter((w) => !w.mine));
  const out: PuzzleWord[] = [];
  for (const w of [...mine.slice(0, Math.ceil(n / 2)), ...rest, ...mine]) {
    const en = w.en.toUpperCase();
    if (out.some((x) => x.en === en)) continue;
    const cz = shortCz(w.cz);
    if (!cz || out.some((x) => x.cz === cz)) continue;
    out.push({ en, cz, orig: w.en });
    if (out.length >= n) break;
  }
  return out;
}

// ---------- word search ----------

export interface Placed extends PuzzleWord {
  r: number;
  c: number;
  dr: number;
  dc: number;
}

export function makeWordSearch(words: PuzzleWord[], size: number, dirs: [number, number][]) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
    const placed: Placed[] = [];
    for (const w of [...words].sort((a, b) => b.en.length - a.en.length)) {
      let ok = false;
      for (let t = 0; t < 150 && !ok; t++) {
        const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        const er = r + dr * (w.en.length - 1);
        const ec = c + dc * (w.en.length - 1);
        if (er < 0 || er >= size || ec < 0 || ec >= size) continue;
        let fits = true;
        for (let k = 0; k < w.en.length && fits; k++) {
          const ch = grid[r + dr * k][c + dc * k];
          if (ch && ch !== w.en[k]) fits = false;
        }
        if (!fits) continue;
        for (let k = 0; k < w.en.length; k++) grid[r + dr * k][c + dc * k] = w.en[k];
        placed.push({ ...w, r, c, dr, dc });
        ok = true;
      }
    }
    if (placed.length < Math.min(words.length, 4) && attempt < 29) continue;
    // fill the rest with letters weighted like English text
    const FILL = 'EEEEEAAAAOOOIIITTTNNNSSRRHHLLDDCCUUMMPPGGBYWFKV';
    for (const row of grid) for (let i = 0; i < size; i++) if (!row[i]) row[i] = FILL[Math.floor(Math.random() * FILL.length)];
    return { grid, placed };
  }
  return { grid: [], placed: [] };
}

// ---------- crossword ----------

export interface CrossWord extends PuzzleWord {
  r: number;
  c: number;
  across: boolean;
  num: number;
}

export function makeCrossword(words: PuzzleWord[], target: number) {
  let best: CrossWord[] = [];
  let bestScore = -1;
  for (let attempt = 0; attempt < 40; attempt++) {
    const list = shuffle(words).sort((a, b) => b.en.length - a.en.length + (Math.random() - 0.5) * 3);
    const cells = new Map<string, string>();
    const key = (r: number, c: number) => `${r},${c}`;
    const dirOf = new Map<string, string>();
    const placed: Omit<CrossWord, 'num'>[] = [];
    const put = (w: PuzzleWord, r: number, c: number, across: boolean) => {
      for (let k = 0; k < w.en.length; k++) {
        const kk = key(across ? r : r + k, across ? c + k : c);
        cells.set(kk, w.en[k]);
        dirOf.set(kk, (dirOf.get(kk) ?? '') + (across ? 'a' : 'd'));
      }
      placed.push({ ...w, r, c, across });
    };
    const canPut = (w: PuzzleWord, r: number, c: number, across: boolean) => {
      const dr = across ? 0 : 1;
      const dc = across ? 1 : 0;
      if (cells.has(key(r - dr, c - dc)) || cells.has(key(r + dr * w.en.length, c + dc * w.en.length))) return -1;
      let cross = 0;
      for (let k = 0; k < w.en.length; k++) {
        const rr = r + dr * k;
        const cc = c + dc * k;
        const ch = cells.get(key(rr, cc));
        if (ch) {
          if (ch !== w.en[k] || dirOf.get(key(rr, cc))!.includes(across ? 'a' : 'd')) return -1;
          cross++;
        } else if (cells.has(key(rr + dc, cc + dr)) || cells.has(key(rr - dc, cc - dr))) return -1; // touching side by side
      }
      return cross;
    };
    for (const w of list) {
      if (placed.length >= target) break;
      if (!placed.length) {
        put(w, 0, 0, true);
        continue;
      }
      let opt: { r: number; c: number; across: boolean; score: number } | null = null;
      for (const p of placed)
        for (let i = 0; i < p.en.length; i++)
          for (let j = 0; j < w.en.length; j++) {
            if (p.en[i] !== w.en[j]) continue;
            const across = !p.across;
            const pr = p.across ? p.r : p.r + i;
            const pc = p.across ? p.c + i : p.c;
            const r = across ? pr : pr - j;
            const c = across ? pc - j : pc;
            const cross = canPut(w, r, c, across);
            if (cross < 1) continue;
            // keep the whole crossword within 12 × 12 so it fits a phone screen
            const all = [...cells.keys()].map((x) => x.split(',').map(Number));
            const er = across ? r : r + w.en.length - 1;
            const ec = across ? c + w.en.length - 1 : c;
            const rs = [...all.map((x) => x[0]), r, er];
            const cs = [...all.map((x) => x[1]), c, ec];
            if (Math.max(...rs) - Math.min(...rs) >= 12 || Math.max(...cs) - Math.min(...cs) >= 12) continue;
            const score = cross * 10 + Math.random();
            if (!opt || score > opt.score) opt = { r, c, across, score };
          }
      if (opt) put(w, opt.r, opt.c, opt.across);
    }
    const rs = [...cells.keys()].map((k) => +k.split(',')[0]);
    const cs = [...cells.keys()].map((k) => +k.split(',')[1]);
    const h = Math.max(...rs) - Math.min(...rs) + 1;
    const wd = Math.max(...cs) - Math.min(...cs) + 1;
    const score = placed.length * 100 - (h * wd) / 4;
    if (score > bestScore) {
      bestScore = score;
      const r0 = Math.min(...rs);
      const c0 = Math.min(...cs);
      best = placed.map((p) => ({ ...p, r: p.r - r0, c: p.c - c0, num: 0 }));
    }
  }
  // numbering: reading order of start cells
  const starts = [...new Set(best.map((w) => `${w.r},${w.c}`))].sort((a, b) => {
    const [ar, ac] = a.split(',').map(Number);
    const [br, bc] = b.split(',').map(Number);
    return ar - br || ac - bc;
  });
  for (const w of best) w.num = starts.indexOf(`${w.r},${w.c}`) + 1;
  const rows = Math.max(0, ...best.map((w) => (w.across ? w.r + 1 : w.r + w.en.length)));
  const cols = Math.max(0, ...best.map((w) => (w.across ? w.c + w.en.length : w.c + 1)));
  return { words: best, rows, cols };
}
