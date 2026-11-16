// Daily quests (three small goals that change every day, with a chest reward) and a weekly challenge.
import type { IconName, Tone } from '../components/icons';
import { dayXp, todayKey } from './store';
import type { AppState, DayStats } from './types';

export interface Quest {
  id: string;
  title: string;
  icon: IconName;
  tone: Tone;
  done: number;
  target: number;
}

const SPEAK = ['drill', 'ladder', 'monologue', 'roleplay', 'stories', 'sprint', 'listen', 'mistake-practice'];

type Def = { id: string; icon: IconName; tone: Tone; make: (d: DayStats, goal: number) => { title: string; done: number; target: number } };

const DEFS: Def[] = [
  { id: 'games2', icon: 'medal', tone: 'violet', make: (d) => ({ title: 'Dokonči 2 hry', done: d.games ?? 0, target: 2 }) },
  { id: 'games3', icon: 'medal', tone: 'violet', make: (d) => ({ title: 'Dokonči 3 hry', done: d.games ?? 0, target: 3 }) },
  { id: 'perfect', icon: 'trophy', tone: 'amber', make: (d) => ({ title: 'Zahraj kolo bez jediné chyby', done: d.perfect ?? 0, target: 1 }) },
  { id: 'words40', icon: 'mic', tone: 'sky', make: (d) => ({ title: 'Řekni anglicky 40 slov', done: d.words, target: 40 }) },
  { id: 'words80', icon: 'mic', tone: 'sky', make: (d) => ({ title: 'Řekni anglicky 80 slov', done: d.words, target: 80 }) },
  { id: 'answers30', icon: 'target', tone: 'rose', make: (d) => ({ title: 'Odpověz na 30 otázek', done: d.answers, target: 30 }) },
  { id: 'xp', icon: 'sparkle', tone: 'amber', make: (d, goal) => ({ title: `Získej ${Math.round(goal * 1.5)} XP`, done: dayXp(d), target: Math.round(goal * 1.5) }) },
  { id: 'path', icon: 'flag', tone: 'emerald', make: (d) => ({ title: 'Splň 2 kroky na Cestě', done: d.steps ?? 0, target: 2 }) },
  { id: 'variety', icon: 'layers', tone: 'teal', make: (d) => ({ title: 'Vyzkoušej 4 různá cvičení', done: Object.keys(d.modes ?? {}).length, target: 4 }) },
  {
    id: 'speak',
    icon: 'dialog',
    tone: 'emerald',
    make: (d) => ({ title: 'Mluv nahlas v 10 odpovědích', done: SPEAK.reduce((n, r) => n + (d.modes?.[r] ?? 0), 0), target: 10 }),
  },
  { id: 'vocab', icon: 'cards', tone: 'pink', make: (d) => ({ title: 'Zopakuj 10 slovíček', done: (d.modes?.['vocab-review'] ?? 0) + (d.modes?.cards ?? 0), target: 10 }) },
];

function hash(s: string) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Today's three quests – same for the whole day, different each day, never two of a kind. */
export function dailyQuests(s: AppState, key = todayKey()): Quest[] {
  const d = s.days[key] ?? { words: 0, answers: 0 };
  const pool = DEFS.filter((q) => q.id !== 'vocab' || s.vocab.length >= 10);
  const out: Def[] = [];
  let h = hash(key);
  for (let guard = 0; out.length < 3 && guard < 200; guard++) {
    const q = pool[h % pool.length];
    const kind = q.id.replace(/\d+$/, '');
    if (!out.some((x) => x.id.replace(/\d+$/, '') === kind)) out.push(q);
    h = hash(String(h));
  }
  return out.map((q) => {
    const m = q.make(d, s.settings.dailyGoal);
    return { id: q.id, icon: q.icon, tone: q.tone, ...m, done: Math.min(m.done, m.target) };
  });
}

export function mondayKey(d = new Date()) {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return todayKey(x);
}

/** Weekly challenge: reach the daily goal on 5 days of the week (Mon–Sun). */
export function weeklyChallenge(s: AppState) {
  const mon = new Date();
  mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => {
    const x = new Date(mon);
    x.setDate(mon.getDate() + i);
    const k = todayKey(x);
    return { k, met: dayXp(s.days[k]) >= s.settings.dailyGoal, future: k > todayKey() };
  });
  const done = days.filter((d) => d.met).length;
  return { key: mondayKey(), days, done: Math.min(done, 5), target: 5, claimed: s.weekClaim === mondayKey() };
}

/** Bonus XP in a chest: random but stable for the day. */
export const chestXp = (key = todayKey()) => 20 + (hash(`chest-${key}`) % 4) * 10;
