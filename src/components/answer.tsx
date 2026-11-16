// Speaking-or-writing games: a start screen to pick ONE input mode, and the answer boxes for each mode.
import { Keyboard, Mic, Send } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { sttSupported } from '../lib/speech';
import { canTranscribe } from '../lib/llm';
import { recordSpeech } from '../lib/store';
import { useOnline } from '../lib/ui';
import { MicRecorder } from './MicRecorder';
import { Btn, Card, ModeHeader, cx } from './ui';

export type InputMode = 'speak' | 'write';

const KEY = 'ajna-input-mode';

function lastMode(game: string): InputMode | null {
  try {
    const m = JSON.parse(localStorage.getItem(KEY) ?? '{}')[game];
    return m === 'speak' || m === 'write' ? m : null;
  } catch {
    return null;
  }
}
function saveMode(game: string, m: InputMode) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    localStorage.setItem(KEY, JSON.stringify({ ...all, [game]: m }));
  } catch {
    /* optional */
  }
}

export const MODE_INFO: Record<InputMode, { title: string; desc: string }> = {
  speak: { title: 'Mluvením', desc: 'Odpovídáš jen hlasem. Když vyslovíš špatně, mikrofon napíše něco jiného a odpověď neplatí. Trénuješ výslovnost.' },
  write: { title: 'Psaním', desc: 'Odpovídáš jen psaním. Musí to být napsané přesně, bez překlepů. Trénuješ pravopis.' },
};

/** Start screen: choose speaking or writing for this round. */
export function ModePicker({ game, title, subtitle, onPick, onBack, extra }: { game: string; title: string; subtitle?: string; onPick: (m: InputMode) => void; onBack?: () => void; extra?: ReactNode }) {
  const online = useOnline();
  const canSpeak = sttSupported || (online && canTranscribe());
  const last = lastMode(game);
  const pick = (m: InputMode) => {
    saveMode(game, m);
    onPick(m);
  };
  return (
    <div>
      <ModeHeader title={title} subtitle={subtitle ?? 'Vyber, jak chceš hrát'} onBack={onBack} />
      <div className="space-y-3">
        {(['speak', 'write'] as InputMode[]).map((m) => {
          const disabled = m === 'speak' && !canSpeak;
          return (
            <button
              key={m}
              disabled={disabled}
              onClick={() => pick(m)}
              className={cx(
                'relative flex w-full items-center gap-4 overflow-hidden rounded-3xl p-5 text-left text-white shadow-md transition active:scale-[0.98] disabled:opacity-40',
                m === 'speak' ? 'bg-gradient-to-br from-rose-500 to-orange-500' : 'bg-gradient-to-br from-sky-500 to-indigo-600',
              )}
            >
              <span className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full bg-white/15" />
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20">{m === 'speak' ? <Mic className="size-8" /> : <Keyboard className="size-8" />}</span>
              <span className="relative min-w-0 flex-1">
                <span className="flex items-center gap-2 text-lg font-extrabold">
                  {MODE_INFO[m].title}
                  {last === m && <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">minule</span>}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-white/85">{disabled ? 'Mikrofon tu není dostupný (potřebuje rozpoznávání řeči nebo internet s API klíčem).' : MODE_INFO[m].desc}</span>
              </span>
            </button>
          );
        })}
        {extra}
      </div>
    </div>
  );
}

/** Small badge showing the current input mode in a game header. */
export function ModeBadge({ mode }: { mode: InputMode }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold', mode === 'speak' ? 'bg-rose-500/12 text-rose-600 dark:text-rose-300' : 'bg-sky-500/12 text-sky-600 dark:text-sky-300')}>
      {mode === 'speak' ? <Mic className="size-3" /> : <Keyboard className="size-3" />}
      {MODE_INFO[mode].title}
    </span>
  );
}

/** Text box for writing games: no autocorrect, no spellcheck – the spelling has to be yours. */
export function TypeAnswer({
  onSubmit,
  resetKey,
  placeholder = 'Napiš anglicky…',
  submitLabel = 'Ověřit',
  autoFocus = true,
}: {
  onSubmit: (text: string) => void;
  resetKey?: unknown;
  placeholder?: string;
  submitLabel?: string;
  autoFocus?: boolean;
}) {
  const [v, setV] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setV('');
    if (autoFocus) setTimeout(() => ref.current?.focus({ preventScroll: true }), 50);
  }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const send = () => {
    const t = v.trim();
    if (!t) return;
    recordSpeech(t);
    ref.current?.blur();
    onSubmit(t);
  };
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <input
        ref={ref}
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="send"
        className="h-14 min-w-0 flex-1 rounded-2xl border border-line bg-surface-2 px-4 text-[17px] outline-none focus:border-accent/60"
      />
      <Btn variant="primary" type="submit" className="h-14 shrink-0 px-4" disabled={!v.trim()}>
        <Send className="size-4" />
        <span className="hidden min-[380px]:inline">{submitLabel}</span>
      </Btn>
    </form>
  );
}

/** Answer box for the chosen mode. */
export function AnswerBox({ mode, onSubmit, resetKey, hint, placeholder }: { mode: InputMode; onSubmit: (t: string) => void; resetKey?: unknown; hint?: string; placeholder?: string }) {
  if (mode === 'write') return <TypeAnswer onSubmit={onSubmit} resetKey={resetKey} placeholder={placeholder} />;
  return <MicRecorder speakOnly resetKey={resetKey} submitLabel="Ověřit" hint={hint ?? 'Ťukni na mikrofon a řekni to nahlas'} onSubmit={onSubmit} />;
}

/** Explains why a spoken answer failed. */
export function HeardAs({ mode, said }: { mode: InputMode; said: string }) {
  return (
    <Card className="px-3 py-2 text-xs">
      {mode === 'speak' ? (
        <>
          Mikrofon rozuměl: <b>„{said}“</b>
          <div className="mt-0.5 text-muted">Pokud jsi to řekl správně, zkus vyslovit pomaleji a zřetelněji.</div>
        </>
      ) : (
        <>
          Napsal jsi: <b>„{said}“</b>
        </>
      )}
    </Card>
  );
}
