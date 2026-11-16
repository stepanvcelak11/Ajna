import { Check, Play, Timer, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GameEnd } from '../components/game';
import { Icon } from '../components/icons';
import { Btn, Card, ModeHeader, cx } from '../components/ui';
import { shortCz, shuffle, wordBank, type Word } from '../data/wordbank';
import { navigate } from '../lib/router';
import { sfx } from '../lib/sfx';
import { getState, recordActivity, recordGame, useStore } from '../lib/store';
import { isTypingTarget } from '../lib/ui';

const SECONDS = 60;

interface Card_ {
  w: Word;
  shown: string;
  ok: boolean;
}

function deal(bank: Word[]): Card_[] {
  const words = shuffle(bank);
  return words.map((w, i) => {
    const ok = Math.random() < 0.5;
    if (ok) return { w, shown: shortCz(w.cz), ok };
    // a wrong meaning, preferably of the same part of speech
    const others = words.filter((x, j) => j !== i && shortCz(x.cz) !== shortCz(w.cz));
    const same = others.filter((x) => x.pos === w.pos);
    const o = (same.length ? same : others)[Math.floor(Math.random() * (same.length || others.length))];
    return { w, shown: o ? shortCz(o.cz) : shortCz(w.cz), ok: !o };
  });
}

/** 60-second blitz: does the English word mean this? Yes / no, as many as you can. */
export default function Blitz() {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const deck = useMemo(() => deal(wordBank(level)), [level, round]);
  const [phase, setPhase] = useState<'ready' | 'play' | 'end'>('ready');
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(SECONDS);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [combo, setCombo] = useState(0);
  const [flash, setFlash] = useState<null | 'ok' | 'bad'>(null);
  const [penalty, setPenalty] = useState(0);
  const [best, setBest] = useState(false);
  const xpRef = useRef(0);
  const prevBest = getState().games.blitz?.best ?? 0;

  useEffect(() => {
    if (phase !== 'play') return;
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 0.1)), 100);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'play' && left <= 0) {
      setPhase('end');
      const xp = Math.round(score * 1.5);
      xpRef.current = xp;
      recordActivity('blitz', xp);
      setBest(recordGame('blitz', score, score + wrong));
    }
  }, [left, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (yes: boolean) => {
    if (phase !== 'play') return;
    const c = deck[i % deck.length];
    if (yes === c.ok) {
      setScore((s) => s + 1);
      setCombo((x) => x + 1);
      setFlash('ok');
      sfx.correct(combo + 1);
    } else {
      setWrong((w) => w + 1);
      setCombo(0);
      setFlash('bad');
      setLeft((l) => Math.max(0, l - 3));
      setPenalty((p) => p + 1);
      sfx.wrong();
    }
    setI((x) => x + 1);
    setTimeout(() => setFlash(null), 220);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.key === 'ArrowRight' || e.key === 'y') answer(true);
      if (e.key === 'ArrowLeft' || e.key === 'n') answer(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  // swipe left / right
  const start = useRef<number | null>(null);

  if (deck.length < 8)
    return (
      <div>
        <ModeHeader title="Blesk" />
        <Card className="space-y-3 text-center">
          <div className="text-sm text-muted">Potřebuješ aspoň 8 slovíček.</div>
          <Btn variant="primary" onClick={() => navigate('vocab')}>
            Otevřít slovíčka
          </Btn>
        </Card>
      </div>
    );

  if (phase === 'ready')
    return (
      <div>
        <ModeHeader title="Blesk" subtitle="60 vteřin, co nejvíc slov" />
        <Card className="space-y-5 py-8 text-center animate-up">
          <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg">
            <Icon name="bolt" className="size-10" />
          </div>
          <div className="space-y-1.5 text-sm">
            <p>Uvidíš anglické slovo a český význam.</p>
            <p>
              <b>Sedí?</b> Ťukni <b className="text-emerald-500">Ano</b> (nebo švihni doprava), jinak <b className="text-red-500">Ne</b>.
            </p>
            <p className="text-muted">Chyba ubere 3 vteřiny.</p>
          </div>
          {prevBest > 0 && <div className="text-xs text-muted">Tvůj rekord: {prevBest}</div>}
          <Btn
            variant="primary"
            className="h-14 w-full text-lg"
            onClick={() => {
              setI(0);
              setScore(0);
              setWrong(0);
              setCombo(0);
              setPenalty(0);
              setLeft(SECONDS);
              setPhase('play');
            }}
          >
            <Play className="size-5" /> Start
          </Btn>
        </Card>
      </div>
    );

  if (phase === 'end')
    return (
      <div>
        <ModeHeader title="Blesk" />
        <GameEnd
          score={score}
          total={score + wrong}
          xp={xpRef.current}
          best={best}
          icon="bolt"
          tone="amber"
          extra={`správně za 60 s · rekord ${Math.max(prevBest, score)}`}
          onAgain={() => {
            setRound((r) => r + 1);
            setPhase('ready');
          }}
        />
      </div>
    );

  const c = deck[i % deck.length];
  return (
    <div className="select-none">
      <ModeHeader
        title="Blesk"
        right={
          <span className={cx('inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold tabular-nums', left < 10 ? 'bg-red-500/12 text-red-500' : 'bg-surface-2')}>
            <Timer className="size-4" /> {Math.ceil(left)}
          </span>
        }
      />
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-surface-3">
        <div className={cx('h-full transition-[width] duration-100 ease-linear', left > 20 ? 'bg-emerald-500' : left > 10 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${(left / SECONDS) * 100}%` }} />
      </div>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-bold tabular-nums">{score} bodů</span>
        {combo >= 3 && (
          <span key={combo} className="inline-flex items-center gap-1 rounded-full bg-orange-500/12 px-2.5 py-0.5 text-xs font-bold text-orange-600 animate-pop dark:text-orange-300">
            <Icon name="flame" className="size-3.5" /> {combo}×
          </span>
        )}
        {penalty > 0 && <span className="text-xs text-red-500">−{penalty * 3} s</span>}
      </div>
      <div
        key={i}
        onTouchStart={(e) => (start.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (start.current === null) return;
          const dx = e.changedTouches[0].clientX - start.current;
          start.current = null;
          if (Math.abs(dx) > 60) answer(dx > 0);
        }}
        className={cx(
          'mb-5 grid min-h-56 place-items-center rounded-3xl border-2 bg-surface p-6 text-center shadow-sm transition-colors animate-pop',
          flash === 'ok' ? 'border-emerald-500' : flash === 'bad' ? 'border-red-500' : 'border-line',
        )}
      >
        <div>
          <div className="text-3xl font-extrabold">{c.w.en}</div>
          <div className="my-3 text-2xl text-muted">=</div>
          <div className="text-2xl font-semibold text-accent">{c.shown}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => answer(false)} className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-red-500 text-lg font-bold text-white shadow-md active:scale-95">
          <X className="size-6" /> Ne
        </button>
        <button onClick={() => answer(true)} className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-lg font-bold text-white shadow-md active:scale-95">
          <Check className="size-6" /> Ano
        </button>
      </div>
    </div>
  );
}
