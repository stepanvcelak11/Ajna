import { Check, ChevronRight, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { TypeAnswer } from '../components/answer';
import { GameEnd, GameHeader } from '../components/game';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, ExampleText, Label, cx } from '../components/ui';
import { plainExample, sample, shortCz, wordBank, type Word } from '../data/wordbank';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';

const ROUND = 10;
const gap = (w: Word) => w.example.match(/\{([^}]+)\}/)?.[1] ?? '';
const norm = (s: string) => s.toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim();

/** Doplňovačka: a real sentence with one word missing; write it in exactly the right form (writing only). */
export default function Gaps() {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const qs = useMemo(() => {
    const bank = wordBank(level).filter((w) => {
      const g = gap(w);
      return g && g.split(' ').length <= 2 && /^[a-z' -]+$/i.test(g) && plainExample(w.example).split(' ').length >= 4;
    });
    return sample(bank, ROUND);
  }, [level, round]);
  const [i, setI] = useState(0);
  const [res, setRes] = useState<{ said: string; ok: boolean } | null>(null);
  const [again, setAgain] = useState(false);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wrong, setWrong] = useState<Word[]>([]);
  const [result, setResult] = useState<{ best: boolean } | null>(null);

  useEffect(() => {
    setI(0);
    setRes(null);
    setAgain(false);
    setScore(0);
    setXp(0);
    setCombo(0);
    setWrong([]);
    setResult(null);
  }, [qs]);
  useEffect(() => {
    if (qs.length && i === qs.length && !result) setResult({ best: recordGame('gaps', score, qs.length) });
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = qs[i];
  if (!q)
    return (
      <div>
        <GameHeader title="Doplňovačka" i={qs.length} total={qs.length} combo={0} />
        <GameEnd score={score} total={qs.length} xp={xp} best={result?.best} icon="book" extra="napoprvé správně" onAgain={() => setRound((r) => r + 1)}>
          {wrong.length > 0 && (
            <div className="space-y-1.5 text-left">
              <Label>Zopakuj si</Label>
              {wrong.map((w) => (
                <div key={w.en} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm">
                  <span className="flex-1">
                    <ExampleText text={w.example} />
                  </span>
                  <SpeakButton text={plainExample(w.example)} compact />
                </div>
              ))}
            </div>
          )}
        </GameEnd>
      </div>
    );

  const answer = gap(q);
  const submit = (said: string) => {
    const ok = norm(said) === norm(answer);
    setRes({ said, ok });
    speak(plainExample(q.example));
    if (again) {
      if (ok) sfx.correct(1);
      else sfx.wrong();
      return;
    }
    if (ok) {
      const c = combo + 1;
      const gain = 4 + (c >= 3 ? 1 : 0);
      setCombo(c);
      setScore((s) => s + 1);
      setXp((x) => x + gain);
      recordActivity('gaps', gain);
      sfx.correct(c);
    } else {
      setCombo(0);
      setWrong((w) => [...w, q]);
      recordActivity('gaps', 0);
      sfx.wrong();
    }
  };
  const next = () => {
    setRes(null);
    setAgain(false);
    setI((x) => x + 1);
  };
  const differs = norm(answer) !== norm(q.en);

  return (
    <div>
      <GameHeader title="Doplňovačka" subtitle={`${score} správně · ${xp} XP`} i={i} total={qs.length} combo={combo} />
      <Card key={i} className="mb-4 space-y-3 animate-up">
        <Label>Doplň chybějící slovo</Label>
        <div className="text-xl font-semibold leading-relaxed">
          <ExampleText text={q.example} blank={!res} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-accent/12 px-2.5 py-1 font-semibold text-accent">{shortCz(q.cz)}</span>
          <span className="text-muted">
            {answer.length} písmen{differs && !res ? ' · pozor na správný tvar' : ''}
          </span>
        </div>
      </Card>
      {!res ? (
        <TypeAnswer resetKey={`${round}-${i}-${again}`} placeholder="Chybějící slovo…" onSubmit={submit} />
      ) : (
        <div className="space-y-3 animate-up">
          <Card className={cx('space-y-1', res.ok ? 'border-emerald-500/50' : 'border-red-500/40')}>
            <div className={cx('flex items-center gap-1.5 text-sm font-bold', res.ok ? 'text-emerald-500' : 'text-red-500')}>
              {res.ok ? <Check className="size-4" /> : <X className="size-4" />}
              {res.ok ? 'Správně!' : `Správně je: ${answer}`}
            </div>
            {!res.ok && (
              <div className="text-xs text-muted">
                Napsal jsi: <b>„{res.said}“</b>
              </div>
            )}
            {differs && (
              <div className="text-xs text-muted">
                Základní tvar: <b>{q.en}</b>
              </div>
            )}
          </Card>
          <div className="flex gap-2">
            {!res.ok && (
              <Btn className="flex-1 text-xs" onClick={() => (setRes(null), setAgain(true))}>
                <RotateCcw className="size-4" /> Zkusit znovu
              </Btn>
            )}
            <Btn variant="primary" className="h-12 flex-1" onClick={next}>
              {i + 1 < qs.length ? 'Další' : 'Výsledky'} <ChevronRight className="size-4" />
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
