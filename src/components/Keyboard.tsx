// Big on-screen keyboard (Wordle, crossword, hangman, and writing games when the user picks it).
// Czech QWERTZ layout by default (Y and Z where Czech keyboards have them), QWERTY on request.
// Built to feel like a phone keyboard: a key fires the moment the finger touches it (not on release),
// several fingers can type at once, the gaps between keys still count, a bubble shows the letter
// above the finger, and holding backspace keeps deleting.
import { CornerDownLeft, Delete } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent as RMouseEvent, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
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
  const [pop, setPop] = useState<string | null>(null);
  const popTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const repeat = useRef<{ t?: ReturnType<typeof setTimeout>; i?: ReturnType<typeof setInterval> }>({});
  const onKeyRef = useRef(onKey);
  onKeyRef.current = onKey;

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

  const stopRepeat = () => {
    clearTimeout(repeat.current.t);
    clearInterval(repeat.current.i);
  };
  useEffect(() => () => (stopRepeat(), clearTimeout(popTimer.current)), []);

  /** Fire on touch-down. Keyboard activation (Enter/Space on a focused key) still comes as a click with detail 0. */
  const down = (k: string, fn: () => void) => ({
    onPointerDown: (e: RPointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      fn();
      if (k.length === 1 && /[a-z]/.test(k)) {
        setPop(k);
        clearTimeout(popTimer.current);
        popTimer.current = setTimeout(() => setPop(null), 160);
      }
      if (k === 'back') {
        stopRepeat();
        repeat.current.t = setTimeout(() => {
          repeat.current.i = setInterval(() => onKeyRef.current('back'), 70);
        }, 420);
      }
    },
    onPointerUp: k === 'back' ? stopRepeat : undefined,
    onPointerCancel: k === 'back' ? stopRepeat : undefined,
    onPointerLeave: k === 'back' ? stopRepeat : undefined,
    onClick: (e: RMouseEvent) => {
      if (e.detail === 0) fn();
    },
  });

  const h = compact ? 'h-[3.1rem]' : 'h-[3.6rem]';
  // the button is the whole cell (no dead gaps); the visible key is drawn inside with padding
  const cell = ({ id, k, grow = 1, label, face, disabled, fn, edge }: { id?: string; k: string; grow?: number; label?: string; face: string; disabled?: boolean; fn: () => void; edge?: boolean }) => (
    <button
      key={id ?? k}
      type="button"
      aria-label={edge ? undefined : (label ?? k)}
      aria-hidden={edge || undefined}
      tabIndex={edge ? -1 : undefined}
      disabled={disabled}
      style={{ flexGrow: grow, flexBasis: 0 }}
      className={cx('relative min-w-0 touch-none px-[2.5px] py-[4px] outline-none disabled:opacity-40', h)}
      {...down(k, fn)}
    >
      <span className={cx('grid h-full w-full place-items-center rounded-[10px] shadow-[0_1px_0_rgba(0,0,0,0.25)]', face)}>{edge ? null : keyFace(k)}</span>
      {pop === k && !edge && k.length === 1 && (
        <span className="pointer-events-none absolute bottom-[85%] left-1/2 z-20 grid h-14 w-11 -translate-x-1/2 place-items-center rounded-xl border border-line bg-surface text-3xl font-bold uppercase shadow-xl">
          {k}
        </span>
      )}
    </button>
  );
  const keyFace = (k: string): ReactNode =>
    k === 'back' ? <Delete className="size-6" /> : k === 'enter' ? <CornerDownLeft className="size-6" /> : k === ' ' ? 'mezera' : k === 'layout' ? (layout === 'qwertz' ? 'QWERTZ' : 'QWERTY') : k;

  const letter = 'text-[22px] font-semibold uppercase';
  const plain = 'bg-surface-2 border border-line';
  const fnFace = 'bg-surface-3 border border-line';

  return (
    <div className="-mx-1.5 select-none [-webkit-tap-highlight-color:transparent]" onContextMenu={(e) => e.preventDefault()}>
      {LAYOUTS[layout].map((row, r) => (
        <div key={row} className="flex">
          {/* half-key edges on the middle row still type the nearest letter, like a phone keyboard */}
          {r === 1 && cell({ id: 'edge-l', k: row[0], grow: 0.5, face: 'bg-transparent', edge: true, fn: () => onKey(row[0]) })}
          {r === 2 && <span style={{ flexGrow: 1.5, flexBasis: 0 }} />}
          {[...row].map((ch) => cell({ k: ch, face: cx(letter, marks?.[ch] ?? plain), fn: () => onKey(ch) }))}
          {r === 1 && cell({ id: 'edge-r', k: row[row.length - 1], grow: 0.5, face: 'bg-transparent', edge: true, fn: () => onKey(row[row.length - 1]) })}
          {r === 2 && cell({ k: 'back', grow: 1.5, label: 'Smazat', face: fnFace, fn: () => onKey('back') })}
        </div>
      ))}
      <div className="flex">
        {cell({ k: 'layout', grow: space || onEnter ? 1.6 : 1, label: 'Přepnout rozložení klávesnice', face: cx(fnFace, 'text-[10px] font-semibold text-muted'), fn: () => toggleLayout() })}
        {space && cell({ k: "'", face: cx(plain, 'text-xl font-bold'), fn: () => onKey("'") })}
        {space && cell({ k: ' ', grow: 4.4, label: 'Mezera', face: cx(plain, 'text-xs text-muted'), fn: () => onKey(' ') })}
        {onEnter && cell({ k: 'enter', grow: 2, label: 'Potvrdit', disabled: enterDisabled, face: 'bg-accent text-white', fn: () => !enterDisabled && onEnter() })}
        {!space && !onEnter && <span className="flex-[3]" />}
      </div>
    </div>
  );

  function toggleLayout() {
    const n = layout === 'qwertz' ? 'qwerty' : 'qwertz';
    setLayout(n);
    try {
      localStorage.setItem(KEY, n);
    } catch {
      /* optional */
    }
  }
}
