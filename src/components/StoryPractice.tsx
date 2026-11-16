// Practice the English of a story (not the plot): fill in the missing word, build sentences, quiz the key words.
import { Check, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Story } from '../lib/ai';
import type { Phrase } from '../data/phrases';
import { shuffle, type Word } from '../data/wordbank';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { addVocab, hasVocab, recordActivity, recordGame } from '../lib/store';
import { toast } from '../lib/ui';
import Builder from '../modes/Builder';
import Quiz from '../modes/Quiz';
import { GameEnd } from './game';
import { IconTile } from './icons';
import { SpeakButton } from './Speak';
import { Btn, Card, Label, ModeHeader, cx } from './ui';

const STOP = new Set(
  'the a an and but or so to of in on at for with from by is are was were be been am i you he she it we they my your his her our their me him us them this that these those there here not no do does did have has had will would can could just very then than when what who how why if as into about after before up out over all some any one two three'.split(' '),
);

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const findIn = (sentence: string, w: string) => new RegExp(`\\b${esc(w)}\\b`, 'i').exec(sentence);

interface Gap {
  sentence: string;
  cz: string;
  answer: string;
  options: string[];
}

function buildGaps(story: Story): Gap[] {
  const keys = (story.words ?? []).map((w) => w.en);
  const content = (s: string) => (s.match(/[A-Za-z][A-Za-z'-]{2,}/g) ?? []).filter((w) => !STOP.has(w.toLowerCase()));
  const pool = [...new Set(story.sentences.flatMap((s) => content(s.en)).map((w) => w.toLowerCase()))];
  const out: Gap[] = [];
  for (const s of shuffle(story.sentences)) {
    // prefer a key word of the story that really appears in this sentence
    const key = keys.find((k) => findIn(s.en, k) && !out.some((g) => g.answer.toLowerCase() === k.toLowerCase()));
    let answer = key ? findIn(s.en, key)![0] : undefined;
    if (!answer) {
      const c = content(s.en).filter((w) => w.length >= 4 && !out.some((g) => g.answer.toLowerCase() === w.toLowerCase()));
      answer = c.sort((a, b) => b.length - a.length)[Math.floor(Math.random() * Math.min(2, c.length))];
    }
    if (!answer) continue;
    const isPhrase = answer.includes(' ');
    const same = (isPhrase ? keys.filter((k) => k.includes(' ')) : pool).filter((w) => w.toLowerCase() !== answer!.toLowerCase());
    const near = shuffle(same).sort((a, b) => Math.abs(a.length - answer!.length) - Math.abs(b.length - answer!.length));
    const opts = [answer, ...near.slice(0, 3)];
    if (opts.length < 3) continue;
    out.push({ sentence: s.en, cz: s.cz, answer, options: shuffle(opts) });
    if (out.length >= 8) break;
  }
  return out;
}

function GapGame({ story, onDone }: { story: Story; onDone: () => void }) {
  const [round, setRound] = useState(0);
  const gaps = useMemo(() => buildGaps(story), [story, round]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [result, setResult] = useState<{ best: boolean } | null>(null);
  useEffect(() => {
    setI(0);
    setPicked(null);
    setScore(0);
    setXp(0);
    setResult(null);
  }, [gaps]);
  useEffect(() => {
    if (gaps.length && i === gaps.length && !result) setResult({ best: recordGame('story-gaps', score, gaps.length) });
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const g = gaps[i];
  if (!g)
    return <GameEnd score={score} total={gaps.length} xp={xp} best={result?.best} extra="slov doplněno správně" onAgain={() => setRound((r) => r + 1)} onContinue={onDone} />;

  const m = findIn(g.sentence, g.answer)!;
  const before = g.sentence.slice(0, m.index);
  const after = g.sentence.slice(m.index + m[0].length);
  const choose = (o: string) => {
    if (picked) return;
    setPicked(o);
    speak(g.sentence);
    if (o.toLowerCase() === g.answer.toLowerCase()) {
      setScore((s) => s + 1);
      setXp((x) => x + 3);
      recordActivity('stories', 3);
      sfx.correct();
    } else {
      recordActivity('stories', 0);
      sfx.wrong();
    }
  };
  const ok = picked?.toLowerCase() === g.answer.toLowerCase();

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(i / gaps.length) * 100}%` }} />
        </div>
        <span className="text-[11px] tabular-nums text-muted">
          {i + 1}/{gaps.length}
        </span>
      </div>
      <Card key={i} className="mb-4 animate-up">
        <Label>Doplň slovo z příběhu</Label>
        <div className="mt-2 text-xl font-semibold leading-relaxed">
          {before}
          <span
            className={cx(
              'mx-0.5 inline-block min-w-12 rounded-md border-b-4 px-1.5 text-center',
              !picked ? 'border-accent bg-accent/10 text-transparent' : ok ? 'border-emerald-500 bg-emerald-500/12 text-emerald-600 dark:text-emerald-300' : 'border-red-500 bg-red-500/10 text-red-500',
            )}
          >
            {picked ? m[0] : '____'}
          </span>
          {after}
        </div>
        <div className="mt-2 text-sm text-muted">{g.cz}</div>
      </Card>
      <div className="grid grid-cols-2 gap-2.5">
        {g.options.map((o) => {
          const right = o.toLowerCase() === g.answer.toLowerCase();
          return (
            <button
              key={o}
              disabled={!!picked}
              onClick={() => choose(o)}
              className={cx(
                'min-h-14 rounded-2xl border-2 px-3 py-2 text-base font-semibold transition active:scale-95',
                !picked && 'border-line bg-surface',
                picked && right && 'border-emerald-500 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
                picked && !right && o === picked && 'border-red-500 bg-red-500/10 text-red-500 animate-shake',
                picked && !right && o !== picked && 'border-line opacity-40',
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
      {picked && (
        <Btn variant="primary" className="mt-4 h-12 w-full animate-up" onClick={() => (setPicked(null), setI((x) => x + 1))}>
          {i + 1 < gaps.length ? 'Další' : 'Výsledky'} <ChevronRight className="size-4" />
        </Btn>
      )}
    </div>
  );
}

type Mode = 'menu' | 'gaps' | 'build' | 'quiz';

export function StoryPractice({ story, onActive }: { story: Story; onActive?: (active: boolean) => void }) {
  const [mode, setMode] = useState<Mode>('menu');
  useEffect(() => {
    onActive?.(mode !== 'menu');
    window.scrollTo(0, 0);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const [done, setDone] = useState<Mode[]>([]);
  const [, bump] = useState(0);
  const finish = (m: Mode) => () => {
    setDone((d) => (d.includes(m) ? d : [...d, m]));
    setMode('menu');
  };

  // sentences short enough to build from tiles
  const phrases: Phrase[] = useMemo(
    () =>
      story.sentences
        .filter((s) => {
          const n = s.en.split(/\s+/).length;
          return n >= 3 && n <= 12 && !/["“”]/.test(s.en);
        })
        .slice(0, 8)
        .map((s, k) => ({ id: `story-${k}`, level: 2, cz: s.cz, en: s.en })),
    [story],
  );
  const words: Word[] = useMemo(
    () =>
      (story.words ?? []).map((w) => {
        const s = story.sentences.find((x) => findIn(x.en, w.en));
        const example = s ? s.en.replace(findIn(s.en, w.en)![0], (m) => `{${m}}`) : `{${w.en}}`;
        return { en: w.en, cz: w.cz, pos: w.en.includes(' ') ? 'phrase' : '', example, from: story.title };
      }),
    [story],
  );

  if (mode === 'gaps')
    return (
      <div>
        <ModeHeader title="Doplň slovo" subtitle={story.title} onBack={() => setMode('menu')} />
        <GapGame story={story} onDone={finish('gaps')} />
      </div>
    );
  if (mode === 'build') return <Builder phrases={phrases} onContinue={finish('build')} />;
  if (mode === 'quiz') return <Quiz words={words} title="Slovíčka z příběhu" onContinue={finish('quiz')} />;

  const items: { m: Mode; title: string; desc: string; icon: 'target' | 'layers' | 'cards'; tone: 'amber' | 'sky' | 'pink'; ok: boolean }[] = [
    { m: 'gaps', title: 'Doplň chybějící slovo', desc: 'Věty z příběhu s mezerou', icon: 'target', tone: 'amber', ok: story.sentences.length >= 3 },
    { m: 'build', title: 'Slož větu z příběhu', desc: 'Česká věta → poskládej angličtinu', icon: 'layers', tone: 'sky', ok: phrases.length >= 2 },
    { m: 'quiz', title: 'Kvíz slovíček z příběhu', desc: `${words.length} klíčových slov a frází`, icon: 'cards', tone: 'pink', ok: words.length >= 3 },
  ];

  return (
    <div className="space-y-4">
      <Card className="divide-y divide-line p-0">
        {items
          .filter((x) => x.ok)
          .map((x) => (
            <button key={x.m} onClick={() => setMode(x.m)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-2">
              {done.includes(x.m) ? (
                <span className="grid size-9 place-items-center rounded-xl bg-emerald-500 text-white">
                  <Check className="size-5" />
                </span>
              ) : (
                <IconTile name={x.icon} tone={x.tone} size="sm" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{x.title}</span>
                <span className="block text-xs text-muted">{x.desc}</span>
              </span>
              <ChevronRight className="size-4 text-muted" />
            </button>
          ))}
      </Card>

      {words.length > 0 && (
        <section>
          <Label className="mb-2">Slovíčka z příběhu</Label>
          <Card className="divide-y divide-line p-0">
            {words.map((w) => {
              const has = hasVocab(w.en);
              return (
                <div key={w.en} className="flex items-center gap-2 px-4 py-2.5">
                  <div className="min-w-0 flex-1 text-sm">
                    <span className="font-semibold">{w.en}</span> <span className="text-muted">= {w.cz}</span>
                  </div>
                  <SpeakButton text={w.en} compact />
                  <button
                    disabled={has}
                    aria-label="Uložit do slovíček"
                    onClick={() => {
                      if (addVocab({ en: w.en, cz: w.cz, pos: w.pos || 'word', example: w.example, source: 'click' })) toast(`Uloženo: ${w.en}`);
                      bump((x) => x + 1);
                    }}
                    className={cx('grid size-8 place-items-center rounded-lg border', has ? 'border-emerald-500/40 text-emerald-500' : 'border-line text-accent')}
                  >
                    {has ? <Check className="size-4" /> : <Plus className="size-4" />}
                  </button>
                </div>
              );
            })}
          </Card>
          <Btn
            className="mt-2 w-full text-xs"
            onClick={() => {
              const n = words.filter((w) => addVocab({ en: w.en, cz: w.cz, pos: w.pos || 'word', example: w.example, source: 'click' })).length;
              toast(n ? `Uloženo ${n} slovíček` : 'Všechna už máš');
              bump((x) => x + 1);
            }}
          >
            <Plus className="size-4" /> Uložit všechna do opakování
          </Btn>
        </section>
      )}
    </div>
  );
}
