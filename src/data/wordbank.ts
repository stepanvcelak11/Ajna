// Material for the offline mini-games, picked to match the learner's level:
// starter packs of the right level, textbook vocabulary (B1) and the learner's own saved words.
import { getState } from '../lib/store';
import { PHRASES, phrasesFor, type Phrase } from './phrases';
import { STARTER_PACKS } from './starterPacks';
import { LESSONS } from './textbook';

export interface Word {
  en: string;
  cz: string;
  pos: string;
  example: string;
  /** where it comes from, shown in the UI */
  from: string;
  mine?: boolean;
}

/** Strip notes in brackets and "NE …" warnings so answers stay short in quizzes. */
export function shortCz(cz: string) {
  return cz
    .replace(/\s*\((?:NE|ne)\b[^)]*\)/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .split(/[;,]/)[0]
    .trim();
}

export function wordBank(level = getState().settings.level): Word[] {
  const lv = Math.min(level, 4);
  const packLevels = lv === 1 ? [1] : lv === 2 ? [1, 2] : lv === 3 ? [2, 3] : [3, 4];
  const out = new Map<string, Word>();
  const add = (w: Word) => {
    const k = w.en.toLowerCase();
    if (!out.has(k) && w.en && w.cz) out.set(k, w);
  };
  // the learner's own words first (most relevant), then level material
  for (const v of getState().vocab) add({ en: v.en, cz: v.cz, pos: v.pos, example: v.example, from: 'Moje slovíčka', mine: true });
  for (const p of STARTER_PACKS) if (packLevels.includes(p.level)) for (const it of p.items) add({ ...it, from: p.cz });
  if (lv >= 3) for (const l of LESSONS) for (const it of l.vocab) add({ ...it, from: `Lekce ${l.n}` });
  return [...out.values()];
}

export function phraseBank(level = getState().settings.level): Phrase[] {
  const p = phrasesFor(level);
  return p.length >= 8 ? p : PHRASES.filter((x) => x.level <= 2);
}

export function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function sample<T>(a: T[], n: number): T[] {
  return shuffle(a).slice(0, n);
}

/** Example sentence without the {gap} braces. */
export const plainExample = (e: string) => e.replace(/[{}]/g, '');
