import { Hand, Keyboard, LifeBuoy, Loader2, Mic, MicOff, RotateCcw, Send, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { IS_IOS, sttSupported, useSpeechRecognition } from '../lib/speech';
import { useAudioRecognition } from '../lib/recorder';
import { canTranscribe } from '../lib/llm';
import { useOnline } from '../lib/ui';
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
  const engine = useStore((s) => s.settings.sttEngine);
  useStore((s) => s.settings.geminiKey + s.settings.openaiKey);
  const online = useOnline();
  const aiPossible = online && canTranscribe() && !!navigator.mediaDevices?.getUserMedia;
  // iPhone's built-in recognition is unreliable in web apps, so record + AI transcription is the default there
  const useAi = aiPossible && (engine === 'ai' || (engine === 'auto' && (IS_IOS || !sttSupported)));
  const browserSr = useSpeechRecognition();
  const aiSr = useAudioRecognition();
  const sr = useAi ? aiSr : browserSr;
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
    browserSr.stop();
    browserSr.reset(initialText);
    aiSr.reset(initialText);
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

  const submittingRef = useRef(false);
  const submit = async () => {
    if (busy || disabled || submittingRef.current) return;
    submittingRef.current = true;
    try {
      // with AI transcription the text only exists after the recording is transcribed
      const t = (sr.listening || sr.status === 'transcribing' ? await sr.finish() : textRef.current).trim();
      if (!t) return;
      sr.stop();
      recordSpeech(t);
      onSubmit(t);
    } finally {
      submittingRef.current = false;
    }
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
        void submitRef.current();
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
          readOnly={sr.listening || sr.status === 'transcribing'}
          onChange={(e) => sr.setText(e.target.value)}
          placeholder={sr.status === 'transcribing' ? 'Přepisuji, co jsi řekl…' : placeholder}
          rows={3}
          className={cx(
            'w-full resize-none rounded-2xl border bg-surface-2 px-4 py-3 text-[16px] leading-relaxed outline-none transition',
            'focus:border-accent/60 placeholder:text-muted/70',
            sr.listening ? 'border-accent/60 ring-4 ring-accent/10' : 'border-line',
          )}
        />
        {sr.status === 'transcribing' && (
          <div className="absolute right-3 bottom-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-accent animate-pulse">
            <Loader2 className="size-3 animate-spin" /> přepis
          </div>
        )}
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
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {sr.canRetry && (
              <button onClick={sr.retry} className="inline-flex items-center gap-1.5 font-semibold text-accent">
                <RotateCcw className="size-3.5" /> Zkusit přepis znovu
              </button>
            )}
            {!useAi && aiPossible && (
              <button onClick={() => updateSettings({ sttEngine: 'ai' })} className="inline-flex items-center gap-1.5 font-semibold text-accent">
                <Sparkles className="size-3.5" /> Přepnout na AI přepis
              </button>
            )}
            <button onClick={useKeyboard} className="inline-flex items-center gap-1.5 font-semibold text-accent">
              <Keyboard className="size-3.5" /> Diktovat přes klávesnici
            </button>
          </div>
          <div className="text-[11px] text-muted">Na klávesnici telefonu ťukni na ikonu mikrofonu vpravo dole a mluv.</div>
        </div>
      )}
      {!sttSupported && !useAi && (
        <div className="text-xs text-muted">
          Rozpoznávání řeči tu není dostupné – použij diktování na klávesnici telefonu (ikona mikrofonu) a piš do pole.
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={disabled || (!sttSupported && !useAi) || sr.status === 'transcribing'}
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
          {sr.listening && sr.status !== 'starting' && !useAi && <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />}
          {sr.listening && useAi && (
            <span
              className="absolute inset-0 rounded-full bg-red-500/35 transition-transform duration-100"
              style={{ transform: `scale(${1 + sr.level * 0.55})` }}
            />
          )}
          {sr.listening ? <MicOff className="size-7 relative" /> : <Mic className="size-7" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted leading-snug">
            {sr.status === 'transcribing' ? (
              <span className="text-accent font-medium">Přepisuji…</span>
            ) : sr.listening ? (
              sr.status === 'starting' ? (
                <span className="text-amber-600 dark:text-amber-400">Zapínám mikrofon… chvilku počkej</span>
              ) : sr.status === 'hearing' ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Slyším tě…</span>
              ) : micMode === 'ptt' ? (
                'Mluv… pusť pro pauzu na přemýšlení'
              ) : (
                useAi ? 'Nahrávám, mluv. Pak ťukni znovu nebo rovnou Ověřit.' : 'Poslouchám, mluv. Klidně se zastav a přemýšlej.'
              )
            ) : (
              hint ?? (micMode === 'ptt' ? 'Drž tlačítko a mluv' : 'Ťukni a mluv')
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
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
            {aiPossible && (
              <button
                onClick={() => updateSettings({ sttEngine: useAi ? 'browser' : 'ai' })}
                className={cx(
                  'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]',
                  useAi ? 'border-accent/50 text-accent' : 'border-line text-muted hover:text-fg',
                )}
              >
                <Sparkles className="size-3" /> {useAi ? 'AI přepis' : 'Přepis telefonu'}
              </button>
            )}
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

        <Btn
          variant="primary"
          onClick={() => void submit()}
          loading={busy || sr.status === 'transcribing'}
          disabled={(!sr.text.trim() && !(useAi && sr.listening)) || disabled}
          className="shrink-0"
        >
          <Send className="size-4" />
          <span className="hidden min-[380px]:inline">{submitLabel}</span>
        </Btn>
      </div>
    </div>
  );
}
