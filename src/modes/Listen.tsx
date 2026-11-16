import { Check, ChevronRight, Snail, Volume2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { GameEnd, GameHeader } from '../components/game';
import { MicRecorder } from '../components/MicRecorder';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, cx } from '../components/ui';
import { phraseBank, sample, shuffle } from '../data/wordbank';
import type { Phrase } from '../data/phrases';
import { checkPhrase, type Verdict } from '../lib/match';
import { sfx } from '../lib/sfx';
import { speak, ttsSupported } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';

const ROUND = 8;

export default function Listen({ phrases, onDone, onContinue }: { phrases?: Phrase[]; onDone?: (score: number, total: number) => void; onContinue?: () => void } = {}) {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const items = useMemo(() => (phrases ? shuffle(phrases) : sample(phraseBank(level), ROUND)), [level, round, phrases]);
  const [i, setI] = useState(0);
  const [res, setRes] = useState<{ said: string; verdict: Verdict } | null>(null);
  const [plays, setPlays] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [result, setResult] = useState<{ best: boolean } | null>(null);
  const p = items[i];

  useEffect(() => {
    setI(0);
    setRes(null);
    setScore(0);
    setXp(0);
    setCombo(0);
    setResult(null);
  }, [items]);

  const play = (slow = false) => {
    if (!p) return;
    setPlays((n) => n + 1);
    speak(p.en, slow ? { rate: 0.65 } : {});
  };

  // play each new sentence automatically
  useEffect(() => {
    setPlays(0);
    if (p) {
      const t = setTimeout(() => play(), 350);
      return () => clearTimeout(t);
    }
  }, [p]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (items.length && i === items.length && !result) {
      setResult({ best: recordGame('listen', score, items.length) });
      onDone?.(score, items.length);
    }
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ttsSupported)
    return (
      <div>
        <GameHeader onBack={onContinue} title="Poslech" i={0} total={1} combo={0} />
        <Card className="text-sm text-muted">Tento prohlížeč neumí přehrávat řeč, poslech tu bohužel nejde.</Card>
      </div>
    );

  if (!p)
    return (
      <div>
        <GameHeader onBack={onContinue} title="Poslech" i={items.length} total={items.length} combo={0} />
        <GameEnd score={score} total={items.length} xp={xp} best={result?.best} icon="mic" tone="sky" extra="vět správně zachycených" onAgain={() => setRound((r) => r + 1)} onContinue={onContinue} />
      </div>
    );

  const submit = (said: string) => {
    const r = checkPhrase(p, said);
    setRes({ said, verdict: r.verdict });
    const ok = r.verdict !== 'wrong';
    if (ok) {
      const c = combo + 1;
      const gain = 4 + (plays <= 1 ? 2 : 0) + (c >= 3 ? 1 : 0);
      setCombo(c);
      setScore((s) => s + 1);
      setXp((x) => x + gain);
      recordActivity('listen', gain);
      sfx.correct(c);
    } else {
      setCombo(0);
      recordActivity('listen', 0);
      sfx.wrong();
    }
  };
  const next = () => {
    setRes(null);
    setI((x) => x + 1);
  };
  const ok = res && res.verdict !== 'wrong';

  return (
    <div>
      <GameHeader onBack={onContinue} title="Poslech" subtitle="Poslechni si a zopakuj nebo napiš" i={i} total={items.length} combo={combo} />

      <Card key={i} className="mb-4 flex flex-col items-center gap-4 py-6 animate-up">
        <Label>Co zaznělo?</Label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => play()}
            aria-label="Přehrát"
            className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-accent to-fuchsia-500 text-white shadow-lg shadow-accent/30 transition active:scale-95"
          >
            <Volume2 className="size-9" />
          </button>
          <button
            onClick={() => play(true)}
            aria-label="Přehrát pomalu"
            className="grid size-14 place-items-center rounded-full border border-line bg-surface-2 text-accent transition active:scale-95"
          >
            <Snail className="size-6" />
          </button>
        </div>
        <div className="text-xs text-muted">{plays <= 1 ? 'Napoprvé = bonus XP' : `Přehráno ${plays}×`}</div>

        {res && (
          <div className="w-full space-y-2 border-t border-line pt-4 text-center animate-up">
            <div className={cx('flex items-center justify-center gap-1.5 text-sm font-bold', ok ? 'text-emerald-500' : 'text-red-500')}>
              {ok ? <Check className="size-4" /> : <X className="size-4" />}
              {res.verdict === 'ok' ? 'Přesně tak!' : res.verdict === 'close' ? 'Skoro přesně' : 'Zaznělo:'}
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="text-xl font-semibold">{p.en}</div>
              <SpeakButton text={p.en} compact />
            </div>
            <div className="text-sm text-muted">{p.cz}</div>
            {res.verdict !== 'ok' && <div className="text-xs text-muted">Ty: „{res.said}“</div>}
          </div>
        )}
      </Card>

      {!res ? (
        <MicRecorder resetKey={`${round}-${i}`} submitLabel="Ověřit" placeholder="Řekni nebo napiš, co jsi slyšel…" hint="Zopakuj, co jsi slyšel" onSubmit={submit} />
      ) : (
        <Btn variant="primary" className="h-12 w-full" onClick={next}>
          {i + 1 < items.length ? 'Další' : 'Výsledky'} <ChevronRight className="size-4" />
        </Btn>
      )}
    </div>
  );
}
