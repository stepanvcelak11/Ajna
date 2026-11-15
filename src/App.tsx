import { AlertCircle, BookOpen, Home, Settings as Cog } from 'lucide-react';
import { useEffect, type ComponentType } from 'react';
import { WordRescue } from './components/WordRescue';
import { cx } from './components/ui';
import { navigate, useRoute, type Route } from './lib/router';
import { isDue } from './lib/srs';
import { useStore } from './lib/store';
import { isTypingTarget, runAction, useUi } from './lib/ui';
import Dashboard from './modes/Dashboard';
import Drill from './modes/Drill';
import Ladder from './modes/Ladder';
import MistakePractice from './modes/MistakePractice';
import Mistakes from './modes/Mistakes';
import Monologue from './modes/Monologue';
import Roleplay from './modes/Roleplay';
import Settings from './modes/Settings';
import Vocab from './modes/Vocab';
import VocabReview from './modes/VocabReview';

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
};

const TABS: { route: Route; label: string; icon: typeof Home; match: Route[] }[] = [
  { route: 'home', label: 'Trénink', icon: Home, match: ['home', 'ladder', 'drill', 'monologue', 'roleplay'] },
  { route: 'vocab', label: 'Slovíčka', icon: BookOpen, match: ['vocab', 'vocab-review'] },
  { route: 'mistakes', label: 'Chyby', icon: AlertCircle, match: ['mistakes', 'mistake-practice'] },
  { route: 'settings', label: 'Nastavení', icon: Cog, match: ['settings'] },
];

export default function App() {
  const route = useRoute();
  const theme = useStore((s) => s.settings.theme);
  const vocab = useStore((s) => s.vocab);
  const mistakes = useStore((s) => s.mistakes);
  const toastMsg = useUi((s) => s.toast);
  const Screen = SCREENS[route];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b0b0f' : '#fafafa');
  }, [theme]);

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
    mistakes: mistakes.filter((m) => !m.mastered && isDue(m.dueDate)).length,
  };

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <main
        key={route}
        className="mx-auto max-w-xl px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] animate-fade"
      >
        <Screen />
      </main>

      <WordRescue />

      {toastMsg && (
        <div className="fixed left-1/2 -translate-x-1/2 z-[60] bottom-[calc(4.75rem+env(safe-area-inset-bottom))] whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-sm shadow-lg animate-up">
          {toastMsg.text}
        </div>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-bg/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-xl grid grid-cols-4">
          {TABS.map((t) => {
            const active = t.match.includes(route);
            const b = badges[t.route];
            return (
              <button
                key={t.route}
                onClick={() => navigate(t.route)}
                className={cx('relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition', active ? 'text-accent' : 'text-muted')}
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
    </div>
  );
}
