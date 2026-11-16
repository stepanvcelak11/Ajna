// Ajna's own icon set: 24×24, 1.75 stroke, rounded joins. Drawn for this app so topics, lessons,
// scenarios and modes share one visual language (instead of emoji).
import type { ReactNode } from 'react';
import { cx } from './ui';

const P: Record<string, ReactNode> = {
  // ---- topics / lessons
  plate: (
    <>
      <circle cx="12.5" cy="12" r="6" />
      <circle cx="12.5" cy="12" r="3.2" />
      <path d="M3.5 4v4.5a1.5 1.5 0 0 0 3 0V4M5 9.5V20M21 20V4c-1.6 1-2.3 3.2-2.3 6.3h2.3" />
    </>
  ),
  family: (
    <>
      <circle cx="7" cy="7" r="2.6" />
      <circle cx="17" cy="7" r="2.6" />
      <circle cx="12" cy="12.5" r="2" />
      <path d="M2.5 19c0-3.4 2-5.8 4.5-5.8 1 0 1.9.3 2.6.9M21.5 19c0-3.4-2-5.8-4.5-5.8-1 0-1.9.3-2.6.9M8.8 20.5c0-2.3 1.4-4 3.2-4s3.2 1.7 3.2 4" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="9" cy="6.5" rx="6" ry="2.5" />
      <path d="M3 6.5v4c0 1.4 2.7 2.5 6 2.5M3 10.5v4c0 1.4 2.7 2.5 6 2.5M15 6.5v2" />
      <circle cx="16" cy="15" r="5" />
      <path d="M16 12.6v4.8" />
    </>
  ),
  car: (
    <>
      <path d="M3 15.5v-2.8l2.2-5.2A1.5 1.5 0 0 1 6.6 6.5h10.8a1.5 1.5 0 0 1 1.4 1l2.2 5.2v2.8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
      <path d="M4 12.5h16" />
      <circle cx="7.5" cy="17.5" r="2" />
      <circle cx="16.5" cy="17.5" r="2" />
    </>
  ),
  ball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 8 3.3 2.4-1.3 3.9h-4l-1.3-3.9L12 8ZM12 8V3.2M15.3 10.4l4.4-1.6M14 14.3l2.8 3.9M10 14.3l-2.8 3.9M8.7 10.4 4.3 8.8" />
    </>
  ),
  plug: (
    <path d="M9 2.5V7M15 2.5V7M6 7h12v3.5a6 6 0 0 1-12 0V7ZM12 16.5v5" />
  ),
  film: (
    <>
      <rect x="3" y="10" width="18" height="10.5" rx="1.5" />
      <path d="m3.3 10-.8-3.7 16.6-3.6.8 3.7L3.3 10ZM7.6 5.4l2.3 3.2M12.6 4.3l2.3 3.2" />
    </>
  ),
  cap: (
    <>
      <path d="m2 9 10-5 10 5-10 5L2 9Z" />
      <path d="M6 11v5c0 1.4 2.7 3 6 3s6-1.6 6-3v-5M22 9v5.5" />
    </>
  ),
  home: <path d="M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5M10 20v-5h4v5" />,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12.5h18M10.5 12.5v1.5h3v-1.5" />
    </>
  ),
  bag: <path d="M5 8h14l-1.1 12.1a1 1 0 0 1-1 .9H7.1a1 1 0 0 1-1-.9L5 8ZM9 10V6.5a3 3 0 0 1 6 0V10" />,
  plane: <path d="M3 11 21 3l-6.5 18-3-7.5L3 11ZM11.5 13.5 21 3" />,
  chat: (
    <>
      <path d="M4 5h16v10.5H9.5L5 19.5V5Z" />
      <path d="M8.5 10.3h.01M12 10.3h.01M15.5 10.3h.01" strokeWidth="2.4" />
    </>
  ),
  bed: (
    <>
      <path d="M3 5v15M3 14.5h18V20M21 14.5v-1.8a3 3 0 0 0-3-3h-7.5v4.8" />
      <circle cx="6.8" cy="11.3" r="1.8" />
    </>
  ),
  coffee: <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9ZM16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5v2.5M12 3.5v2.5M3 21.5h14" />,
  pill: (
    <>
      <rect x="2.8" y="8.8" width="18.4" height="6.4" rx="3.2" transform="rotate(-40 12 12)" />
      <path d="m9.4 9.1 5.2 5.8" />
    </>
  ),
  tie: <path d="M9.5 3h5l-1.3 3.2 2.3 9.3L12 21l-3.5-5.5 2.3-9.3L9.5 3Z" />,
  train: (
    <>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 10h14M8 21l2-4M16 21l-2-4" />
      <path d="M9 13.5h.01M15 13.5h.01" strokeWidth="2.6" />
    </>
  ),
  wrench: <path d="M14.7 5.3a4 4 0 0 0-5.2 5.2L3.8 16.2a2 2 0 1 0 2.9 2.9l5.7-5.7a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.4-.5-.5-2.4 2.6-2.6Z" />,

  // ---- modes
  ladder: <path d="M3 20h5v-5h5v-5h5V5h3M3 20V9" />,
  swap: <path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5" />,
  mic: (
    <>
      <rect x="9" y="2.5" width="6" height="11.5" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7" />
    </>
  ),
  dialog: <path d="M3 4.5h11.5v8H7.5L3 16V4.5ZM10 15.5v1.5h6.5L21 20.5v-9h-3.5" />,
  cards: (
    <>
      <rect x="7" y="3" width="13.5" height="15.5" rx="2" />
      <path d="M4.5 7v12a2 2 0 0 0 2 2h10.5M10.5 8.5h6.5M10.5 12h4.5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  book: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5ZM4 21a2.5 2.5 0 0 1 2.5-2.5H20V21H6.5M8.5 7.5h7" />,

  // ---- misc
  lifebuoy: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="m5.6 5.6 3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6" />
    </>
  ),
  bulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2v.1h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />,
  trophy: <path d="M8 3.5h8V9a4 4 0 0 1-8 0V3.5ZM8 5.5H5a3 3 0 0 0 3 4M16 5.5h3a3 3 0 0 1-3 4M12 13v3.5M8.5 21h7M9.5 16.5h5V21h-5z" />,
  up: <path d="m3 17 6-6 4 4 8-8M15 7h6v6" />,
  down: <path d="m3 7 6 6 4-4 8 8M15 17h6v-6" />,
  sparkle: <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />,
  flag: <path d="M5 21V4M5 4h11l-2 4 2 4H5" />,
  layers: <path d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5" />,
  bolt: <path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12l1-8Z" />,
  flame: <path d="M12 21.5c-3.9 0-6.5-2.7-6.5-6.3 0-3.3 2.2-5.4 3.7-7.6.4 1.5 1.2 2.6 2.3 3.2C11.3 7 12.6 4.6 15 2.5c.2 3.1 1.6 5 2.6 6.6.9 1.4 1.4 2.8 1.4 4.6 0 4.4-2.9 7.8-7 7.8ZM12 21.5c-1.7 0-2.8-1.2-2.8-2.8 0-1.8 1.4-2.6 2.1-4 .9 1.1 1.6 1.5 2.4 2.5.5.6.8 1.1.8 1.7 0 1.5-1 2.6-2.5 2.6Z" />,
  goal: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.3 2.7 2.7L16.2 9.5" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="15" r="5.5" />
      <path d="M8.5 10.7 5.5 3h4l2.5 5.5M15.5 10.7l3-7.7h-4L12 8.5M12 12.5l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2.8-1.6Z" />
    </>
  ),
};

export type IconName = keyof typeof P;

export function Icon({ name, className, strokeWidth = 1.75 }: { name: IconName | string; className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx('size-5 shrink-0', className)}
      aria-hidden="true"
    >
      {P[name] ?? P.sparkle}
    </svg>
  );
}

export type Tone = 'violet' | 'sky' | 'emerald' | 'amber' | 'rose' | 'orange' | 'teal' | 'indigo' | 'pink' | 'lime' | 'slate';

const TONES: Record<Tone, string> = {
  violet: 'text-violet-500 bg-violet-500/12 dark:text-violet-300',
  sky: 'text-sky-600 bg-sky-500/12 dark:text-sky-300',
  emerald: 'text-emerald-600 bg-emerald-500/12 dark:text-emerald-300',
  amber: 'text-amber-600 bg-amber-500/14 dark:text-amber-300',
  rose: 'text-rose-600 bg-rose-500/12 dark:text-rose-300',
  orange: 'text-orange-600 bg-orange-500/12 dark:text-orange-300',
  teal: 'text-teal-600 bg-teal-500/12 dark:text-teal-300',
  indigo: 'text-indigo-600 bg-indigo-500/12 dark:text-indigo-300',
  pink: 'text-pink-600 bg-pink-500/12 dark:text-pink-300',
  lime: 'text-lime-700 bg-lime-500/14 dark:text-lime-300',
  slate: 'text-slate-600 bg-slate-500/12 dark:text-slate-300',
};

/** Icon on a tinted rounded tile. */
export function IconTile({ name, tone = 'violet', size = 'md' }: { name: IconName | string; tone?: Tone; size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'size-9 rounded-xl', md: 'size-11 rounded-2xl', lg: 'size-14 rounded-2xl' }[size];
  const i = { sm: 'size-[18px]', md: 'size-[22px]', lg: 'size-7' }[size];
  return (
    <div className={cx('grid place-items-center shrink-0', s, TONES[tone])}>
      <Icon name={name} className={i} />
    </div>
  );
}

/** Small language badge instead of flag emoji. */
export function LangBadge({ code, className }: { code: 'US' | 'UK' | 'CZ' | 'EN'; className?: string }) {
  return (
    <span
      className={cx(
        'inline-grid place-items-center rounded-[5px] border border-current/30 px-1 text-[9px] font-bold leading-[14px] tracking-wide opacity-80',
        className,
      )}
    >
      {code}
    </span>
  );
}
