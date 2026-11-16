import { Hand, Keyboard, LifeBuoy, Mic, MicOff, Send, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { sttSupported, useSpeechRecognition } from '../lib/speech';
import { recordSpeech, updateSettings, useStore } from '../lib/store';
import { isTypingTarget, setInsertHandler, setUi } from '../lib/ui';
import { Btn, cx } from './ui';

interface Props {
  onSubmit: (text: string) => void;
  busy?: boolean;
  disabled?: boolean;
  placeholder?: string;
  submitLabel?: string;
  /** change this value to clear the recorder (e.g. new exercise) */
  resetKey?: unknown;
  initialText?: string;
  onListeningChange?: (listening: boolean) => void;
  /** externally force-stop (e.g. timer ran out) */
  stopSignal?: unknown;
  hint?: string;
}

export function MicRecorder({
  onSubmit,
  busy,
  disabled,
  placeholder = 'Mluv anglicky… nebo piš.',
  submitLabel = 'Vyhodnotit',
  resetKey,
  initialText = '',
  onListeningChange,
  stopSignal,
  hint,
}: Props) {
  const micMode = useStore((s) => s.settings.micMode);
  const accent = useStore((s) => s.settings.accent);
  const sr = useSpeechRecognition();
  const textRef = useRef(sr.text);
  textRef.current = sr.text;
  const listeningRef = useRef(sr.listening);
  listeningRef.current = sr.listening;
  const pttHeld = useRef(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  // switch to typing / the phone keyboard's own dictation (always works on iPhone)
  const useKeyboard = () => {
    sr.stop();
    setTimeout(() => taRef.current?.focus(), 50);
  };

  // reset on new exercise
  useEffect(() => {
    sr.stop();
    sr.reset(initialText);
  }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (stopSignal !== undefined) sr.stop();
  }, [stopSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onListeningChange?.(sr.listening);
  }, [sr.listening]); // eslint-disable-line react-hooks/exhaustive-deps

  // Word Rescue context + insertion
  useEffect(() => {
    setUi({ context: sr.text });
  }, [sr.text]);
  useEffect(() => {
    setInsertHandler((t) => {
      const cur = textRef.current;
      sr.reset(cur ? `${cur.trimEnd()} ${t}` : t);
    });
    return () => setInsertHandler(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => {
    const t = textRef.current.trim();
    if (!t || busy || disabled) return;
    sr.stop();
    recordSpeech(t);
    onSubmit(t);
  };
  const submitRef = useRef(submit);
  submitRef.current = submit;

  // keyboard: Space = toggle / push-to-talk, Enter = submit
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.querySelector('[data-sheet-open]')) return;
      if (e.code === 'Space' && !isTypingTarget(e.target)) {
        e.preventDefault();
        if (e.repeat) return;
        if (micMode === 'ptt') {
          pttHeld.current = true;
          sr.start();
        } else if (listeningRef.current) sr.stop();
        else sr.start();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        const typing = isTypingTarget(e.target);
        if (typing && (e.target as HTMLElement).dataset.recorder !== 'true') return;
        e.preventDefault();
        submitRef.current();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space' && micMode === 'ptt' && pttHeld.current) {
        pttHeld.current = false;
        sr.stop();
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [micMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const micHandlers =
    micMode === 'ptt'
      ? {
          onPointerDown: (e: React.PointerEvent) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            sr.start();
          },
          onPointerUp: () => sr.stop(),
          onPointerCancel: () => sr.stop(),
        }
      : { onClick: () => (sr.listening ? sr.stop() : sr.start()) };

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          ref={taRef}
          data-recorder="true"
          value={sr.text}
          readOnly={sr.listening}
          onChange={(e) => sr.setText(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cx(
            'w-full resize-none rounded-2xl border bg-surface-2 px-4 py-3 text-[16px] leading-relaxed outline-none transition',
            'focus:border-accent/60 placeholder:text-muted/70',
            sr.listening ? 'border-accent/60 ring-4 ring-accent/10' : 'border-line',
          )}
        />
        {sr.listening && sr.interim && sr.interim !== sr.committed && (
          <div className="absolute right-3 bottom-2 text-[10px] uppercase tracking-wider text-accent animate-pulse">živě</div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setUi({ rescueOpen: true })}
        className="w-full flex items-center gap-2 rounded-xl border border-dashed border-line px-3 h-9 text-xs text-muted hover:text-fg hover:border-accent/50"
      >
        <LifeBuoy className="size-3.5 text-accent" />
        Nevím slovo? Napiš ho česky…
        <span className="ml-auto hidden sm:inline text-[10px] opacity-70">Ctrl+K</span>
      </button>

      {(sr.stalled || sr.error) && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-3 py-2.5 text-xs space-y-2">
          <div className={sr.error ? 'text-red-500' : ''}>
            {sr.error ?? 'Nic neslyším. Mikrofon se restartoval, zkus mluvit znovu a trochu hlasitěji.'}
          </div>
          <button onClick={useKeyboard} className="inline-flex items-center gap-1.5 font-semibold text-accent">
            <Keyboard className="size-3.5" /> Diktovat přes klávesnici
          </button>
          <div className="text-[11px] text-muted">Na klávesnici telefonu ťukni na ikonu mikrofonu vpravo dole a mluv.</div>
        </div>
      )}
      {!sttSupported && (
        <div className="text-xs text-muted">
          Rozpoznávání řeči tu není dostupné – použij diktování na klávesnici telefonu (ikona mikrofonu) a piš do pole.
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={disabled || !sttSupported}
          aria-label={micMode === 'ptt' ? 'Drž a mluv' : sr.listening ? 'Zastavit' : 'Nahrávat'}
          onContextMenu={(e) => e.preventDefault()}
          {...micHandlers}
          className={cx(
            'relative size-16 shrink-0 rounded-full grid place-items-center transition no-callout touch-none select-none',
            'disabled:opacity-40',
            sr.listening
              ? sr.status === 'starting'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                : 'bg-red-500 text-white scale-105 shadow-lg shadow-red-500/30'
              : 'bg-accent text-white shadow-lg shadow-accent/30',
          )}
        >
          {sr.listening && sr.status !== 'starting' && <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />}
          {sr.listening ? <MicOff className="size-7 relative" /> : <Mic className="size-7" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted leading-snug">
            {sr.listening ? (
              sr.status === 'starting' ? (
                <span className="text-amber-600 dark:text-amber-400">Zapínám mikrofon… chvilku počkej</span>
              ) : sr.status === 'hearing' ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Slyším tě…</span>
              ) : micMode === 'ptt' ? (
                'Mluv… pusť pro pauzu na přemýšlení'
              ) : (
                'Poslouchám, mluv. Klidně se zastav a přemýšlej.'
              )
            ) : (
              hint ?? (micMode === 'ptt' ? 'Drž tlačítko a mluv' : 'Ťukni a mluv')
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <button
              onClick={() => updateSettings({ micMode: micMode === 'ptt' ? 'toggle' : 'ptt' })}
              className="inline-flex items-center gap-1 rounded-md border border-line px-1.5 py-0.5 text-[10px] text-muted hover:text-fg"
            >
              {micMode === 'ptt' ? <Hand className="size-3" /> : <Mic className="size-3" />}
              {micMode === 'ptt' ? 'Push-to-talk' : 'Toggle'}
            </button>
            <button
              onClick={() => updateSettings({ accent: accent === 'en-US' ? 'en-GB' : 'en-US' })}
              className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-muted hover:text-fg"
            >
              {accent === 'en-US' ? 'Přízvuk US' : 'Přízvuk UK'}
            </button>
            <button
              onClick={useKeyboard}
              aria-label="Psát nebo diktovat klávesnicí"
              className="rounded-md border border-line p-0.5 px-1 text-muted hover:text-fg"
            >
              <Keyboard className="size-3" />
            </button>
            {sr.text && !sr.listening && (
              <button
                onClick={() => sr.reset('')}
                aria-label="Smazat"
                className="rounded-md border border-line p-0.5 text-muted hover:text-fg"
              >
                <Trash2 className="size-3" />
              </button>
            )}
          </div>
        </div>

        <Btn variant="primary" onClick={submit} loading={busy} disabled={!sr.text.trim() || disabled} className="shrink-0">
          <Send className="size-4" />
          <span className="hidden min-[380px]:inline">{submitLabel}</span>
        </Btn>
      </div>
    </div>
  );
}
