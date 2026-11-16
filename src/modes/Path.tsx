import { Check, Lock, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, IconTile } from '../components/icons';
import { LevelSheet } from '../components/LevelPicker';
import { Btn, Card, cx } from '../components/ui';
import { getLevel } from '../data/levels';
import { NODE_INFO, pathFor, starsFor, type PathNode, type PathUnit } from '../data/path';
import { sfx } from '../lib/sfx';
import { ttsSupported } from '../lib/speech';
import { savePathStars, useStore } from '../lib/store';
import { celebrate } from '../lib/ui';
import Builder from './Builder';
import Listen from './Listen';
import Quiz from './Quiz';

// zig-zag horizontal offsets for the nodes (in rem)
const OFFSETS = [0, 3.5, 0, -3.5];

export default function Path() {
  const level = useStore((s) => s.settings.level);
  const stars = useStore((s) => s.path);
  const units = useMemo(() => pathFor(level), [level]);
  const [active, setActive] = useState<{ unit: PathUnit; node: PathNode } | null>(null);
  const [levelOpen, setLevelOpen] = useState(false);
  const currentRef = useRef<HTMLDivElement>(null);

  const flat = units.flatMap((u) => u.nodes.map((n) => ({ u, n })));
  const doneCount = flat.filter((x) => stars[x.n.id]).length;
  const currentIdx = flat.findIndex((x) => !stars[x.n.id]);
  const starTotal = flat.reduce((n, x) => n + (stars[x.n.id] ?? 0), 0);

  useEffect(() => {
    if (!active) currentRef.current?.scrollIntoView({ block: 'center' });
  }, [active, level]);

  if (active) {
    const { unit, node } = active;
    const done = (score: number, total: number) => {
      const st = starsFor(score, total);
      const wasNew = !stars[node.id];
      savePathStars(node.id, st);
      if (node.kind === 'boss' && wasNew) {
        celebrate();
        sfx.win();
      }
    };
    const back = () => setActive(null);
    if (node.kind === 'words' || node.kind === 'boss')
      return <Quiz key={node.id} words={unit.words} title={`${unit.title} · ${node.title}`} onDone={done} onContinue={back} />;
    if (node.kind === 'listen' && ttsSupported) return <Listen key={node.id} phrases={unit.phrases} onDone={done} onContinue={back} />;
    return <Builder key={node.id} phrases={unit.phrases} onDone={done} onContinue={back} />;
  }

  const lv = getLevel(level);
  return (
    <div className="space-y-5">
      <div className="hero-gradient relative overflow-hidden rounded-3xl p-5 text-white shadow-lg shadow-accent/25">
        <div className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-white/10" />
        <div className="text-xs text-white/75">Tvoje cesta · úroveň {lv.id}</div>
        <button onClick={() => setLevelOpen(true)} className="text-left text-2xl font-extrabold">
          {lv.name} <span className="text-base font-semibold text-white/70">{lv.cefr} ›</span>
        </button>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${(doneCount / flat.length) * 100}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-white/80 tabular-nums">
          <span>
            {doneCount}/{flat.length} kroků · {units.length} jednotek
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="size-3 fill-amber-300 text-amber-300" /> {starTotal}/{flat.length * 3}
          </span>
        </div>
      </div>
      <LevelSheet open={levelOpen} onClose={() => setLevelOpen(false)} />

      {units.map((u, ui) => {
        const unitDone = u.nodes.every((n) => stars[n.id]);
        return (
          <section key={u.id} className="space-y-4">
            <Card className={cx('flex items-center gap-3', unitDone && 'border-emerald-500/40')}>
              <IconTile name={u.icon} tone={u.tone} />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Jednotka {u.n}</div>
                <div className="truncate text-sm font-semibold">{u.title}</div>
                <div className="truncate text-xs text-muted">{u.words.slice(0, 4).map((w) => w.en).join(', ')}…</div>
              </div>
              {unitDone && <Check className="size-5 text-emerald-500" />}
            </Card>
            <div className="flex flex-col items-center gap-9 pb-1 pt-6">
              {u.nodes.map((n, ni) => {
                const idx = ui * 4 + ni;
                const st = stars[n.id] ?? 0;
                const unlocked = idx === 0 || !!stars[flat[idx - 1]?.n.id] || st > 0;
                const current = idx === currentIdx;
                const info = NODE_INFO[n.kind];
                return (
                  <div key={n.id} ref={current ? currentRef : undefined} className="flex flex-col items-center" style={{ transform: `translateX(${OFFSETS[ni]}rem)` }}>
                    <button
                      disabled={!unlocked}
                      onClick={() => setActive({ unit: u, node: n })}
                      aria-label={`${u.title}: ${info.title}`}
                      className={cx(
                        'relative grid place-items-center rounded-full border-b-[6px] transition active:translate-y-0.5 active:border-b-2',
                        n.kind === 'boss' ? 'size-20' : 'size-16',
                        st
                          ? 'border-amber-600 bg-amber-400 text-white'
                          : unlocked
                            ? 'border-[color-mix(in_oklab,var(--accent)_60%,black)] bg-accent text-white'
                            : 'border-surface-3 bg-surface-2 text-muted',
                        current && 'ring-4 ring-accent/30 animate-float',
                      )}
                    >
                      {unlocked ? <Icon name={info.icon} className={n.kind === 'boss' ? 'size-9' : 'size-7'} /> : <Lock className="size-6" />}
                      {current && (
                        <span className="absolute -top-8 whitespace-nowrap rounded-lg bg-surface px-2 py-1 text-[11px] font-bold text-accent shadow-md">
                          {doneCount === 0 ? 'Začni tady' : 'Pokračuj'}
                        </span>
                      )}
                    </button>
                    <div className="mt-1.5 flex gap-0.5">
                      {[1, 2, 3].map((k) => (
                        <Star key={k} className={cx('size-3.5', k <= st ? 'fill-amber-400 text-amber-400' : 'text-surface-3')} />
                      ))}
                    </div>
                    <div className="text-[11px] text-muted">{info.title}</div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <Card className="text-center text-sm text-muted">
        Konec cesty pro tuto úroveň.{' '}
        <Btn variant="ghost" className="h-8 px-2 text-xs text-accent" onClick={() => setLevelOpen(true)}>
          Změnit úroveň
        </Btn>
      </Card>
    </div>
  );
}
