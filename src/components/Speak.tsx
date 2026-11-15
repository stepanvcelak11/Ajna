import { Square, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { speak, stopSpeaking, ttsSupported } from '../lib/speech';
import { updateSettings, useStore } from '../lib/store';
import { cx } from './ui';

/** TTS play button with a 0.8x / 1x speed toggle (setting is global). */
export function SpeakButton({ text, compact, className }: { text: string; compact?: boolean; className?: string }) {
  const rate = useStore((s) => s.settings.ttsRate);
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => void (playing && stopSpeaking()), [playing]);
  if (!ttsSupported) return null;
  const play = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    speak(text, { onEnd: () => setPlaying(false) });
  };
  return (
    <span className={cx('inline-flex items-center rounded-lg border border-line bg-surface-2 overflow-hidden shrink-0', className)}>
      <button
        onClick={play}
        aria-label="Přehrát"
        className={cx('grid place-items-center text-accent hover:bg-surface-3', compact ? 'size-8' : 'size-9')}
      >
        {playing ? <Square className="size-3.5 fill-current" /> : <Volume2 className="size-4" />}
      </button>
      {!compact && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateSettings({ ttsRate: rate === 1 ? 0.8 : 1 });
          }}
          aria-label="Rychlost"
          className="h-9 px-2 text-[11px] font-semibold text-muted hover:text-fg border-l border-line tabular-nums"
        >
          {rate === 1 ? '1.0×' : '0.8×'}
        </button>
      )}
    </span>
  );
}
