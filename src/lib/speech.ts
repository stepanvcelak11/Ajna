import { useCallback, useEffect, useRef, useState } from 'react';
import { getState } from './store';

// ---------------- Speech-to-text ----------------
/* eslint-disable @typescript-eslint/no-explicit-any */
const SR: any =
  typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;

export const sttSupported = !!SR;

function joinText(a: string, b: string) {
  if (!a) return b.trim();
  if (!b.trim()) return a;
  return `${a.trimEnd()} ${b.trim()}`;
}

export type MicStatus = 'idle' | 'starting' | 'ready' | 'hearing';

// errors after which restarting makes no sense
const FATAL = new Set(['not-allowed', 'service-not-allowed', 'network', 'audio-capture', 'language-not-supported', 'bad-grammar']);
const START_TIMEOUT_MS = 3000;

/**
 * Continuous recognition that survives pauses and flaky mobile browsers.
 *
 * - The browser ends a session after silence (Android) or at random (iOS); while the user still
 *   wants to listen we start a fresh session after a short gap.
 * - Words that were still "interim" when a session ended are kept, not thrown away.
 * - Events from an old session are ignored once a new one exists, so a late `onend` can never
 *   leave the hook stuck in a dead state.
 * - Watchdog: if the microphone does not actually start within 3 s, we abort and retry once,
 *   then tell the user instead of silently doing nothing.
 * - Text-to-speech is stopped first, with a short pause, because the two fight over the audio.
 */
export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState<MicStatus>('idle');
  const [committed, setCommitted] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<any>(null);
  const wantRef = useRef(false);
  const committedRef = useRef('');
  const sessionTextRef = useRef(''); // everything heard in the current session (final + interim)
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failedStartsRef = useRef(0);
  const quickEndsRef = useRef<number[]>([]);

  const setCommittedBoth = (t: string) => {
    committedRef.current = t;
    setCommitted(t);
  };

  const clearTimers = () => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    watchdogRef.current = null;
    restartTimerRef.current = null;
  };

  const flushSession = () => {
    if (sessionTextRef.current) setCommittedBoth(joinText(committedRef.current, sessionTextRef.current));
    sessionTextRef.current = '';
    setInterim('');
  };

  const finish = (msg?: string) => {
    wantRef.current = false;
    clearTimers();
    flushSession();
    const rec = recRef.current;
    recRef.current = null;
    if (rec) {
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
    }
    setListening(false);
    setStatus('idle');
    if (msg) setError(msg);
  };

  const startSession = useCallback(() => {
    if (!SR || !wantRef.current) return;
    const rec = new SR();
    rec.lang = getState().settings.accent;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let started = false;
    let gotResult = false;
    const mine = () => recRef.current === rec;

    const onStarted = () => {
      if (!mine() || started) return;
      started = true;
      failedStartsRef.current = 0;
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      setStatus((s) => (s === 'hearing' ? s : 'ready'));
    };
    rec.onstart = onStarted;
    rec.onaudiostart = onStarted;
    rec.onspeechstart = () => mine() && setStatus('hearing');
    rec.onspeechend = () => mine() && setStatus('ready');

    rec.onresult = (e: any) => {
      if (!mine()) return;
      onStarted();
      gotResult = true;
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < e.results.length; i++) {
        const t: string = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          // Android bug: each final result may repeat the previous ones. Replace instead of append.
          const norm = (x: string) => x.trim().toLowerCase();
          if (finalText && norm(t).startsWith(norm(finalText))) finalText = t.trim();
          else finalText = joinText(finalText, t);
        } else {
          interimText = joinText(interimText, t);
        }
      }
      const all = joinText(finalText, interimText);
      // some engines briefly report an empty result between phrases; never lose what we had
      if (all || !sessionTextRef.current) sessionTextRef.current = all;
      setInterim(sessionTextRef.current);
      setStatus('hearing');
    };

    rec.onerror = (e: any) => {
      if (!mine()) return;
      const err = e.error as string;
      if (err === 'no-speech' || err === 'aborted') return; // harmless, onend restarts
      if (err === 'not-allowed' || err === 'service-not-allowed')
        finish('Mikrofon je zablokovaný. Povol ho u adresy (ikona zámku) nebo v nastavení telefonu pro prohlížeč.');
      else if (err === 'audio-capture') finish('Mikrofon teď používá jiná aplikace (hovor, nahrávání). Zavři ji a zkus to znovu.');
      else if (err === 'network') finish('Rozpoznávání řeči potřebuje internet. Bez něj odpověď napiš nebo nadiktuj klávesnicí.');
      else if (FATAL.has(err)) finish(`Chyba mikrofonu: ${err}`);
    };

    rec.onend = () => {
      if (!mine()) return;
      flushSession();
      if (!wantRef.current) {
        recRef.current = null;
        clearTimers();
        setListening(false);
        setStatus('idle');
        return;
      }
      // a session that ends immediately without hearing anything, many times in a row,
      // means the engine is broken right now; stop instead of looping forever
      const now = Date.now();
      if (!gotResult) quickEndsRef.current = [...quickEndsRef.current.filter((t) => now - t < 4000), now];
      if (quickEndsRef.current.length >= 6) {
        quickEndsRef.current = [];
        finish('Mikrofon se opakovaně vypíná. Ťukni na něj znovu, případně zavři a otevři aplikaci.');
        return;
      }
      setStatus('starting');
      // Android needs a short gap before the next start
      restartTimerRef.current = setTimeout(() => {
        if (wantRef.current && mine()) startSession();
      }, 250);
    };

    recRef.current = rec;
    setStatus('starting');
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = setTimeout(() => {
      if (!mine() || started) return;
      // the engine never started: throw this instance away and try once more
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
      failedStartsRef.current++;
      if (failedStartsRef.current >= 2) {
        failedStartsRef.current = 0;
        finish('Mikrofon se nespustil. Ťukni na něj znovu. Pokud to nepomůže, zavři aplikaci a otevři ji znovu.');
      } else {
        recRef.current = null;
        restartTimerRef.current = setTimeout(() => {
          if (wantRef.current && recRef.current === null) startSession();
        }, 300);
      }
    }, START_TIMEOUT_MS);
    try {
      rec.start();
    } catch {
      // "already started" or not allowed outside a tap: let the watchdog retry
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback(() => {
    if (!SR) {
      setError('Tento prohlížeč neumí rozpoznávat řeč. Použij Chrome (Android) nebo Safari (iOS), nebo piš / diktuj klávesnicí.');
      return;
    }
    setError(null);
    clearTimers();
    failedStartsRef.current = 0;
    quickEndsRef.current = [];
    // drop any old (possibly stuck) session
    const old = recRef.current;
    recRef.current = null;
    if (old?.abort) {
      try {
        old.abort();
      } catch {
        /* ignore */
      }
    }
    sessionTextRef.current = '';
    setInterim('');
    wantRef.current = true;
    setListening(true);
    setStatus('starting');
    const speaking = !!window.speechSynthesis?.speaking;
    window.speechSynthesis?.cancel();
    // Start right away (inside the tap, which iOS requires); if audio was playing or an old
    // session was just aborted, give the device a moment to release the audio first.
    if (speaking || old) restartTimerRef.current = setTimeout(startSession, 300);
    else startSession();
  }, [startSession]);

  const stop = useCallback(() => {
    wantRef.current = false;
    clearTimers();
    const rec = recRef.current;
    if (rec?.stop) {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      // some browsers never fire onend after stop(); don't wait for it forever
      watchdogRef.current = setTimeout(() => {
        if (recRef.current === rec) finish();
      }, 1200);
    } else finish();
    setListening(false);
    setStatus('idle');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback((text = '') => {
    // a session that is still shutting down must not leak its words into the new text
    if (!wantRef.current && recRef.current) {
      const r = recRef.current;
      recRef.current = null;
      clearTimers();
      try {
        r.abort?.();
      } catch {
        /* ignore */
      }
    }
    sessionTextRef.current = '';
    setInterim('');
    setCommittedBoth(text);
  }, []);

  // stop when the app goes to the background (screen off, app switch)
  useEffect(() => {
    const h = () => document.hidden && wantRef.current && stop();
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, [stop]);

  useEffect(
    () => () => {
      wantRef.current = false;
      clearTimers();
      try {
        recRef.current?.abort?.();
      } catch {
        /* ignore */
      }
      recRef.current = null;
    },
    [],
  );

  const text = joinText(committed, interim);
  return { listening, status, text, committed, interim, error, start, stop, reset, setText: reset };
}

// ---------------- Text-to-speech ----------------
let voicesCache: SpeechSynthesisVoice[] = [];
function loadVoices() {
  voicesCache = window.speechSynthesis?.getVoices() ?? [];
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice(lang: string) {
  if (!voicesCache.length) loadVoices();
  const same = voicesCache.filter((v) => v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase());
  const pool = same.length ? same : voicesCache.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const prefer = ['natural', 'neural', 'premium', 'enhanced', 'google', 'samantha', 'daniel', 'serena', 'aria', 'jenny'];
  for (const p of prefer) {
    const v = pool.find((x) => x.name.toLowerCase().includes(p));
    if (v) return v;
  }
  return pool[0];
}

export const ttsSupported = typeof window !== 'undefined' && !!window.speechSynthesis;

export function speak(text: string, opts: { rate?: number; onEnd?: () => void } = {}) {
  if (!ttsSupported || !text) return;
  const clean = text.replace(/[{}]/g, '');
  const s = getState().settings;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = s.accent;
  const v = pickVoice(s.accent);
  if (v) u.voice = v;
  u.rate = opts.rate ?? s.ttsRate;
  if (opts.onEnd) {
    u.onend = opts.onEnd;
    u.onerror = opts.onEnd;
  }
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}
