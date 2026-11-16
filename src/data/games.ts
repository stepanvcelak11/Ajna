// All mini-games, grouped for the Games screen, plus the rotating game of the day.
import type { IconName } from '../components/icons';
import type { Route } from '../lib/router';
import { ttsSupported } from '../lib/speech';
import { todayKey } from '../lib/store';

export type GameInput = 'both' | 'speak' | 'write' | 'tap';

export interface GameDef {
  route: Route;
  id: string;
  title: string;
  desc: string;
  icon: IconName;
  bg: string;
  input: GameInput;
  isNew?: boolean;
  tts?: boolean;
}

export const GAME_LIST: { title: string; desc: string; input: GameInput; games: GameDef[] }[] = [
  {
    title: 'Mluvením, nebo psaním',
    desc: 'Na začátku vybereš jedno z toho, celé kolo pak hraješ jen tak',
    input: 'both',
    games: [
      { route: 'sprint', id: 'sprint', title: 'Rychlé fráze', desc: 'Česká fráze → anglicky', icon: 'bolt', bg: 'from-orange-500 to-rose-500', input: 'both' },
      { route: 'words', id: 'words', title: 'Překlad slovíček', desc: 'Česky → anglicky', icon: 'cards', bg: 'from-violet-500 to-fuchsia-600', input: 'both', isNew: true },
      { route: 'listen', id: 'listen', title: 'Poslech / Diktát', desc: 'Slyšíš → zopakuj / napiš', icon: 'chat', bg: 'from-emerald-500 to-teal-600', input: 'both', tts: true },
      { route: 'verbs', id: 'verbs', title: 'Nepravidelná slovesa', desc: 'go → went, gone', icon: 'ladder', bg: 'from-teal-500 to-emerald-600', input: 'both' },
    ],
  },
  {
    title: 'Jen mluvením',
    desc: 'Mikrofon ti musí rozumět, takže trénuješ výslovnost',
    input: 'speak',
    games: [
      { route: 'dialogs', id: 'dialogs', title: 'Dialogy', desc: 'Zahraj roli v rozhovoru', icon: 'dialog', bg: 'from-orange-500 to-red-600', input: 'speak', isNew: true },
      { route: 'pronounce', id: 'pronounce', title: 'Výslovnost', desc: 'th, w, ship × sheep…', icon: 'mic', bg: 'from-rose-500 to-pink-600', input: 'speak', isNew: true },
      { route: 'fluency', id: 'fluency', title: 'Mluv na čas', desc: 'Slova za minutu', icon: 'dialog', bg: 'from-lime-500 to-emerald-600', input: 'speak' },
    ],
  },
  {
    title: 'Jen psaním',
    desc: 'Bez automatických oprav, musíš to umět napsat',
    input: 'write',
    games: [
      { route: 'spelling', id: 'spelling', title: 'Pravopis', desc: 'Slyšíš slovo → napiš ho', icon: 'book', bg: 'from-sky-500 to-indigo-600', input: 'write', isNew: true, tts: true },
      { route: 'gaps', id: 'gaps', title: 'Doplňovačka', desc: 'Doplň slovo do věty', icon: 'book', bg: 'from-indigo-500 to-violet-600', input: 'write', isNew: true },
      { route: 'hangman', id: 'hangman', title: 'Šibenice', desc: 'Hádej slovo po písmenech', icon: 'target', bg: 'from-slate-600 to-slate-800', input: 'write', isNew: true },
      { route: 'crossword', id: 'crossword', title: 'Křížovka', desc: 'Česká nápověda → anglicky', icon: 'layers', bg: 'from-rose-500 to-orange-500', input: 'write' },
    ],
  },
  {
    title: 'Ťukací hry',
    desc: 'Rychlé opakování: vybíráš z možností',
    input: 'tap',
    games: [
      { route: 'quiz', id: 'quiz', title: 'Kvíz', desc: '12 otázek na čas', icon: 'medal', bg: 'from-violet-500 to-indigo-600', input: 'tap' },
      { route: 'blitz', id: 'blitz', title: 'Blesk', desc: '60 s: sedí význam?', icon: 'bolt', bg: 'from-yellow-400 to-orange-500', input: 'tap' },
      { route: 'match', id: 'match', title: 'Párování', desc: 'Spoj dvojice na čas', icon: 'sparkle', bg: 'from-pink-500 to-fuchsia-600', input: 'tap' },
      { route: 'wordsearch', id: 'wordsearch', title: 'Osmisměrka', desc: 'Najdi slova v mřížce', icon: 'target', bg: 'from-emerald-500 to-lime-600', input: 'tap' },
      { route: 'builder', id: 'builder', title: 'Skládání vět', desc: 'Správný slovosled', icon: 'layers', bg: 'from-sky-500 to-blue-600', input: 'tap' },
      { route: 'preps', id: 'preps', title: 'Předložky', desc: 'in, on, at…', icon: 'flag', bg: 'from-indigo-500 to-blue-700', input: 'tap' },
      { route: 'grammar', id: 'grammar', title: 'Gramatika', desc: 'Doplň tvar', icon: 'book', bg: 'from-amber-500 to-orange-600', input: 'tap' },
      { route: 'traps', id: 'traps', title: 'Chytáky', desc: 'Typické chyby Čechů', icon: 'target', bg: 'from-rose-500 to-red-600', input: 'tap' },
      { route: 'numbers', id: 'numbers', title: 'Čísla poslechem', desc: '13 nebo 30? Ceny, časy', icon: 'coins', bg: 'from-cyan-500 to-sky-600', input: 'tap', tts: true },
      { route: 'situations', id: 'situations', title: 'Co řekneš?', desc: 'Přirozená reakce', icon: 'dialog', bg: 'from-fuchsia-500 to-pink-600', input: 'tap' },
      { route: 'cards', id: 'cards', title: 'Kartičky', desc: 'Otoč a švihni', icon: 'layers', bg: 'from-purple-500 to-violet-700', input: 'tap' },
    ],
  },
];

/** Featured game of the day rotates. */
export function gameOfDay(): GameDef {
  const all = GAME_LIST.flatMap((c) => c.games).filter((g) => g.route !== 'cards' && g.route !== 'fluency' && g.route !== 'pronounce' && g.route !== 'dialogs' && (!g.tts || ttsSupported));
  let h = 0;
  for (const ch of todayKey()) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return all[h % all.length];
}

