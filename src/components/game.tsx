// Shared building blocks for the mini-games: header with progress + combo, choice buttons, end screen.
import { RotateCcw, Trophy } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { navigate, useRoute } from '../lib/router';
import { nextTask } from '../lib/plan';
import { sfx } from '../lib/sfx';
import { celebrate } from '../lib/ui';
import { Icon, IconTile, type IconName, type Tone } from './icons';
import { Btn, Card, ModeHeader, cx } from './ui';

export function GameHeader({ title, subtitle, i, total, combo }: { title: string; subtitle?: string; i: number; total: number; combo: number }) {
  return (
    <>
      <ModeHeader
        title={title}
        subtitle={subtitle}
        right={
          combo >= 2 ? (
            <span
              key={combo}
              className="inline-flex items-center gap-1 rounded-full bg-orange-500/12 px-2.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-300 animate-pop"
            >
              <Icon name="flame" className="size-3.5" /> {combo}×
            </span>
          ) : undefined
        }
      />
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full rounded-full bg-gradient-to-r from-accent to-fuchsia-500 transition-all duration-300" style={{ width: `${(i / total) * 100}%` }} />
        </div>
        <span className="text-[11px] tabular-nums text-muted">
          {Math.min(i + 1, total)}/{total}
        </span>
      </div>
    </>
  );
}

export type ChoiceState = 'idle' | 'correct' | 'wrong' | 'dim';

export function Choice({ children, state, onClick, sub }: { children: ReactNode; state: ChoiceState; onClick: () => void; sub?: ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={state !== 'idle'}
      className={cx(
        'w-full rounded-2xl border-2 px-4 py-3.5 text-left text-[15px] font-medium transition active:scale-[0.98]',
        state === 'idle' && 'border-line bg-surface hover:border-accent/50',
        state === 'correct' && 'border-emerald-500 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 animate-pop',
        state === 'wrong' && 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-300 animate-shake',
        state === 'dim' && 'border-line bg-surface opacity-45',
      )}
    >
      {children}
      {sub && <div className="mt-0.5 text-xs font-normal text-muted">{sub}</div>}
    </button>
  );
}

export function GameEnd({
  score,
  total,
  xp,
  best,
  extra,
  onAgain,
  icon = 'trophy',
  tone = 'emerald',
  children,
}: {
  score: number;
  total: number;
  xp: number;
  best?: boolean;
  extra?: string;
  onAgain: () => void;
  icon?: IconName;
  tone?: Tone;
  children?: ReactNode;
}) {
  const ratio = total ? score / total : 0;
  const route = useRoute();
  const next = nextTask(route);
  useEffect(() => {
    if (ratio >= 0.8) {
      celebrate();
      sfx.win();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const msg = ratio === 1 ? 'Perfektní kolo!' : ratio >= 0.8 ? 'Výborně!' : ratio >= 0.5 ? 'Dobrá práce!' : 'Nevzdávej to, příště to bude lepší.';
  return (
    <Card className="space-y-4 py-7 text-center animate-up">
      <div className="flex justify-center">
        <IconTile name={ratio >= 0.8 ? 'trophy' : icon} tone={ratio >= 0.8 ? 'emerald' : tone} size="lg" />
      </div>
      <div>
        <div className="text-lg font-bold">{msg}</div>
        <div className="mt-1 text-4xl font-extrabold tabular-nums">
          {score}
          <span className="text-xl text-muted">/{total}</span>
        </div>
        {extra && <div className="mt-1 text-sm text-muted">{extra}</div>}
      </div>
      <div className="flex justify-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-3 py-1 text-xs font-bold text-accent">+{xp} XP</span>
        {best && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/14 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-300">
            <Trophy className="size-3.5" /> Nový rekord
          </span>
        )}
      </div>
      {children}
      {next && (
        <button
          onClick={() => navigate(next.route)}
          className="flex w-full items-center gap-3 rounded-2xl border border-accent/40 bg-accent/8 p-3 text-left transition active:scale-[0.99]"
        >
          <IconTile name={next.icon} tone={next.tone} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-accent">Další úkol z plánu</span>
            <span className="block truncate text-sm font-semibold">{next.title}</span>
          </span>
          <Icon name="up" className="size-4 rotate-45 text-accent" />
        </button>
      )}
      <div className="flex gap-2 pt-1">
        <Btn className="flex-1" onClick={() => navigate('home')}>
          Domů
        </Btn>
        <Btn variant="primary" className="flex-1" onClick={onAgain}>
          <RotateCcw className="size-4" /> Hrát znovu
        </Btn>
      </div>
    </Card>
  );
}
