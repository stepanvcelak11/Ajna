import { ChevronRight, Plus, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Choice, GameEnd, GameHeader, type ChoiceState } from '../components/game';
import { LangBadge } from '../components/icons';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, ExampleText, Label, cx } from '../components/ui';
import { plainExample, sample, shortCz, shuffle, wordBank, type Word } from '../data/wordbank';
import { navigate } from '../lib/router';
import { sfx } from '../lib/sfx';
import { speak, ttsSupported } from '../lib/speech';
import { addVocab, hasVocab, recordActivity, recordGame, useStore } from '../lib/store';
import { isTypingTarget, toast } from '../lib/ui';

const ROUND = 12;
const SECONDS = 12;

type Kind = 'cz-en' | 'en-cz' | 'listen' | 'gap';
interface Q {
  kind: Kind;
  word: Word;
  options: string[];
  answer: string;
}

const gapOf = (w: Word) => w.example.match(/\{([^}]+)\}/)?.[1];

function build(bank: Word[], only?: Word[]): Q[] {
  const words = only ? shuffle(only) : sample(bank, ROUND);
  return words.map((w, i) => {
    const kinds: Kind[] = ['cz-en', 'en-cz', 'cz-en'];
    if (ttsSupported) kinds.push('listen');
    if (gapOf(w)?.toLowerCase() === w.en.toLowerCase()) kinds.push('gap', 'gap');
    const kind = kinds[(i + Math.floor(Math.random() * kinds.length)) % kinds.length];
    const toCz = kind === 'en-cz';
    const label = (x: Word) => (toCz ? shortCz(x.cz) : x.en);
    const answer = label(w);
    // distractors: same part of speech first, all different from the answer
    const pool = shuffle(bank.filter((x) => x !== w && label(x).toLowerCase() !== answer.toLowerCase()));
    const same = pool.filter((x) => x.pos === w.pos);
    const picked: string[] = [];
    for (const x of [...same, ...pool]) {
      const l = label(x);
      if (!picked.some((p) => p.toLowerCase() === l.toLowerCase())) picked.push(l);
      if (picked.length === 3) break;
    }
    return { kind, word: w, answer, options: shuffle([answer, ...picked]) };
  });
}

const PROMPT: Record<Kind, string> = {
  'cz-en': 'Jak se to řekne anglicky?',
  'en-cz': 'Co to znamená?',
  listen: 'Poslechni si a vyber, co zaznělo',
  gap: 'Doplň do věty',
};

export default function Quiz({ words, title = 'Kvíz', onDone, onContinue }: { words?: Word[]; title?: string; onDone?: (score: number, total: number) => void; onContinue?: () => void } = {}) {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const bank = useMemo(() => wordBank(level), [level, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const qs = useMemo(() => (bank.length >= 8 ? build(bank, words) : []), [bank, words]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [xp, setXp] = useState(0);
  const [wrong, setWrong] = useState<Word[]>([]);
  const [left, setLeft] = useState(SECONDS);
  const [result, setResult] = useState<{ best: boolean } | null>(null);
  const autoNext = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const q = qs[i];

  useEffect(() => {
    setI(0);
    setPicked(null);
    setScore(0);
    setCombo(0);
    setBest(0);
    setXp(0);
    setWrong([]);
    setResult(null);
  }, [qs]);

  // per-question timer (only adds a speed bonus, never fails you)
  useEffect(() => {
    if (!q || picked) return;
    setLeft(SECONDS);
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 0.1)), 100);
    return () => clearInterval(t);
  }, [i, q, picked]);

  useEffect(() => {
    if (q?.kind === 'listen') speak(q.word.en);
  }, [q]);

  const next = () => {
    clearTimeout(autoNext.current);
    setPicked(null);
    setI((x) => x + 1);
  };

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const ok = opt === q.answer;
    if (ok) {
      const c = combo + 1;
      const gain = 3 + (left > SECONDS / 2 ? 1 : 0) + (c >= 3 ? 1 : 0);
      setCombo(c);
      setBest((b) => Math.max(b, c));
      setScore((s) => s + 1);
      setXp((x) => x + gain);
      recordActivity('quiz', gain);
      sfx.correct(c);
      if (q.kind !== 'listen') speak(q.word.en);
      autoNext.current = setTimeout(next, 1100);
    } else {
      setCombo(0);
      setWrong((w) => [...w, q.word]);
      recordActivity('quiz', 0);
      sfx.wrong();
      speak(q.word.en);
    }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || !q) return;
      const n = Number(e.key);
      if (!picked && n >= 1 && n <= q.options.length) choose(q.options[n - 1]);
      else if (picked && e.key === 'Enter') next();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  useEffect(() => () => clearTimeout(autoNext.current), []);

  // record once when the last question is done (score state is final here)
  useEffect(() => {
    if (qs.length && i === qs.length && !result) {
      setResult({ best: recordGame('quiz', score, qs.length) });
      onDone?.(score, qs.length);
    }
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  if (bank.length < 8)
    return (
      <div>
        <GameHeader title="Kvíz" i={0} total={1} combo={0} />
        <Card className="space-y-3 text-center">
          <div className="text-sm text-muted">Na kvíz potřebuješ aspoň 8 slovíček. Přidej si balíček.</div>
          <Btn variant="primary" onClick={() => navigate('vocab')}>
            Otevřít slovíčka
          </Btn>
        </Card>
      </div>
    );

  if (!q)
    return (
      <div>
        <GameHeader title={title} i={qs.length} total={qs.length} combo={0} />
        <GameEnd score={score} total={qs.length} xp={xp} best={result?.best} extra={`nejdelší série ${best}×`} onAgain={() => setRound((r) => r + 1)} onContinue={onContinue}>
          {wrong.length > 0 && (
            <div className="space-y-2 text-left">
              <Label>Zopakuj si</Label>
              {wrong.map((w) => (
                <div key={w.en} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
                  <div className="min-w-0 flex-1 text-sm">
                    <span className="font-semibold">{w.en}</span> <span className="text-muted">= {shortCz(w.cz)}</span>
                  </div>
                  <SpeakButton text={w.en} compact />
                  {!hasVocab(w.en) && (
                    <button
                      aria-label="Uložit do slovíček"
                      className="grid size-8 place-items-center rounded-lg border border-line text-accent"
                      onClick={() => addVocab({ en: w.en, cz: w.cz, pos: w.pos, example: w.example, source: 'click' }) && toast('Uloženo do slovíček')}
                    >
                      <Plus className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </GameEnd>
      </div>
    );

  const stateOf = (o: string): ChoiceState => (!picked ? 'idle' : o === q.answer ? 'correct' : o === picked ? 'wrong' : 'dim');
  const ok = picked === q.answer;

  return (
    <div>
      <GameHeader title={title} subtitle={`${score} správně · ${xp} XP`} i={i} total={qs.length} combo={combo} />
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cx('h-full transition-[width] duration-100 ease-linear', left > SECONDS / 2 ? 'bg-emerald-500' : left > 3 ? 'bg-amber-500' : 'bg-red-500')}
          style={{ width: `${picked ? 0 : (left / SECONDS) * 100}%` }}
        />
      </div>

      <Card key={i} className="mb-4 animate-up">
        <Label className="flex items-center gap-1.5">
          <LangBadge code={q.kind === 'en-cz' || q.kind === 'listen' ? 'EN' : 'CZ'} /> {PROMPT[q.kind]}
        </Label>
        {q.kind === 'listen' ? (
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => speak(q.word.en)}
              aria-label="Přehrát znovu"
              className="grid size-20 place-items-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 active:scale-95"
            >
              <Volume2 className="size-9" />
            </button>
          </div>
        ) : q.kind === 'gap' ? (
          <div className="mt-2 text-xl font-semibold leading-snug">
            <ExampleText text={q.word.example} blank={!picked} />
            <div className="mt-1 text-sm font-normal text-muted">{shortCz(q.word.cz)}</div>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 text-2xl font-bold leading-snug">{q.kind === 'en-cz' ? q.word.en : shortCz(q.word.cz)}</div>
            {q.kind === 'en-cz' && <SpeakButton text={q.word.en} compact />}
          </div>
        )}
      </Card>

      <div className="space-y-2.5">
        {q.options.map((o, n) => (
          <Choice key={o} state={stateOf(o)} onClick={() => choose(o)}>
            <span className="mr-2 hidden text-xs text-muted sm:inline">{n + 1}</span>
            {o}
          </Choice>
        ))}
      </div>

      {picked && !ok && (
        <Card className="mt-4 space-y-2 border-amber-500/30 animate-up">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="text-sm">
                <b>{q.word.en}</b> = {q.word.cz}
              </div>
              <div className="mt-1 text-xs text-muted">{plainExample(q.word.example)}</div>
            </div>
            <SpeakButton text={plainExample(q.word.example)} compact />
          </div>
          <Btn variant="primary" className="h-12 w-full" onClick={next}>
            Další <ChevronRight className="size-4" />
          </Btn>
        </Card>
      )}
    </div>
  );
}
