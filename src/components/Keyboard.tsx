// Big on-screen keyboard for writing games. Czech QWERTZ layout by default (Y and Z where Czech keyboards have them),
// QWERTY on request. Using it instead of the phone keyboard also keeps the iPhone screen from shifting.
import { CornerDownLeft, Delete } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isTypingTarget } from '../lib/ui';
import { cx } from './ui';

const LAYOUTS = {
  qwertz: ['qwertzuiop', 'asdfghjkl', 'yxcvbnm'],
  qwerty: ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'],
};
type Layout = keyof typeof LAYOUTS;
const KEY = 'ajna-kb-layout';

function loadLayout(): Layout {
  try {
    return localStorage.getItem(KEY) === 'qwerty' ? 'qwerty' : 'qwertz';
  } catch {
    return 'qwertz';
  }
}

export function Keyboard({
  onKey,
  onEnter,
  space = true,
  marks,
  enterDisabled,
  compact,
}: {
  onKey: (k: string) => void; // a letter, ' ', "'" or 'back'
  onEnter?: () => void;
  space?: boolean;
  /** optional colour per letter (Wordle) */
  marks?: Record<string, string>;
  enterDisabled?: boolean;
  /** slightly lower keys where the screen is full (Wordle, crossword) */
  compact?: boolean;
}) {
  const [layout, setLayout] = useState<Layout>(loadLayout);

  // physical keyboard too (desktop)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.querySelector('[data-sheet-open]')) return;
      if (/^[a-z]$/i.test(e.key)) onKey(e.key.toLowerCase());
      else if (e.key === 'Backspace') onKey('back');
      else if (e.key === ' ' && space) {
        e.preventDefault();
        onKey(' ');
      } else if (e.key === "'" && space) onKey("'");
      else if (e.key === 'Enter' && onEnter) {
        e.preventDefault();
        onEnter();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const key = cx(compact ? 'h-12' : 'h-[3.25rem]', 'min-w-0 flex-1 rounded-xl text-lg font-bold uppercase shadow-sm transition active:scale-95 active:brightness-90 touch-manipulation');
  return (
    <div className="select-none space-y-1.5" onContextMenu={(e) => e.preventDefault()}>
      {LAYOUTS[layout].map((row, r) => (
        <div key={row} className={cx('flex gap-1', r === 1 && 'px-[4.5%]')}>
          {[...row].map((ch) => (
            <button key={ch} type="button" onClick={() => onKey(ch)} className={cx(key, marks?.[ch] ?? 'border border-line bg-surface-2')}>
              {ch}
            </button>
          ))}
          {r === 2 && (
            <button type="button" onClick={() => onKey('back')} aria-label="Smazat" className={cx(key, 'grid flex-[1.6] place-items-center border border-line bg-surface-3')}>
              <Delete className="size-6" />
            </button>
          )}
        </div>
      ))}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => {
            const n = layout === 'qwertz' ? 'qwerty' : 'qwertz';
            setLayout(n);
            try {
              localStorage.setItem(KEY, n);
            } catch {
              /* optional */
            }
          }}
          className={cx(key, 'border border-line bg-surface-3 text-[10px] normal-case text-muted', space || onEnter ? 'flex-[1.4]' : 'mx-auto h-8 max-w-28')}
          aria-label="Přepnout rozložení klávesnice"
        >
          {layout === 'qwertz' ? 'QWERTZ' : 'QWERTY'}
        </button>
        {space && (
          <>
            <button type="button" onClick={() => onKey("'")} className={cx(key, 'border border-line bg-surface-2')}>
              '
            </button>
            <button type="button" onClick={() => onKey(' ')} className={cx(key, 'flex-[4] border border-line bg-surface-2 text-xs normal-case text-muted')}>
              mezera
            </button>
          </>
        )}
        {onEnter && (
          <button
            type="button"
            disabled={enterDisabled}
            onClick={onEnter}
            aria-label="Potvrdit"
            className={cx(key, 'grid flex-[2] place-items-center bg-accent text-white disabled:opacity-40')}
          >
            <CornerDownLeft className="size-6" />
          </button>
        )}
      </div>
    </div>
  );
}
