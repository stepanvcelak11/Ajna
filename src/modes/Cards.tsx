import { RotateCcw, Shuffle } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { GameEnd, GameHeader } from '../components/game';
import { LangBadge } from '../components/icons';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, ExampleText, cx } from '../components/ui';
import { shuffle } from '../data/wordbank';
import { navigate } from '../lib/router';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { formatInterval, isDue, review } from '../lib/srs';
import { getState, recordActivity, setState } from '../lib/store';
import type { VocabCard } from '../lib/types';

const MAX = 25;

function grade(id: string, q: number) {
  setState((s) => ({ ...s, vocab: s.vocab.map((v) => (v.id === id ? { ...v, srs: review(v.srs, q) } : v)) }));
}

/** Fast offline flashcards: flip, rate, swipe. Complements the slower 2-step speaking review. */
export default function Cards() {
  const [round, setRound] = useState(0);
  const [dir, setDir] = useState<'cz-en' | 'en-cz'>('cz-en');
  const deck = useMemo(() => {
    const all = getState().vocab;
    const due = all.filter((v) => isDue(v.srs.dueDate)).sort((a, b) => a.srs.dueDate.localeCompare(b.srs.dueDate));
    // nothing due: practise a random selection without changing the schedule much
    return (due.length ? due : shuffle(all)).slice(0, MAX);
  }, [round]);
  const dueMode = useMemo(() => getState().vocab.some((v) => isDue(v.srs.dueDate)), [round]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);

  const c: VocabCard | undefined = deck[i];

  if (!deck.length)
    return (
      <div>
        <GameHeader title="Kartičky" i={0} total={1} combo={0} />
        <Card className="space-y-3 text-center">
          <div className="text-sm text-muted">Zatím nemáš žádná slovíčka. Přidej si balíček.</div>
          <Btn variant="primary" onClick={() => navigate('vocab')}>
            Otevřít slovíčka
          </Btn>
        </Card>
      </div>
    );

  if (!c)
    return (
      <div>
        <GameHeader title="Kartičky" i={deck.length} total={deck.length} combo={0} />
        <GameEnd score={known} total={deck.length} xp={deck.length} icon="cards" tone="pink" extra="slovíček jsi věděl" onAgain={() => (setRound((r) => r + 1), setI(0), setKnown(0))} />
      </div>
    );

  const rate = (q: number) => {
    if (dueMode) grade(c.id, q);
    recordActivity('cards', 1);
    if (q >= 4) {
      setKnown((k) => k + 1);
      sfx.correct();
    } else sfx.tap();
    setFlipped(false);
    setDrag(0);
    setI((x) => x + 1);
  };
  const flip = () => {
    if (!flipped) {
      setFlipped(true);
      speak(c.en);
    }
  };

  // swipe: right = knew it, left = again (only after flipping)
  const onDown = (e: React.PointerEvent) => {
    start.current = e.clientX;
  };
  const onMove = (e: React.PointerEvent) => {
    if (start.current !== null && flipped) setDrag(e.clientX - start.current);
  };
  const onUp = () => {
    if (start.current === null) return;
    const d = drag;
    start.current = null;
    if (!flipped) return flip();
    if (d > 90) rate(4);
    else if (d < -90) rate(1);
    else setDrag(0);
  };

  const front = dir === 'cz-en' ? c.cz : c.en;
  const previews = [1, 3, 4, 5].map((q) => ({ q, iv: formatInterval(review(c.srs, q).interval) }));

  return (
    <div>
      <GameHeader title="Kartičky" subtitle={dueMode ? 'Opakování podle plánu' : 'Volné procvičování'} i={i} total={deck.length} combo={0} />
      <div className="mb-3 flex justify-end">
        <button onClick={() => setDir((d) => (d === 'cz-en' ? 'en-cz' : 'cz-en'))} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2 py-1 text-xs text-muted">
          <Shuffle className="size-3.5" /> {dir === 'cz-en' ? 'CZ → EN' : 'EN → CZ'}
        </button>
      </div>

      <div className="relative h-[22rem] select-none [perspective:1200px]">
        {/* next card peeking behind */}
        {deck[i + 1] && <div className="absolute inset-x-3 top-3 bottom-0 rounded-3xl border border-line bg-surface-2" />}
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => (setDrag(0), (start.current = null))}
          className="absolute inset-0 touch-pan-y cursor-pointer"
          style={{ transform: `translateX(${drag}px) rotate(${drag / 18}deg)`, transition: start.current === null ? 'transform .25s' : 'none' }}
        >
          <div
            className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
            style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-line bg-surface p-6 text-center shadow-lg [backface-visibility:hidden]">
              <LangBadge code={dir === 'cz-en' ? 'CZ' : 'EN'} />
              <div className="mt-4 text-3xl font-extrabold leading-tight">{front}</div>
              <div className="mt-6 text-xs text-muted">Ťukni pro otočení</div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border border-accent/40 bg-surface p-6 text-center shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="flex items-center gap-2">
                <div className="text-3xl font-extrabold">{c.en}</div>
                <SpeakButton text={c.en} compact />
              </div>
              <div className="text-base text-muted">{c.cz}</div>
              <div className="text-sm leading-relaxed">
                <ExampleText text={c.example} />
              </div>
              {c.collocation && <div className="text-xs text-muted">{c.collocation}</div>}
            </div>
          </div>
          {flipped && Math.abs(drag) > 30 && (
            <div
              className={cx(
                'absolute top-5 rounded-xl border-2 px-3 py-1 text-sm font-extrabold uppercase',
                drag > 0 ? 'left-5 rotate-[-12deg] border-emerald-500 text-emerald-500' : 'right-5 rotate-12 border-red-500 text-red-500',
              )}
            >
              {drag > 0 ? 'Vím' : 'Znovu'}
            </div>
          )}
        </div>
      </div>

      {flipped ? (
        <div className="mt-5 grid grid-cols-4 gap-2 animate-up">
          {previews.map(({ q, iv }) => (
            <Btn key={q} variant={q === 4 ? 'primary' : 'secondary'} className="h-14 flex-col gap-0 px-1 text-xs" onClick={() => rate(q)}>
              <span>{q === 1 ? 'Znovu' : q === 3 ? 'Těžké' : q === 4 ? 'Vím' : 'Snadné'}</span>
              {dueMode && <span className="text-[10px] opacity-70">{iv}</span>}
            </Btn>
          ))}
        </div>
      ) : (
        <Btn variant="primary" className="mt-5 h-12 w-full" onClick={flip}>
          <RotateCcw className="size-4" /> Otočit
        </Btn>
      )}
      <div className="mt-3 text-center text-[11px] text-muted">Po otočení: přetáhni doprava = vím, doleva = znovu</div>
    </div>
  );
}
