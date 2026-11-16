import { Check, ChevronRight, Plus, RotateCcw, Snail, Volume2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AnswerBox, HeardAs, ModeBadge, ModePicker, type InputMode } from '../components/answer';
import { GameEnd, GameHeader } from '../components/game';
import { LangBadge } from '../components/icons';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, ExampleText, Label, cx } from '../components/ui';
import { plainExample, sample, shortCz, wordBank, type Word } from '../data/wordbank';
import { words } from '../lib/match';
import { sfx } from '../lib/sfx';
import { speak, ttsSupported } from '../lib/speech';
import { addVocab, hasVocab, recordActivity, recordGame, useStore } from '../lib/store';
import { toast } from '../lib/ui';

const ROUND = 10;
const strip = (s: string) => words(s).filter((w, i) => !(i === 0 && ['a', 'an', 'the', 'to'].includes(w))).join(' ');
const same = (answer: string, w: Word) => strip(answer) === strip(w.en);

/** Diff the typed word against the right one letter by letter. */
function Letters({ said, right }: { said: string; right: string }) {
  const a = said.toLowerCase();
  return (
    <span className="font-mono text-lg font-bold tracking-wide">
      {[...right].map((ch, i) => (
        <span key={i} className={cx(a[i] === ch.toLowerCase() ? 'text-emerald-600 dark:text-emerald-400' : 'rounded bg-red-500/15 text-red-500')}>
          {ch}
        </span>
      ))}
    </span>
  );
}

/**
 * kind = 'translate': Czech word → say or write it in English (pick the mode at the start).
 * kind = 'spell': hear the English word and write it (writing only).
 */
export default function WordGame({ kind = 'translate' }: { kind?: 'translate' | 'spell' }) {
  const level = useStore((s) => s.settings.level);
  const [mode, setMode] = useState<InputMode | null>(kind === 'spell' ? 'write' : null);
  const [round, setRound] = useState(0);
  const qs = useMemo(() => {
    const bank = wordBank(level).filter((w) => w.en.split(' ').length <= (kind === 'spell' ? 1 : 3) && /^[a-z' -]+$/i.test(w.en));
    return sample(bank, ROUND);
  }, [level, round, kind]);
  const [i, setI] = useState(0);
  const [res, setRes] = useState<{ said: string; ok: boolean } | null>(null);
  const [again, setAgain] = useState(false);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wrong, setWrong] = useState<Word[]>([]);
  const [result, setResult] = useState<{ best: boolean } | null>(null);
  const id = kind === 'spell' ? 'spelling' : `words-${mode}`;
  const title = kind === 'spell' ? 'Pravopis' : 'Překlad slovíček';

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
  const q = mode ? qs[i] : undefined;
  useEffect(() => {
    if (q && kind === 'spell') {
      const t = setTimeout(() => speak(q.en), 300);
      return () => clearTimeout(t);
    }
  }, [q, kind]);
  useEffect(() => {
    if (qs.length && i === qs.length && !result) setResult({ best: recordGame(id, score, qs.length) });
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mode)
    return (
      <ModePicker
        game="words"
        title={title}
        subtitle="Česky → anglicky: řekni nebo napiš slovíčko"
        onPick={(m) => {
          setMode(m);
          setRound((r) => r + 1);
        }}
      />
    );

  if (kind === 'spell' && !ttsSupported)
    return (
      <div>
        <GameHeader title={title} i={0} total={1} combo={0} />
        <Card className="text-sm text-muted">Tento prohlížeč neumí přehrávat řeč.</Card>
      </div>
    );

  const back = kind === 'spell' ? undefined : () => setMode(null);

  if (!q)
    return (
      <div>
        <GameHeader title={title} i={qs.length} total={qs.length} combo={0} onBack={back} />
        <GameEnd score={score} total={qs.length} xp={xp} best={result?.best} extra="napoprvé správně" onAgain={() => setRound((r) => r + 1)}>
          {wrong.length > 0 && (
            <div className="space-y-1.5 text-left">
              <Label>Zopakuj si</Label>
              {wrong.map((w) => (
                <div key={w.en} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
                  <div className="min-w-0 flex-1 text-sm">
                    <b>{w.en}</b> <span className="text-muted">= {shortCz(w.cz)}</span>
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

  const submit = (said: string) => {
    const ok = same(said, q);
    setRes({ said, ok });
    if (mode === 'write' || kind === 'spell') speak(q.en);
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
      recordActivity(id, gain);
      sfx.correct(c);
    } else {
      setCombo(0);
      setWrong((w) => [...w, q]);
      recordActivity(id, 0);
      sfx.wrong();
    }
  };
  const next = () => {
    setRes(null);
    setAgain(false);
    setI((x) => x + 1);
  };

  return (
    <div>
      <GameHeader title={title} subtitle={`${score} správně · ${xp} XP`} i={i} total={qs.length} combo={combo} onBack={back} />
      <Card key={i} className="mb-4 space-y-3 animate-up">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5">
            {kind === 'spell' ? (
              <>
                <LangBadge code="EN" /> Napiš, co slyšíš
              </>
            ) : (
              <>
                <LangBadge code="CZ" /> {mode === 'speak' ? 'Řekni anglicky' : 'Napiš anglicky'}
              </>
            )}
          </Label>
          <ModeBadge mode={mode} />
        </div>
        {kind === 'spell' ? (
          <div className="flex items-center justify-center gap-4 py-2">
            <button onClick={() => speak(q.en)} aria-label="Přehrát" className="grid size-20 place-items-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 active:scale-95">
              <Volume2 className="size-9" />
            </button>
            <button onClick={() => speak(q.en, { rate: 0.55 })} aria-label="Přehrát pomalu" className="grid size-14 place-items-center rounded-full border border-line bg-surface-2 text-accent active:scale-95">
              <Snail className="size-6" />
            </button>
          </div>
        ) : null}
        <div className={cx('font-bold leading-snug', kind === 'spell' ? 'text-center text-base text-muted' : 'text-3xl')}>{shortCz(q.cz)}</div>
        {kind === 'translate' && q.example.includes('{') && (
          <div className="text-sm text-muted">
            <ExampleText text={q.example} blank={!res} />
          </div>
        )}
      </Card>

      {!res ? (
        <AnswerBox mode={mode} resetKey={`${round}-${i}-${again}`} placeholder={kind === 'spell' ? 'Napiš slovo…' : 'Napiš anglicky…'} hint="Řekni slovíčko anglicky" onSubmit={submit} />
      ) : (
        <div className="space-y-3 animate-up">
          <Card className={cx('space-y-2', res.ok ? 'border-emerald-500/50' : 'border-red-500/40')}>
            <div className={cx('flex items-center gap-1.5 text-sm font-bold', res.ok ? 'text-emerald-500' : 'text-red-500')}>
              {res.ok ? <Check className="size-4" /> : <X className="size-4" />}
              {res.ok ? 'Správně!' : 'Správně je:'}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">{mode === 'write' && !res.ok ? <Letters said={res.said} right={q.en} /> : <span className="text-xl font-bold">{q.en}</span>}</div>
              <SpeakButton text={q.en} compact />
            </div>
            <div className="text-xs text-muted">{plainExample(q.example)}</div>
          </Card>
          {!res.ok && <HeardAs mode={mode} said={res.said} />}
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
