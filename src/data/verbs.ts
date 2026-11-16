// Irregular verbs: base – past simple – past participle, Czech meaning and the level where they matter.
export interface Verb {
  base: string;
  past: string;
  pp: string;
  cz: string;
  level: number;
}

const RAW: [string, string, string, string, number][] = [
  ['be', 'was/were', 'been', 'být', 1],
  ['have', 'had', 'had', 'mít', 1],
  ['do', 'did', 'done', 'dělat', 1],
  ['go', 'went', 'gone', 'jít, jet', 1],
  ['get', 'got', 'got', 'dostat, získat', 1],
  ['make', 'made', 'made', 'udělat, vyrobit', 1],
  ['say', 'said', 'said', 'říct', 1],
  ['see', 'saw', 'seen', 'vidět', 1],
  ['come', 'came', 'come', 'přijít', 1],
  ['eat', 'ate', 'eaten', 'jíst', 1],
  ['drink', 'drank', 'drunk', 'pít', 1],
  ['buy', 'bought', 'bought', 'koupit', 1],
  ['give', 'gave', 'given', 'dát', 1],
  ['take', 'took', 'taken', 'vzít', 1],
  ['know', 'knew', 'known', 'vědět, znát', 1],
  ['think', 'thought', 'thought', 'myslet', 1],
  ['sleep', 'slept', 'slept', 'spát', 1],
  ['read', 'read', 'read', 'číst', 1],
  ['write', 'wrote', 'written', 'psát', 1],
  ['speak', 'spoke', 'spoken', 'mluvit', 1],
  ['find', 'found', 'found', 'najít', 2],
  ['tell', 'told', 'told', 'říct (někomu)', 2],
  ['feel', 'felt', 'felt', 'cítit (se)', 2],
  ['leave', 'left', 'left', 'odejít, nechat', 2],
  ['meet', 'met', 'met', 'potkat', 2],
  ['pay', 'paid', 'paid', 'zaplatit', 2],
  ['run', 'ran', 'run', 'běžet', 2],
  ['sit', 'sat', 'sat', 'sedět', 2],
  ['stand', 'stood', 'stood', 'stát', 2],
  ['swim', 'swam', 'swum', 'plavat', 2],
  ['drive', 'drove', 'driven', 'řídit', 2],
  ['ride', 'rode', 'ridden', 'jet (na kole, koni)', 2],
  ['fly', 'flew', 'flown', 'letět', 2],
  ['sing', 'sang', 'sung', 'zpívat', 2],
  ['begin', 'began', 'begun', 'začít', 2],
  ['bring', 'brought', 'brought', 'přinést', 2],
  ['send', 'sent', 'sent', 'poslat', 2],
  ['spend', 'spent', 'spent', 'utratit, strávit', 2],
  ['sell', 'sold', 'sold', 'prodat', 2],
  ['lose', 'lost', 'lost', 'ztratit, prohrát', 2],
  ['win', 'won', 'won', 'vyhrát', 2],
  ['put', 'put', 'put', 'položit, dát', 2],
  ['cut', 'cut', 'cut', 'říznout, stříhat', 2],
  ['hear', 'heard', 'heard', 'slyšet', 2],
  ['understand', 'understood', 'understood', 'rozumět', 2],
  ['forget', 'forgot', 'forgotten', 'zapomenout', 2],
  ['wake', 'woke', 'woken', 'probudit (se)', 2],
  ['wear', 'wore', 'worn', 'mít na sobě', 2],
  ['break', 'broke', 'broken', 'rozbít', 2],
  ['choose', 'chose', 'chosen', 'vybrat', 2],
  ['teach', 'taught', 'taught', 'učit (někoho)', 2],
  ['catch', 'caught', 'caught', 'chytit', 3],
  ['build', 'built', 'built', 'postavit', 3],
  ['keep', 'kept', 'kept', 'nechat si, udržet', 3],
  ['hold', 'held', 'held', 'držet', 3],
  ['lend', 'lent', 'lent', 'půjčit (někomu)', 3],
  ['become', 'became', 'become', 'stát se', 3],
  ['fall', 'fell', 'fallen', 'spadnout', 3],
  ['grow', 'grew', 'grown', 'růst, pěstovat', 3],
  ['draw', 'drew', 'drawn', 'kreslit', 3],
  ['throw', 'threw', 'thrown', 'hodit', 3],
  ['show', 'showed', 'shown', 'ukázat', 3],
  ['hide', 'hid', 'hidden', 'schovat', 3],
  ['bite', 'bit', 'bitten', 'kousnout', 3],
  ['shake', 'shook', 'shaken', 'třást', 3],
  ['steal', 'stole', 'stolen', 'ukrást', 3],
  ['hurt', 'hurt', 'hurt', 'zranit, bolet', 3],
  ['let', 'let', 'let', 'nechat, dovolit', 3],
  ['shut', 'shut', 'shut', 'zavřít', 3],
  ['set', 'set', 'set', 'nastavit', 3],
  ['fight', 'fought', 'fought', 'bojovat, hádat se', 3],
  ['feed', 'fed', 'fed', 'krmit', 3],
  ['lead', 'led', 'led', 'vést', 3],
  ['mean', 'meant', 'meant', 'znamenat, myslet', 3],
  ['light', 'lit', 'lit', 'zapálit', 3],
  ['ring', 'rang', 'rung', 'zvonit', 3],
  ['shine', 'shone', 'shone', 'svítit', 3],
  ['lie', 'lay', 'lain', 'ležet', 4],
  ['lay', 'laid', 'laid', 'položit', 4],
  ['rise', 'rose', 'risen', 'stoupat', 4],
  ['seek', 'sought', 'sought', 'hledat', 4],
  ['bear', 'bore', 'borne', 'snést, nést', 4],
  ['forbid', 'forbade', 'forbidden', 'zakázat', 4],
  ['forgive', 'forgave', 'forgiven', 'odpustit', 4],
  ['freeze', 'froze', 'frozen', 'zmrznout', 4],
  ['swear', 'swore', 'sworn', 'přísahat, nadávat', 4],
  ['tear', 'tore', 'torn', 'roztrhnout', 4],
  ['undertake', 'undertook', 'undertaken', 'podniknout', 4],
  ['withdraw', 'withdrew', 'withdrawn', 'stáhnout, vybrat (peníze)', 4],
  ['overcome', 'overcame', 'overcome', 'překonat', 4],
  ['spread', 'spread', 'spread', 'rozšířit (se)', 4],
  ['strike', 'struck', 'struck', 'udeřit', 4],
  ['bend', 'bent', 'bent', 'ohnout', 4],
  ['dig', 'dug', 'dug', 'kopat', 4],
  ['hang', 'hung', 'hung', 'pověsit', 4],
];

export const VERBS: Verb[] = RAW.map(([base, past, pp, cz, level]) => ({ base, past, pp, cz, level }));

export function verbsFor(level: number) {
  const lv = Math.min(level, 4);
  return VERBS.filter((v) => v.level <= lv);
}

/** Plausible wrong forms: regularised "-ed", the other form, the base, a vowel swap. */
export function wrongForms(v: Verb, which: 'past' | 'pp'): string[] {
  const right = which === 'past' ? v.past : v.pp;
  const other = which === 'past' ? v.pp : v.past;
  const reg = v.base.endsWith('e') ? `${v.base}d` : /[^aeiou]y$/.test(v.base) ? `${v.base.slice(0, -1)}ied` : `${v.base}ed`;
  const swaps: string[] = [];
  const m = right.match(/^(.*?)([aeiou]+)(.*)$/);
  if (m) for (const vw of ['a', 'o', 'u', 'i', 'ou', 'ea']) if (vw !== m[2]) swaps.push(`${m[1]}${vw}${m[3]}`);
  const cands = [other, reg, `${right}ed`, v.base, ...swaps];
  const out: string[] = [];
  for (const c of cands) if (c !== right && !out.includes(c) && !right.split('/').includes(c)) out.push(c);
  return out;
}
