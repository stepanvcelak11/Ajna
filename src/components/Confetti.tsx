import { useEffect, useRef } from 'react';
import { useUi } from '../lib/ui';

const COLORS = ['#8b6cff', '#f59e0b', '#10b981', '#ec4899', '#38bdf8', '#f43f5e', '#facc15'];

/** Full-screen confetti burst whenever `celebrate()` is called. Canvas only, no dependencies. */
export function Confetti() {
  const trigger = useUi((s) => s.confetti);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext('2d');
    if (!g) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth;
    const H = window.innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    g.scale(dpr, dpr);
    const parts = Array.from({ length: 140 }, (_, i) => {
      const fromLeft = i % 2 === 0;
      return {
        x: fromLeft ? -10 : W + 10,
        y: H * 0.65,
        vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 7),
        vy: -(9 + Math.random() * 9),
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        w: 6 + Math.random() * 6,
        h: 3 + Math.random() * 4,
        c: COLORS[i % COLORS.length],
      };
    });
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const age = t - t0;
      g.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.vy += 0.32;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        g.save();
        g.globalAlpha = Math.max(0, 1 - age / 2600);
        g.translate(p.x, p.y);
        g.rotate(p.r);
        g.fillStyle = p.c;
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        g.restore();
      }
      if (age < 2600) raf = requestAnimationFrame(step);
      else g.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [trigger]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] h-full w-full" />;
}
