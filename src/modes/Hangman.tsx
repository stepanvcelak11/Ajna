import { ChevronRight, Heart, Lightbulb } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { GameEnd, GameHeader } from '../components/game';
import { Keyboard } from '../components/Keyboard';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, cx } from '../components/ui';
import { plainExample, sample, shortCz, wordBank, type Word } from '../data/wordbank';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';

const ROUND = 6;
const LIVES = 6;

/** The drawing: one part per mistake. */
function Gallows({ wrong }: { wrong: number }) {
  const s = 'stroke-current';
  return (
    <svg viewBox="0 0 120 110" className="mx-auto h-28 text-muted" fill="none" strokeWidth="4" strokeLinecap="round">
      <path d="M10 104 H70 M30 104 V8 H80 V20" className={s} />
      {wrong > 0 && <circle cx="80" cy="30" r="10" className="stroke-red-500" />}
      {wrong > 1 && <path d="M80 40 V70" className="stroke-red-500" />}
      {wrong > 2 && <path d="M80 48 L66 60" className="stroke-red-500" />}
      {wrong > 3 && <path d="M80 48 L94 60" className="stroke-red-500" />}
      {wrong > 4 && <path d="M80 70 L68 88" className="stroke-red-500" />}
      {wrong > 5 && <path d="M80 70 L92 88" className="stroke-red-500" />}
    </svg>
  );
}

/** Šibenice: Czech clue, guess the English word letter by letter (writing only). */
export default function Hangman() {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const qs = useMemo(() => {
    const bank = wordBank(level).filter((w) => /^[a-z]{4,10}$/i.test(w.en));
    return sample(bank, ROUND);
  }, [level, round]);
  const [i, setI] = useState(0);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [hinted, setHinted] = useState(false);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lost, setLost] = useState<Word[]>([]);
  const [result, setResult] = useState<{ best: boolean } | null>(null);

  useEffect(() => {
    setI(0);
    setGuessed([]);
    setHinted(false);
    setScore(0);
    setXp(0);
    setCombo(0);
    setLost([]);
    setResult(null);
  }, [qs]);
  useEffect(() => {
    if (qs.length && i === qs.length && !result) setResult({ best: recordGame('hangman', score, qs.length) });
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = qs[i];
  const word = q?.en.toLowerCase() ?? '';
  const wrong = guessed.filter((g) => !word.includes(g)).length;
  const won = !!q && [...word].every((ch) => guessed.includes(ch));
  const dead = wrong >= LIVES;
  const over = won || dead;

  useEffect(() => {
    if (!q || !over) return;
    speak(q.en);
    if (won) {
      const c = combo + 1;
      const gain = Math.max(2, 6 - wrong - (hinted ? 2 : 0));
      setCombo(c);
      setScore((s) => s + 1);
      setXp((x) => x + gain);
      recordActivity('hangman', gain);
      sfx.correct(c);
    } else {
      setCombo(0);
      setLost((l) => [...l, q]);
      recordActivity('hangman', 0);
      sfx.wrong();
    }
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!q)
    return (
      <div>
        <GameHeader title="Šibenice" i={qs.length} total={qs.length} combo={0} />
        <GameEnd score={score} total={qs.length} xp={xp} best={result?.best} icon="target" extra="uhodnutých slov" onAgain={() => setRound((r) => r + 1)}>
          {lost.length > 0 && (
            <div className="space-y-1.5 text-left">
              <Label>Neuhodnuté</Label>
              {lost.map((w) => (
                <div key={w.en} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm">
                  <span className="flex-1">
                    <b>{w.en}</b> <span className="text-muted">= {shortCz(w.cz)}</span>
                  </span>
                  <SpeakButton text={w.en} compact />
                </div>
              ))}
            </div>
          )}
        </GameEnd>
      </div>
    );

  const press = (k: string) => {
    if (over || k === 'back' || k.length !== 1 || !/[a-z]/.test(k) || guessed.includes(k)) return;
    setGuessed((g) => [...g, k]);
    if (word.includes(k)) sfx.tap();
    else sfx.wrong();
  };
  const hint = () => {
    const miss = [...word].find((ch) => !guessed.includes(ch));
    if (miss) {
      setHinted(true);
      setGuessed((g) => [...g, miss]);
    }
  };
  const next = () => {
    setGuessed([]);
    setHinted(false);
    setI((x) => x + 1);
  };
  const marks: Record<string, string> = {};
  for (const g of guessed) marks[g] = word.includes(g) ? 'bg-emerald-500 text-white' : 'bg-surface-3 text-muted/50 opacity-50';

  return (
    <div className="select-none">
      <GameHeader title="Šibenice" subtitle={`${score} uhodnuto · ${xp} XP`} i={i} total={qs.length} combo={combo} />
      <Card key={i} className="mb-3 space-y-2 text-center animate-up">
        <div className="flex items-center justify-between">
          <Label>Anglicky se řekne…</Label>
          <span className="flex gap-0.5">
            {Array.from({ length: LIVES }, (_, k) => (
              <Heart key={k} className={cx('size-4', k < LIVES - wrong ? 'fill-rose-500 text-rose-500' : 'text-line')} />
            ))}
          </span>
        </div>
        <div className="text-2xl font-bold">{shortCz(q.cz)}</div>
        <Gallows wrong={wrong} />
        <div className="flex flex-wrap justify-center gap-1.5">
          {[...word].map((ch, k) => (
            <span
              key={k}
              className={cx(
                'grid h-11 w-8 place-items-center border-b-[3px] text-2xl font-extrabold uppercase',
                guessed.includes(ch) ? 'border-accent' : dead ? 'border-red-500 text-red-500' : 'border-line text-transparent',
              )}
            >
              {guessed.includes(ch) || dead ? ch : '·'}
            </span>
          ))}
        </div>
        {over && (
          <div className="space-y-1 pt-1 animate-up">
            <div className={cx('text-sm font-bold', won ? 'text-emerald-500' : 'text-red-500')}>{won ? 'Uhodnuto!' : 'Tentokrát ne.'}</div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted">
              {plainExample(q.example)} <SpeakButton text={q.en} compact />
            </div>
          </div>
        )}
      </Card>
      {over ? (
        <Btn variant="primary" className="h-12 w-full" onClick={next}>
          {i + 1 < qs.length ? 'Další slovo' : 'Výsledky'} <ChevronRight className="size-4" />
        </Btn>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-end">
            <Btn variant="ghost" className="h-8 text-xs" onClick={hint} disabled={hinted}>
              <Lightbulb className="size-4" /> Odkrýt písmeno
            </Btn>
          </div>
          <Keyboard onKey={press} space={false} marks={marks} compact />
        </div>
      )}
    </div>
  );
}
