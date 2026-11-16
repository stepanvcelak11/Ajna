import { Lock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { IconTile } from '../components/icons';
import { Card, Label, ModeHeader, cx } from '../components/ui';
import { BADGES } from '../data/achievements';
import { dayXp, rankOf, streak, todayKey, totalXp, useStore } from '../lib/store';

const GAME_NAMES: Record<string, string> = { quiz: 'Kvíz', builder: 'Skládání vět', listen: 'Poslech', match: 'Párování', grammar: 'Gramatika', traps: 'Chytáky', wordle: 'Slovo dne' };
const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function Progress() {
  const state = useStore((s) => s);
  const [range, setRange] = useState<14 | 30>(14);
  const xpAll = totalXp(state.days);
  const rank = rankOf(xpAll);
  const goal = state.settings.dailyGoal;

  const series = useMemo(
    () =>
      Array.from({ length: range }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (range - 1 - i));
        const k = todayKey(d);
        return { k, d, xp: dayXp(state.days[k]) };
      }),
    [state.days, range],
  );
  const max = Math.max(goal, ...series.map((x) => x.xp));
  const all = Object.values(state.days);
  const words = all.reduce((n, d) => n + d.words, 0);
  const answers = all.reduce((n, d) => n + d.answers, 0);
  const active = all.filter((d) => d.answers > 0).length;
  const phrases = Object.values(state.phraseStats).filter((p) => p.ok > p.fail).length;
  const mastered = state.mistakes.filter((m) => m.mastered).length;
  const seen = new Set(state.badgesSeen);
  const badges = BADGES.map((b) => {
    const [v, g] = b.progress(state);
    return { ...b, v: Math.min(v, g), g, done: v >= g || seen.has(b.id) };
  });
  const doneCount = badges.filter((b) => b.done).length;

  return (
    <div className="space-y-6">
      <ModeHeader title="Tvůj pokrok" subtitle={`${active} ${active === 1 ? 'den' : active >= 2 && active <= 4 ? 'dny' : 'dní'} tréninku celkem`} />

      <div className="relative overflow-hidden rounded-3xl hero-gradient p-5 text-white shadow-lg shadow-accent/25">
        <div className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-white/10" />
        <div className="text-xs text-white/70">Hodnost {rank.rank}</div>
        <div className="text-2xl font-extrabold">{rank.name}</div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-amber-300" style={{ width: `${(rank.into / rank.need) * 100}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-white/75 tabular-nums">
          <span>{xpAll.toLocaleString('cs-CZ')} XP celkem</span>
          <span>
            ještě {rank.need - rank.into} XP do další
          </span>
        </div>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <Label>Body za poslední dny</Label>
          <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5 text-[11px]">
            {([14, 30] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={cx('rounded-md px-2 py-0.5', range === r ? 'bg-surface text-fg shadow-sm' : 'text-muted')}>
                {r} dní
              </button>
            ))}
          </div>
        </div>
        <Card>
          <div className="relative flex h-36 items-end gap-[3px]">
            <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-emerald-500/50" style={{ bottom: `${(goal / max) * 100}%` }}>
              <span className="absolute -top-4 right-0 text-[10px] text-emerald-600 dark:text-emerald-400">cíl {goal}</span>
            </div>
            {series.map((x) => (
              <div key={x.k} className="group relative flex h-full flex-1 flex-col justify-end">
                <div
                  className={cx(
                    'w-full rounded-t-[4px] transition-all',
                    x.xp >= goal ? 'bg-emerald-500' : x.xp > 0 ? 'bg-accent' : 'bg-surface-3',
                    x.k === todayKey() && 'ring-2 ring-accent/40',
                  )}
                  style={{ height: `${Math.max(3, (x.xp / max) * 100)}%` }}
                  title={`${x.d.toLocaleDateString('cs-CZ')}: ${x.xp} XP`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            <span>{series[0].d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}</span>
            <span>dnes</span>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-3 gap-2">
        {[
          { v: streak(state.days), l: 'dní v řadě', c: 'text-orange-500' },
          { v: words, l: 'slov řečeno', c: 'text-accent' },
          { v: answers, l: 'odpovědí', c: 'text-sky-500' },
          { v: state.vocab.length, l: 'slovíček', c: 'text-pink-500' },
          { v: phrases, l: 'frází umíš', c: 'text-amber-500' },
          { v: mastered, l: 'chyb opraveno', c: 'text-emerald-500' },
        ].map((x) => (
          <div key={x.l} className="rounded-2xl border border-line bg-surface px-2 py-3 text-center">
            <div className={cx('text-xl font-bold tabular-nums', x.c)}>{x.v.toLocaleString('cs-CZ')}</div>
            <div className="mt-0.5 text-[10px] leading-tight text-muted">{x.l}</div>
          </div>
        ))}
      </section>

      {Object.keys(state.games).length > 0 && (
        <section>
          <Label className="mb-2">Rekordy her</Label>
          <Card className="divide-y divide-line p-0">
            {Object.entries(state.games).map(([id, g]) => (
              <div key={id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="font-medium">{GAME_NAMES[id] ?? id}</span>
                <span className="text-xs text-muted tabular-nums">
                  nejlépe {g.best} · {g.plays}× hráno{g.bestTime ? ` · ${fmtTime(g.bestTime)}` : ''}
                </span>
              </div>
            ))}
          </Card>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <Label>Odznaky</Label>
          <span className="text-[11px] text-muted tabular-nums">
            {doneCount}/{badges.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {badges.map((b) => (
            <div
              key={b.id}
              className={cx('relative flex flex-col items-center rounded-2xl border p-3 text-center', b.done ? 'border-line bg-surface' : 'border-dashed border-line bg-surface/40')}
            >
              <div className={cx(!b.done && 'opacity-35 grayscale')}>
                <IconTile name={b.icon} tone={b.tone} />
              </div>
              {!b.done && <Lock className="absolute right-2 top-2 size-3 text-muted" />}
              <div className="mt-2 text-xs font-semibold leading-tight">{b.title}</div>
              <div className="mt-0.5 text-[10px] leading-tight text-muted">{b.desc}</div>
              {!b.done && b.g > 1 && (
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full bg-accent" style={{ width: `${(b.v / b.g) * 100}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
