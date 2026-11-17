import { ChevronRight, Hand, Keyboard, Mic } from 'lucide-react';
import { Icon } from '../components/icons';
import { cx } from '../components/ui';
import { GAME_LIST, gameOfDay, type GameInput } from '../data/games';
import { wordleDoneToday } from '../lib/plan';
import { navigate } from '../lib/router';
import { ttsSupported } from '../lib/speech';
import { useStore } from '../lib/store';

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function Games() {
  const games = useStore((s) => s.games);
  useStore((s) => s.wordle);
  const wordleDone = wordleDoneToday();
  const plays = Object.values(games).reduce((n, g) => n + g.plays, 0);
  const featured = gameOfDay();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Hry</h1>
          <div className="text-xs text-muted">Všechny fungují i offline · {plays} odehraných kol</div>
        </div>
        <button onClick={() => navigate('progress')} className="text-xs font-semibold text-accent">
          Rekordy ›
        </button>
      </div>

      {/* featured */}
      <button
        onClick={() => navigate(featured.route)}
        className={cx('relative flex w-full items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-left text-white shadow-lg transition active:scale-[0.99]', featured.bg)}
      >
        <span className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-white/15" />
        <span className="pointer-events-none absolute -bottom-12 right-10 size-24 rounded-full bg-white/10" />
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/20 animate-float">
          <Icon name={featured.icon} className="size-9" />
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-white/80">Hra dne · 2× XP za první kolo</span>
          <span className="block text-xl font-extrabold">{featured.title}</span>
          <span className="block text-sm text-white/85">{featured.desc}</span>
        </span>
        <ChevronRight className="relative size-5" />
      </button>

      <button
        onClick={() => navigate('stories')}
        className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-3.5 text-left text-white shadow-md transition active:scale-[0.99]"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/20">
          <Icon name="book" className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold">Příběhy ke čtení</span>
          <span className="block text-xs text-white/85">Čti a poslouchej, překlad po větách, pak procvič slovíčka z textu</span>
        </span>
        <ChevronRight className="size-4" />
      </button>

      <button
        onClick={() => navigate('tenses')}
        className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 p-3.5 text-left text-white shadow-md transition active:scale-[0.99]"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/20">
          <Icon name="ladder" className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold">Slovesné časy</span>
          <span className="block text-xs text-white/85">Přehled v tabulce a procvičování vybraných časů</span>
        </span>
        <ChevronRight className="size-4" />
      </button>

      <button
        onClick={() => navigate('wordle')}
        className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-left transition active:scale-[0.99]"
      >
        <span className="grid grid-cols-5 gap-0.5">
          {['W', 'O', 'R', 'D', 'S'].map((ch, k) => (
            <span
              key={k}
              className={cx(
                'grid size-6 place-items-center rounded-md text-[11px] font-extrabold text-white',
                wordleDone ? 'bg-emerald-500' : k % 3 === 0 ? 'bg-emerald-500' : k % 3 === 1 ? 'bg-amber-500' : 'bg-surface-3 text-muted',
              )}
            >
              {ch}
            </span>
          ))}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold">Slovo dne</span>
          <span className="block text-xs text-muted">{wordleDone ? 'Dnes hotovo · další zítra' : 'Uhodni anglické slovo na 6 pokusů'}</span>
        </span>
        <ChevronRight className="size-4 text-muted" />
      </button>

      {GAME_LIST.map((cat) => (
        <section key={cat.title}>
          <div className="mb-2 flex items-center gap-2">
            <InputIcon input={cat.input} />
            <div className="min-w-0">
              <div className="text-sm font-bold">{cat.title}</div>
              <div className="text-[11px] leading-tight text-muted">{cat.desc}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {cat.games.map((g) => {
              const st = games[g.id];
              if (g.tts && !ttsSupported) return null;
              return (
                <button
                  key={g.route}
                  onClick={() => navigate(g.route)}
                  className={cx('relative min-h-28 overflow-hidden rounded-2xl bg-gradient-to-br p-3.5 text-left text-white shadow-md transition active:scale-[0.97]', g.bg)}
                >
                  <span className="pointer-events-none absolute -right-5 -top-6 size-20 rounded-full bg-white/15" />
                  <span className="grid size-10 place-items-center rounded-xl bg-white/20">
                    <Icon name={g.icon} className="size-6" />
                  </span>
                  <span className="mt-2.5 block text-sm font-bold leading-tight">{g.title}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-white/80">{g.desc}</span>
                  {g.isNew && !st?.plays ? (
                    <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-fuchsia-600">NOVÉ</span>
                  ) : st && st.plays > 0 && g.route !== 'cards' ? (
                    <span className="absolute right-2.5 top-2.5 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-semibold tabular-nums">
                      {g.id === 'match' && st.bestTime ? fmtTime(st.bestTime) : `max ${st.best}`}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function InputIcon({ input }: { input: GameInput }) {
  const cls = 'grid size-9 shrink-0 place-items-center rounded-xl';
  if (input === 'both')
    return (
      <span className={cx(cls, 'w-14 gap-0.5 bg-gradient-to-r from-rose-500/15 to-sky-500/15')}>
        <span className="flex items-center gap-0.5">
          <Mic className="size-4 text-rose-500" />
          <span className="text-[10px] text-muted">/</span>
          <Keyboard className="size-4 text-sky-500" />
        </span>
      </span>
    );
  if (input === 'speak')
    return (
      <span className={cx(cls, 'bg-rose-500/15 text-rose-500')}>
        <Mic className="size-5" />
      </span>
    );
  if (input === 'write')
    return (
      <span className={cx(cls, 'bg-sky-500/15 text-sky-500')}>
        <Keyboard className="size-5" />
      </span>
    );
  return (
    <span className={cx(cls, 'bg-amber-500/15 text-amber-500')}>
      <Hand className="size-5" />
    </span>
  );
}
