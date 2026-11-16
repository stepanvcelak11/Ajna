import { useCallback, useEffect, useRef, useState } from 'react';
import { transcribeAudio } from './llm';
import type { MicStatus } from './speech';

// Records the microphone directly (Web Audio) and has the AI transcribe it afterwards.
// Used on iPhone, where the browser's own speech recognition often "listens" but hears nothing.
// Recording itself is very reliable everywhere; the trade-off is a short wait for the text.

const TARGET_RATE = 16000;
const MAX_SEC = 180;
const VOICE_RMS = 0.015;

function joinText(a: string, b: string) {
  if (!a) return b.trim();
  if (!b.trim()) return a;
  return `${a.trimEnd()} ${b.trim()}`;
}

function encodeWav(chunks: Float32Array[], inRate: number): Blob {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const ratio = inRate / TARGET_RATE;
  const outLen = Math.floor(total / ratio);
  const pcm = new Int16Array(outLen);
  // flatten lazily while averaging each block of input samples (simple low-pass + downsample)
  let ci = 0;
  let off = 0;
  let pos = 0;
  for (let i = 0; i < outLen; i++) {
    const end = Math.floor((i + 1) * ratio);
    let sum = 0;
    let n = 0;
    while (pos < end && ci < chunks.length) {
      sum += chunks[ci][off];
      n++;
      pos++;
      if (++off >= chunks[ci].length) {
        ci++;
        off = 0;
      }
    }
    const v = Math.max(-1, Math.min(1, n ? sum / n : 0));
    pcm[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
  }
  const buf = new ArrayBuffer(44 + pcm.length * 2);
  const dv = new DataView(buf);
  const str = (o: number, t: string) => [...t].forEach((ch, i) => dv.setUint8(o + i, ch.charCodeAt(0)));
  str(0, 'RIFF');
  dv.setUint32(4, 36 + pcm.length * 2, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true);
  dv.setUint32(24, TARGET_RATE, true);
  dv.setUint32(28, TARGET_RATE * 2, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  str(36, 'data');
  dv.setUint32(40, pcm.length * 2, true);
  new Int16Array(buf, 44).set(pcm);
  return new Blob([buf], { type: 'audio/wav' });
}

interface Session {
  ctx: AudioContext;
  stream: MediaStream | null;
  proc: ScriptProcessorNode | null;
  src: MediaStreamAudioSourceNode | null;
  chunks: Float32Array[];
  samples: number;
  heard: boolean;
  closed: boolean;
}

export function useAudioRecognition() {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState<MicStatus>('idle');
  const [committed, setCommitted] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const committedRef = useRef('');
  const sessRef = useRef<Session | null>(null);
  const pendingRef = useRef<Promise<string> | null>(null);
  const lastWavRef = useRef<Blob | null>(null);
  const genRef = useRef(0);

  const setCommittedBoth = (t: string) => {
    committedRef.current = t;
    setCommitted(t);
  };

  const close = (s: Session) => {
    if (s.closed) return;
    s.closed = true;
    try {
      s.proc?.disconnect();
      s.src?.disconnect();
    } catch {
      /* ignore */
    }
    s.stream?.getTracks().forEach((t) => t.stop());
    s.ctx.close().catch(() => {});
  };

  const transcribe = useCallback(async (wav: Blob, gen: number): Promise<string> => {
    setStatus('transcribing');
    setError(null);
    try {
      const t = await transcribeAudio(wav);
      if (gen !== genRef.current) return committedRef.current; // exercise changed meanwhile
      lastWavRef.current = null;
      if (!t) setError('Nic srozumitelného jsem nezachytil. Zkus to znovu, blíž k telefonu.');
      setCommittedBoth(joinText(committedRef.current, t));
    } catch (e) {
      if (gen === genRef.current) setError(`Přepis se nepovedl: ${(e as Error).message}`);
    } finally {
      if (gen === genRef.current) setStatus('idle');
    }
    return committedRef.current;
  }, []);

  /** Stop recording; resolves with the full text once the transcript has arrived. */
  const finish = useCallback((): Promise<string> => {
    const s = sessRef.current;
    sessRef.current = null;
    setListening(false);
    setLevel(0);
    if (!s) {
      setStatus((st) => (st === 'transcribing' ? st : 'idle'));
      return pendingRef.current ?? Promise.resolve(committedRef.current);
    }
    close(s);
    if (!s.heard || s.samples < s.ctx.sampleRate * 0.3) {
      setStatus('idle');
      if (s.samples > 0) setError('Nic jsem neslyšel. Mluv blíž k telefonu a zkus to znovu.');
      return Promise.resolve(committedRef.current);
    }
    const wav = encodeWav(s.chunks, s.ctx.sampleRate);
    lastWavRef.current = wav;
    const p = transcribe(wav, genRef.current).finally(() => {
      if (pendingRef.current === p) pendingRef.current = null;
    });
    pendingRef.current = p;
    return p;
  }, [transcribe]);

  const stop = useCallback(() => {
    void finish();
  }, [finish]);

  const start = useCallback(() => {
    if (sessRef.current) return;
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Tento prohlížeč nepovoluje nahrávání. Použij diktování na klávesnici.');
      return;
    }
    window.speechSynthesis?.cancel();
    const el = document.activeElement as HTMLElement | null;
    if (el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')) el.blur();
    // the AudioContext must be created inside the tap (iPhone)
    const AC: typeof AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    void ctx.resume();
    const s: Session = { ctx, stream: null, proc: null, src: null, chunks: [], samples: 0, heard: false, closed: false };
    sessRef.current = s;
    setListening(true);
    setStatus('starting');
    navigator.mediaDevices
      .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } })
      .then((stream) => {
        s.stream = stream;
        if (s.closed || sessRef.current !== s) {
          close(s);
          return;
        }
        const src = ctx.createMediaStreamSource(stream);
        const proc = ctx.createScriptProcessor(4096, 1, 1);
        let lastLevel = 0;
        proc.onaudioprocess = (e) => {
          if (s.closed) return;
          const data = e.inputBuffer.getChannelData(0);
          s.chunks.push(new Float32Array(data));
          s.samples += data.length;
          let sum = 0;
          for (let i = 0; i < data.length; i += 4) sum += data[i] * data[i];
          const rms = Math.sqrt(sum / (data.length / 4));
          const loud = rms > VOICE_RMS;
          if (loud) s.heard = true;
          const lv = Math.min(1, rms * 12);
          if (Math.abs(lv - lastLevel) > 0.05) {
            lastLevel = lv;
            setLevel(lv);
          }
          setStatus(loud ? 'hearing' : 'ready');
          if (s.samples > ctx.sampleRate * MAX_SEC) void finish();
        };
        src.connect(proc);
        proc.connect(ctx.destination); // required for onaudioprocess to fire; output stays silent
        s.src = src;
        s.proc = proc;
        setStatus('ready');
      })
      .catch((e: Error) => {
        close(s);
        if (sessRef.current === s) sessRef.current = null;
        setListening(false);
        setStatus('idle');
        setError(
          e?.name === 'NotAllowedError'
            ? 'Mikrofon je zablokovaný. Na iPhonu: Nastavení → Aplikace → Safari → Mikrofon → Povolit, pak aplikaci zavři a otevři.'
            : e?.name === 'NotFoundError' || e?.name === 'NotReadableError'
              ? 'Mikrofon teď používá jiná aplikace (hovor, nahrávání). Zavři ji a zkus to znovu.'
              : `Mikrofon se nespustil: ${e?.message ?? e}`,
        );
      });
  }, [finish]);

  const retry = useCallback(() => {
    if (lastWavRef.current) void transcribe(lastWavRef.current, genRef.current);
  }, [transcribe]);

  const reset = useCallback((text = '') => {
    genRef.current++;
    const s = sessRef.current;
    sessRef.current = null;
    if (s) close(s);
    pendingRef.current = null;
    lastWavRef.current = null;
    setListening(false);
    setStatus('idle');
    setLevel(0);
    setError(null);
    setCommittedBoth(text);
  }, []);

  useEffect(() => {
    const h = () => document.hidden && sessRef.current && void finish();
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, [finish]);

  useEffect(
    () => () => {
      genRef.current++;
      if (sessRef.current) close(sessRef.current);
    },
    [],
  );

  return {
    listening,
    status,
    stalled: false,
    text: committed,
    committed,
    interim: '',
    error,
    level,
    canRetry: !!lastWavRef.current && status === 'idle' && !!error,
    start,
    stop,
    finish,
    retry,
    reset,
    setText: (t: string) => setCommittedBoth(t),
  };
}
