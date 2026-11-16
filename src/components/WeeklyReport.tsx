import { ArrowDownRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import { navigate, type Route } from '../lib/router';
import { dayXp, todayKey, topTraps, updateSettings, useStore } from '../lib/store';
import type { CzenglishWarning } from '../lib/types';
import { TRAP_LABELS } from './FeedbackCard';
import { Card, Label, cx } from './ui';

// what to do about each kind of mistake
const FIX: Record<CzenglishWarning['category'], { label: string; route: Route; focus?: string }> = {
  articles: { label: 'Procvič členy', route: 'drill', focus: 'articles-basic' },
  prepositions: { label: 'Procvič předložky', route: 'drill', focus: 'prepositions-time-place' },
  tense: { label: 'Gramatický tahák: časy', route: 'cheatsheet' },
  word_order: { label: 'Skládání vět', route: 'builder' },
  false_friend: { label: 'Hra Chytáky', route: 'traps' },
  word_choice: { label: 'Zeptej se učitele', route: 'tutor' },
  missing_subject: { label: 'Hra Chytáky', route: 'traps' },
  countable_plural: { label: 'Procvič počitatelnost', route: 'drill', focus: 'countable' },
  question_form: { label: 'Procvič otázky', route: 'drill', focus: 'questions' },
  negation: { label: 'Gramatika (kvíz)', route: 'grammar' },
  other: { label: 'Moje chyby', route: 'mistake-practice' },
};

function weekKeys(offsetWeeks: number) {
  const d = new Date();
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - dow - offsetWeeks * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return todayKey(x);
  });
}

/** This week vs last week + what to focus on, based on recent mistakes. */
export function WeeklyReport() {
  const days = useStore((s) => s.days);
  const mistakes = useStore((s) => s.mistakes);
  const goal = useStore((s) => s.settings.dailyGoal);
  const thisW = weekKeys(0);
  const lastW = weekKeys(1);
  const sum = (keys: string[], f: (k: string) => number) => keys.reduce((n, k) => n + f(k), 0);
  const xpNow = sum(thisW, (k) => dayXp(days[k]));
  // compare with the same days of last week (Mon..today), not the whole week
  const elapsed = thisW.indexOf(todayKey()) + 1;
  const xpPrev = sum(lastW.slice(0, elapsed), (k) => dayXp(days[k]));
  const wordsNow = sum(thisW, (k) => days[k]?.words ?? 0);
  const activeNow = thisW.filter((k) => days[k]?.answers).length;
  const goalDays = thisW.filter((k) => dayXp(days[k]) >= goal).length;
  const change = xpPrev ? Math.round(((xpNow - xpPrev) / xpPrev) * 100) : null;

  const recent = mistakes.filter((m) => Date.now() - new Date(m.createdAt).getTime() < 14 * 86400000);
  const traps = topTraps(recent.length ? recent : mistakes, 3);

  return (
    <section className="space-y-3">
      <Label>Tento týden</Label>
      <Card className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-extrabold tabular-nums">{xpNow}</div>
            <div className="text-xs text-muted">XP od pondělí</div>
          </div>
          {change !== null && (
            <span
              className={cx(
                'inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-bold',
                change >= 0 ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-500',
              )}
            >
              {change >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {Math.abs(change)} % oproti stejným dnům minulého týdne
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-surface-2 py-2">
            <div className="font-bold tabular-nums">{activeNow}/7</div>
            <div className="text-[10px] text-muted">dní tréninku</div>
          </div>
          <div className="rounded-xl bg-surface-2 py-2">
            <div className="font-bold tabular-nums">{goalDays}</div>
            <div className="text-[10px] text-muted">splněných cílů</div>
          </div>
          <div className="rounded-xl bg-surface-2 py-2">
            <div className="font-bold tabular-nums">{wordsNow}</div>
            <div className="text-[10px] text-muted">slov řečeno</div>
          </div>
        </div>
      </Card>

      {traps.length > 0 && (
        <Card className="space-y-2">
          <Label>Na co se zaměřit</Label>
          {traps.map((t) => {
            const fix = FIX[t.category] ?? FIX.other;
            return (
              <button
                key={t.category}
                onClick={() => {
                  if (fix.focus) updateSettings({ focus: fix.focus });
                  navigate(fix.route);
                }}
                className="flex w-full items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5 text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {TRAP_LABELS[t.category] ?? t.category} <span className="text-xs font-normal text-muted">×{t.count}</span>
                  </span>
                  <span className="block truncate text-xs text-muted">
                    <span className="line-through">{t.example.error}</span> → {t.example.correction}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium text-accent">{fix.label}</span>
                <ChevronRight className="size-4 shrink-0 text-accent" />
              </button>
            );
          })}
        </Card>
      )}
    </section>
  );
}
