import { BookOpen, Gamepad2, Home, Map as MapIcon, UserRound, WifiOff } from 'lucide-react';
import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { WordRescue } from './components/WordRescue';
import { cx } from './components/ui';
import { navigate, useRoute, type Route } from './lib/router';
import { isDue } from './lib/srs';
import { useStore } from './lib/store';
import { isTypingTarget, runAction, toast, useOnline, useUi } from './lib/ui';
import { IS_IOS, setSilentHandler } from './lib/speech';
import { ACCENTS } from './lib/colors';

// iPhone home-screen app: iOS sometimes keeps the viewport shortened after the keyboard closes,
// so fixed `bottom: 0` elements float mid-screen. There we pin them to the full screen height instead.
const IOS_STANDALONE = IS_IOS && (navigator as unknown as { standalone?: boolean }).standalone === true;
import Dashboard from './modes/Dashboard';
const Drill = lazy(() => import('./modes/Drill'));
const Ladder = lazy(() => import('./modes/Ladder'));
const MistakePractice = lazy(() => import('./modes/MistakePractice'));
const Mistakes = lazy(() => import('./modes/Mistakes'));
const Monologue = lazy(() => import('./modes/Monologue'));
const Roleplay = lazy(() => import('./modes/Roleplay'));
const Settings = lazy(() => import('./modes/Settings'));
const Vocab = lazy(() => import('./modes/Vocab'));
const VocabReview = lazy(() => import('./modes/VocabReview'));
const Course = lazy(() => import('./modes/Course'));
const Sprint = lazy(() => import('./modes/Sprint'));
const Quiz = lazy(() => import('./modes/Quiz'));
const Builder = lazy(() => import('./modes/Builder'));
const Listen = lazy(() => import('./modes/Listen'));
const Match = lazy(() => import('./modes/Match'));
const Progress = lazy(() => import('./modes/Progress'));
const Grammar = lazy(() => import('./modes/Grammar'));
const Placement = lazy(() => import('./modes/Placement'));
const Stories = lazy(() => import('./modes/Stories'));
const Traps = lazy(() => import('./modes/Traps'));
const Wordle = lazy(() => import('./modes/Wordle'));
const Cheatsheet = lazy(() => import('./modes/Cheatsheet'));
const Cards = lazy(() => import('./modes/Cards'));
const Path = lazy(() => import('./modes/Path'));
const Tutor = lazy(() => import('./modes/Tutor'));
const Games = lazy(() => import('./modes/Games'));
const Verbs = lazy(() => import('./modes/Verbs'));
const Numbers = lazy(() => import('./modes/Numbers'));
const Situations = lazy(() => import('./modes/Situations'));
const Blitz = lazy(() => import('./modes/Blitz'));
const Preps = lazy(() => import('./modes/Preps'));
const Fluency = lazy(() => import('./modes/Fluency'));
const WordSearch = lazy(() => import('./modes/WordSearch'));
const Crossword = lazy(() => import('./modes/Crossword'));
const Pronounce = lazy(() => import('./modes/Pronounce'));
const WordGame = lazy(() => import('./modes/WordGame'));
const Spelling = lazy(() => import('./modes/Spelling'));
const Dialogs = lazy(() => import('./modes/Dialogs'));
const Hangman = lazy(() => import('./modes/Hangman'));
const Gaps = lazy(() => import('./modes/Gaps'));
const Tenses = lazy(() => import('./modes/Tenses'));
const TenseDrill = lazy(() => import('./modes/TenseDrill'));
const TenseSteps = lazy(() => import('./modes/TenseSteps'));
import { Confetti } from './components/Confetti';
import { BadgeWatcher } from './components/BadgeWatcher';
import { Onboarding } from './components/Onboarding';

const SCREENS: Record<Route, ComponentType> = {
  home: Dashboard,
  ladder: Ladder,
  drill: Drill,
  monologue: Monologue,
  roleplay: Roleplay,
  vocab: Vocab,
  'vocab-review': VocabReview,
  mistakes: Mistakes,
  'mistake-practice': MistakePractice,
  settings: Settings,
  course: Course,
  sprint: Sprint,
  quiz: Quiz,
  builder: Builder,
  listen: Listen,
  match: Match,
  progress: Progress,
  grammar: Grammar,
  placement: Placement,
  stories: Stories,
  traps: Traps,
  wordle: Wordle,
  cheatsheet: Cheatsheet,
  cards: Cards,
  path: Path,
  tutor: Tutor,
  games: Games,
  verbs: Verbs,
  numbers: Numbers,
  situations: Situations,
  blitz: Blitz,
  preps: Preps,
  fluency: Fluency,
  wordsearch: WordSearch,
  crossword: Crossword,
  pronounce: Pronounce,
  words: WordGame as ComponentType,
  spelling: Spelling,
  dialogs: Dialogs,
  hangman: Hangman,
  gaps: Gaps,
  tenses: Tenses,
  'tense-drill': TenseDrill,
  'tense-steps': TenseSteps,
};

const TABS: { route: Route; label: string; icon: typeof Home; match: Route[] }[] = [
  { route: 'home', label: 'Domů', icon: Home, match: ['home'] },
  { route: 'path', label: 'Cesta', icon: MapIcon, match: ['path'] },
  { route: 'games', label: 'Hry', icon: Gamepad2, match: ['games'] },
  { route: 'vocab', label: 'Slovíčka', icon: BookOpen, match: ['vocab'] },
  { route: 'progress', label: 'Profil', icon: UserRound, match: ['progress', 'settings', 'mistakes', 'course'] },
];
// sections reachable from the profile keep the tab bar; exercises are full-screen
const NAV_ROUTES = new Set<Route>(TABS.flatMap((t) => t.match));

export default function App() {
  const route = useRoute();
  const theme = useStore((s) => s.settings.theme);
  const color = useStore((s) => s.settings.color);
  const vocab = useStore((s) => s.vocab);
  const mistakes = useStore((s) => s.mistakes);
  const toastMsg = useUi((s) => s.toast);
  const online = useOnline();
  const Screen = SCREENS[route];
  const onboarded = useStore((s) => s.settings.onboarded);
  // exercises are full-screen (back arrow in the header); the tab bar shows on the main sections only
  const showNav = NAV_ROUTES.has(route);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    const a = ACCENTS[color] ?? ACCENTS.violet;
    document.documentElement.style.setProperty('--accent', theme === 'dark' ? a.dark : a.light);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b0b0f' : '#fafafa');
  }, [theme, color]);

  useEffect(() => {
    if (!IOS_STANDALONE) return;
    const set = () => {
      const landscape = window.matchMedia('(orientation: landscape)').matches;
      const full = landscape ? Math.min(screen.width, screen.height) : Math.max(screen.width, screen.height);
      // never place the bar below what is actually visible when the keyboard is genuinely open
      const kb = window.visualViewport && window.visualViewport.height < window.innerHeight - 120;
      document.documentElement.style.setProperty('--app-h', `${kb ? window.innerHeight : Math.max(full, window.innerHeight)}px`);
    };
    set();
    window.addEventListener('resize', set);
    window.visualViewport?.addEventListener('resize', set);
    window.addEventListener('orientationchange', set);
    return () => {
      window.removeEventListener('resize', set);
      window.visualViewport?.removeEventListener('resize', set);
      window.removeEventListener('orientationchange', set);
    };
  }, []);

  // iPhone home-screen app: after the keyboard closes, iOS sometimes leaves the page shifted
  // (bottom bar floating mid-screen). Nudge the viewport back once nothing is being typed.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const fix = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (isTypingTarget(document.activeElement)) return;
        window.scrollTo(window.scrollX, window.scrollY);
        document.documentElement.style.height = '100.1%';
        requestAnimationFrame(() => (document.documentElement.style.height = ''));
      }, 120);
    };
    window.addEventListener('focusout', fix);
    window.visualViewport?.addEventListener('resize', fix);
    window.addEventListener('orientationchange', fix);
    document.addEventListener('visibilitychange', fix);
    return () => {
      clearTimeout(t);
      window.removeEventListener('focusout', fix);
      window.visualViewport?.removeEventListener('resize', fix);
      window.removeEventListener('orientationchange', fix);
      document.removeEventListener('visibilitychange', fix);
    };
  }, []);

  // speech output did not start (typically iPhone in silent mode) → explain once a minute at most
  useEffect(() => {
    let last = 0;
    setSilentHandler(() => {
      if (Date.now() - last < 60000) return;
      last = Date.now();
      toast(IS_IOS ? 'Neslyšíš hlas? Vypni tichý režim (přepínač na boku) a zesil hlasitost.' : 'Hlas se nespustil. Zkontroluj hlasitost.');
    });
    return () => setSilentHandler(null);
  }, []);

  // global hotkeys R / S
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      if (document.querySelector('[data-sheet-open]')) return;
      const k = e.key.toLowerCase();
      if (k === 'r' && runAction('replay')) e.preventDefault();
      if (k === 's' && runAction('save')) e.preventDefault();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const badges: Partial<Record<Route, number>> = {
    vocab: vocab.filter((v) => isDue(v.srs.dueDate)).length,
    progress: mistakes.filter((m) => !m.mastered && isDue(m.dueDate)).length,
  };

  if (!onboarded)
    return (
      <div className="min-h-dvh bg-bg text-fg">
        <Onboarding />
        <Confetti />
      </div>
    );

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <main
        key={route}
        className={cx('mx-auto max-w-xl px-4 pt-[calc(1rem+env(safe-area-inset-top))] animate-fade', showNav ? 'pb-[calc(6rem+env(safe-area-inset-bottom))]' : 'pb-[calc(1.5rem+env(safe-area-inset-bottom))]')}
      >
        {!online && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs text-muted">
            <WifiOff className="size-3.5 shrink-0" />
            Offline režim – slovíčka, Banka chyb a výslovnost fungují, AI hodnocení počká na internet.
          </div>
        )}
        <Suspense fallback={<div className="py-20 text-center text-sm text-muted">Načítám…</div>}>
          <Screen />
        </Suspense>
      </main>

      <WordRescue />
      <Confetti />
      <BadgeWatcher />

      {toastMsg && (
        <div
          style={
            IOS_STANDALONE && showNav ? { bottom: 'auto', top: 'calc(var(--app-h, 100%) - 4.75rem - env(safe-area-inset-bottom) - 2.5rem)' } : undefined
          }
          className={cx(
            'fixed left-1/2 -translate-x-1/2 z-[60] whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-sm shadow-lg animate-up',
            // exercises have their own controls at the bottom, so toasts go to the top there
            showNav ? 'bottom-[calc(4.75rem+env(safe-area-inset-bottom))]' : 'top-[calc(0.75rem+env(safe-area-inset-top))]',
          )}
        >
          {toastMsg.text}
        </div>
      )}

      {showNav && (
      <nav
        style={IOS_STANDALONE ? { bottom: 'auto', top: 'var(--app-h, 100%)', transform: 'translateY(-100%)' } : undefined}
        className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-bg/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-xl grid grid-cols-5">
          {TABS.map((t) => {
            const active = t.match.includes(route);
            const b = badges[t.route];
            return (
              <button
                key={t.route}
                onClick={() => navigate(t.route)}
                className={cx('relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition', active ? 'text-accent' : 'text-muted')}
              >
                <t.icon className="size-5" />
                {t.label}
                {!!b && (
                  <span className="absolute top-1.5 left-1/2 ml-2 min-w-4 h-4 px-1 rounded-full bg-accent text-white text-[9px] font-semibold grid place-items-center">
                    {b > 99 ? '99+' : b}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
      )}
    </div>
  );
}
