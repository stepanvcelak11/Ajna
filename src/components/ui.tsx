import { ArrowLeft, Loader2, X } from 'lucide-react';
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { navigate } from '../lib/router';

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
export function Btn({
  variant = 'secondary',
  className,
  loading,
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  const v: Record<Variant, string> = {
    primary: 'bg-accent text-white hover:brightness-110 active:brightness-95 shadow-sm shadow-accent/30',
    secondary: 'bg-surface-2 text-fg border border-line hover:bg-surface-3',
    ghost: 'text-muted hover:text-fg hover:bg-surface-2',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20',
  };
  return (
    <button
      {...p}
      disabled={p.disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 h-11 text-sm font-medium transition select-none',
        'disabled:opacity-50 disabled:pointer-events-none',
        v[variant],
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cx('rounded-2xl border border-line bg-surface p-4', onClick && 'cursor-pointer active:scale-[0.99] transition', className)}
    >
      {children}
    </div>
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('text-[11px] font-semibold uppercase tracking-wider text-muted', className)}>{children}</div>;
}

export function Spinner({ label }: { label?: string }) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSec((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="py-6 text-center">
      <div className="flex items-center gap-2 text-sm text-muted justify-center">
        <Loader2 className="size-4 animate-spin" /> {label ?? 'Přemýšlím…'}
        {sec >= 3 && <span className="tabular-nums text-xs opacity-70">{sec} s</span>}
      </div>
      {sec >= 15 && (
        <div className="mt-2 text-[11px] text-muted">Trvá to dlouho? V Nastavení zkus rychlejší model (např. gemini-flash-lite-latest).</div>
      )}
    </div>
  );
}

export function ErrorBox({ error, onRetry }: { error: string; onRetry?: () => void }) {
  const noKey = /API klíč/.test(error);
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500 space-y-2">
      <div>{error}</div>
      <div className="flex gap-2">
        {noKey && (
          <Btn variant="secondary" className="h-9" onClick={() => navigate('settings')}>
            Otevřít Nastavení
          </Btn>
        )}
        {onRetry && (
          <Btn variant="secondary" className="h-9" onClick={onRetry}>
            Zkusit znovu
          </Btn>
        )}
      </div>
    </div>
  );
}

export function ModeHeader({ title, subtitle, right, below }: { title: string; subtitle?: string; right?: ReactNode; below?: ReactNode }) {
  return (
    <div className="mb-5 space-y-3">
      <div className="flex items-center gap-2">
        <button
          aria-label="Zpět"
          onClick={() => (history.length > 1 ? history.back() : navigate('home'))}
          className="size-10 -ml-2 grid place-items-center rounded-xl text-muted hover:text-fg hover:bg-surface-2"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight leading-tight truncate">{title}</h1>
          {subtitle && <div className="text-xs text-muted truncate">{subtitle}</div>}
        </div>
        {right}
      </div>
      {below}
    </div>
  );
}

export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div data-sheet-open className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-fade" onClick={onClose} />
      <div className="relative w-full sm:max-w-md max-h-[85dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-line bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] animate-up">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line sm:hidden" />
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">{title}</div>
          <button aria-label="Zavřít" onClick={onClose} className="size-9 grid place-items-center rounded-lg text-muted hover:bg-surface-2">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs', className)}>
      {children}
    </span>
  );
}

/** Render an example with {target} highlighted, or blanked. */
export function ExampleText({ text, blank, className }: { text: string; blank?: boolean; className?: string }) {
  const parts = text.split(/(\{[^}]+\})/g);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.startsWith('{') ? (
          blank ? (
            <span key={i} className="inline-block min-w-16 border-b-2 border-accent mx-1 text-transparent select-none">
              ______
            </span>
          ) : (
            <mark key={i} className="bg-accent/15 text-accent rounded px-1">
              {p.slice(1, -1)}
            </mark>
          )
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}
