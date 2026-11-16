import { ChevronRight, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Choice, GameEnd, GameHeader, type ChoiceState } from '../components/game';
import { Btn, Card, Label } from '../components/ui';
import { shuffle } from '../data/wordbank';
import { sfx } from '../lib/sfx';
import { speak, ttsSupported } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';

const ROUND = 10;
type Kind = 'number' | 'price' | 'time' | 'year' | 'phone' | 'date';
interface Q {
  kind: Kind;
  say: string;
  answer: string;
  options: string[];
}

const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const uniq = (answer: string, cands: string[]) => {
  const out: string[] = [];
  for (const c of shuffle(cands)) if (c !== answer && !out.includes(c)) out.push(c);
  return shuffle([answer, ...out.slice(0, 3)]);
};

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function say2(n: number): string {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
}
const ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth', 'thirtieth', 'thirty-first'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_CZ = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];

function make(kind: Kind): Q {
  switch (kind) {
    case 'number': {
      // the classic trap: thirteen vs thirty, fifteen vs fifty…
      const d = rnd(3, 9);
      const teen = 10 + d;
      const ten = d * 10;
      const n = pick([teen, ten, rnd(21, 99), rnd(101, 999)]);
      if (n === teen || n === ten) {
        const a = String(n);
        return { kind, say: String(n), answer: a, options: uniq(a, [String(teen), String(ten), String(ten + d), String(teen + 1), String(ten + 10)]) };
      }
      const a = String(n);
      const swapped = a.length === 2 ? `${a[1]}${a[0]}` : `${a[0]}${a[2]}${a[1]}`;
      return { kind, say: a, answer: a, options: uniq(a, [swapped, String(n + 10), String(n - 10), String(n + 1), String(n + 100)].filter((x) => !x.startsWith('-') && x !== '0')) };
    }
    case 'price': {
      const e = rnd(2, 99);
      const c = pick([0, 50, 99, 20, 75, 15]);
      const fmt = (x: number, y: number) => `£${x}.${String(y).padStart(2, '0')}`;
      const a = fmt(e, c);
      const say = c ? `${e} pounds ${c}` : `${e} pounds`;
      const teenSwap = e >= 13 && e <= 19 ? (e - 10) * 10 : e % 10 === 0 && e >= 30 ? e / 10 + 10 : e + 10;
      return { kind, say, answer: a, options: uniq(a, [fmt(teenSwap, c), fmt(e, c === 50 ? 15 : 50), fmt(e + 1, c), fmt(Math.max(1, e - 1), c), fmt(e, (c + 10) % 100)]) };
    }
    case 'time': {
      const h = rnd(1, 12);
      const m = pick([0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55]);
      const nh = (h % 12) + 1;
      let say = '';
      if (m === 0) say = `${say2(h)} o'clock`;
      else if (m === 15) say = `quarter past ${say2(h)}`;
      else if (m === 30) say = `half past ${say2(h)}`;
      else if (m === 45) say = `quarter to ${say2(nh)}`;
      else if (m < 30) say = `${say2(m)} past ${say2(h)}`;
      else say = `${say2(60 - m)} to ${say2(nh)}`;
      const fmt = (x: number, y: number) => `${x}:${String(y).padStart(2, '0')}`;
      const a = fmt(h, m);
      // "half past three" is 3:30, not 2:30 like Czech "půl čtvrté"
      const czTrap = m === 30 ? fmt(h === 1 ? 12 : h - 1, 30) : m > 30 ? fmt(nh, 60 - m) : fmt(h, 60 - m || 30);
      return { kind, say, answer: a, options: uniq(a, [czTrap, fmt(nh, m), fmt(h, (m + 30) % 60), fmt(h === 1 ? 12 : h - 1, m)]) };
    }
    case 'year': {
      const y = pick([rnd(1900, 1999), rnd(2000, 2009), rnd(2010, 2030), rnd(1800, 1899)]);
      const a = String(y);
      const say = y >= 2000 && y < 2010 ? `two thousand and ${ONES[y - 2000]}` : `${say2(Math.floor(y / 100))} ${y % 100 === 0 ? 'hundred' : y % 100 < 10 ? `oh ${ONES[y % 100]}` : say2(y % 100)}`;
      const lo = y % 100;
      const teenSwap = lo >= 13 && lo <= 19 ? y - lo + (lo - 10) * 10 : lo % 10 === 0 && lo >= 30 ? y - lo + lo / 10 + 10 : y + 10;
      return { kind, say, answer: a, options: uniq(a, [String(teenSwap), String(y + 100), String(y - 1), String(y + 1), String(y - 100)]) };
    }
    case 'phone': {
      const digits = Array.from({ length: 6 }, () => rnd(0, 9));
      const a = `${digits.slice(0, 3).join('')} ${digits.slice(3).join('')}`;
      const say = digits.map((d) => (d === 0 ? 'oh' : ONES[d])).join(', ');
      const mut = () => {
        const x = [...digits];
        const k = rnd(0, 5);
        x[k] = (x[k] + pick([1, 2, 3, 5])) % 10;
        return `${x.slice(0, 3).join('')} ${x.slice(3).join('')}`;
      };
      const swap = () => {
        const x = [...digits];
        const k = rnd(0, 4);
        [x[k], x[k + 1]] = [x[k + 1], x[k]];
        return `${x.slice(0, 3).join('')} ${x.slice(3).join('')}`;
      };
      return { kind, say, answer: a, options: uniq(a, [mut(), mut(), swap(), mut()]) };
    }
    case 'date': {
      const d = rnd(1, 28);
      const mo = rnd(0, 11);
      const fmt = (x: number, y: number) => `${x}. ${MONTHS_CZ[y]}`;
      const a = fmt(d, mo);
      const say = `the ${ORD[d]} of ${MONTHS[mo]}`;
      return { kind, say, answer: a, options: uniq(a, [fmt(d, (mo + 1) % 12), fmt(Math.min(28, d + 1), mo), fmt(d >= 13 && d <= 19 ? d + 10 : Math.max(1, d - 2), mo), fmt(d, (mo + 11) % 12)]) };
    }
  }
}

const LABEL: Record<Kind, string> = {
  number: 'Jaké číslo zaznělo?',
  price: 'Kolik to stojí?',
  time: 'Kolik je hodin?',
  year: 'Který rok zazněl?',
  phone: 'Jaké číslo ti diktují?',
  date: 'Jaké je datum?',
};

const TIP: Partial<Record<Kind, string>> = {
  number: 'Pozor: -teen (13–19) má přízvuk na konci „thirTEEN“, -ty (30, 40…) na začátku „THIRty“.',
  time: '„Half past three“ = 3:30 (ne půl třetí!). „Quarter to four“ = 3:45.',
  year: 'Roky se čtou po dvojicích: 1995 = nineteen ninety-five, 2008 = two thousand and eight.',
  phone: 'Nula se v telefonních číslech často čte „oh“.',
  date: 'Datum se říká řadovou číslovkou: the third of May.',
};

function build(level: number): Q[] {
  const kinds: Kind[] = level <= 1 ? ['number', 'number', 'price', 'time', 'phone'] : ['number', 'price', 'time', 'year', 'phone', 'date'];
  return Array.from({ length: ROUND }, (_, i) => make(kinds[(i + Math.floor(Math.random() * kinds.length)) % kinds.length]));
}

/** Listening to numbers, prices, times, years and dates – a classic weak spot. */
export default function Numbers() {
  const level = useStore((s) => s.settings.level);
  const [round, setRound] = useState(0);
  const qs = useMemo(() => build(level), [level, round]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [slow, setSlow] = useState(false);
  const [result, setResult] = useState<{ best: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const q = qs[i];

  useEffect(() => {
    setI(0);
    setPicked(null);
    setScore(0);
    setXp(0);
    setCombo(0);
    setResult(null);
  }, [qs]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (q) {
      const t = setTimeout(() => speak(q.say), 250);
      return () => clearTimeout(t);
    }
  }, [q]);
  useEffect(() => {
    if (qs.length && i === qs.length && !result) setResult({ best: recordGame('numbers', score, qs.length) });
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ttsSupported)
    return (
      <div>
        <GameHeader title="Čísla poslechem" i={0} total={1} combo={0} />
        <Card className="text-center text-sm text-muted">Tento prohlížeč neumí přehrávat řeč.</Card>
      </div>
    );

  if (!q)
    return (
      <div>
        <GameHeader title="Čísla poslechem" i={qs.length} total={qs.length} combo={0} />
        <GameEnd score={score} total={qs.length} xp={xp} best={result?.best} extra="správně napoprvé" onAgain={() => setRound((r) => r + 1)} />
      </div>
    );

  const next = () => {
    clearTimeout(timer.current);
    setPicked(null);
    setI((x) => x + 1);
  };
  const choose = (o: string) => {
    if (picked) return;
    setPicked(o);
    if (o === q.answer) {
      const c = combo + 1;
      const gain = 3 + (c >= 3 ? 1 : 0);
      setCombo(c);
      setScore((s) => s + 1);
      setXp((x) => x + gain);
      recordActivity('numbers', gain);
      sfx.correct(c);
      timer.current = setTimeout(next, 900);
    } else {
      setCombo(0);
      recordActivity('numbers', 0);
      sfx.wrong();
    }
  };
  const replay = (s = slow) => speak(q.say, s ? { rate: 0.6 } : {});
  const stateOf = (o: string): ChoiceState => (!picked ? 'idle' : o === q.answer ? 'correct' : o === picked ? 'wrong' : 'dim');

  return (
    <div>
      <GameHeader title="Čísla poslechem" subtitle={`${score} správně · ${xp} XP`} i={i} total={qs.length} combo={combo} />
      <Card key={i} className="mb-4 space-y-4 text-center animate-up">
        <Label>{LABEL[q.kind]}</Label>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => replay()} aria-label="Přehrát znovu" className="grid size-20 place-items-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 active:scale-95">
            <Volume2 className="size-9" />
          </button>
          <button
            onClick={() => {
              setSlow(true);
              replay(true);
            }}
            className="rounded-full border border-line bg-surface-2 px-3 py-2 text-xs font-semibold"
          >
            Pomaleji
          </button>
        </div>
        {picked && <div className="text-sm text-muted animate-fade">„{q.say}“</div>}
      </Card>
      <div className="grid grid-cols-2 gap-2.5">
        {q.options.map((o) => (
          <Choice key={o} state={stateOf(o)} onClick={() => choose(o)}>
            <span className="block text-center text-lg font-bold tabular-nums">{o}</span>
          </Choice>
        ))}
      </div>
      {picked && picked !== q.answer && (
        <Card className="mt-4 space-y-3 border-amber-500/30 animate-up">
          {TIP[q.kind] && <div className="text-sm">{TIP[q.kind]}</div>}
          <Btn variant="primary" className="h-12 w-full" onClick={next}>
            Další <ChevronRight className="size-4" />
          </Btn>
        </Card>
      )}
    </div>
  );
}
