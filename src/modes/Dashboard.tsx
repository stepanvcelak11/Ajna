import { AlertTriangle, ChevronRight, KeyRound, WifiOff, X } from 'lucide-react';
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
import { levelSuggestion, streak, todayKey, topTraps, updateSettings, useStore } from '../lib/store';
import { useOnline } from '../lib/ui';

const MODES: { route: Route; title: string; desc: string; icon: IconName; tone: Tone; offline?: boolean }[] = [
  { route: 'drill', title: 'Překlad vět', desc: 'Česká věta → řekni ji anglicky', icon: 'swap', tone: 'sky' },
  { route: 'ladder', title: 'Nabalování vět', desc: 'Od krátké věty po složitou', icon: 'ladder', tone: 'violet' },
  { route: 'monologue', title: 'Monolog', desc: 'Mluv volně, dostaneš rodilou verzi', icon: 'mic', tone: 'emerald' },
  { route: 'roleplay', title: 'Hraní rolí', desc: 'Hotel, lékárna, pohovor…', icon: 'dialog', tone: 'amber' },
  { route: 'vocab-review', title: 'Slovíčka', desc: 'Vybav si slovo a použij ho', icon: 'cards', tone: 'pink', offline: true },
  { route: 'mistake-practice', title: 'Moje chyby', desc: 'Procvič, co ti nešlo', icon: 'target', tone: 'rose' },
];

export default function Dashboard() {
  const days = useStore((s) => s.days);
  const vocab = useStore((s) => s.vocab);
  const mistakes = useStore((s) => s.mistakes);
  const level = useStore((s) => s.settings.level);
  const focus = useStore((s) => s.settings.focus);
  const levelLog = useStore((s) => s.levelLog);
  useStore((s) => s.settings.provider + s.settings.geminiKey + s.settings.anthropicKey + s.settings.openaiKey);
  const online = useOnline();
  const [levelOpen, setLevelOpen] = useState(false);

  const lv = getLevel(level);
  const topic = findTopic(focus);
  const lesson = lessonOfTopic(focus);
  const suggestion = levelSuggestion(levelLog, level);
  const today = days[todayKey()] ?? { words: 0, answers: 0 };
  const st = streak(days);
  const vocabDue = vocab.filter((v) => isDue(v.srs.dueDate)).length;
  const mistakesDue = mistakes.filter((m) => !m.mastered && isDue(m.dueDate)).length;
  const active = mistakes.filter((m) => !m.mastered);
  const traps = topTraps(active.length ? active : mistakes, 3);

  const badge: Partial<Record<Route, number>> = { 'vocab-review': vocabDue, 'mistake-practice': mistakesDue };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-medium text-muted">
          {(() => {
            const d = new Date().toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
            return d.charAt(0).toUpperCase() + d.slice(1);
          })()}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Ahoj! Pojďme mluvit.</h1>
      </div>

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
        <Label className="mb-2">Dnes</Label>
        <div className="grid grid-cols-4 gap-2">
          <Stat value={st} label={st === 1 ? 'den v řadě' : st >= 2 && st <= 4 ? 'dny v řadě' : 'dní v řadě'} tone="text-orange-500" />
          <Stat value={today.words} label="slov řečeno" tone="text-accent" />
          <Stat value={vocabDue} label="slovíček" tone="text-pink-500" onClick={() => navigate(vocabDue ? 'vocab-review' : 'vocab')} />
          <Stat value={mistakesDue} label="chyb" tone="text-rose-500" onClick={() => navigate(mistakesDue ? 'mistake-practice' : 'mistakes')} />
        </div>
      </section>

      {/* --- modes --- */}
      <section>
        <Label className="mb-2">Cvičení</Label>
        <div className="grid grid-cols-2 gap-3">
          {MODES.map((m) => (
            <Card key={m.route} onClick={() => navigate(m.route)} className="relative p-3.5 hover:border-accent/40">
              <IconTile name={m.icon} tone={m.tone} />
              <div className="mt-3 text-sm font-semibold leading-tight">{m.title}</div>
              <div className="mt-0.5 text-xs text-muted leading-snug">{m.desc}</div>
              {!!badge[m.route] && (
                <span className="absolute top-3 right-3 min-w-6 h-6 px-1.5 rounded-full bg-accent text-white text-[11px] font-semibold grid place-items-center tabular-nums">
                  {badge[m.route]}
                </span>
              )}
              {!online && !m.offline && (
                <span className="absolute top-3.5 right-3.5 text-muted">
                  <WifiOff className="size-3.5" />
                </span>
              )}
            </Card>
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
