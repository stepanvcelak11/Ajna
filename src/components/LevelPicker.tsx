import { Check, Gauge, Target } from 'lucide-react';
import { useState } from 'react';
import { LEVELS, findTopic, getLevel, type LevelId } from '../data/levels';
import { updateSettings, useStore } from '../lib/store';
import { Btn, Label, Sheet, cx } from './ui';

/** Chip showing the current level (and grammar focus); opens a sheet to change both. */
export function LevelChip({ onChange }: { onChange?: () => void }) {
  const level = useStore((s) => s.settings.level);
  const focus = useStore((s) => s.settings.focus);
  const [open, setOpen] = useState(false);
  const l = getLevel(level);
  const topic = findTopic(focus);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 h-8 text-xs font-medium hover:border-accent/50"
      >
        <Gauge className="size-3.5 text-accent" />
        {level}
        {topic && <Target className="size-3 text-amber-500" />}
      </button>
      <LevelSheet
        open={open}
        onClose={() => setOpen(false)}
        onChange={onChange}
        title={`Úroveň ${l.id} · ${l.name}${topic ? ` · ${topic.cz}` : ''}`}
      />
    </>
  );
}

export function LevelSheet({ open, onClose, onChange, title }: { open: boolean; onClose: () => void; onChange?: () => void; title?: string }) {
  const level = useStore((s) => s.settings.level);
  const focus = useStore((s) => s.settings.focus);
  const [view, setView] = useState<LevelId>(level);
  const l = getLevel(view);
  const tbTopic = (() => {
    const t = findTopic(focus);
    return t?.lessonN ? t : null;
  })();

  const pickLevel = (id: LevelId) => {
    setView(id);
    if (id !== level) {
      // keep a textbook-lesson focus; a focus on another level's grammar no longer applies
      updateSettings({ level: id, focus: findTopic(focus)?.lessonN ? focus : null });
      onChange?.();
    }
  };
  const pickFocus = (id: string | null) => {
    updateSettings({ focus: id });
    onChange?.();
  };

  return (
    <Sheet open={open} onClose={onClose} title={title ?? 'Obtížnost'}>
      <Label>Úroveň</Label>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {LEVELS.map((x) => (
          <button
            key={x.id}
            onClick={() => pickLevel(x.id)}
            className={cx(
              'rounded-xl border py-2 text-center transition',
              level === x.id ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted hover:text-fg',
            )}
          >
            <div className="text-lg font-semibold leading-none">{x.id}</div>
            <div className="mt-1 text-[9px]">{x.cefr}</div>
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-surface-2 p-3">
        <div className="text-sm font-medium">
          {l.name} <span className="text-xs text-muted">({l.cefr})</span>
        </div>
        <div className="text-xs text-muted mt-0.5">{l.desc}</div>
      </div>

      {tbTopic && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/5 p-3 text-xs">
          <Target className="size-4 text-amber-500 shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-fg">📘 {tbTopic.cz}</div>
            <div className="text-muted">Procvičuješ lekci z učebnice.</div>
          </div>
          <button className="text-accent font-medium" onClick={() => pickFocus(null)}>
            Zrušit
          </button>
        </div>
      )}

      <Label className="mt-4">Zaměření na gramatiku</Label>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          onClick={() => pickFocus(null)}
          className={cx('rounded-full border px-3 py-1.5 text-xs', !focus ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted')}
        >
          Mix všeho
        </button>
        {l.grammar.map((g) => (
          <button
            key={g.id}
            onClick={() => pickFocus(g.id)}
            className={cx(
              'rounded-full border px-3 py-1.5 text-xs inline-flex items-center gap-1',
              focus === g.id ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-line text-muted',
            )}
          >
            {focus === g.id && <Check className="size-3" />}
            {g.cz}
          </button>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-muted">
        Se zaměřením budou všechny nové věty procvičovat právě tuto gramatiku. Témata z ostatních úrovní uvidíš po ťuknutí na jejich číslo.
      </div>
      <Btn variant="primary" className="w-full mt-4" onClick={onClose}>
        Hotovo
      </Btn>
    </Sheet>
  );
}
