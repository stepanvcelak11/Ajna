import { useEffect, useState } from 'react';
import { BADGES, unlockedIds, type Badge } from '../data/achievements';
import { navigate } from '../lib/router';
import { sfx } from '../lib/sfx';
import { setState, useStore } from '../lib/store';
import { celebrate } from '../lib/ui';
import { IconTile } from './icons';

/** Shows a celebration card when a new achievement is unlocked. */
export function BadgeWatcher() {
  const unlocked = useStore((s) => unlockedIds(s).join(','));
  const seenStr = useStore((s) => s.badgesSeen.join(','));
  const [show, setShow] = useState<Badge | null>(null);

  useEffect(() => {
    const seen = new Set(seenStr ? seenStr.split(',') : []);
    const ids = unlocked ? unlocked.split(',') : [];
    const fresh = ids.filter((id) => !seen.has(id));
    if (!fresh.length) return;
    const legacy = seen.has('__legacy');
    setState((s) => ({ ...s, badgesSeen: [...new Set([...s.badgesSeen.filter((x) => x !== '__legacy'), ...ids])] }));
    // people who used the app before badges existed: unlock silently once
    if (legacy) return;
    const b = BADGES.find((x) => x.id === fresh[0]);
    if (b) {
      setShow(b);
      celebrate();
      sfx.win();
    }
  }, [unlocked, seenStr]);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(null), 5000);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;
  // non-blocking banner so it never interrupts an exercise
  return (
    <div className="fixed inset-x-0 top-[calc(0.75rem+env(safe-area-inset-top))] z-[65] flex justify-center px-4 animate-up">
      <button
        onClick={() => {
          setShow(null);
          navigate('progress');
        }}
        className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-amber-400/50 bg-surface/95 p-3 text-left shadow-2xl backdrop-blur"
      >
        <div className="animate-pop">
          <IconTile name={show.icon} tone={show.tone} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Nový odznak!</div>
          <div className="text-sm font-bold">{show.title}</div>
          <div className="truncate text-xs text-muted">{show.desc}</div>
        </div>
        <span className="text-xs font-medium text-accent">Zobrazit</span>
      </button>
    </div>
  );
}
