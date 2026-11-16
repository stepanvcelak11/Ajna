// Learning path: the level's material split into small units. Each unit has four steps:
// new words (quiz), building phrases, listening, and a mastery test. Deterministic, so progress sticks.
import type { IconName, Tone } from '../components/icons';
import { phrasesFor, type Phrase } from './phrases';
import { STARTER_PACKS } from './starterPacks';
import { LESSONS } from './textbook';
import type { Word } from './wordbank';

export type NodeKind = 'words' | 'build' | 'listen' | 'boss';

export interface PathNode {
  id: string;
  kind: NodeKind;
  title: string;
}

export interface PathUnit {
  id: string;
  n: number;
  title: string;
  icon: IconName;
  tone: Tone;
  words: Word[];
  phrases: Phrase[];
  nodes: PathNode[];
}

const WORDS_PER_UNIT = 8;
const TONES: Tone[] = ['violet', 'sky', 'emerald', 'amber', 'pink', 'teal', 'orange', 'indigo', 'rose', 'lime'];
const ICONS: IconName[] = ['flag', 'home', 'chat', 'coffee', 'bag', 'plane', 'briefcase', 'book', 'sparkle', 'trophy'];

export const NODE_INFO: Record<NodeKind, { title: string; icon: IconName }> = {
  words: { title: 'Nová slovíčka', icon: 'cards' },
  build: { title: 'Skládání frází', icon: 'layers' },
  listen: { title: 'Poslech', icon: 'chat' },
  boss: { title: 'Mistrovský test', icon: 'trophy' },
};

function sourcesFor(level: number): { title: string; words: Word[] }[] {
  const lv = Math.min(level, 4);
  const packLevels = lv === 1 ? [1] : lv === 2 ? [2] : lv === 3 ? [3] : [4, 3];
  const out: { title: string; words: Word[] }[] = [];
  for (const p of STARTER_PACKS) if (packLevels.includes(p.level)) out.push({ title: p.cz, words: p.items.map((it) => ({ ...it, from: p.cz })) });
  if (lv >= 3) for (const l of LESSONS) out.push({ title: `Lekce ${l.n}: ${l.cz}`, words: l.vocab.map((it) => ({ ...it, from: `Lekce ${l.n}` })) });
  return out;
}

const cache = new Map<number, PathUnit[]>();

export function pathFor(level: number): PathUnit[] {
  const key = Math.min(level, 4);
  const hit = cache.get(key);
  if (hit) return hit;
  const phrases = phrasesFor(key).filter((p) => p.level === key);
  const units: PathUnit[] = [];
  let pi = 0;
  for (const src of sourcesFor(key)) {
    for (let k = 0; k < src.words.length; k += WORDS_PER_UNIT) {
      const words = src.words.slice(k, k + WORDS_PER_UNIT);
      if (words.length < 4) {
        units[units.length - 1]?.words.push(...words);
        continue;
      }
      const n = units.length + 1;
      const ph: Phrase[] = [];
      for (let j = 0; j < 5 && phrases.length; j++) ph.push(phrases[pi++ % phrases.length]);
      const id = `L${key}-U${n}`;
      const part = Math.floor(k / WORDS_PER_UNIT) + 1;
      const parts = Math.ceil(src.words.length / WORDS_PER_UNIT);
      units.push({
        id,
        n,
        title: parts > 1 ? `${src.title} ${part}` : src.title,
        icon: ICONS[(n - 1) % ICONS.length],
        tone: TONES[(n - 1) % TONES.length],
        words,
        phrases: ph,
        nodes: (['words', 'build', 'listen', 'boss'] as NodeKind[]).map((kind) => ({ id: `${id}-${kind}`, kind, title: NODE_INFO[kind].title })),
      });
    }
  }
  cache.set(key, units);
  return units;
}

export const starsFor = (score: number, total: number) => (total === 0 ? 1 : score / total >= 0.9 ? 3 : score / total >= 0.7 ? 2 : 1);
