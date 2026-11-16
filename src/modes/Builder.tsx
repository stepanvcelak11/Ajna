import { ChevronRight, Lightbulb, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { GameEnd, GameHeader } from '../components/game';
import { Icon, LangBadge } from '../components/icons';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, cx } from '../components/ui';
import { phraseBank, sample, shuffle } from '../data/wordbank';
import type { Phrase } from '../data/phrases';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';

const ROUND = 8;
// typical Czech word-order / grammar traps used as decoys
const DECOYS = ['do', 'does', 'is', 'are', 'am', 'the', 'a', 'to', 'at', 'in', 'on', 'have', 'has', 'for', 'of', 'will', 'did', 'was', 'it', 'me'];

interface Tile {
  id: number;
  text: string;
}
interface Task {
  phrase: Phrase;
  target: string[];
  tiles: Tile[];
}

function tokens(en: string) {
  const t = en.replace(/[.!?]+$/, '').split(/\s+/).filter(Boolean);
  // don't give away the first word by its capital letter
  if (t[0] && !/^I($|')/.test(t[0])) t[0] = t[0].charAt(0).toLowerCase() + t[0].slice(1);
  return t;
}

function makeTask(p: Phrase): Task {
  const target = tokens(p.en);
  const have = new Set(target.map((w) => w.toLowerCase().replace(/[,]/g, '')));
  const decoys = shuffle(DECOYS.filter((d) => !have.has(d))).slice(0, target.length > 6 ? 3 : 2);
  const tiles = shuffle([...target, ...decoys]).map((text, id) => ({ id, text }));
  return { phrase: p, target, tiles };
}

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export default function Builder() {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const tasks = useMemo(() => {
    const pool = phraseBank(level).filter((p) => {
      const n = tokens(p.en).length;
      return n >= 3 && n <= 10;
    });
    return sample(pool, ROUND).map(makeTask);
  }, [level, round]);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<Tile[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [hints, setHints] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [result, setResult] = useState<{ best: boolean } | null>(null);

  useEffect(() => {
    setI(0);
    setChosen([]);
    setChecked(null);
    setHints(0);
    setScore(0);
    setXp(0);
    setCombo(0);
    setResult(null);
  }, [tasks]);

  const t = tasks[i];

  useEffect(() => {
    if (tasks.length && i === tasks.length && !result) setResult({ best: recordGame('builder', score, tasks.length) });
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!t)
    return (
      <div>
        <GameHeader title="Skládání vět" i={tasks.length} total={tasks.length} combo={0} />
        <GameEnd score={score} total={tasks.length} xp={xp} best={result?.best} extra="vět složených bez chyby" onAgain={() => setRound((r) => r + 1)} />
      </div>
    );

  const used = new Set(chosen.map((c) => c.id));
  const add = (tile: Tile) => {
    if (checked !== null) return;
    sfx.tap();
    setChosen((c) => [...c, tile]);
  };
  const remove = (tile: Tile) => {
    if (checked !== null) return;
    setChosen((c) => c.filter((x) => x.id !== tile.id));
  };
  const hint = () => {
    // keep the correct beginning, then place the next right word
    let k = 0;
    while (k < chosen.length && k < t.target.length && same(chosen[k].text, t.target[k])) k++;
    const keep = chosen.slice(0, k);
    const nextWord = t.target[k];
    if (nextWord === undefined) return;
    const tile = t.tiles.find((x) => !keep.some((c) => c.id === x.id) && same(x.text, nextWord));
    if (!tile) return;
    setHints((h) => h + 1);
    setChosen([...keep, tile]);
  };
  const check = () => {
    const ok = chosen.length === t.target.length && chosen.every((c, n) => same(c.text, t.target[n]));
    setChecked(ok);
    speak(t.phrase.en);
    if (ok) {
      const c = combo + 1;
      const gain = Math.max(1, 5 - hints * 2) + (c >= 3 ? 1 : 0);
      setCombo(c);
      setScore((s) => s + (hints === 0 ? 1 : 0));
      setXp((x) => x + gain);
      recordActivity('builder', gain);
      sfx.correct(c);
    } else {
      setCombo(0);
      recordActivity('builder', 0);
      sfx.wrong();
    }
  };
  const next = () => {
    setChosen([]);
    setChecked(null);
    setHints(0);
    setI((x) => x + 1);
  };

  return (
    <div>
      <GameHeader title="Skládání vět" subtitle="Slož anglickou větu ze slov" i={i} total={tasks.length} combo={combo} />

      <Card key={i} className="mb-4 animate-up">
        <Label className="flex items-center gap-1.5">
          <LangBadge code="CZ" /> Přelož
        </Label>
        <div className="mt-2 text-2xl font-bold leading-snug">{t.phrase.cz}</div>
      </Card>

      {/* answer line */}
      <div
        className={cx(
          'mb-4 flex min-h-[7.5rem] flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed p-3 transition-colors',
          checked === null ? 'border-line' : checked ? 'border-emerald-500 bg-emerald-500/8' : 'border-red-500/60 bg-red-500/5 animate-shake',
        )}
      >
        {chosen.length === 0 && <span className="m-auto text-sm text-muted">Ťukej na slova ve správném pořadí</span>}
        {chosen.map((c) => (
          <button
            key={c.id}
            onClick={() => remove(c)}
            className="rounded-xl border border-accent/40 bg-accent/12 px-3 py-2 text-[16px] font-semibold text-fg shadow-sm animate-pop"
          >
            {c.text}
          </button>
        ))}
      </div>

      {/* word bank */}
      <div className="mb-5 flex flex-wrap justify-center gap-2">
        {t.tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => add(tile)}
            disabled={used.has(tile.id) || checked !== null}
            className={cx(
              'rounded-xl border px-3 py-2 text-[16px] font-medium shadow-sm transition active:scale-95',
              used.has(tile.id) ? 'border-line bg-surface-2 text-transparent shadow-none' : 'border-line bg-surface hover:border-accent/50',
            )}
          >
            {tile.text}
          </button>
        ))}
      </div>

      {checked === null ? (
        <div className="flex gap-2">
          <Btn className="px-3" onClick={hint} aria-label="Nápověda">
            <Lightbulb className="size-4" />
          </Btn>
          <Btn className="px-3" onClick={() => setChosen([])} disabled={!chosen.length} aria-label="Vymazat">
            <RotateCcw className="size-4" />
          </Btn>
          <Btn variant="primary" className="h-12 flex-1" disabled={chosen.length === 0} onClick={check}>
            Zkontrolovat
          </Btn>
        </div>
      ) : (
        <Card className={cx('space-y-3 animate-up', checked ? 'border-emerald-500/40' : 'border-amber-500/40')}>
          <div className={cx('flex items-center gap-2 text-sm font-bold', checked ? 'text-emerald-500' : 'text-red-500')}>
            <Icon name={checked ? 'goal' : 'bulb'} className="size-5" />
            {checked ? (hints ? 'Správně (s nápovědou)' : 'Správně!') : 'Správné pořadí:'}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-lg font-semibold">{t.phrase.en}</div>
            <SpeakButton text={t.phrase.en} compact />
          </div>
          {t.phrase.tip && <div className="text-xs text-muted">{t.phrase.tip}</div>}
          <Btn variant="primary" className="h-12 w-full" onClick={next}>
            {i + 1 < tasks.length ? 'Další' : 'Výsledky'} <ChevronRight className="size-4" />
          </Btn>
        </Card>
      )}
    </div>
  );
}
