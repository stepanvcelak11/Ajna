import { AlertTriangle, ChevronLeft, ChevronRight, Dumbbell, Footprints, Table2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, ModeHeader, cx } from '../components/ui';
import { CONFUSIONS, GROUPS, TENSES, tenseById, type Tense, type TenseId, type Timeline } from '../data/tenses';
import { navigate } from '../lib/router';
import { useStore } from '../lib/store';

const OPEN = 'ajna-open-tense';
/** Open the drill with just these tenses selected. */
export function practiseTenses(ids: TenseId[]) {
  try {
    sessionStorage.setItem('ajna-tense-pick', JSON.stringify(ids));
  } catch {
    /* optional */
  }
  navigate('tense-drill');
}
export function openTense(id: TenseId) {
  try {
    sessionStorage.setItem(OPEN, id);
  } catch {
    /* optional */
  }
  navigate('tenses');
}

/** Small timeline: past – now – future, with where the action sits. */
export function TimelineSvg({ kind, className }: { kind: Timeline; className?: string }) {
  const X = (x: number, k: string | number) => <path key={k} d={`M${x - 5} 25 l10 10 m0 -10 l-10 10`} className="stroke-accent" strokeWidth="3" strokeLinecap="round" />;
  const wave = (a: number, b: number) => {
    let d = `M${a} 30`;
    for (let x = a; x < b; x += 10) d += ` q2.5 -7 5 0 t5 0`;
    return <path d={d} className="stroke-accent" strokeWidth="3" fill="none" strokeLinecap="round" />;
  };
  const bar = (a: number, b: number) => <path d={`M${a} 30 H${b}`} className="stroke-accent" strokeWidth="4" strokeLinecap="round" />;
  const arrow = (x: number) => <path d={`M${x - 7} 23 L${x} 30 L${x - 7} 37`} className="stroke-accent" strokeWidth="3" fill="none" strokeLinecap="round" />;
  const parts: Record<Timeline, React.ReactNode> = {
    habit: [40, 80, 120, 160, 200, 240].map((x, k) => X(x, k)),
    now: wave(130, 172),
    'past-point': X(80, 0),
    'past-range': (
      <>
        {wave(45, 115)}
        <path d="M95 14 V46" className="stroke-rose-500" strokeWidth="2.5" strokeDasharray="3 3" />
      </>
    ),
    'past-to-now': (
      <>
        {X(55, 0)}
        {X(95, 1)}
        <path d="M55 20 Q105 -2 150 20" className="stroke-accent" strokeWidth="2" fill="none" strokeDasharray="4 3" />
        {bar(55, 150)}
        {arrow(150)}
      </>
    ),
    'past-to-now-range': (
      <>
        {wave(55, 148)}
        {arrow(152)}
      </>
    ),
    'before-past': (
      <>
        {X(45, 0)}
        {X(100, 1)}
        <text x="45" y="56" textAnchor="middle" className="fill-accent text-[11px] font-bold">1</text>
        <text x="100" y="56" textAnchor="middle" className="fill-muted text-[11px] font-bold">2</text>
      </>
    ),
    'future-point': X(225, 0),
    plan: (
      <>
        <circle cx="150" cy="30" r="5" className="fill-accent" />
        <path d="M157 30 H218" className="stroke-accent" strokeWidth="2" strokeDasharray="4 3" />
        {X(228, 0)}
      </>
    ),
    'future-range': (
      <>
        {wave(190, 255)}
        <path d="M215 14 V46" className="stroke-rose-500" strokeWidth="2.5" strokeDasharray="3 3" />
      </>
    ),
    'before-future': (
      <>
        {X(200, 0)}
        <path d="M245 14 V46" className="stroke-rose-500" strokeWidth="3" />
        <text x="245" y="58" textAnchor="middle" className="fill-rose-500 text-[10px] font-bold">by…</text>
      </>
    ),
  };
  return (
    <svg viewBox="0 0 300 62" className={cx('w-full', className)} fill="none">
      <path d="M10 30 H290" className="stroke-line" strokeWidth="2" />
      <path d="M284 25 L291 30 L284 35" className="stroke-line" strokeWidth="2" />
      <path d="M150 8 V52" className="stroke-muted" strokeWidth="1.5" strokeDasharray="2 3" />
      <text x="40" y="60" className="fill-muted text-[10px]">minulost</text>
      <text x="150" y="7" textAnchor="middle" className="fill-muted text-[10px] font-bold">teď</text>
      <text x="230" y="60" className="fill-muted text-[10px]">budoucnost</text>
      {parts[kind]}
    </svg>
  );
}

/** Open the steps (Schody) of one tense. */
export function openSteps(id: TenseId) {
  try {
    sessionStorage.setItem('ajna-steps-open', id);
  } catch {
    /* optional */
  }
  navigate('tense-steps');
}

/** Slovesné časy: one table with all tenses, then a page for each. */
export default function Tenses() {
  const level = useStore((s) => s.settings.level);
  const [open, setOpen] = useState<TenseId | null>(() => {
    try {
      const id = sessionStorage.getItem(OPEN) as TenseId | null;
      sessionStorage.removeItem(OPEN);
      return id && TENSES.some((t) => t.id === id) ? id : null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [open]);

  if (open) return <TenseView t={tenseById(open)} onBack={() => setOpen(null)} onGo={setOpen} />;

  return (
    <div className="space-y-5">
      <ModeHeader title="Slovesné časy" subtitle="Všechny časy na jednom místě: kdy, jak a příklad" />

      <button
        onClick={() => navigate('tense-drill')}
        className="relative flex w-full items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 p-4 text-left text-white shadow-md transition active:scale-[0.99]"
      >
        <span className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full bg-white/15" />
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20">
          <Dumbbell className="size-7" />
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block text-base font-extrabold">Procvičovat časy</span>
          <span className="block text-xs text-white/85">Vyber si, které časy chceš, a jak: ťukáním, psaním nebo mluvením</span>
        </span>
        <ChevronRight className="relative size-5" />
      </button>

      <button
        onClick={() => navigate('tense-steps')}
        className="relative -mt-2 flex w-full items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-left text-white shadow-md transition active:scale-[0.99]"
      >
        <span className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full bg-white/15" />
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20">
          <Footprints className="size-7" />
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block text-base font-extrabold">Schody: jeden čas pořádně</span>
          <span className="block text-xs text-white/85">Od krátkých vět po souvětí a vlastní věty, dokud čas neumíš</span>
        </span>
        <ChevronRight className="relative size-5" />
      </button>

      {/* the overview table */}
      <section>
        <Label className="mb-2 flex items-center gap-1.5">
          <Table2 className="size-3.5" /> Přehled v tabulce
        </Label>
        <div className="-mx-4 overflow-x-auto px-4 pb-1">
          <table className="w-full min-w-[38rem] border-separate border-spacing-0 overflow-hidden rounded-2xl border border-line text-left text-xs">
            <thead>
              <tr className="bg-surface-3 text-[10px] uppercase tracking-wide text-muted">
                <th className="sticky left-0 z-10 bg-surface-3 px-3 py-2">Čas</th>
                <th className="px-3 py-2">Kdy se používá</th>
                <th className="px-3 py-2">Tvar</th>
                <th className="px-3 py-2">Příklad</th>
              </tr>
            </thead>
            <tbody>
              {GROUPS.map((g) => (
                <Group key={g.id} title={g.cz} tenses={TENSES.filter((t) => t.group === g.id)} onOpen={setOpen} level={level} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-1 text-[10px] text-muted">Tabulku můžeš posouvat do strany. Ťukni na řádek pro podrobnosti.</div>
      </section>

      {/* common confusions */}
      <section className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <AlertTriangle className="size-3.5 text-amber-500" /> Co si Češi nejčastěji pletou
        </Label>
        {CONFUSIONS.map((c) => (
          <Card key={c.a + c.b} className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <TenseChip id={c.a} onClick={() => setOpen(c.a)} /> <span className="text-muted">×</span> <TenseChip id={c.b} onClick={() => setOpen(c.b)} />
            </div>
            <div className="text-sm">{c.cz}</div>
            <div className="space-y-1">
              {c.ex.map((e) => (
                <div key={e} className="flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-1.5 text-sm">
                  <span className="flex-1">{e}</span>
                  <SpeakButton text={e.replace(/\(.*\)/, '')} compact />
                </div>
              ))}
            </div>
            <button onClick={() => practiseTenses([c.a, c.b])} className="text-xs font-semibold text-accent">
              Procvičit tyhle dva ›
            </button>
          </Card>
        ))}
      </section>

      {/* one card per tense */}
      {GROUPS.map((g) => (
        <section key={g.id} className="space-y-2">
          <Label>{g.cz}</Label>
          <div className="grid gap-2.5">
            {TENSES.filter((t) => t.group === g.id).map((t) => (
              <Card key={t.id} onClick={() => setOpen(t.id)} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cx('size-2.5 rounded-full bg-gradient-to-br', t.color)} />
                  <span className="flex-1 text-sm font-bold">{t.en}</span>
                  <ChevronRight className="size-4 text-muted" />
                </div>
                <div className="text-xs text-muted">
                  {t.cz} · {t.when}
                </div>
                <TimelineSvg kind={t.timeline} className="h-10" />
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Group({ title, tenses, onOpen, level }: { title: string; tenses: Tense[]; onOpen: (id: TenseId) => void; level: number }) {
  return (
    <>
      <tr>
        <td colSpan={4} className="sticky left-0 border-t border-line bg-surface-2 px-3 py-1.5 text-[11px] font-extrabold text-accent">
          {title}
        </td>
      </tr>
      {tenses.map((t) => (
        <tr key={t.id} onClick={() => onOpen(t.id)} className="cursor-pointer align-top active:bg-surface-2">
          <td className="sticky left-0 z-10 w-32 border-t border-line bg-surface px-3 py-2">
            <div className="font-bold leading-tight">{t.en}</div>
            <div className="text-[10px] leading-tight text-muted">{t.cz}</div>
            {t.level > level + 1 && <div className="mt-0.5 text-[9px] font-semibold text-amber-600">pokročilé</div>}
          </td>
          <td className="w-40 min-w-[9rem] border-t border-line px-3 py-2 leading-snug">{t.when}</td>
          <td className="w-32 min-w-[7.5rem] border-t border-line px-3 py-2 font-mono text-[11px] font-semibold leading-snug text-accent">{t.form.split(' · ').map((f) => (<div key={f}>{f}</div>))}</td>
          <td className="border-t border-line px-3 py-2 leading-snug">
            <div className="font-semibold">{t.example.en}</div>
            <div className="text-[10px] text-muted">{t.example.cz}</div>
          </td>
        </tr>
      ))}
    </>
  );
}

function TenseChip({ id, onClick }: { id: TenseId; onClick: () => void }) {
  const t = tenseById(id);
  return (
    <button onClick={onClick} className={cx('rounded-full bg-gradient-to-br px-2.5 py-1 text-[11px] font-bold text-white', t.color)}>
      {t.en}
    </button>
  );
}

function TenseView({ t, onBack, onGo }: { t: Tense; onBack: () => void; onGo: (id: TenseId) => void }) {
  const idx = TENSES.indexOf(t);
  const prev = TENSES[idx - 1];
  const next = TENSES[idx + 1];
  return (
    <div className="space-y-4">
      <ModeHeader title={t.en} subtitle={t.cz} onBack={onBack} />

      <div className={cx('rounded-3xl bg-gradient-to-br p-4 text-white shadow-md', t.color)}>
        <div className="text-xs font-semibold text-white/80">Kdy ho použít</div>
        <div className="text-lg font-extrabold leading-snug">{t.when}</div>
        <div className="mt-3 rounded-2xl bg-white/90 p-2 dark:bg-white/95">
          <TimelineSvg kind={t.timeline} className="text-slate-900 [&_.fill-muted]:fill-slate-500 [&_.stroke-line]:stroke-slate-300 [&_.stroke-muted]:stroke-slate-400" />
        </div>
      </div>

      <section className="space-y-2">
        <Label>Použití s příklady</Label>
        {t.uses.map((u) => (
          <Card key={u.en} className="space-y-1.5">
            <div className="text-xs font-semibold text-accent">{u.cz}</div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-[15px] font-semibold">{u.en}</div>
                <div className="text-xs text-muted">{u.tr}</div>
              </div>
              <SpeakButton text={u.en} compact />
            </div>
          </Card>
        ))}
      </section>

      <section>
        <Label className="mb-2">Jak se tvoří</Label>
        <div className="overflow-hidden rounded-2xl border border-line text-sm">
          {(
            [
              ['+', 'Oznamovací', t.forms.plus],
              ['−', 'Zápor', t.forms.minus],
              ['?', 'Otázka', t.forms.q],
            ] as const
          ).map(([sign, name, [f, ex]], k) => (
            <div key={sign} className={cx('flex gap-3 px-3 py-2.5', k > 0 && 'border-t border-line')}>
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent/12 text-base font-extrabold text-accent">{sign}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">{name}</div>
                <div className="font-mono text-[12px] font-semibold">{f}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[15px]">
                  <span className="flex-1">{ex}</span>
                  <SpeakButton text={ex} compact />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Label className="mb-2">Signální slova</Label>
        <div className="flex flex-wrap gap-1.5">
          {t.signals.map((s) => (
            <span key={s} className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <AlertTriangle className="size-3.5 text-amber-500" /> Pozor
        </Label>
        {t.tips.map((tip) => (
          <div key={tip} className="rounded-xl bg-amber-500/8 px-3 py-2 text-sm leading-snug">
            {tip}
          </div>
        ))}
      </section>

      <div className="flex gap-2">
        <Btn variant="primary" className="h-12 flex-1 text-xs" onClick={() => openSteps(t.id)}>
          <Footprints className="size-4" /> Schody: {t.en}
        </Btn>
        <Btn className="h-12 flex-1 text-xs" onClick={() => practiseTenses([t.id])}>
          <Dumbbell className="size-4" /> Rychlý trénink
        </Btn>
      </div>

      <div className="flex gap-2">
        {prev ? (
          <Btn className="flex-1 text-xs" onClick={() => onGo(prev.id)}>
            <ChevronLeft className="size-4" /> {prev.en}
          </Btn>
        ) : (
          <span className="flex-1" />
        )}
        {next && (
          <Btn className="flex-1 text-xs" onClick={() => onGo(next.id)}>
            {next.en} <ChevronRight className="size-4" />
          </Btn>
        )}
      </div>
    </div>
  );
}
