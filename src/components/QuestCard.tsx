import { Check, Gift } from 'lucide-react';
import { useState } from 'react';
import { chestXp, dailyQuests, weeklyChallenge } from '../lib/quests';
import { sfx } from '../lib/sfx';
import { claimQuest, todayKey, useStore } from '../lib/store';
import { celebrate } from '../lib/ui';
import { IconTile } from './icons';
import { Card, Label, cx } from './ui';

const WEEK_XP = 150;
const DOW = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

/** Three daily quests with a chest, plus the weekly 5-day challenge. */
export function QuestCard() {
  const state = useStore((s) => s);
  const quests = dailyQuests(state);
  const week = weeklyChallenge(state);
  const allDone = quests.every((q) => q.done >= q.target);
  const claimed = state.questClaim === todayKey();
  const [opened, setOpened] = useState<number | null>(null);

  const open = () => {
    const xp = chestXp();
    claimQuest('day', todayKey(), xp);
    setOpened(xp);
    celebrate();
    sfx.win();
  };
  const claimWeek = () => {
    claimQuest('week', week.key, WEEK_XP);
    celebrate();
    sfx.win();
  };

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <Label>Denní úkoly</Label>
        <span className="text-[11px] text-muted">nové každý den</span>
      </div>
      <Card className="space-y-3">
        {quests.map((q) => {
          const done = q.done >= q.target;
          return (
            <div key={q.id} className="flex items-center gap-3">
              {done ? (
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white animate-pop">
                  <Check className="size-5" />
                </span>
              ) : (
                <IconTile name={q.icon} tone={q.tone} size="sm" />
              )}
              <div className="min-w-0 flex-1">
                <div className={cx('text-sm font-medium', done && 'text-muted')}>{q.title}</div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
                    <div className={cx('h-full rounded-full transition-all duration-500', done ? 'bg-emerald-500' : 'bg-amber-400')} style={{ width: `${(q.done / q.target) * 100}%` }} />
                  </div>
                  <span className="w-12 text-right text-[10px] tabular-nums text-muted">
                    {q.done}/{q.target}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {claimed ? (
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            <Gift className="size-4" /> {opened ? `Truhla otevřena: +${opened} XP!` : 'Dnešní truhla otevřena. Zítra čekají nové úkoly.'}
          </div>
        ) : (
          <button
            disabled={!allDone}
            onClick={open}
            className={cx(
              'flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition',
              allDone ? 'border-amber-400 bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 shadow-md animate-float active:scale-[0.98]' : 'border-dashed border-line text-muted',
            )}
          >
            <Gift className={cx('size-7', allDone ? '' : 'opacity-50')} />
            <span className="flex-1 text-sm font-bold">{allDone ? 'Otevři truhlu!' : 'Splň všechny 3 úkoly a otevři truhlu'}</span>
            <span className="text-xs font-semibold">{allDone ? 'bonus XP' : `${quests.filter((q) => q.done >= q.target).length}/3`}</span>
          </button>
        )}

        <div className="border-t border-line pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">Týdenní výzva: splň cíl 5 dní</span>
            <span className="text-muted tabular-nums">
              {week.done}/{week.target} · +{WEEK_XP} XP
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            {week.days.map((d, i) => (
              <div key={d.k} className="flex flex-1 flex-col items-center gap-0.5">
                <div
                  className={cx(
                    'grid h-6 w-full place-items-center rounded-md text-[10px] font-bold',
                    d.met ? 'bg-emerald-500 text-white' : d.future ? 'border border-dashed border-line text-muted' : 'bg-surface-3 text-muted',
                    d.k === todayKey() && !d.met && 'ring-2 ring-accent/50',
                  )}
                >
                  {d.met ? <Check className="size-3.5" strokeWidth={3} /> : ''}
                </div>
                <span className="text-[9px] text-muted">{DOW[i]}</span>
              </div>
            ))}
            {week.done >= week.target && !week.claimed ? (
              <button onClick={claimWeek} className="ml-1 rounded-lg bg-amber-400 px-2.5 py-1.5 text-xs font-bold text-amber-950 animate-pop">
                Vyzvednout
              </button>
            ) : (
              <Gift className={cx('ml-1 size-5', week.claimed ? 'text-emerald-500' : 'text-muted')} />
            )}
          </div>
        </div>
      </Card>
    </section>
  );
}
