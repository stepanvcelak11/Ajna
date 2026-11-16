import { Check, ChevronRight, Mic, Volume2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { GameEnd, GameHeader } from '../components/game';
import { Icon } from '../components/icons';
import { MicRecorder } from '../components/MicRecorder';
import { Btn, Card, Label, ModeHeader, cx } from '../components/ui';
import { soundsFor, type Sound } from '../data/pronounce';
import { shuffle } from '../data/wordbank';
import { words } from '../lib/match';
import { sfx } from '../lib/sfx';
import { speak, sttSupported } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';
import { canTranscribe } from '../lib/llm';
import { useOnline } from '../lib/ui';

const ROUND = 10;
const TRIES = 3;

interface Item {
  word: string;
  not?: string;
  sound: Sound;
}

function build(sounds: Sound[]): Item[] {
  const all: Item[] = [];
  for (const s of sounds)
    for (const w of s.words) {
      const [a, b] = w.split('|');
      if (b) {
        all.push({ word: a, not: b, sound: s }, { word: b, not: a, sound: s });
      } else all.push({ word: a, sound: s });
    }
  // don't ask both halves of a pair in one round
  const out: Item[] = [];
  for (const it of shuffle(all)) {
    if (out.some((o) => o.not === it.word)) continue;
    out.push(it);
    if (out.length >= ROUND) break;
  }
  return out;
}

const has = (said: string, target: string) => {
  const a = words(said).join(' ');
  const t = words(target).join(' ');
  return ` ${a} `.includes(` ${t} `);
};

/** Speaking only: say the word so clearly that the microphone writes exactly it. */
export default function Pronounce() {
  const level = useStore((s) => s.settings.level);
  const online = useOnline();
  const groups = soundsFor(level);
  const [pick, setPick] = useState<Sound[] | null>(null);
  const [round, setRound] = useState(0);
  const items = useMemo(() => (pick ? build(pick) : []), [pick, round]);
  const [i, setI] = useState(0);
  const [tries, setTries] = useState(0);
  const [heard, setHeard] = useState<string | null>(null);
  const [state, setState] = useState<'ask' | 'ok' | 'fail'>('ask');
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [missed, setMissed] = useState<Item[]>([]);
  const [result, setResult] = useState<{ best: boolean } | null>(null);

  useEffect(() => {
    setI(0);
    setTries(0);
    setHeard(null);
    setState('ask');
    setScore(0);
    setXp(0);
    setCombo(0);
    setMissed([]);
    setResult(null);
  }, [items]);
  useEffect(() => {
    if (items.length && i === items.length && !result) setResult({ best: recordGame('pronounce', score, items.length) });
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSpeak = sttSupported || (online && canTranscribe());

  if (!pick)
    return (
      <div className="space-y-4">
        <ModeHeader title="Výslovnost" subtitle="Hraje se jen mluvením: mikrofon ti musí rozumět" />
        {!canSpeak && <Card className="border-amber-500/40 text-sm">Mikrofon tu není dostupný. Výslovnost potřebuje rozpoznávání řeči (nebo internet a API klíč).</Card>}
        <button
          disabled={!canSpeak}
          onClick={() => setPick(groups)}
          className="flex w-full items-center gap-4 rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 p-5 text-left text-white shadow-md transition active:scale-[0.98] disabled:opacity-40"
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-white/20">
            <Mic className="size-8" />
          </span>
          <span>
            <span className="block text-lg font-extrabold">Mix všech hlásek</span>
            <span className="block text-xs text-white/85">10 slov napříč tématy pro tvou úroveň</span>
          </span>
        </button>
        <Label>Nebo trénuj jednu hlásku</Label>
        <div className="space-y-2.5">
          {groups.map((g) => (
            <Card key={g.id} onClick={canSpeak ? () => setPick([g]) : undefined} className={cx('space-y-1', !canSpeak && 'opacity-50')}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">{g.title}</div>
                <ChevronRight className="size-4 text-muted" />
              </div>
              <div className="text-xs text-muted">{g.tip}</div>
            </Card>
          ))}
        </div>
      </div>
    );

  const it = items[i];
  if (!it)
    return (
      <div>
        <GameHeader title="Výslovnost" i={items.length} total={items.length} combo={0} onBack={() => setPick(null)} />
        <GameEnd score={score} total={items.length} xp={xp} best={result?.best} icon="mic" tone="rose" extra="slov napoprvé srozumitelně" onAgain={() => setRound((r) => r + 1)}>
          {missed.length > 0 && (
            <div className="space-y-1.5 text-left">
              <Label>Na tyhle se zaměř</Label>
              {missed.map((m) => (
                <div key={m.word} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold">{m.word}</div>
                    <div className="text-xs text-muted">{m.sound.tip}</div>
                  </div>
                  <button onClick={() => speak(m.word, { rate: 0.75 })} className="grid size-8 place-items-center rounded-lg border border-line text-accent">
                    <Volume2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </GameEnd>
      </div>
    );

  const next = () => {
    setTries(0);
    setHeard(null);
    setState('ask');
    setI((x) => x + 1);
  };
  const submit = (said: string) => {
    const t = tries + 1;
    setTries(t);
    setHeard(said);
    if (has(said, it.word)) {
      setState('ok');
      const first = t === 1;
      const c = first ? combo + 1 : 0;
      const gain = first ? 4 + (c >= 3 ? 1 : 0) : 2;
      setCombo(c);
      if (first) setScore((s) => s + 1);
      setXp((x) => x + gain);
      recordActivity('pronounce', gain);
      sfx.correct(Math.max(1, c));
    } else {
      setCombo(0);
      sfx.wrong();
      recordActivity('pronounce', 0);
      if (t >= TRIES) {
        setState('fail');
        setMissed((m) => [...m, it]);
      }
    }
  };
  const confused = heard && it.not && has(heard, it.not);

  return (
    <div>
      <GameHeader title="Výslovnost" subtitle={`${score} napoprvé · ${xp} XP`} i={i} total={items.length} combo={combo} onBack={() => setPick(null)} />
      <Card key={i} className="mb-4 space-y-4 text-center animate-up">
        <Label>Řekni nahlas</Label>
        <div className={cx('text-5xl font-extrabold tracking-tight', state === 'ok' && 'text-emerald-500', state === 'fail' && 'text-red-500')}>{it.word}</div>
        {it.not && (
          <div className="text-xs text-muted">
            Pozor, ať to nezní jako <b>{it.not}</b>
          </div>
        )}
        <div className="flex justify-center gap-2">
          <Btn variant="secondary" className="h-10" onClick={() => speak(it.word)}>
            <Volume2 className="size-4" /> Poslech
          </Btn>
          <Btn variant="secondary" className="h-10" onClick={() => speak(it.word, { rate: 0.6 })}>
            Pomalu
          </Btn>
        </div>
        <div className="flex gap-2 rounded-xl bg-amber-500/8 px-3 py-2 text-left text-xs">
          <Icon name="bulb" className="size-4 text-amber-500" />
          <span>{it.sound.tip}</span>
        </div>
        {heard !== null && (
          <div className={cx('rounded-xl px-3 py-2 text-sm', state === 'ok' ? 'bg-emerald-500/10' : 'bg-red-500/8')}>
            <div className="flex items-center justify-center gap-1.5 font-semibold">
              {state === 'ok' ? <Check className="size-4 text-emerald-500" /> : <X className="size-4 text-red-500" />}
              Mikrofon slyšel: „{heard}“
            </div>
            {state !== 'ok' && (
              <div className="mt-0.5 text-xs text-muted">
                {confused ? `To je jiné slovo (${it.not})! ` : ''}
                {state === 'fail' ? 'Poslechni si to a jdi dál.' : `Zkus to znovu (pokus ${tries + 1} ze ${TRIES}).`}
              </div>
            )}
          </div>
        )}
      </Card>

      {state === 'ask' ? (
        <MicRecorder speakOnly resetKey={`${round}-${i}-${tries}`} submitLabel="Ověřit" hint="Ťukni na mikrofon a řekni slovo" onSubmit={submit} />
      ) : (
        <Btn variant="primary" className="h-12 w-full" onClick={next}>
          {i + 1 < items.length ? 'Další slovo' : 'Výsledky'} <ChevronRight className="size-4" />
        </Btn>
      )}
    </div>
  );
}
