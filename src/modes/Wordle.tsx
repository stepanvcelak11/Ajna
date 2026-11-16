import { CornerDownLeft, Delete, Lightbulb } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { GameHeader } from '../components/game';
import { IconTile, LangBadge } from '../components/icons';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, cx } from '../components/ui';
import { WORDS5, wordOfDay } from '../data/wordle';
import { navigate } from '../lib/router';
import { sfx } from '../lib/sfx';
import { addVocab, hasVocab, recordActivity, recordGame, setState, todayKey, useStore } from '../lib/store';
import { celebrate, isTypingTarget, toast } from '../lib/ui';

const TRIES = 6;
type Mark = 'hit' | 'near' | 'miss';

/** Standard colouring that handles repeated letters correctly. */
function score(guess: string, word: string): Mark[] {
  const res: Mark[] = Array(5).fill('miss');
  const left: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    if (guess[i] === word[i]) res[i] = 'hit';
    else left[word[i]] = (left[word[i]] ?? 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    if (res[i] === 'hit') continue;
    if (left[guess[i]]) {
      res[i] = 'near';
      left[guess[i]]--;
    }
  }
  return res;
}

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const COLORS: Record<Mark, string> = {
  hit: 'bg-emerald-500 border-emerald-500 text-white',
  near: 'bg-amber-500 border-amber-500 text-white',
  miss: 'bg-surface-3 border-surface-3 text-muted',
};

export default function Wordle() {
  const day = todayKey();
  const saved = useStore((s) => s.wordle);
  const [practice, setPractice] = useState<[string, string] | null>(null);
  const [en, cz] = practice ?? wordOfDay(day);
  const [guesses, setGuesses] = useState<string[]>(() => (!practice && saved?.day === day ? saved.guesses : []));
  const [cur, setCur] = useState('');
  const [shake, setShake] = useState(false);
  const [hint, setHint] = useState(false);

  const won = guesses.includes(en);
  const lost = !won && guesses.length >= TRIES;
  const over = won || lost;

  // persist the daily attempt
  useEffect(() => {
    if (!practice) setState((s) => ({ ...s, wordle: { day, guesses } }));
  }, [guesses, practice, day]);

  const keyMarks = useMemo(() => {
    const m: Record<string, Mark> = {};
    const rank = { miss: 0, near: 1, hit: 2 };
    for (const g of guesses)
      score(g, en).forEach((mk, i) => {
        const ch = g[i];
        if (!m[ch] || rank[mk] > rank[m[ch]]) m[ch] = mk;
      });
    return m;
  }, [guesses, en]);

  const submit = () => {
    if (over) return;
    if (cur.length !== 5) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    const next = [...guesses, cur];
    setGuesses(next);
    setCur('');
    if (cur === en) {
      const xp = 4 + (TRIES - next.length) * 2 + (hint ? 0 : 2);
      recordActivity('wordle', xp);
      recordGame('wordle', TRIES + 1 - next.length, TRIES);
      sfx.win();
      celebrate();
    } else if (next.length >= TRIES) {
      recordActivity('wordle', 0);
      recordGame('wordle', 0, TRIES);
      sfx.wrong();
    } else sfx.tap();
  };
  const type = (k: string) => {
    if (over) return;
    if (k === 'enter') submit();
    else if (k === 'back') setCur((c) => c.slice(0, -1));
    else if (/^[a-z]$/.test(k) && cur.length < 5) setCur((c) => c + k);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey) return;
      if (e.key === 'Enter') type('enter');
      else if (e.key === 'Backspace') type('back');
      else if (/^[a-zA-Z]$/.test(e.key)) type(e.key.toLowerCase());
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const newPractice = () => {
    const w = WORDS5[Math.floor(Math.random() * WORDS5.length)];
    setPractice(w);
    setGuesses([]);
    setCur('');
    setHint(false);
  };

  const rows = Array.from({ length: TRIES }, (_, r) => {
    const g = guesses[r] ?? (r === guesses.length ? cur : '');
    const marks = guesses[r] ? score(guesses[r], en) : null;
    return { g, marks, active: r === guesses.length };
  });

  return (
    <div>
      <GameHeader title={practice ? 'Slovo (trénink)' : 'Slovo dne'} subtitle="Uhodni anglické slovo podle českého významu" i={guesses.length} total={TRIES} combo={0} />

      <Card className="mb-4 flex items-center gap-3 py-3">
        <LangBadge code="CZ" />
        <div className="flex-1 text-xl font-bold">{cz}</div>
        {!hint && !over && (
          <button onClick={() => setHint(true)} className="inline-flex items-center gap-1 text-xs font-medium text-accent">
            <Lightbulb className="size-3.5" /> Nápověda
          </button>
        )}
        {hint && !over && <span className="text-xs text-muted">začíná na „{en[0].toUpperCase()}“</span>}
      </Card>

      <div className="mx-auto mb-4 grid max-w-[16rem] gap-1.5">
        {rows.map((row, r) => (
          <div key={r} className={cx('grid grid-cols-5 gap-1.5', row.active && shake && 'animate-shake')}>
            {Array.from({ length: 5 }, (_, c) => {
              const ch = row.g[c] ?? '';
              const mk = row.marks?.[c];
              return (
                <div
                  key={c}
                  style={mk ? { animationDelay: `${c * 90}ms` } : undefined}
                  className={cx(
                    'grid aspect-square place-items-center rounded-xl border-2 text-2xl font-extrabold uppercase',
                    mk ? `${COLORS[mk]} animate-pop` : ch ? 'border-accent/60 bg-surface' : 'border-line bg-surface/50',
                  )}
                >
                  {ch}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {over ? (
        <Card className="space-y-3 text-center animate-up">
          <div className="flex justify-center">
            <IconTile name={won ? 'trophy' : 'book'} tone={won ? 'emerald' : 'amber'} size="lg" />
          </div>
          <div className="text-lg font-bold">{won ? `Uhodnuto na ${guesses.length}. pokus!` : 'Tentokrát to nevyšlo'}</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-extrabold uppercase tracking-widest">{en}</span>
            <SpeakButton text={en} compact />
          </div>
          <div className="text-sm text-muted">= {cz}</div>
          <div className="flex gap-2 pt-1">
            {!hasVocab(en) && (
              <Btn className="flex-1" onClick={() => addVocab({ en, cz, pos: 'word', example: `{${en}}`, source: 'click' }) && toast('Uloženo do slovíček')}>
                Do slovíček
              </Btn>
            )}
            <Btn variant="primary" className="flex-1" onClick={newPractice}>
              Další slovo
            </Btn>
          </div>
          {!practice && (
            <button className="text-xs text-muted underline" onClick={() => navigate('home')}>
              Nové slovo dne bude zítra
            </button>
          )}
        </Card>
      ) : (
        <div className="space-y-1.5 select-none">
          {ROWS.map((row, r) => (
            <div key={row} className="flex justify-center gap-1">
              {r === 2 && (
                <button onClick={() => type('enter')} aria-label="Potvrdit" className="grid h-12 w-12 place-items-center rounded-lg bg-accent text-white active:scale-95">
                  <CornerDownLeft className="size-5" />
                </button>
              )}
              {[...row].map((k) => (
                <button
                  key={k}
                  onClick={() => type(k)}
                  className={cx('h-12 min-w-0 flex-1 max-w-9 rounded-lg text-sm font-bold uppercase transition active:scale-95', keyMarks[k] ? COLORS[keyMarks[k]] : 'bg-surface-2 border border-line')}
                >
                  {k}
                </button>
              ))}
              {r === 2 && (
                <button onClick={() => type('back')} aria-label="Smazat" className="grid h-12 w-12 place-items-center rounded-lg border border-line bg-surface-2 active:scale-95">
                  <Delete className="size-5" />
                </button>
              )}
            </div>
          ))}
          <div className="pt-2 text-center text-[11px] text-muted">
            <span className="mr-2 inline-block size-2.5 rounded-sm bg-emerald-500" /> správné místo
            <span className="ml-3 mr-2 inline-block size-2.5 rounded-sm bg-amber-500" /> jinde ve slově
          </div>
        </div>
      )}
    </div>
  );
}
