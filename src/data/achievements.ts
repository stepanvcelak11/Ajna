// Achievements are derived from the stored progress, so nothing extra has to be tracked.
import type { IconName, Tone } from '../components/icons';
import { dayXp, streak, totalXp } from '../lib/store';
import type { AppState } from '../lib/types';

export interface Badge {
  id: string;
  title: string;
  desc: string;
  icon: IconName;
  tone: Tone;
  progress: (s: AppState) => [value: number, goal: number];
}

const sum = <T,>(a: T[], f: (x: T) => number) => a.reduce((n, x) => n + f(x), 0);
const days = (s: AppState) => Object.values(s.days);
const wordsSpoken = (s: AppState) => sum(days(s), (d) => d.words);
const goalDays = (s: AppState) => days(s).filter((d) => dayXp(d) >= s.settings.dailyGoal).length;
const phrasesKnown = (s: AppState) => Object.values(s.phraseStats).filter((p) => p.ok > p.fail).length;
const game = (s: AppState, id: string) => s.games[id] ?? { plays: 0, best: 0, correct: 0 };
const EXPLORE = ['drill', 'ladder', 'monologue', 'roleplay', 'sprint', 'quiz', 'builder', 'listen', 'match', 'grammar', 'stories', 'traps', 'wordle', 'vocab-review'];
const explored = (s: AppState) => {
  const seen = new Set<string>();
  for (const d of days(s)) for (const k of Object.keys(d.modes ?? {})) seen.add(k);
  return EXPLORE.filter((r) => seen.has(r)).length;
};

export const BADGES: Badge[] = [
  { id: 'first', title: 'První krok', desc: 'Odpověz na první otázku', icon: 'flag', tone: 'violet', progress: (s) => [sum(days(s), (d) => d.answers), 1] },
  { id: 'streak3', title: 'Rozjezd', desc: '3 dny v řadě', icon: 'flame', tone: 'orange', progress: (s) => [streak(s.days), 3] },
  { id: 'streak7', title: 'Celý týden', desc: '7 dní v řadě', icon: 'flame', tone: 'orange', progress: (s) => [streak(s.days), 7] },
  { id: 'streak30', title: 'Neúnavný', desc: '30 dní v řadě', icon: 'flame', tone: 'rose', progress: (s) => [streak(s.days), 30] },
  { id: 'goal7', title: 'Cílevědomý', desc: 'Splň denní cíl 7×', icon: 'goal', tone: 'emerald', progress: (s) => [goalDays(s), 7] },
  { id: 'goal30', title: 'Disciplína', desc: 'Splň denní cíl 30×', icon: 'goal', tone: 'emerald', progress: (s) => [goalDays(s), 30] },
  { id: 'xp1000', title: 'Tisícovka', desc: 'Získej 1 000 XP', icon: 'sparkle', tone: 'amber', progress: (s) => [totalXp(s.days), 1000] },
  { id: 'xp10000', title: 'Legenda', desc: 'Získej 10 000 XP', icon: 'trophy', tone: 'amber', progress: (s) => [totalXp(s.days), 10000] },
  { id: 'talk1k', title: 'Mluvka', desc: 'Řekni 1 000 anglických slov', icon: 'mic', tone: 'sky', progress: (s) => [wordsSpoken(s), 1000] },
  { id: 'talk10k', title: 'Řečník', desc: 'Řekni 10 000 anglických slov', icon: 'dialog', tone: 'sky', progress: (s) => [wordsSpoken(s), 10000] },
  { id: 'vocab50', title: 'Sběratel', desc: 'Měj 50 slovíček v opakování', icon: 'cards', tone: 'pink', progress: (s) => [s.vocab.length, 50] },
  { id: 'vocab200', title: 'Slovník', desc: 'Měj 200 slovíček v opakování', icon: 'book', tone: 'pink', progress: (s) => [s.vocab.length, 200] },
  { id: 'phrases30', title: 'Frázista', desc: 'Zvládni 30 rychlých frází', icon: 'bolt', tone: 'orange', progress: (s) => [phrasesKnown(s), 30] },
  { id: 'fix10', title: 'Opravář', desc: 'Úplně zvládni 10 svých chyb', icon: 'wrench', tone: 'rose', progress: (s) => [s.mistakes.filter((m) => m.mastered).length, 10] },
  { id: 'quizPerfect', title: 'Bez chyby', desc: 'Kvíz 12/12', icon: 'medal', tone: 'violet', progress: (s) => [game(s, 'quiz').perfect ?? 0, 1] },
  { id: 'builder50', title: 'Stavitel vět', desc: 'Slož 50 vět bez nápovědy', icon: 'layers', tone: 'indigo', progress: (s) => [game(s, 'builder').correct, 50] },
  { id: 'listen50', title: 'Bystré ucho', desc: '50 správně zachycených vět v Poslechu', icon: 'sparkle', tone: 'teal', progress: (s) => [game(s, 'listen').correct, 50] },
  {
    id: 'matchFast',
    title: 'Blesk',
    desc: 'Párování bez chyby pod 60 s',
    icon: 'bolt',
    tone: 'lime',
    progress: (s) => [game(s, 'match').bestTime !== undefined && game(s, 'match').bestTime! <= 60 ? 1 : 0, 1],
  },
  { id: 'grammar50', title: 'Gramatik', desc: '50 správných odpovědí v Gramatice', icon: 'book', tone: 'amber', progress: (s) => [game(s, 'grammar').correct, 50] },
  {
    id: 'reader',
    title: 'Čtenář',
    desc: 'Odpověz na 15 otázek k příběhům',
    icon: 'book',
    tone: 'teal',
    progress: (s) => [Object.values(s.days).reduce((n, d) => n + (d.modes?.stories ?? 0), 0), 15],
  },
  { id: 'wordle10', title: 'Hádankář', desc: 'Zahraj si 10× hádání slov', icon: 'sparkle', tone: 'emerald', progress: (s) => [Object.values(s.days).reduce((n, d) => n + (d.modes?.wordle ?? 0), 0), 10] },
  { id: 'traps50', title: 'Lovec chytáků', desc: 'Odhal 50 chytáků', icon: 'target', tone: 'rose', progress: (s) => [game(s, 'traps').correct, 50] },
  { id: 'path10', title: 'Poutník', desc: 'Dokonči 10 kroků na Cestě', icon: 'flag', tone: 'indigo', progress: (s) => [Object.keys(s.path).length, 10] },
  { id: 'path3stars', title: 'Hvězdář', desc: 'Získej 30 hvězd na Cestě', icon: 'sparkle', tone: 'amber', progress: (s) => [Object.values(s.path).reduce((n, x) => n + x, 0), 30] },
  { id: 'verbs100', title: 'Slovesář', desc: '100 nepravidelných sloves správně', icon: 'ladder', tone: 'teal', progress: (s) => [game(s, 'verbs').correct, 100] },
  { id: 'preps50', title: 'In, on, at', desc: '50 předložek správně', icon: 'flag', tone: 'indigo', progress: (s) => [game(s, 'preps').correct, 50] },
  { id: 'numbers', title: 'Počtář', desc: 'Čísla poslechem 10/10', icon: 'coins', tone: 'sky', progress: (s) => [game(s, 'numbers').perfect ?? 0, 1] },
  { id: 'situations', title: 'Diplomat', desc: 'Co řekneš? bez chyby', icon: 'dialog', tone: 'pink', progress: (s) => [game(s, 'situations').perfect ?? 0, 1] },
  { id: 'blitz25', title: 'Bleskový', desc: 'V Blesku 25 bodů', icon: 'bolt', tone: 'amber', progress: (s) => [game(s, 'blitz').best, 25] },
  { id: 'dialogs', title: 'Konverzátor', desc: '50 replik v Dialozích napoprvé', icon: 'dialog', tone: 'rose', progress: (s) => [game(s, 'dialogs').correct, 50] },
  { id: 'hangman', title: 'Kat', desc: 'Šibenice 6/6', icon: 'target', tone: 'slate', progress: (s) => [game(s, 'hangman').perfect ?? 0, 1] },
  { id: 'week', title: 'Týden splněn', desc: 'Splň týdenní výzvu', icon: 'trophy', tone: 'emerald', progress: (s) => [s.weekClaim ? 1 : 0, 1] },
  { id: 'explorer', title: 'Průzkumník', desc: `Vyzkoušej všech ${EXPLORE.length} cvičení`, icon: 'target', tone: 'slate', progress: (s) => [explored(s), EXPLORE.length] },
];

export function unlockedIds(s: AppState) {
  return BADGES.filter((b) => {
    const [v, g] = b.progress(s);
    return v >= g;
  }).map((b) => b.id);
}
