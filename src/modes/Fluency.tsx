import { ChevronRight, Play, RotateCcw, Timer } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, IconTile } from '../components/icons';
import { MicRecorder } from '../components/MicRecorder';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, ModeHeader, cx } from '../components/ui';
import { sample } from '../data/wordbank';
import { navigate } from '../lib/router';
import { sfx } from '../lib/sfx';
import { getState, recordGame, recordSpeech, useStore } from '../lib/store';
import { celebrate } from '../lib/ui';

// Quick personal questions: answer out loud against the clock. Works offline (no AI needed).
const QUESTIONS: { en: string; cz: string; level: number; help: string[] }[] = [
  { level: 1, en: 'What is your name and where are you from?', cz: 'Jak se jmenuješ a odkud jsi?', help: ['My name is…', "I'm from…", 'I live in…'] },
  { level: 1, en: 'What do you do every morning?', cz: 'Co děláš každé ráno?', help: ['I get up at…', 'I have…', 'Then I…'] },
  { level: 1, en: 'What is your favourite food?', cz: 'Jaké je tvoje oblíbené jídlo?', help: ['My favourite food is…', 'I like… because…', 'I eat it…'] },
  { level: 1, en: 'Tell me about your family.', cz: 'Řekni mi o své rodině.', help: ['I have…', 'My mother is…', 'We live…'] },
  { level: 1, en: 'What do you do at the weekend?', cz: 'Co děláš o víkendu?', help: ['At the weekend I…', 'I usually…', 'Sometimes I…'] },
  { level: 1, en: 'Describe your room.', cz: 'Popiš svůj pokoj.', help: ['There is a…', 'There are…', 'My room is…'] },
  { level: 1, en: 'What can you do well?', cz: 'Co umíš dobře?', help: ['I can…', "I can't…", "I'm good at…"] },
  { level: 2, en: 'What did you do yesterday?', cz: 'Co jsi dělal včera?', help: ['Yesterday I…', 'After that I…', 'In the evening I…'] },
  { level: 2, en: 'Describe your last holiday.', cz: 'Popiš svou poslední dovolenou.', help: ['Last summer I went to…', 'We stayed…', 'The best thing was…'] },
  { level: 2, en: 'What are your plans for next weekend?', cz: 'Jaké máš plány na příští víkend?', help: ["I'm going to…", "I'd like to…", 'Maybe I will…'] },
  { level: 2, en: 'What is your job like?', cz: 'Jaká je tvoje práce?', help: ['I work as…', 'Every day I have to…', 'I like it because…'] },
  { level: 2, en: 'What is the best place in your town?', cz: 'Jaké je nejlepší místo ve tvém městě?', help: ['The best place is…', "It's…", 'You can…'] },
  { level: 2, en: 'Tell me about a good friend.', cz: 'Řekni mi o dobrém kamarádovi.', help: ["I've known… for…", "He's / She's…", 'We often…'] },
  { level: 2, en: 'What did you eat today?', cz: 'Co jsi dnes jedl?', help: ['For breakfast I had…', 'For lunch…', 'It was…'] },
  { level: 3, en: 'Why are you learning English?', cz: 'Proč se učíš anglicky?', help: ["I'm learning English because…", 'It helps me to…', 'In the future I want to…'] },
  { level: 3, en: 'What would you do with a million euros?', cz: 'Co bys dělal s milionem eur?', help: ['If I had…, I would…', 'First, I would…', "I wouldn't…"] },
  { level: 3, en: 'Describe a problem you solved recently.', cz: 'Popiš problém, který jsi nedávno vyřešil.', help: ['Recently I had a problem with…', 'So I decided to…', 'In the end…'] },
  { level: 3, en: 'What is something you have never done but would like to?', cz: 'Co jsi nikdy nedělal, ale chtěl bys?', help: ["I've never…", "I'd love to…", 'because…'] },
  { level: 3, en: 'Is it better to live in a city or in the countryside?', cz: 'Je lepší žít ve městě, nebo na venkově?', help: ['In my opinion…', 'On the one hand…', 'On the other hand…'] },
  { level: 3, en: 'Talk about a film or series you liked.', cz: 'Mluv o filmu nebo seriálu, který se ti líbil.', help: ["It's about…", 'What I liked was…', "I'd recommend it because…"] },
  { level: 3, en: 'How has your life changed in the last five years?', cz: 'Jak se ti změnil život za posledních pět let?', help: ["I've…", 'I used to…, but now…', 'The biggest change is…'] },
  { level: 4, en: 'Should social media be banned for children?', cz: 'Měly by být sociální sítě zakázané pro děti?', help: ['I strongly believe…', 'One argument is…', 'Having said that…'] },
  { level: 4, en: 'What makes a good manager?', cz: 'Co dělá dobrého manažera?', help: ['A good manager should…', 'For instance…', 'Above all…'] },
  { level: 4, en: 'Will AI take people\'s jobs?', cz: 'Vezme AI lidem práci?', help: ["It's likely that…", 'However…', 'In the long run…'] },
  { level: 4, en: 'Describe a decision you regret.', cz: 'Popiš rozhodnutí, kterého lituješ.', help: ['I wish I had…', 'If I had known…, I would have…', 'Looking back…'] },
  { level: 4, en: 'Is working from home the future?', cz: 'Je práce z domova budoucnost?', help: ['There are pros and cons.', 'What worries me is…', 'All things considered…'] },
];

const LENGTHS = [30, 45, 60];
const ROUND = 3;
const countWords = (t: string) => t.split(/\s+/).filter((w) => /[a-z]/i.test(w)).length;

/** "Mluv na čas" – answer three questions out loud, each against the clock. Measures fluency (words per minute). */
export default function Fluency() {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const qs = useMemo(() => {
    const lv = Math.min(level, 4);
    const pool = QUESTIONS.filter((q) => q.level === lv || q.level === lv - 1);
    return sample(pool, ROUND);
  }, [level, round]);
  const [secs, setSecs] = useState(45);
  const [i, setI] = useState(-1); // -1 = intro
  const [left, setLeft] = useState(secs);
  const [running, setRunning] = useState(false);
  const [stop, setStop] = useState(0);
  const [answers, setAnswers] = useState<{ q: string; text: string; words: number; secs: number }[]>([]);
  const [result, setResult] = useState<{ best: boolean } | null>(null);
  const prevBest = useRef(getState().games.fluency?.best ?? 0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setStop((s) => s + 1);
          sfx.tap();
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const q = qs[i];
  const done = i >= qs.length;
  const totalWords = answers.reduce((n, a) => n + a.words, 0);
  const totalSecs = answers.reduce((n, a) => n + a.secs, 0);
  const wpm = totalSecs ? Math.round((totalWords / totalSecs) * 60) : 0;

  useEffect(() => {
    if (done && answers.length && !result) {
      const best = recordGame('fluency', wpm, Math.max(wpm, 1));
      setResult({ best });
      if (wpm >= 60 || best) {
        celebrate();
        sfx.win();
      }
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (text: string) => {
    const used = Math.max(10, secs - left || secs);
    setRunning(false);
    const words = countWords(text);
    if (words) recordSpeech(text);
    setAnswers((a) => [...a, { q: q.en, text, words, secs: Math.min(used, secs) }]);
    setI((x) => x + 1);
    setLeft(secs);
  };

  if (i === -1)
    return (
      <div>
        <ModeHeader title="Mluv na čas" subtitle="Plynulost: odpovídej nahlas bez zastavování" />
        <Card className="space-y-5 text-center animate-up">
          <div className="flex justify-center">
            <IconTile name="mic" tone="emerald" size="lg" />
          </div>
          <div className="space-y-1.5 text-sm">
            <p>Dostaneš {ROUND} otázky. Na každou mluv, dokud neskončí čas.</p>
            <p className="text-muted">Neřeš chyby, jde o to nezastavit se. Když nevíš slovo, řekni to jinak.</p>
          </div>
          <div>
            <Label className="mb-2">Čas na odpověď</Label>
            <div className="flex justify-center gap-2">
              {LENGTHS.map((l) => (
                <button
                  key={l}
                  onClick={() => (setSecs(l), setLeft(l))}
                  className={cx('h-11 w-20 rounded-xl border-2 text-sm font-bold', secs === l ? 'border-accent bg-accent/10 text-accent' : 'border-line')}
                >
                  {l} s
                </button>
              ))}
            </div>
          </div>
          {prevBest.current > 0 && <div className="text-xs text-muted">Tvůj rekord: {prevBest.current} slov za minutu</div>}
          <Btn variant="primary" className="h-14 w-full text-lg" onClick={() => setI(0)}>
            <Play className="size-5" /> Začít
          </Btn>
        </Card>
      </div>
    );

  if (done)
    return (
      <div>
        <ModeHeader title="Mluv na čas" />
        <Card className="space-y-5 py-7 text-center animate-up">
          <div className="text-sm text-muted">Tvoje plynulost</div>
          <div>
            <div className="text-5xl font-extrabold tabular-nums text-accent">{wpm}</div>
            <div className="text-sm text-muted">slov za minutu</div>
          </div>
          <div className="mx-auto max-w-xs">
            <div className="relative h-3 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-sky-500" style={{ width: `${Math.min(100, (wpm / 140) * 100)}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted">
              <span>začátek</span>
              <span>60 plynule</span>
              <span>120+ rodilý</span>
            </div>
          </div>
          <div className="flex justify-center gap-2 text-xs">
            <span className="rounded-full bg-surface-2 px-3 py-1 font-semibold">{totalWords} slov</span>
            {result?.best && <span className="rounded-full bg-amber-500/14 px-3 py-1 font-bold text-amber-600 dark:text-amber-300">Nový rekord!</span>}
            {!result?.best && prevBest.current > 0 && <span className="rounded-full bg-surface-2 px-3 py-1">rekord {prevBest.current}</span>}
          </div>
          <div className="space-y-2 text-left">
            {answers.map((a) => (
              <div key={a.q} className="rounded-xl bg-surface-2 px-3 py-2">
                <div className="text-xs font-semibold">{a.q}</div>
                <div className="mt-0.5 text-sm text-muted">{a.text || '—'}</div>
                <div className="mt-1 text-[10px] text-muted tabular-nums">
                  {a.words} slov · {a.secs} s
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted">Chceš opravu chyb a rodilou verzi? Zkus Monolog s AI.</div>
          <div className="flex gap-2">
            <Btn className="flex-1" onClick={() => navigate('monologue')}>
              <Icon name="mic" className="size-4" /> Monolog
            </Btn>
            <Btn
              variant="primary"
              className="flex-1"
              onClick={() => {
                setAnswers([]);
                setResult(null);
                prevBest.current = getState().games.fluency?.best ?? 0;
                setRound((r) => r + 1);
                setI(0);
              }}
            >
              <RotateCcw className="size-4" /> Znovu
            </Btn>
          </div>
        </Card>
      </div>
    );

  return (
    <div>
      <ModeHeader
        title="Mluv na čas"
        subtitle={`Otázka ${i + 1} z ${qs.length}`}
        right={
          <span className={cx('inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold tabular-nums', running && left <= 10 ? 'bg-red-500/12 text-red-500' : running ? 'bg-emerald-500/12 text-emerald-600' : 'bg-surface-2')}>
            <Timer className="size-4" /> {left}s
          </span>
        }
      />
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-surface-3">
        <div className={cx('h-full transition-[width] duration-1000 ease-linear', left <= 10 ? 'bg-red-500' : 'bg-emerald-500')} style={{ width: `${(left / secs) * 100}%` }} />
      </div>
      <Card key={i} className="mb-4 space-y-3 animate-up">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="text-xl font-bold leading-snug">{q.en}</div>
            <div className="mt-1 text-sm text-muted">{q.cz}</div>
          </div>
          <SpeakButton text={q.en} compact />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {q.help.map((h) => (
            <span key={h} className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs">
              {h}
            </span>
          ))}
        </div>
      </Card>
      <MicRecorder
        resetKey={`fl-${round}-${i}`}
        stopSignal={stop || undefined}
        submitLabel={i + 1 < qs.length ? 'Další otázka' : 'Výsledek'}
        hint={running ? 'Mluv, dokud neskončí čas' : 'Zapni mikrofon, čas se spustí sám'}
        onListeningChange={(l) => {
          if (l && !running && left > 0) setRunning(true);
          if (!l && running) setRunning(false);
        }}
        onSubmit={submit}
      />
      {!running && left < secs && (
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-muted animate-fade">
          Čas vypršel nebo jsi zastavil. Odešli odpověď <ChevronRight className="size-3" />
        </div>
      )}
    </div>
  );
}
