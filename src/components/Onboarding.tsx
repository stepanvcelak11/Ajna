import { ChevronRight, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { LEVELS } from '../data/levels';
import { navigate } from '../lib/router';
import { updateSettings, useStore } from '../lib/store';
import { celebrate } from '../lib/ui';
import { Icon, IconTile, type IconName, type Tone } from './icons';
import { Btn, cx } from './ui';

const FEATURES: { icon: IconName; tone: Tone; title: string; desc: string }[] = [
  { icon: 'mic', tone: 'emerald', title: 'Mluv nahlas každý den', desc: 'Překlady vět, monology a scénky s okamžitou zpětnou vazbou od AI.' },
  { icon: 'bolt', tone: 'orange', title: 'Hry i bez internetu', desc: 'Kvíz, skládání vět, poslech, párování a gramatika.' },
  { icon: 'target', tone: 'rose', title: 'Učí se z tvých chyb', desc: 'Chyby i slovíčka se ti vrací přesně ve chvíli, kdy je potřebuješ.' },
];

const GOALS = [
  { v: 50, t: 'Lehký', d: '~5 min denně' },
  { v: 100, t: 'Běžný', d: '~10 min denně' },
  { v: 200, t: 'Vážný', d: '~20 min denně' },
  { v: 300, t: 'Drsný', d: '~30 min denně' },
];

/** First-run welcome: what the app does, daily goal, level, AI key. */
export function Onboarding() {
  const [step, setStep] = useState(0);
  const goal = useStore((s) => s.settings.dailyGoal);
  const level = useStore((s) => s.settings.level);
  const hasGemini = useStore((s) => !!(s.settings.geminiKey || s.settings.anthropicKey || s.settings.openaiKey));

  const finish = (to?: Parameters<typeof navigate>[0]) => {
    updateSettings({ onboarded: true });
    if (to) navigate(to);
    else celebrate();
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((n) => (
            <span key={n} className={cx('h-1.5 rounded-full transition-all', n === step ? 'w-6 bg-accent' : n < step ? 'w-3 bg-accent/50' : 'w-3 bg-surface-3')} />
          ))}
        </div>
        <button className="text-xs text-muted" onClick={() => finish()}>
          Přeskočit
        </button>
      </div>

      <div key={step} className="flex flex-1 flex-col animate-up">
        {step === 0 && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="relative grid size-28 place-items-center rounded-[2rem] hero-gradient text-white shadow-xl shadow-accent/30 animate-float">
                <Icon name="chat" className="size-14" strokeWidth={1.5} />
                <span className="absolute -right-2 -top-2 grid size-9 place-items-center rounded-full bg-amber-400 text-accent shadow-md">
                  <Icon name="sparkle" className="size-5" />
                </span>
              </div>
            </div>
            <h1 className="text-center text-3xl font-extrabold tracking-tight">Ahoj! Já jsem Ajna.</h1>
            <p className="mt-2 text-center text-muted">Pomůžu ti rozmluvit se anglicky. Žádné nudné biflování, hlavně mluvení.</p>
            <div className="mt-8 space-y-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
                  <IconTile name={f.icon} tone={f.tone} />
                  <div>
                    <div className="text-sm font-semibold">{f.title}</div>
                    <div className="text-xs text-muted">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-2xl font-extrabold tracking-tight">Kolik času denně?</h1>
            <p className="mt-1 text-sm text-muted">Pravidelnost je důležitější než délka. Cíl můžeš kdykoliv změnit.</p>
            <div className="mt-6 space-y-2.5">
              {GOALS.map((g) => (
                <button
                  key={g.v}
                  onClick={() => updateSettings({ dailyGoal: g.v })}
                  className={cx(
                    'flex w-full items-center justify-between rounded-2xl border-2 px-4 py-4 text-left transition',
                    goal === g.v ? 'border-accent bg-accent/10' : 'border-line bg-surface',
                  )}
                >
                  <span>
                    <span className="block font-bold">{g.t}</span>
                    <span className="text-xs text-muted">{g.d}</span>
                  </span>
                  <span className={cx('text-sm font-bold tabular-nums', goal === g.v ? 'text-accent' : 'text-muted')}>{g.v} XP</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-extrabold tracking-tight">Jak na tom jsi?</h1>
            <p className="mt-1 text-sm text-muted">Vyber úroveň, nebo si za 2 minuty udělej krátký test.</p>
            <button
              onClick={() => finish('placement')}
              className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 p-4 text-left text-white shadow-md"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-white/20">
                <Icon name="target" className="size-6" />
              </span>
              <span className="flex-1">
                <span className="block font-bold">Udělat rozřazovací test</span>
                <span className="text-xs text-white/80">Doporučím ti úroveň</span>
              </span>
              <ChevronRight className="size-5" />
            </button>
            <div className="mt-4 space-y-2">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => updateSettings({ level: l.id })}
                  className={cx(
                    'flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition',
                    level === l.id ? 'border-accent bg-accent/10' : 'border-line bg-surface',
                  )}
                >
                  <span className={cx('grid size-9 shrink-0 place-items-center rounded-xl font-bold', level === l.id ? 'bg-accent text-white' : 'bg-surface-3 text-muted')}>{l.id}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {l.name} <span className="text-xs font-normal text-muted">{l.cefr}</span>
                    </span>
                    <span className="block truncate text-xs text-muted">{l.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="mb-5 flex justify-center">
              <IconTile name="sparkle" tone="amber" size="lg" />
            </div>
            <h1 className="text-center text-2xl font-extrabold tracking-tight">Zapni si AI trenéra</h1>
            <p className="mt-2 text-center text-sm text-muted">
              Hodnocení mluvení, příběhy a scénky běží přes tvůj vlastní klíč. Klíč <b>Google Gemini</b> je zdarma a získáš ho za 2 minuty. Hry fungují i bez něj.
            </p>
            {hasGemini ? (
              <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/8 p-4 text-center text-sm font-medium text-emerald-600 dark:text-emerald-300">
                Klíč už máš nastavený. Můžeš začít!
              </div>
            ) : (
              <Btn variant="primary" className="mt-6 h-12 w-full" onClick={() => finish('settings')}>
                <KeyRound className="size-4" /> Nastavit klíč (návod krok za krokem)
              </Btn>
            )}
          </>
        )}
      </div>

      <div className="mt-8 flex gap-2">
        {step > 0 && (
          <Btn className="h-12 px-5" onClick={() => setStep((s) => s - 1)}>
            Zpět
          </Btn>
        )}
        <Btn variant="primary" className="h-12 flex-1 text-base" onClick={() => (step < 3 ? setStep((s) => s + 1) : finish())}>
          {step === 0 ? 'Jdeme na to' : step < 3 ? 'Pokračovat' : hasGemini ? 'Začít trénovat' : 'Zatím bez AI'}
          <ChevronRight className="size-4" />
        </Btn>
      </div>
    </div>
  );
}
