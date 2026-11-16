import type { Phrase } from '../data/phrases';

// Offline answer matching for the phrase sprint: tolerant to contractions, UK/US spelling
// and small speech-recognition typos.

function normalize(s: string) {
  return (
    ' ' +
    s
      .toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/\bcan't\b/g, 'can not')
      .replace(/\bcannot\b/g, 'can not')
      .replace(/\bwon't\b/g, 'will not')
      .replace(/n't\b/g, ' not')
      .replace(/'re\b/g, ' are')
      .replace(/\bi'm\b/g, 'i am')
      .replace(/'ll\b/g, ' will')
      .replace(/'ve\b/g, ' have')
      .replace(/'d\b/g, ' would')
      .replace(/\b(it|that|there|what|he|she|where|how|who|here)'s\b/g, '$1 is')
      .replace(/\bo'clock\b/g, 'oclock')
      .replace(/ise\b/g, 'ize')
      .replace(/practice/g, 'practize')
      .replace(/\bok\b|\bokay\b/g, 'okay')
      .replace(/\bmovie\b/g, 'film')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

const UNITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** "twenty five" → "25", "five" → "5", so spoken digits and words compare equal. */
function numbers(ws: string[]) {
  const out: string[] = [];
  for (let i = 0; i < ws.length; i++) {
    const t = TENS.indexOf(ws[i]);
    if (t >= 2) {
      const u = UNITS.indexOf(ws[i + 1] ?? '');
      if (u >= 1 && u <= 9) {
        out.push(String(t * 10 + u));
        i++;
      } else out.push(String(t * 10));
      continue;
    }
    const u = UNITS.indexOf(ws[i]);
    out.push(u >= 0 ? String(u) : ws[i]);
  }
  return out;
}

export const words = (s: string) => numbers(normalize(s).trim().split(' ').filter(Boolean));

function lev<T>(a: T[], b: T[], eq: (x: T, y: T) => boolean) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (eq(a[i - 1], b[j - 1]) ? 0 : 1));
  return dp[a.length][b.length];
}

const charLev = (a: string, b: string) => lev([...a], [...b], (x, y) => x === y);
// tolerate small speech-recognition typos inside longer words
export const sameWord = (a: string, b: string) => a === b || (a.length >= 5 && b.length >= 5 && charLev(a, b) <= 1);

export type Verdict = 'ok' | 'close' | 'wrong';

/**
 * strict: words must match exactly (writing = correct spelling, speaking = the recogniser heard
 * exactly that word, so a mispronounced word fails). Case, punctuation and contractions still don't matter.
 */
export function checkPhrase(p: Pick<Phrase, 'en' | 'alt'>, answer: string, strict = false): { verdict: Verdict; target: string } {
  const a = words(answer);
  let best = { d: Infinity, target: p.en };
  for (const t of [p.en, ...(p.alt ?? [])]) {
    const d = lev(a, words(t), strict ? (x: string, y: string) => x === y : sameWord);
    if (d < best.d) best = { d, target: t };
  }
  const len = words(best.target).length;
  if (best.d === 0) return { verdict: 'ok', target: best.target };
  if (best.d === 1 && len >= 4) return { verdict: 'close', target: best.target };
  return { verdict: 'wrong', target: p.en };
}

