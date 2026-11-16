import { useSyncExternalStore } from 'react';

export type Route =
  | 'home'
  | 'ladder'
  | 'drill'
  | 'monologue'
  | 'roleplay'
  | 'vocab'
  | 'vocab-review'
  | 'mistakes'
  | 'mistake-practice'
  | 'settings'
  | 'course'
  | 'sprint'
  | 'quiz'
  | 'builder'
  | 'listen'
  | 'match'
  | 'progress'
  | 'grammar'
  | 'placement'
  | 'stories'
  | 'traps'
  | 'wordle'
  | 'cheatsheet'
  | 'cards'
  | 'path'
  | 'games'
  | 'verbs'
  | 'numbers'
  | 'situations'
  | 'blitz'
  | 'preps'
  | 'fluency'
  | 'wordsearch'
  | 'crossword'
  | 'tutor';

const ROUTES: Route[] = ['home', 'ladder', 'drill', 'monologue', 'roleplay', 'vocab', 'vocab-review', 'mistakes', 'mistake-practice', 'settings', 'course', 'sprint', 'quiz', 'builder', 'listen', 'match', 'progress', 'grammar', 'placement', 'stories', 'traps', 'wordle', 'cheatsheet', 'cards', 'path', 'tutor', 'games', 'verbs', 'numbers', 'situations', 'blitz', 'preps', 'fluency', 'wordsearch', 'crossword'];

function current(): Route {
  const h = location.hash.replace(/^#\/?/, '') as Route;
  return ROUTES.includes(h) ? h : 'home';
}

// Hash routing so the Android back gesture / browser back button works.
export function useRoute() {
  return useSyncExternalStore(
    (l) => {
      window.addEventListener('hashchange', l);
      return () => window.removeEventListener('hashchange', l);
    },
    current,
  );
}

export function navigate(r: Route) {
  if (current() === r) return;
  location.hash = r === 'home' ? '/' : `/${r}`;
  window.scrollTo(0, 0);
}
