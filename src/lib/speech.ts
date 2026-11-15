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

/**
 * Continuous recognition that survives pauses: when the browser ends the session
 * (Android Chrome stops after a few seconds of silence) we restart it automatically
 * while the user still wants to listen. Final text from earlier sessions is kept in `committed`.
 */
export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [committed, setCommitted] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<any>(null);
  const wantRef = useRef(false);
  const committedRef = useRef('');
  const sessionFinalRef = useRef('');

  const setCommittedBoth = (t: string) => {
    committedRef.current = t;
    setCommitted(t);
  };

  const flushSession = () => {
    if (sessionFinalRef.current) {
      setCommittedBoth(joinText(committedRef.current, sessionFinalRef.current));
      sessionFinalRef.current = '';
    }
    setInterim('');
  };

  const startSession = useCallback(() => {
    if (!SR) return;
    const rec = new SR();
    rec.lang = getState().settings.accent;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < e.results.length; i++) {
        const t: string = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          // Android bug: each final result may repeat the previous ones. Replace instead of append.
          const norm = (s: string) => s.trim().toLowerCase();
          if (finalText && norm(t).startsWith(norm(finalText))) finalText = t.trim();
          else finalText = joinText(finalText, t);
        } else {
          interimText = joinText(interimText, t);
        }
      }
      sessionFinalRef.current = finalText;
      setInterim(joinText(finalText, interimText));
    };
    rec.onerror = (e: any) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        wantRef.current = false;
        setError('Mikrofon není povolen. Povol ho v prohlížeči (ikona zámku u adresy).');
      } else if (e.error === 'network') {
        setError('Rozpoznávání řeči potřebuje internet.');
      } else {
        setError(`Chyba mikrofonu: ${e.error}`);
      }
    };
    rec.onend = () => {
      flushSession();
      if (wantRef.current) {
        try {
          startSession();
          return;
        } catch {
          /* fallthrough */
        }
      }
      recRef.current = null;
      setListening(false);
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      /* already started */
    }
  }, []);

  const start = useCallback(() => {
    if (!SR) {
      setError('Tento prohlížeč neumí rozpoznávat řeč. Použij Chrome (Android) nebo Safari (iOS), nebo piš / diktuj klávesnicí.');
      return;
    }
    window.speechSynthesis?.cancel();
    setError(null);
    wantRef.current = true;
    if (!recRef.current) startSession();
  }, [startSession]);

  const stop = useCallback(() => {
    wantRef.current = false;
    const rec = recRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const reset = useCallback((text = '') => {
    sessionFinalRef.current = '';
    setInterim('');
    setCommittedBoth(text);
  }, []);

  useEffect(
    () => () => {
      wantRef.current = false;
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const text = listening ? joinText(committed, interim) : committed;
  return { listening, text, committed, interim, error, start, stop, reset, setText: reset };
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
