// All mini-games, grouped for the Games screen, plus the rotating game of the day.
import type { IconName } from '../components/icons';
import type { Route } from '../lib/router';
import { ttsSupported } from '../lib/speech';
import { todayKey } from '../lib/store';

export interface GameDef {
  route: Route;
  id: string;
  title: string;
  desc: string;
  icon: IconName;
  bg: string;
  isNew?: boolean;
  tts?: boolean;
}

export const GAME_LIST: { title: string; games: GameDef[] }[] = [
  {
    title: 'Slovíčka',
    games: [
      { route: 'quiz', id: 'quiz', title: 'Kvíz', desc: '12 otázek na čas', icon: 'medal', bg: 'from-violet-500 to-indigo-600' },
      { route: 'blitz', id: 'blitz', title: 'Blesk', desc: '60 s: sedí význam?', icon: 'bolt', bg: 'from-yellow-400 to-orange-500', isNew: true },
      { route: 'match', id: 'match', title: 'Párování', desc: 'Spoj dvojice na čas', icon: 'sparkle', bg: 'from-pink-500 to-fuchsia-600' },
      { route: 'cards', id: 'cards', title: 'Kartičky', desc: 'Otoč a švihni', icon: 'layers', bg: 'from-purple-500 to-violet-700' },
    ],
  },
  {
    title: 'Gramatika a věty',
    games: [
      { route: 'builder', id: 'builder', title: 'Skládání vět', desc: 'Správný slovosled', icon: 'layers', bg: 'from-sky-500 to-blue-600' },
      { route: 'verbs', id: 'verbs', title: 'Nepravidelná slovesa', desc: 'go – went – gone', icon: 'ladder', bg: 'from-teal-500 to-emerald-600', isNew: true },
      { route: 'preps', id: 'preps', title: 'Předložky', desc: 'in, on, at…', icon: 'flag', bg: 'from-indigo-500 to-blue-700', isNew: true },
      { route: 'grammar', id: 'grammar', title: 'Gramatika', desc: 'Doplň tvar', icon: 'book', bg: 'from-amber-500 to-orange-600' },
      { route: 'traps', id: 'traps', title: 'Chytáky', desc: 'Typické chyby Čechů', icon: 'target', bg: 'from-rose-500 to-red-600' },
    ],
  },
  {
    title: 'Poslech a mluvení',
    games: [
      { route: 'sprint', id: 'sprint', title: 'Rychlé fráze', desc: 'Řekni větu, hned víš', icon: 'bolt', bg: 'from-orange-500 to-rose-500' },
      { route: 'listen', id: 'listen', title: 'Poslech', desc: 'Slyšíš a opakuješ', icon: 'chat', bg: 'from-emerald-500 to-teal-600', tts: true },
      { route: 'numbers', id: 'numbers', title: 'Čísla poslechem', desc: '13 nebo 30? Ceny, časy', icon: 'coins', bg: 'from-cyan-500 to-sky-600', isNew: true, tts: true },
      { route: 'fluency', id: 'fluency', title: 'Mluv na čas', desc: 'Slova za minutu', icon: 'mic', bg: 'from-lime-500 to-emerald-600', isNew: true },
      { route: 'situations', id: 'situations', title: 'Co řekneš?', desc: 'Přirozená reakce', icon: 'dialog', bg: 'from-fuchsia-500 to-pink-600', isNew: true },
    ],
  },
];

/** Featured game of the day rotates. */
export function gameOfDay(): GameDef {
  const all = GAME_LIST.flatMap((c) => c.games).filter((g) => g.route !== 'cards' && g.route !== 'fluency' && (!g.tts || ttsSupported));
  let h = 0;
  for (const ch of todayKey()) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return all[h % all.length];
}

