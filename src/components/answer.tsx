// Speaking-or-writing games: a start screen to pick ONE input mode, and the answer boxes for each mode.
import { Keyboard, Mic, Send } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Keyboard as Kb } from './Keyboard';
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

type KbMode = 'phone' | 'app';
const KB_MODE = 'ajna-kb-mode';
function loadKb(): KbMode {
  try {
    return localStorage.getItem(KB_MODE) === 'app' ? 'app' : 'phone';
  } catch {
    return 'phone';
  }
}

/**
 * Writing games: the answer is typed either on the phone's own keyboard (default, with autocorrect,
 * auto-capitals and suggestions switched off so the spelling has to be yours) or on the app's big keyboard.
 */
export function TypeAnswer({
  onSubmit,
  resetKey,
  placeholder = 'Napiš anglicky…',
  submitLabel = 'Ověřit',
}: {
  onSubmit: (text: string) => void;
  resetKey?: unknown;
  placeholder?: string;
  submitLabel?: string;
}) {
  const [v, setV] = useState('');
  const [kb, setKb] = useState<KbMode>(loadKb);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => setV(''), [resetKey]);
  // keep the phone keyboard open from one question to the next
  useEffect(() => {
    if (kb === 'phone') input.current?.focus({ preventScroll: true });
  }, [resetKey, kb]);
  const send = () => {
    const t = v.trim();
    if (!t) return;
    recordSpeech(t);
    onSubmit(t);
  };
  const key = (k: string) => {
    if (k === 'back') setV((x) => x.slice(0, -1));
    else setV((x) => (k === ' ' && (!x || x.endsWith(' ')) ? x : x + k).slice(0, 120));
  };
  const switchKb = () => {
    const n: KbMode = kb === 'phone' ? 'app' : 'phone';
    setKb(n);
    try {
      localStorage.setItem(KB_MODE, n);
    } catch {
      /* optional */
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {kb === 'phone' ? (
          <input
            ref={input}
            value={v}
            onChange={(e) => setV(e.target.value.slice(0, 120))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                send();
              }
            }}
            placeholder={placeholder}
            type="text"
            inputMode="text"
            enterKeyHint="done"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            data-1p-ignore
            className="h-14 min-w-0 flex-1 rounded-2xl border border-accent/50 bg-surface-2 px-4 text-[19px] font-semibold tracking-wide outline-none placeholder:text-base placeholder:font-normal placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        ) : (
          <div className="flex min-h-14 min-w-0 flex-1 items-center rounded-2xl border border-accent/50 bg-surface-2 px-4 text-[19px] font-semibold tracking-wide">
            {v ? (
              <span className="break-all">
                {v}
                <span className="ml-0.5 inline-block h-6 w-0.5 translate-y-1 animate-pulse bg-accent" />
              </span>
            ) : (
              <span className="text-base font-normal text-muted/70">{placeholder}</span>
            )}
          </div>
        )}
        <Btn
          variant="primary"
          className="h-14 shrink-0 px-4"
          disabled={!v.trim()}
          // keep focus in the input so the phone keyboard doesn't close and reopen
          onPointerDown={(e) => kb === 'phone' && e.preventDefault()}
          onClick={send}
        >
          <Send className="size-4" />
          <span className="hidden min-[380px]:inline">{submitLabel}</span>
        </Btn>
      </div>
      <button type="button" onClick={switchKb} className="flex items-center gap-1 text-[11px] font-semibold text-accent">
        <Keyboard className="size-3.5" /> {kb === 'phone' ? 'Použít velkou klávesnici aplikace' : 'Použít klávesnici telefonu'}
      </button>
      {kb === 'app' && <Kb onKey={key} onEnter={send} enterDisabled={!v.trim()} />}
    </div>
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
