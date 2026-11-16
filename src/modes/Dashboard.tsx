import { AlertTriangle, Check, ChevronRight, KeyRound, WifiOff, X } from 'lucide-react';
import { useState } from 'react';
import { TRAP_LABELS } from '../components/FeedbackCard';
import { Icon, IconTile, type IconName, type Tone } from '../components/icons';
import { LevelSheet } from '../components/LevelPicker';
import { Btn, Card, Label, cx } from '../components/ui';
import { findTopic, getLevel } from '../data/levels';
import { lessonOfTopic } from '../data/textbook';
import { hasKey } from '../lib/llm';
import { navigate, type Route } from '../lib/router';
import { isDue } from '../lib/srs';
import { dayXp, levelSuggestion, rankOf, streakInfo, todayKey, topTraps, totalXp, updateSettings, useStore } from '../lib/store';
import { useOnline } from '../lib/ui';

type ModeDef = { route: Route; title: string; desc: string; icon: IconName; tone: Tone; offline?: boolean };

const SPEAK_MODES: (ModeDef & { wide?: boolean })[] = [
  { route: 'stories', title: 'Příběhy', desc: 'Čti a poslouchej příběh, odpověz na otázky a převyprávěj ho', icon: 'book', tone: 'teal', offline: true, wide: true },
  { route: 'drill', title: 'Překlad vět', desc: 'Česká věta → řekni ji anglicky', icon: 'swap', tone: 'sky' },
  { route: 'ladder', title: 'Nabalování vět', desc: 'Od krátké věty po složitou', icon: 'ladder', tone: 'violet' },
  { route: 'monologue', title: 'Monolog', desc: 'Mluv volně, dostaneš rodilou verzi', icon: 'mic', tone: 'emerald' },
  { route: 'roleplay', title: 'Hraní rolí', desc: 'Kavárna, lékárna, pohovor…', icon: 'dialog', tone: 'amber' },
];

const REVIEW_MODES: (ModeDef & { wide?: boolean })[] = [
  { route: 'vocab-review', title: 'Slovíčka', desc: 'Vybav si slovo a použij ho', icon: 'cards', tone: 'pink', offline: true },
  { route: 'cards', title: 'Kartičky', desc: 'Rychle: otoč, ohodnoť, švihni', icon: 'layers', tone: 'violet', offline: true },
  { route: 'mistake-practice', title: 'Moje chyby', desc: 'Procvič, co ti nešlo', icon: 'target', tone: 'rose' },
  { route: 'cheatsheet', title: 'Gramatický tahák', desc: 'Pravidla česky a typické chyby', icon: 'bulb', tone: 'indigo', offline: true },
];

// colourful game cards; all of them work offline
const GAMES: { route: Route; title: string; desc: string; icon: IconName; bg: string; id?: string }[] = [
  { route: 'sprint', title: 'Rychlé fráze', desc: 'Řekni větu, hned víš', icon: 'bolt', bg: 'from-orange-500 to-rose-500' },
  { route: 'quiz', title: 'Kvíz', desc: '12 otázek na čas', icon: 'medal', bg: 'from-violet-500 to-indigo-600', id: 'quiz' },
  { route: 'builder', title: 'Skládání vět', desc: 'Správný slovosled', icon: 'layers', bg: 'from-sky-500 to-blue-600', id: 'builder' },
  { route: 'listen', title: 'Poslech', desc: 'Slyšíš a opakuješ', icon: 'chat', bg: 'from-emerald-500 to-teal-600', id: 'listen' },
  { route: 'match', title: 'Párování', desc: 'Spoj dvojice na čas', icon: 'sparkle', bg: 'from-pink-500 to-fuchsia-600', id: 'match' },
  { route: 'grammar', title: 'Gramatika', desc: 'Doplň tvar + vysvětlení', icon: 'book', bg: 'from-amber-500 to-orange-600', id: 'grammar' },
  { route: 'traps', title: 'Chytáky', desc: 'Typické chyby Čechů', icon: 'target', bg: 'from-rose-500 to-red-600', id: 'traps' },
];

import { dailyPlan, wordleDoneToday } from '../lib/plan';
import { NODE_INFO, pathFor } from '../data/path';

const WEEKDAYS = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

function Ring({ value, size = 76, stroke = 8, children }: { value: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-white/20" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-white transition-[stroke-dashoffset] duration-700"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, value))}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const days = useStore((s) => s.days);
  const vocab = useStore((s) => s.vocab);
  const mistakes = useStore((s) => s.mistakes);
  const level = useStore((s) => s.settings.level);
  const focus = useStore((s) => s.settings.focus);
  const levelLog = useStore((s) => s.levelLog);
  const games = useStore((s) => s.games);
  useStore((s) => s.wordle);
  const wordleDone = wordleDoneToday();
  useStore((s) => s.settings.provider + s.settings.geminiKey + s.settings.anthropicKey + s.settings.openaiKey);
  const online = useOnline();
  const [levelOpen, setLevelOpen] = useState(false);

  const lv = getLevel(level);
  const topic = findTopic(focus);
  const lesson = lessonOfTopic(focus);
  const suggestion = levelSuggestion(levelLog, level);
  const today = days[todayKey()] ?? { words: 0, answers: 0 };
  const plan = dailyPlan(days[todayKey()], vocab.length, vocab.filter((v) => isDue(v.srs.dueDate)).length, mistakes.filter((m) => !m.mastered && isDue(m.dueDate)).length);
  const next = plan.find((t) => t.done < t.target && !(t.ai && (!online || !hasKey()))) ?? plan.find((t) => t.done < t.target);
  const vocabDue = vocab.filter((v) => isDue(v.srs.dueDate)).length;
  const mistakesDue = mistakes.filter((m) => !m.mastered && isDue(m.dueDate)).length;
  const active = mistakes.filter((m) => !m.mastered);
  const traps = topTraps(active.length ? active : mistakes, 3);

  const badge: Partial<Record<Route, number>> = { 'vocab-review': vocabDue, cards: vocabDue, 'mistake-practice': mistakesDue };

  return (
    <div className="space-y-6">
      <Hero />

      {!hasKey() && (
        <Card onClick={() => navigate('settings')} className="border-accent/50 bg-accent/5 flex items-center gap-3">
          <KeyRound className="size-5 text-accent" />
          <div className="text-sm flex-1">
            <div className="font-semibold">Nastav API klíč</div>
            <div className="text-xs text-muted">Gemini je zdarma. Návod najdeš v Nastavení.</div>
          </div>
          <ChevronRight className="size-4 text-muted" />
        </Card>
      )}

      {/* --- today's plan --- */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <Label>Dnešní plán</Label>
          <span className="text-[11px] text-muted tabular-nums">
            {plan.filter((t) => t.done >= t.target).length}/{plan.length} hotovo
          </span>
        </div>
        <Card className="p-0 divide-y divide-line overflow-hidden">
          {plan.map((t) => {
            const done = t.done >= t.target;
            const blocked = t.ai && (!online || !hasKey());
            return (
              <button key={t.route} onClick={() => navigate(t.route)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-2">
                {done ? (
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white">
                    <Check className="size-5" />
                  </span>
                ) : (
                  <IconTile name={t.icon} tone={t.tone} size="sm" />
                )}
                <span className="flex-1 min-w-0">
                  <span className={cx('block text-sm font-medium', done && 'text-muted line-through decoration-1')}>{t.title}</span>
                  <span className="mt-1 flex items-center gap-2">
                    <span className="h-1 flex-1 max-w-28 rounded-full bg-surface-3 overflow-hidden">
                      <span className={cx('block h-full rounded-full', done ? 'bg-emerald-500' : 'bg-accent')} style={{ width: `${t.target ? (t.done / t.target) * 100 : 100}%` }} />
                    </span>
                    <span className="text-[10px] text-muted tabular-nums">
                      {t.done}/{t.target}
                    </span>
                    {blocked && <WifiOff className="size-3 text-muted" />}
                  </span>
                </span>
                {!done && <ChevronRight className="size-4 text-muted" />}
              </button>
            );
          })}
        </Card>
        {next ? (
          <Btn variant="primary" className="mt-3 w-full h-12 text-base" onClick={() => navigate(next.route)}>
            {plan.some((t) => t.done > 0) ? 'Pokračovat' : 'Začít trénink'}: {next.title} <ChevronRight className="size-4" />
          </Btn>
        ) : (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-3 py-2.5 text-sm">
            <Icon name="trophy" className="size-5 text-emerald-500" />
            <span>Dnešní plán splněn. Cokoliv navíc je bonus!</span>
          </div>
        )}
      </section>

      {/* --- learning path --- */}
      <PathCard level={level} />

      {/* --- what am I practising --- */}
      <section>
        <Label className="mb-2">Tvůj trénink</Label>
        <Card className="p-0 divide-y divide-line">
          <button onClick={() => setLevelOpen(true)} className="w-full flex items-center gap-3 p-4 text-left">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-lg font-bold text-white">{level}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-muted">Obtížnost</span>
              <span className="block text-base font-semibold">
                {lv.name} <span className="text-xs font-normal text-muted">{lv.cefr}</span>
              </span>
              <span className="block text-xs text-muted truncate">{lv.desc}</span>
            </span>
            <span className="text-xs font-medium text-accent">Změnit</span>
          </button>
          <button onClick={() => navigate('placement')} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs">
            <Icon name="target" className="size-4 text-accent" />
            <span className="flex-1 text-muted">Nevíš, která úroveň ti sedí? Udělej si rozřazovací test (2 min).</span>
            <ChevronRight className="size-4 text-muted" />
          </button>

          <div className="flex items-center gap-3 p-4">
            {lesson ? (
              <IconTile name={lesson.icon} tone={lesson.tone} />
            ) : (
              <IconTile name={topic ? 'target' : 'layers'} tone={topic ? 'amber' : 'slate'} />
            )}
            <button className="flex-1 min-w-0 text-left" onClick={() => (lesson ? navigate('course') : setLevelOpen(true))}>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-muted">Procvičuješ</span>
              <span className="block text-base font-semibold truncate">
                {lesson ? `Lekce ${lesson.n}: ${lesson.title}` : topic ? topic.cz : 'Obecně (mix)'}
              </span>
              <span className="block text-xs text-muted truncate">
                {lesson ? topic?.cz : topic ? `Gramatika úrovně ${lv.id}` : 'Nebo si vyber lekci z učebnice'}
              </span>
            </button>
            {focus ? (
              <Btn variant="secondary" className="h-9 px-3 text-xs" onClick={() => updateSettings({ focus: null })}>
                <X className="size-3.5" /> Obecně
              </Btn>
            ) : (
              <Btn variant="secondary" className="h-9 px-3 text-xs" onClick={() => navigate('course')}>
                <Icon name="book" className="size-4" /> Lekce
              </Btn>
            )}
          </div>
        </Card>
      </section>
      <LevelSheet open={levelOpen} onClose={() => setLevelOpen(false)} />

      {suggestion && (
        <Card className={cx('flex items-center gap-3', suggestion === 'up' ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-amber-500/40 bg-amber-500/5')}>
          <IconTile name={suggestion} tone={suggestion === 'up' ? 'emerald' : 'amber'} />
          <div className="flex-1 text-sm">
            <div className="font-semibold">{suggestion === 'up' ? 'Na této úrovni ti to jde skvěle!' : 'Tahle úroveň je teď náročná.'}</div>
            <div className="text-xs text-muted">
              {suggestion === 'up' ? `Zkus úroveň ${level + 1} – ${getLevel(level + 1).name}.` : `Zkus chvíli úroveň ${level - 1} a pak se vrať.`}
            </div>
          </div>
          <Btn
            variant="primary"
            className="h-9 px-3"
            onClick={() => updateSettings({ level: (suggestion === 'up' ? level + 1 : level - 1) as 1 | 2 | 3 | 4 | 5, focus: lesson ? focus : null })}
          >
            {suggestion === 'up' ? 'Postoupit' : 'Ubrat'}
          </Btn>
        </Card>
      )}

      {/* --- today --- */}
      <section>
        <div className="grid grid-cols-3 gap-2">
          <Stat value={today.words} label="slov dnes řečeno" tone="text-accent" />
          <Stat value={vocabDue} label="slovíček k opakování" tone="text-pink-500" onClick={() => navigate(vocabDue ? 'vocab-review' : 'vocab')} />
          <Stat value={mistakesDue} label="chyb k opravě" tone="text-rose-500" onClick={() => navigate(mistakesDue ? 'mistake-practice' : 'mistakes')} />
        </div>
      </section>

      {/* --- games --- */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <Label>Hry · fungují i offline</Label>
          <button onClick={() => navigate('progress')} className="text-[11px] font-medium text-accent">
            Rekordy
          </button>
        </div>
        <button
          onClick={() => navigate('wordle')}
          className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-left transition active:scale-[0.99]"
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
            <span className="block text-xs text-muted">{wordleDone ? 'Dnes hotovo · další zítra (nebo trénink)' : 'Uhodni anglické slovo na 6 pokusů'}</span>
          </span>
          <ChevronRight className="size-4 text-muted" />
        </button>
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map((g, n) => {
            const st = g.id ? games[g.id] : undefined;
            return (
              <button
                key={g.route}
                onClick={() => navigate(g.route)}
                className={cx(
                  'relative overflow-hidden rounded-2xl bg-gradient-to-br p-3.5 text-left text-white shadow-md transition active:scale-[0.98]',
                  g.bg,
                  (n === 0 || (n === GAMES.length - 1 && GAMES.length % 2 === 0)) && 'col-span-2 flex items-center gap-3',
                )}
              >
                <span className="pointer-events-none absolute -right-5 -top-6 size-20 rounded-full bg-white/15" />
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/20">
                  <Icon name={g.icon} className="size-6" />
                </span>
                <span className={cx('block', !(n === 0 || (n === GAMES.length - 1 && GAMES.length % 2 === 0)) && 'mt-3')}>
                  <span className="block text-sm font-bold leading-tight">{g.title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-white/80">{g.desc}</span>
                </span>
                {st && st.plays > 0 && (
                  <span className="absolute right-2.5 top-2.5 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-semibold tabular-nums">
                    {g.id === 'match' && st.bestTime ? `${Math.floor(st.bestTime / 60)}:${String(st.bestTime % 60).padStart(2, '0')}` : `max ${st.best}`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* --- AI speaking --- */}
      <section>
        <Label className="mb-2">Mluvení a čtení s AI</Label>
        <div className="grid grid-cols-2 gap-3">
          {SPEAK_MODES.map((m) => (
            <div key={m.route} className={cx(m.wide && 'col-span-2')}>
              <ModeCard m={m} badge={badge[m.route]} offline={!online} wide={m.wide} />
            </div>
          ))}
        </div>
      </section>

      {/* --- review --- */}
      <section>
        <Label className="mb-2">Opakování</Label>
        <div className="grid grid-cols-2 gap-3">
          {REVIEW_MODES.map((m) => (
            <div key={m.route} className={cx(m.wide && 'col-span-2')}>
              <ModeCard m={m} badge={badge[m.route]} offline={!online} wide={m.wide} />
            </div>
          ))}
        </div>
      </section>

      {traps.length > 0 && (
        <Card onClick={() => navigate('mistakes')}>
          <Label className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-3.5" /> Tvoje nejčastější chyby
          </Label>
          <div className="mt-3 space-y-2.5">
            {traps.map((t, i) => (
              <div key={t.category} className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-amber-500/12 text-amber-600 dark:text-amber-400 grid place-items-center text-xs font-semibold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">
                    {TRAP_LABELS[t.category] ?? t.category} <span className="text-xs text-muted font-normal">×{t.count}</span>
                  </div>
                  <div className="text-xs text-muted truncate">
                    <span className="line-through">{t.example.error}</span> → {t.example.correction}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="hidden sm:block text-[11px] text-muted text-center pb-2">
        Klávesy: Mezerník = nahrávat · Enter = odeslat · R = přehrát · S = uložit chybu · Ctrl+K = Nevím slovo
      </div>
    </div>
  );
}

function Stat({ value, label, tone, onClick }: { value: number; label: string; tone: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="rounded-2xl border border-line bg-surface px-2 py-3 text-center disabled:cursor-default enabled:hover:border-accent/40"
    >
      <div className={cx('text-xl font-bold tabular-nums', tone)}>{value}</div>
      <div className="mt-0.5 text-[10px] leading-tight text-muted">{label}</div>
    </button>
  );
}

function Hero() {
  const days = useStore((s) => s.days);
  const goal = useStore((s) => s.settings.dailyGoal);
  const k = todayKey();
  const xp = dayXp(days[k]);
  const { n: st, saved } = streakInfo(days);
  const rank = rankOf(totalXp(days));
  const met = xp >= goal;
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = todayKey(d);
    return { key, label: WEEKDAYS[d.getDay()], v: Math.min(1, dayXp(days[key]) / goal), today: key === k };
  });
  const date = new Date().toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate('progress')}
      className="relative cursor-pointer overflow-hidden rounded-3xl hero-gradient p-5 text-white shadow-lg shadow-accent/25 transition active:scale-[0.99]"
    >
      <div className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 size-40 rounded-full bg-white/5" />
      <div className="relative flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white/70">{date.charAt(0).toUpperCase() + date.slice(1)}</div>
          <div className="mt-0.5 text-xl font-bold leading-tight">
            {met ? 'Cíl splněn, skvělá práce!' : xp > 0 ? 'Jen tak dál!' : st > 0 ? 'Udrž sérii!' : 'Ahoj! Pojďme mluvit.'}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-semibold">
              <Icon name="flame" className={cx('size-3.5', st > 0 ? 'text-orange-300' : 'text-white/60')} />
              {st} {st === 1 ? 'den' : st >= 2 && st <= 4 ? 'dny' : 'dní'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-semibold">
              <Icon name="medal" className="size-3.5 text-amber-200" />
              {rank.name}
            </span>
          </div>
        </div>
        <Ring value={xp / goal}>
          <div className="text-center leading-none">
            {met ? <Check className="mx-auto size-7" /> : <div className="text-lg font-bold tabular-nums">{xp}</div>}
            <div className="mt-1 text-[10px] text-white/70 tabular-nums">{met ? `${xp} XP` : `/ ${goal} XP`}</div>
          </div>
        </Ring>
      </div>

      <div className="relative mt-4 grid grid-cols-7 gap-1.5">
        {week.map((d) => (
          <div key={d.key} className="flex flex-col items-center gap-1">
            <div
              className={cx(
                'grid size-7 place-items-center rounded-full text-[10px] font-bold',
                d.v >= 1 ? 'bg-white text-accent' : d.v > 0 ? 'bg-white/30' : 'bg-white/10',
                d.today && 'ring-2 ring-white/80 ring-offset-2 ring-offset-transparent',
              )}
            >
              {d.v >= 1 ? (
                <Check className="size-3.5" strokeWidth={3} />
              ) : d.v > 0 ? (
                <span className="size-1.5 rounded-full bg-white" />
              ) : saved.includes(d.key) ? (
                <Icon name="lifebuoy" className="size-3.5 text-sky-200" />
              ) : null}
            </div>
            <span className={cx('text-[10px]', d.today ? 'font-semibold' : 'text-white/60')}>{d.label}</span>
          </div>
        ))}
      </div>

      <div className="relative mt-4">
        <div className="flex justify-between text-[10px] text-white/70">
          <span>Hodnost {rank.rank} · {rank.name} · zobrazit pokrok ›</span>
          <span className="tabular-nums">
            {rank.into}/{rank.need} XP
          </span>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-white/15 overflow-hidden">
          <div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${(rank.into / rank.need) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function ModeCard({ m, badge, offline, wide }: { m: ModeDef; badge?: number; offline: boolean; wide?: boolean }) {
  return (
    <Card onClick={() => navigate(m.route)} className={cx('relative h-full p-3.5 hover:border-accent/40', wide && 'flex items-center gap-3')}>
      <IconTile name={m.icon} tone={m.tone} />
      <div className={cx(wide ? 'min-w-0 flex-1' : 'mt-3')}>
        <div className="text-sm font-semibold leading-tight">{m.title}</div>
        <div className="mt-0.5 text-xs leading-snug text-muted">{m.desc}</div>
      </div>
      {!!badge && (
        <span className="absolute right-3 top-3 grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-semibold tabular-nums text-white">
          {badge}
        </span>
      )}
      {offline && !m.offline && (
        <span className="absolute right-3.5 top-3.5 text-muted">
          <WifiOff className="size-3.5" />
        </span>
      )}
    </Card>
  );
}

function PathCard({ level }: { level: number }) {
  const stars = useStore((s) => s.path);
  const units = pathFor(level);
  const flat = units.flatMap((u) => u.nodes.map((n) => ({ u, n })));
  const done = flat.filter((x) => stars[x.n.id]).length;
  const cur = flat.find((x) => !stars[x.n.id]);
  if (!flat.length) return null;
  return (
    <button onClick={() => navigate('path')} className="flex w-full items-center gap-3 rounded-2xl border border-accent/40 bg-accent/8 p-3.5 text-left transition active:scale-[0.99]">
      <span className="grid size-12 shrink-0 place-items-center rounded-full border-b-4 border-[color-mix(in_oklab,var(--accent)_60%,black)] bg-accent text-white">
        <Icon name={cur ? NODE_INFO[cur.n.kind].icon : 'trophy'} className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-accent">Cesta · {done}/{flat.length}</span>
        <span className="block truncate text-sm font-semibold">{cur ? `Jednotka ${cur.u.n}: ${cur.u.title}` : 'Cesta pro tuto úroveň dokončena!'}</span>
        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-surface-3">
          <span className="block h-full rounded-full bg-accent" style={{ width: `${(done / flat.length) * 100}%` }} />
        </span>
      </span>
      <ChevronRight className="size-4 text-accent" />
    </button>
  );
}
