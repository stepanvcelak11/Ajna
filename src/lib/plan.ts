// The daily plan: a few concrete tasks with progress, shared by the dashboard and game end screens.
import type { IconName, Tone } from '../components/icons';
import { hasKey } from './llm';
import type { Route } from './router';
import { isDue } from './srs';
import { getState, todayKey } from './store';
import type { DayStats } from './types';
import { wordOfDay } from '../data/wordle';

// The AI exercise of the day rotates so every day feels a bit different.
const CHALLENGES: { route: Route; title: string; target: number; unit: string; icon: IconName; tone: Tone }[] = [
  { route: 'drill', title: 'Přelož 5 vět', target: 5, unit: 'vět', icon: 'swap', tone: 'sky' },
  { route: 'ladder', title: 'Nabal 3 věty', target: 3, unit: 'kroků', icon: 'ladder', tone: 'violet' },
  { route: 'monologue', title: 'Řekni 1 monolog', target: 1, unit: 'monolog', icon: 'mic', tone: 'emerald' },
  { route: 'roleplay', title: 'Zahraj si scénku (4 repliky)', target: 4, unit: 'replik', icon: 'dialog', tone: 'amber' },
];

const DAILY_GAMES: { route: Route; title: string; target: number; icon: IconName; tone: Tone }[] = [
  { route: 'quiz', title: 'Zahraj si Kvíz', target: 12, icon: 'medal', tone: 'violet' },
  { route: 'builder', title: 'Slož 8 vět', target: 8, icon: 'layers', tone: 'sky' },
  { route: 'listen', title: 'Poslech: 8 vět', target: 8, icon: 'chat', tone: 'emerald' },
  { route: 'match', title: 'Párování (3 tabule)', target: 15, icon: 'sparkle', tone: 'pink' },
  { route: 'grammar', title: 'Gramatika: 10 otázek', target: 10, icon: 'book', tone: 'amber' },
  { route: 'traps', title: 'Chytáky: 10 vět', target: 10, icon: 'target', tone: 'rose' },
  { route: 'verbs', title: 'Nepravidelná slovesa: 10', target: 10, icon: 'ladder', tone: 'teal' },
  { route: 'preps', title: 'Předložky: 10 vět', target: 10, icon: 'flag', tone: 'indigo' },
  { route: 'situations', title: 'Co řekneš? (8 situací)', target: 8, icon: 'dialog', tone: 'pink' },
  { route: 'numbers', title: 'Čísla poslechem: 10', target: 10, icon: 'coins', tone: 'sky' },
  { route: 'blitz', title: 'Blesk: 1 kolo', target: 1, icon: 'bolt', tone: 'amber' },
  { route: 'wordsearch', title: 'Osmisměrka', target: 1, icon: 'target', tone: 'emerald' },
  { route: 'crossword', title: 'Křížovka', target: 1, icon: 'layers', tone: 'rose' },
];

export interface Task {
  route: Route;
  title: string;
  done: number;
  target: number;
  icon: IconName;
  tone: Tone;
  ai?: boolean;
}

export function dailyPlan(day: DayStats | undefined, vocabCount: number, vocabDue: number, mistakesDue: number): Task[] {
  const m = day?.modes ?? {};
  const tasks: Task[] = [];
  const reviewed = (m['vocab-review'] ?? 0) + (m.cards ?? 0);
  if (vocabCount > 0 && (vocabDue > 0 || reviewed > 0)) {
    // step 1 + step 2 per card both count as answers, so 10 answers ≈ 5 cards
    tasks.push({ route: 'vocab-review', title: 'Zopakuj slovíčka', done: Math.min(reviewed, 10), target: vocabDue === 0 ? Math.min(reviewed, 10) : 10, icon: 'cards', tone: 'pink' });
  }
  tasks.push({ route: 'wordle', title: 'Slovo dne', done: Math.min(m.wordle ?? 0, 1), target: 1, icon: 'sparkle', tone: 'emerald' });
  tasks.push({ route: 'sprint', title: 'Rychlé fráze (1 kolo)', done: Math.min(m.sprint ?? 0, 10), target: 10, icon: 'bolt', tone: 'orange' });
  const g = DAILY_GAMES[Math.floor(Date.now() / 86400000) % DAILY_GAMES.length];
  tasks.push({ route: g.route, title: g.title, done: Math.min(m[g.route] ?? 0, g.target), target: g.target, icon: g.icon, tone: g.tone });
  const c = CHALLENGES[Math.floor(Date.now() / 86400000) % CHALLENGES.length];
  tasks.push({ route: c.route, title: c.title, done: Math.min(m[c.route] ?? 0, c.target), target: c.target, icon: c.icon, tone: c.tone, ai: true });
  const fixed = m['mistake-practice'] ?? 0;
  if (mistakesDue > 0 || fixed > 0) {
    tasks.push({ route: 'mistake-practice', title: 'Oprav své chyby', done: Math.min(fixed, 3), target: mistakesDue === 0 ? Math.min(fixed, 3) : 3, icon: 'target', tone: 'rose', ai: true });
  }
  return tasks;
}


/** Next unfinished task of today's plan (AI tasks are skipped while offline / without a key). */
export function nextTask(except?: Route): Task | undefined {
  const s = getState();
  const plan = dailyPlan(
    s.days[todayKey()],
    s.vocab.length,
    s.vocab.filter((v) => isDue(v.srs.dueDate)).length,
    s.mistakes.filter((m) => !m.mastered && isDue(m.dueDate)).length,
  );
  const usable = (t: Task) => t.done < t.target && t.route !== except && !(t.ai && (!navigator.onLine || !hasKey()));
  return plan.find(usable);
}

export function wordleDoneToday() {
  const w = getState().wordle;
  return !!w && w.day === todayKey() && (w.guesses.includes(wordOfDay(w.day)[0]) || w.guesses.length >= 6);
}
