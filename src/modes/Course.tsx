import { AlertTriangle, BookOpen, Check, ChevronLeft, ChevronRight, Layers, MessageCircle, Plus, Repeat2, Target, Timer, X } from 'lucide-react';
import { useState } from 'react';
import { PracticeBar } from '../components/LevelPicker';
import { IconTile } from '../components/icons';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, ExampleText, Label, cx } from '../components/ui';
import { COURSE, LESSONS, lessonOfTopic, packIdOf, type Lesson } from '../data/textbook';
import { getLevel } from '../data/levels';
import { navigate, type Route } from '../lib/router';
import { newSrs } from '../lib/srs';
import { setState, uid, updateSettings, useStore } from '../lib/store';
import type { AppState, VocabCard } from '../lib/types';
import { toast } from '../lib/ui';

function lessonProgress(log: AppState['levelLog'], n: number) {
  const mine = log.filter((x) => x.focus && (x.focus === `u${n}` || x.focus.startsWith(`u${n}-`)));
  return { done: mine.filter((x) => x.ok).length, tried: mine.length };
}

function addLessonVocab(l: Lesson) {
  setState((s) => {
    const have = new Set(s.vocab.map((v) => v.en.toLowerCase()));
    const now = new Date().toISOString();
    const cards: VocabCard[] = l.vocab
      .filter((it) => !have.has(it.en.toLowerCase()))
      .map((it) => ({ ...it, id: uid(), source: 'starter', pack: `L${l.n} ${l.title}`, createdAt: now, srs: newSrs() }));
    return { ...s, vocab: [...s.vocab, ...cards], addedPacks: [...new Set([...s.addedPacks, packIdOf(l.n)])] };
  });
  toast(`Slovíčka lekce ${l.n} přidána`);
}

const GOAL = 10; // successful answers to mark a lesson as practised

export default function Course() {
  const [open, setOpen] = useState<number | null>(null);
  const log = useStore((s) => s.levelLog);
  const focus = useStore((s) => s.settings.focus);
  const active = lessonOfTopic(focus);
  const lesson = LESSONS.find((l) => l.n === open);
  if (lesson) return <LessonView lesson={lesson} onBack={() => setOpen(null)} />;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-medium text-muted">Učebnice {COURSE.code}</div>
        <h1 className="text-2xl font-bold tracking-tight">{COURSE.title}</h1>
        <div className="text-xs text-muted mt-1">{COURSE.note}</div>
      </div>

      {active && (
        <Card className="border-amber-500/40 bg-amber-500/5 space-y-3">
          <div className="flex items-center gap-3" onClick={() => setOpen(active.n)}>
            <IconTile name={active.icon} tone={active.tone} />
            <div className="flex-1 text-sm">
              <div className="font-semibold">Právě procvičuješ lekci {active.n}: {active.title}</div>
              <div className="text-xs text-muted">Všechny režimy teď používají tuto lekci.</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Btn variant="secondary" className="flex-1 h-9" onClick={() => setOpen(active.n)}>
              Otevřít lekci
            </Btn>
            <Btn variant="secondary" className="flex-1 h-9" onClick={() => updateSettings({ focus: null })}>
              <X className="size-4" /> Ukončit lekci
            </Btn>
          </div>
        </Card>
      )}

      <div className="space-y-2.5">
        {LESSONS.map((l) => {
          const p = lessonProgress(log, l.n);
          const pct = Math.min(100, (p.done / GOAL) * 100);
          return (
            <Card key={l.n} onClick={() => setOpen(l.n)} className={cx('py-3', active?.n === l.n && 'border-accent/50')}>
              <div className="flex items-center gap-3">
                <IconTile name={l.icon} tone={l.tone} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">
                    <span className="text-muted mr-1.5">{l.n}</span>
                    {l.title} <span className="text-muted font-normal">· {l.cz}</span>
                  </div>
                  <div className="text-xs text-muted truncate">{l.grammarTitle}</div>
                  <div className="mt-1.5 h-1 rounded-full bg-surface-3 overflow-hidden">
                    <div className={cx('h-full', pct >= 100 ? 'bg-emerald-500' : 'bg-accent')} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                {pct >= 100 ? <Check className="size-4 text-emerald-500" /> : <ChevronRight className="size-4 text-muted" />}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

const MODES: { route: Route; label: string; icon: typeof Layers }[] = [
  { route: 'drill', label: 'Překlad vět', icon: Repeat2 },
  { route: 'ladder', label: 'Nabalování vět', icon: Layers },
  { route: 'monologue', label: 'Monolog', icon: Timer },
  { route: 'roleplay', label: 'Hraní rolí', icon: MessageCircle },
];

function LessonView({ lesson: l, onBack }: { lesson: Lesson; onBack: () => void }) {
  const focus = useStore((s) => s.settings.focus);
  const level = useStore((s) => s.settings.level);
  const added = useStore((s) => s.addedPacks.includes(packIdOf(l.n)));
  const log = useStore((s) => s.levelLog);
  const p = lessonProgress(log, l.n);
  const inLesson = lessonOfTopic(focus)?.n === l.n;

  const ensureFocus = () => {
    if (!inLesson) updateSettings({ focus: `u${l.n}` });
  };
  const go = (r: Route) => {
    ensureFocus();
    navigate(r);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Zpět" className="size-10 -ml-2 grid place-items-center rounded-xl text-muted hover:text-fg hover:bg-surface-2">
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted">
            Lekce {l.n} · {p.done}/{GOAL} úspěšných odpovědí
          </div>
          <h1 className="text-xl font-bold tracking-tight leading-tight">
            {l.title} <span className="text-muted font-normal text-base">· {l.cz}</span>
          </h1>
        </div>
        <IconTile name={l.icon} tone={l.tone} />
      </div>

      {inLesson ? (
        <PracticeBar />
      ) : (
        <Btn variant="primary" className="w-full h-12" onClick={ensureFocus}>
          <Target className="size-4" /> Procvičovat tuto lekci
        </Btn>
      )}

      <Card className="space-y-3">
        <Label>Trénink lekce</Label>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((m) => (
            <Btn key={m.route} variant="secondary" className="h-12 justify-start" onClick={() => go(m.route)}>
              <m.icon className="size-4 text-accent" /> {m.label}
            </Btn>
          ))}
        </div>
        <div className="text-[11px] text-muted">
          Gramatika a slovíčka podle lekce, délka a složitost vět podle tvé úrovně ({level} · {getLevel(level).name}).
          {inLesson ? ` Zaměření: ${focus === `u${l.n}` ? 'celá lekce' : l.topics.find((t) => t.id === focus)?.cz}.` : ''}
        </div>
      </Card>

      {l.topics.map((t) => {
        const on = focus === t.id;
        return (
          <Card key={t.id} className={cx('space-y-3', on && 'border-amber-500/50')}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <Label>Gramatika</Label>
                <div className="mt-1 font-medium">{t.cz}</div>
              </div>
              <Btn
                variant={on ? 'secondary' : 'ghost'}
                className="h-8 px-2.5 text-xs shrink-0"
                onClick={() => {
                  updateSettings({ focus: on ? `u${l.n}` : t.id });
                  toast(on ? 'Zaměření: celá lekce' : `Zaměření: ${t.cz}`);
                }}
              >
                <Target className={cx('size-3.5', on && 'text-amber-500')} /> {on ? 'Zaměřeno' : 'Zaměřit'}
              </Btn>
            </div>
            <ul className="space-y-1.5 text-sm">
              {t.rules.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-1.5">
              {t.examples.map((e) => (
                <div key={e} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm">
                  <span className="flex-1">{e}</span>
                  <SpeakButton text={e} compact />
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      <Card className="space-y-2">
        <Label className="flex items-center gap-1.5 text-amber-500">
          <AlertTriangle className="size-3.5" /> Časté chyby Čechů
        </Label>
        {l.traps.map((t) => (
          <div key={t} className="text-sm">
            {t}
          </div>
        ))}
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label className="flex items-center gap-1.5">
            <BookOpen className="size-3.5" /> Slovíčka lekce ({l.vocab.length})
          </Label>
          <Btn variant={added ? 'ghost' : 'primary'} className="h-8 px-3 text-xs" disabled={added} onClick={() => addLessonVocab(l)}>
            {added ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
            {added ? 'V opakování' : 'Přidat do opakování'}
          </Btn>
        </div>
        <div className="divide-y divide-line">
          {l.vocab.map((v) => (
            <div key={v.en} className="py-2 flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium">{v.en}</span> <span className="text-muted">– {v.cz}</span>
                </div>
                <ExampleText text={v.example} className="text-xs text-muted" />
                {v.collocation && <div className="text-[11px] text-amber-500/90">{v.collocation}</div>}
              </div>
              <SpeakButton text={v.en} compact />
            </div>
          ))}
        </div>
        {added && (
          <Btn variant="secondary" className="w-full" onClick={() => navigate('vocab-review')}>
            Opakovat slovíčka
          </Btn>
        )}
      </Card>
    </div>
  );
}
