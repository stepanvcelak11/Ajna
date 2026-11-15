import { AlertTriangle, BookOpen, Flame, KeyRound, Layers, MessageCircle, Mic, Repeat2, Timer, WifiOff } from 'lucide-react';
import { TRAP_LABELS } from '../components/FeedbackCard';
import { Card, Label, cx } from '../components/ui';
import { hasKey } from '../lib/llm';
import { navigate, type Route } from '../lib/router';
import { isDue } from '../lib/srs';
import { streak, todayKey, topTraps, useStore } from '../lib/store';
import { useOnline } from '../lib/ui';

const MODES: { route: Route; letter: string; title: string; cz: string; icon: typeof Mic; color: string }[] = [
  { route: 'ladder', letter: 'A', title: 'Nabalování vět', cz: 'Stavěj složité věty krok po kroku', icon: Layers, color: 'text-violet-400 bg-violet-500/10' },
  { route: 'drill', letter: 'B', title: 'Aktivní překlad', cz: 'CZ → EN s povinnými frázemi', icon: Repeat2, color: 'text-sky-400 bg-sky-500/10' },
  { route: 'monologue', letter: 'C', title: '60s monolog', cz: 'Mluv volně, dostaneš rodilou verzi', icon: Timer, color: 'text-emerald-400 bg-emerald-500/10' },
  { route: 'roleplay', letter: 'D', title: 'Hraní rolí', cz: 'Hotel, lékárna, small talk…', icon: MessageCircle, color: 'text-amber-400 bg-amber-500/10' },
  { route: 'vocab-review', letter: 'E', title: 'Aktivní slovíčka', cz: 'Vybav si slovo a použij ho ve větě', icon: BookOpen, color: 'text-pink-400 bg-pink-500/10' },
];

export default function Dashboard() {
  const days = useStore((s) => s.days);
  const vocab = useStore((s) => s.vocab);
  const mistakes = useStore((s) => s.mistakes);
  useStore((s) => s.settings);
  const online = useOnline();
  const today = days[todayKey()] ?? { words: 0, answers: 0 };
  const st = streak(days);
  const vocabDue = vocab.filter((v) => isDue(v.srs.dueDate)).length;
  const mistakesDue = mistakes.filter((m) => !m.mastered && isDue(m.dueDate)).length;
  const traps = topTraps(mistakes.filter((m) => !m.mastered).length ? mistakes.filter((m) => !m.mastered) : mistakes, 3);

  // last 7 days activity
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { k: todayKey(d), label: d.toLocaleDateString('cs-CZ', { weekday: 'narrow' }), words: days[todayKey(d)]?.words ?? 0 };
  });
  const maxW = Math.max(30, ...week.map((w) => w.words));

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs text-muted">{new Date().toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <h1 className="text-2xl font-semibold tracking-tight">Ahoj! Pojďme mluvit. 🎙️</h1>
      </div>

      {!hasKey() && (
        <Card onClick={() => navigate('settings')} className="border-accent/40 bg-accent/5 flex items-center gap-3">
          <KeyRound className="size-5 text-accent" />
          <div className="text-sm flex-1">
            <div className="font-medium">Nastav API klíč</div>
            <div className="text-xs text-muted">Gemini (zdarma), Claude nebo OpenAI – uložen jen v tomto zařízení.</div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="flex items-center gap-1.5 text-orange-400">
            <Flame className="size-4" />
            <Label className="text-orange-400">Série</Label>
          </div>
          <div className="mt-1 text-3xl font-semibold tabular-nums">
            {st}
            <span className="text-sm font-normal text-muted ml-1">{st === 1 ? 'den' : st >= 2 && st <= 4 ? 'dny' : 'dní'}</span>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-accent">
            <Mic className="size-4" />
            <Label className="text-accent">Slov dnes</Label>
          </div>
          <div className="mt-1 text-3xl font-semibold tabular-nums">{today.words}</div>
          <div className="mt-2 flex items-end gap-1 h-6">
            {week.map((w) => (
              <div key={w.k} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className={cx('w-full rounded-sm', w.k === todayKey() ? 'bg-accent' : 'bg-accent/35')}
                  style={{ height: `${Math.max(2, (w.words / maxW) * 20)}px` }}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card onClick={() => navigate('vocab-review')} className={cx(vocabDue > 0 && 'border-pink-500/30')}>
          <Label>Slovíčka dnes</Label>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-semibold tabular-nums">{vocabDue}</span>
            <span className="text-xs text-muted">k opakování</span>
          </div>
          <div className="mt-1 text-xs text-accent">{vocabDue ? 'Začít →' : vocab.length ? 'Vše hotovo ✓' : 'Přidej balíček →'}</div>
        </Card>
        <Card onClick={() => navigate(mistakesDue ? 'mistake-practice' : 'mistakes')} className={cx(mistakesDue > 0 && 'border-amber-500/30')}>
          <Label>Chyby dnes</Label>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-semibold tabular-nums">{mistakesDue}</span>
            <span className="text-xs text-muted">k procvičení</span>
          </div>
          <div className="mt-1 text-xs text-accent">{mistakesDue ? 'Procvičit →' : 'Banka chyb →'}</div>
        </Card>
      </div>

      {traps.length > 0 && (
        <Card onClick={() => navigate('mistakes')}>
          <Label className="flex items-center gap-1.5 text-amber-500">
            <AlertTriangle className="size-3.5" /> Top 3 Czenglish pasti
          </Label>
          <div className="mt-3 space-y-2.5">
            {traps.map((t, i) => (
              <div key={t.category} className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-amber-500/10 text-amber-500 grid place-items-center text-xs font-semibold shrink-0">{i + 1}</div>
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

      <div>
        <Label className="mb-2">Trénink</Label>
        <div className="space-y-2.5">
          {MODES.map((m) => (
            <Card key={m.route} onClick={() => navigate(m.route)} className="flex items-center gap-3 py-3 hover:border-accent/40">
              <div className={cx('size-11 rounded-xl grid place-items-center shrink-0', m.color)}>
                <m.icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">
                  <span className="text-muted mr-1.5">{m.letter}</span>
                  {m.title}
                </div>
                <div className="text-xs text-muted truncate">{m.cz}</div>
              </div>
              {!online && m.route !== 'vocab-review' && (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted">
                  <WifiOff className="size-3" /> online
                </span>
              )}
              {m.route === 'vocab-review' && vocabDue > 0 && (
                <span className="rounded-full bg-pink-500/15 text-pink-400 text-[11px] px-2 py-0.5 tabular-nums">{vocabDue}</span>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div className="hidden sm:block text-[11px] text-muted text-center pb-2">
        Klávesy: Mezerník = nahrávat · Enter = odeslat · R = přehrát · S = uložit chybu · Ctrl+K = Word Rescue
      </div>
    </div>
  );
}
