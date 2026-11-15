import { Check, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { LEVELS, findTopic, getLevel, type LevelId } from '../data/levels';
import { lessonOfTopic } from '../data/textbook';
import { navigate } from '../lib/router';
import { updateSettings, useStore } from '../lib/store';
import { Icon, IconTile } from './icons';
import { Btn, Label, Sheet, cx } from './ui';

/** Clear the grammar/lesson focus → back to general practice. */
export function clearFocus() {
  updateSettings({ focus: null });
}

/**
 * Bar shown under every practice header: current level (tap to change) and the active
 * focus/lesson with a one-tap ✕ to return to general practice.
 */
export function PracticeBar({ onChange }: { onChange?: () => void }) {
  const level = useStore((s) => s.settings.level);
  const focus = useStore((s) => s.settings.focus);
  const [open, setOpen] = useState(false);
  const l = getLevel(level);
  const topic = findTopic(focus);
  const lesson = lessonOfTopic(focus);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 h-8 text-xs font-medium hover:border-accent/60"
        >
          <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-white">{level}</span>
          Úroveň · {l.name}
          <ChevronDown className="size-3.5 text-muted" />
        </button>
        {topic ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 pl-2.5 pr-1 h-8 text-xs font-medium text-amber-700 dark:text-amber-300 max-w-full">
            <Icon name={lesson ? 'book' : 'target'} className="size-3.5" />
            <span className="truncate">{lesson ? `Lekce ${lesson.n}${focus === `u${lesson.n}` ? `: ${lesson.title}` : `: ${topic.cz}`}` : topic.cz}</span>
            <button
              onClick={() => {
                clearFocus();
                onChange?.();
              }}
              aria-label="Zrušit zaměření"
              title="Zpět na obecné procvičování"
              className="grid size-6 place-items-center rounded-full hover:bg-amber-500/20"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 h-8 text-xs text-muted">
            <Icon name="layers" className="size-3.5" />
            Obecné procvičování
          </span>
        )}
      </div>
      <LevelSheet open={open} onClose={() => setOpen(false)} onChange={onChange} />
    </>
  );
}

/** Vertical list of the five levels. Used in the sheet and in Settings. */
export function LevelList({ onPick }: { onPick?: (id: LevelId) => void }) {
  const level = useStore((s) => s.settings.level);
  const focus = useStore((s) => s.settings.focus);
  return (
    <div className="space-y-1.5">
      {LEVELS.map((x) => {
        const on = level === x.id;
        return (
          <button
            key={x.id}
            onClick={() => {
              if (!on) {
                // keep a textbook-lesson focus; a focus on another level's grammar no longer applies
                updateSettings({ level: x.id, focus: findTopic(focus)?.lessonN ? focus : null });
                onPick?.(x.id);
              }
            }}
            className={cx(
              'w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition',
              on ? 'border-accent bg-accent/10' : 'border-line hover:bg-surface-2',
            )}
          >
            <span
              className={cx(
                'grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold',
                on ? 'bg-accent text-white' : 'bg-surface-2 text-muted',
              )}
            >
              {x.id}
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">{x.name}</span>
                <span className="text-[11px] text-muted">{x.cefr}</span>
              </span>
              <span className="block text-xs text-muted leading-snug">{x.desc}</span>
            </span>
            {on && <Check className="size-4 text-accent" />}
          </button>
        );
      })}
    </div>
  );
}

export function LevelSheet({ open, onClose, onChange }: { open: boolean; onClose: () => void; onChange?: () => void }) {
  const level = useStore((s) => s.settings.level);
  const focus = useStore((s) => s.settings.focus);
  const l = getLevel(level);
  const lesson = lessonOfTopic(focus);

  const pickFocus = (id: string | null) => {
    updateSettings({ focus: id });
    onChange?.();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Obtížnost a zaměření">
      <Label>Úroveň</Label>
      <div className="mt-2">
        <LevelList onPick={() => onChange?.()} />
      </div>

      <Label className="mt-5">Co procvičovat</Label>
      <div className="mt-2 space-y-1.5">
        <button
          onClick={() => pickFocus(null)}
          className={cx(
            'w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left',
            !focus ? 'border-accent bg-accent/10' : 'border-line hover:bg-surface-2',
          )}
        >
          <IconTile name="layers" tone="violet" size="sm" />
          <span className="flex-1 text-sm">
            <span className="font-semibold">Obecné procvičování</span>
            <span className="block text-xs text-muted">Mix gramatiky úrovně {l.id}</span>
          </span>
          {!focus && <Check className="size-4 text-accent" />}
        </button>

        {lesson && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-3 py-2.5">
            <IconTile name={lesson.icon} tone={lesson.tone} size="sm" />
            <span className="flex-1 min-w-0 text-sm">
              <span className="font-semibold">
                Lekce {lesson.n}: {lesson.title}
              </span>
              <span className="block text-xs text-muted truncate">{findTopic(focus)?.cz}</span>
            </span>
            <Btn variant="secondary" className="h-8 px-2.5 text-xs" onClick={() => pickFocus(null)}>
              Ukončit
            </Btn>
          </div>
        )}

        <button
          onClick={() => {
            onClose();
            navigate('course');
          }}
          className="w-full flex items-center gap-3 rounded-2xl border border-line px-3 py-2.5 text-left hover:bg-surface-2"
        >
          <IconTile name="book" tone="sky" size="sm" />
          <span className="flex-1 text-sm">
            <span className="font-semibold">Lekce z učebnice</span>
            <span className="block text-xs text-muted">Vybrat lekci VYA008</span>
          </span>
        </button>
      </div>

      <Label className="mt-5">Nebo jen jedna gramatika (úroveň {l.id})</Label>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {l.grammar.map((g) => (
          <button
            key={g.id}
            onClick={() => pickFocus(focus === g.id ? null : g.id)}
            className={cx(
              'rounded-full border px-3 py-1.5 text-xs inline-flex items-center gap-1',
              focus === g.id ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'border-line text-muted',
            )}
          >
            {focus === g.id && <Check className="size-3" />}
            {g.cz}
          </button>
        ))}
      </div>

      <Btn variant="primary" className="w-full mt-5" onClick={onClose}>
        Hotovo
      </Btn>
    </Sheet>
  );
}
