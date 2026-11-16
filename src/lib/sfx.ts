import { getState } from './store';

// Tiny synthesized sound effects (no audio files, works offline) + vibration on Android.
let ctx: AudioContext | null = null;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

const on = () => getState().settings.sound !== false;
const buzz = (p: number | number[]) => navigator.vibrate?.(p);

export const sfx = {
  correct(combo = 0) {
    if (!on()) return;
    const up = Math.min(combo, 6) * 40;
    tone(660 + up, 0, 0.12, 'triangle');
    tone(990 + up, 0.08, 0.16, 'triangle');
    buzz(15);
  },
  wrong() {
    if (!on()) return;
    tone(200, 0, 0.18, 'square', 0.05);
    tone(150, 0.1, 0.22, 'square', 0.05);
    buzz([30, 40, 30]);
  },
  tap() {
    if (!on()) return;
    tone(520, 0, 0.05, 'sine', 0.06);
  },
  win() {
    if (!on()) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle', 0.1));
    buzz([20, 50, 20, 50, 40]);
  },
};
