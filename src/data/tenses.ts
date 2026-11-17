// English tenses: an overview for Czech learners + a practice bank.
// Verb forms in the exercises are generated (conjugate), so every item can also offer the same verb
// in the other tenses as wrong options.
import { VERBS } from './verbs';

export type TenseId = 'ps' | 'pc' | 'pas' | 'pac' | 'pp' | 'ppc' | 'pap' | 'will' | 'going' | 'fc' | 'fp';
export type TenseGroup = 'present' | 'past' | 'future';
export type Timeline = 'habit' | 'now' | 'past-point' | 'past-range' | 'past-to-now' | 'past-to-now-range' | 'before-past' | 'future-point' | 'plan' | 'future-range' | 'before-future';

export interface Tense {
  id: TenseId;
  en: string;
  cz: string;
  group: TenseGroup;
  level: number;
  /** one line for the overview table */
  when: string;
  /** short form pattern for the table */
  form: string;
  example: { en: string; cz: string };
  uses: { cz: string; en: string; tr: string }[];
  forms: { plus: [string, string]; minus: [string, string]; q: [string, string] };
  signals: string[];
  tips: string[];
  timeline: Timeline;
  color: string;
}

export const GROUPS: { id: TenseGroup; cz: string }[] = [
  { id: 'present', cz: 'Přítomnost' },
  { id: 'past', cz: 'Minulost' },
  { id: 'future', cz: 'Budoucnost' },
];

export const TENSES: Tense[] = [
  {
    id: 'ps',
    en: 'Present Simple',
    cz: 'Přítomný čas prostý',
    group: 'present',
    level: 1,
    when: 'Zvyky, opakované děje, fakta, rozvrhy',
    form: 'I work · he works',
    example: { en: 'I drink coffee every morning.', cz: 'Každé ráno piju kávu.' },
    uses: [
      { cz: 'Zvyky a opakované činnosti', en: 'I go to the gym twice a week.', tr: 'Chodím do posilovny dvakrát týdně.' },
      { cz: 'Obecné pravdy a fakta', en: 'Water boils at 100 degrees.', tr: 'Voda vře při 100 stupních.' },
      { cz: 'Trvalé situace (práce, bydliště)', en: 'She works in a bank.', tr: 'Pracuje v bance.' },
      { cz: 'Jízdní řády a programy', en: 'The train leaves at 6:15.', tr: 'Vlak odjíždí v 6:15.' },
      { cz: 'Stavová slovesa (like, know, want, need…)', en: 'I know what you mean.', tr: 'Vím, co myslíš.' },
    ],
    forms: {
      plus: ['I/you/we/they + sloveso · he/she/it + sloveso-s', 'He works. They work.'],
      minus: ["don't / doesn't + sloveso", "He doesn't work. They don't work."],
      q: ['Do / Does + podmět + sloveso?', 'Does he work? Do they work?'],
    },
    signals: ['always', 'usually', 'often', 'sometimes', 'never', 'every day', 'on Mondays', 'twice a week'],
    tips: [
      'U he/she/it nezapomeň na -s: she works, he goes, it costs. To je nejčastější chyba vůbec.',
      'Po does/doesn\'t už sloveso -s nemá: Does she work? (ne Does she works?)',
      'Česky „pracuju“ může být teď i obecně. Anglicky „I work“ = obecně, „I\'m working“ = právě teď.',
    ],
    timeline: 'habit',
    color: 'from-sky-500 to-blue-600',
  },
  {
    id: 'pc',
    en: 'Present Continuous',
    cz: 'Přítomný čas průběhový',
    group: 'present',
    level: 1,
    when: 'Právě teď, dočasně, domluvené plány',
    form: "I'm working · he's working",
    example: { en: "I'm cooking dinner right now.", cz: 'Zrovna vařím večeři.' },
    uses: [
      { cz: 'Co se děje právě teď', en: "Look! It's snowing.", tr: 'Podívej! Sněží.' },
      { cz: 'Dočasná situace v tomto období', en: "I'm staying with my sister this week.", tr: 'Tento týden bydlím u sestry.' },
      { cz: 'Domluvené plány do budoucna (s časem)', en: "I'm meeting Tom tomorrow at six.", tr: 'Zítra v šest se vidím s Tomem.' },
      { cz: 'Změny a vývoj', en: 'Prices are going up.', tr: 'Ceny rostou.' },
    ],
    forms: {
      plus: ['am / is / are + sloveso-ing', "I'm working. She's working."],
      minus: ["am not / isn't / aren't + -ing", "She isn't working."],
      q: ['Am / Is / Are + podmět + -ing?', 'Is she working?'],
    },
    signals: ['now', 'right now', 'at the moment', 'Look!', 'Listen!', 'this week', 'today', 'currently'],
    tips: [
      'Stavová slovesa (know, like, want, need, understand, believe) průběhový tvar většinou nemají: I know (ne I\'m knowing).',
      'Pravopis -ing: make → making, sit → sitting, lie → lying.',
      'Na domluvené plány je průběhový čas přirozenější než will: I\'m flying to Rome on Friday.',
    ],
    timeline: 'now',
    color: 'from-cyan-500 to-sky-600',
  },
  {
    id: 'pas',
    en: 'Past Simple',
    cz: 'Minulý čas prostý',
    group: 'past',
    level: 1,
    when: 'Ukončený děj v minulosti (víme kdy)',
    form: 'I worked · I went',
    example: { en: 'I went to Prague yesterday.', cz: 'Včera jsem jel do Prahy.' },
    uses: [
      { cz: 'Ukončený děj v určitém čase v minulosti', en: 'We moved to Brno in 2019.', tr: 'V roce 2019 jsme se přestěhovali do Brna.' },
      { cz: 'Řada dějů za sebou (vyprávění)', en: 'I got up, had a shower and left.', tr: 'Vstal jsem, osprchoval se a odešel.' },
      { cz: 'Minulé zvyky', en: 'I played tennis when I was a child.', tr: 'Jako dítě jsem hrál tenis.' },
    ],
    forms: {
      plus: ['sloveso-ed nebo 2. tvar nepravidelného slovesa', 'I worked. She went.'],
      minus: ["didn't + základní tvar", "She didn't go."],
      q: ['Did + podmět + základní tvar?', 'Did she go?'],
    },
    signals: ['yesterday', 'last week', 'last year', 'ago', 'in 2019', 'when I was…', 'then'],
    tips: [
      'Po did/didn\'t je základní tvar: Did you see? (ne Did you saw?)',
      'Sloveso be: I/he/she/it was, you/we/they were.',
      'Když řekneš KDY (yesterday, ago, in 2010), je to minulý čas, ne předpřítomný.',
    ],
    timeline: 'past-point',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'pac',
    en: 'Past Continuous',
    cz: 'Minulý čas průběhový',
    group: 'past',
    level: 2,
    when: 'Probíhalo v minulosti (a něco to přerušilo)',
    form: 'I was working',
    example: { en: 'I was reading when the phone rang.', cz: 'Četl jsem, když zazvonil telefon.' },
    uses: [
      { cz: 'Děj, který probíhal v určitém okamžiku v minulosti', en: 'At eight I was having dinner.', tr: 'V osm jsem večeřel.' },
      { cz: 'Delší děj přerušený krátkým (when + minulý prostý)', en: 'I was walking home when it started to rain.', tr: 'Šel jsem domů, když začalo pršet.' },
      { cz: 'Kulisa příběhu', en: 'The sun was shining and birds were singing.', tr: 'Svítilo slunce a zpívali ptáci.' },
      { cz: 'Dva děje probíhající zároveň (while)', en: 'While I was cooking, he was watching TV.', tr: 'Zatímco jsem vařil, on se díval na televizi.' },
    ],
    forms: {
      plus: ['was / were + sloveso-ing', 'I was working. They were working.'],
      minus: ["wasn't / weren't + -ing", "They weren't working."],
      q: ['Was / Were + podmět + -ing?', 'Were they working?'],
    },
    signals: ['while', 'when', 'at 8 o\'clock yesterday', 'all evening', 'at that moment'],
    tips: [
      'Dlouhý děj = průběhový, krátký přerušující = prostý: I was sleeping when you called.',
      'Česky to bývá nedokonavé sloveso („četl jsem“, „šel jsem“), ale jen když děj právě probíhal.',
    ],
    timeline: 'past-range',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'pp',
    en: 'Present Perfect',
    cz: 'Předpřítomný čas',
    group: 'present',
    level: 2,
    when: 'Minulost s dopadem na teď, zkušenosti, „už / ještě ne“, trvá dodnes',
    form: 'I have worked · she has gone',
    example: { en: "I've lived here for five years.", cz: 'Bydlím tady pět let.' },
    uses: [
      { cz: 'Životní zkušenost (kdy, to není důležité)', en: "I've been to London three times.", tr: 'Byl jsem v Londýně třikrát.' },
      { cz: 'Výsledek je vidět teď', en: "I've lost my keys. I can't get in.", tr: 'Ztratil jsem klíče. Nemůžu dovnitř.' },
      { cz: 'Stav, který začal v minulosti a trvá dodnes (for / since)', en: "We've known each other since school.", tr: 'Známe se od školy.' },
      { cz: 'S just, already, yet', en: "She hasn't finished yet.", tr: 'Ještě to nedokončila.' },
    ],
    forms: {
      plus: ['have / has + 3. tvar (příčestí)', "I've worked. She has gone."],
      minus: ["haven't / hasn't + 3. tvar", "She hasn't gone."],
      q: ['Have / Has + podmět + 3. tvar?', 'Has she gone?'],
    },
    signals: ['ever', 'never', 'already', 'just', 'yet', 'for', 'since', 'so far', 'this year', 'recently'],
    tips: [
      'Čeština tenhle čas nemá. „Bydlím tu pět let“ ≠ I live here for five years. Správně: I have lived here for five years.',
      'Nesmí tam být určitý minulý čas: I have seen him yesterday ✗ → I saw him yesterday ✓.',
      'for + doba (for two years), since + začátek (since 2020, since Monday).',
    ],
    timeline: 'past-to-now',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'ppc',
    en: 'Present Perfect Continuous',
    cz: 'Předpřítomný čas průběhový',
    group: 'present',
    level: 3,
    when: 'Jak dlouho už něco probíhá (a stále / právě skončilo)',
    form: 'I have been working',
    example: { en: "I've been waiting for an hour!", cz: 'Čekám už hodinu!' },
    uses: [
      { cz: 'Činnost začala v minulosti a pořád trvá (jak dlouho)', en: "I've been learning English for two years.", tr: 'Učím se anglicky dva roky.' },
      { cz: 'Činnost právě skončila a je vidět její následek', en: "I'm tired because I've been running.", tr: 'Jsem unavený, protože jsem běhal.' },
      { cz: 'Opakovaná činnost v poslední době', en: "I haven't been sleeping well recently.", tr: 'Poslední dobou nespím dobře.' },
    ],
    forms: {
      plus: ['have / has been + sloveso-ing', "She's been working all day."],
      minus: ["haven't / hasn't been + -ing", "I haven't been working."],
      q: ['Have / Has + podmět + been + -ing?', 'How long have you been working?'],
    },
    signals: ['for', 'since', 'how long', 'all day', 'all morning', 'recently', 'lately'],
    tips: [
      'Otázka „Jak dlouho…?“ s činností = How long have you been + -ing? (ne How long are you…).',
      'Se stavovými slovesy (know, have = vlastnit, be) použij prostý předpřítomný: I\'ve known him for years.',
      'Důraz na činnost a její délku. Kolik/kolikrát (výsledek) = předpřítomný prostý: I\'ve read three books.',
    ],
    timeline: 'past-to-now-range',
    color: 'from-fuchsia-500 to-pink-600',
  },
  {
    id: 'pap',
    en: 'Past Perfect',
    cz: 'Předminulý čas',
    group: 'past',
    level: 3,
    when: 'Stalo se ještě před jiným minulým dějem',
    form: 'I had worked',
    example: { en: 'When we arrived, the film had started.', cz: 'Když jsme dorazili, film už začal.' },
    uses: [
      { cz: 'Děj, který proběhl dřív než jiný minulý děj', en: 'She had left before I got there.', tr: 'Odešla dřív, než jsem tam přišel.' },
      { cz: 'Vysvětlení příčiny v minulosti', en: "I was hungry because I hadn't eaten all day.", tr: 'Měl jsem hlad, protože jsem celý den nejedl.' },
      { cz: 'Nepřímá řeč (posun časů)', en: 'He said he had seen the film.', tr: 'Řekl, že ten film viděl.' },
    ],
    forms: {
      plus: ['had + 3. tvar', 'I had finished.'],
      minus: ["hadn't + 3. tvar", "I hadn't finished."],
      q: ['Had + podmět + 3. tvar?', 'Had you finished?'],
    },
    signals: ['before', 'after', 'by the time', 'already', 'when', 'never… before'],
    tips: [
      'Použij ho, jen když je potřeba ukázat, co bylo DŘÍV. Když děje jdou po sobě, stačí minulý prostý.',
      'Pozor: I\'d může být I had (předminulý) i I would. V testech raději piš celé „had“.',
    ],
    timeline: 'before-past',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'will',
    en: 'Future Simple (will)',
    cz: 'Budoucí čas s will',
    group: 'future',
    level: 1,
    when: 'Rozhodnutí teď, sliby, nabídky, předpovědi',
    form: "I will work · I'll work",
    example: { en: "Don't worry, I'll help you.", cz: 'Neboj, pomůžu ti.' },
    uses: [
      { cz: 'Rozhodnutí v okamžiku mluvení', en: "I think I'll have the fish.", tr: 'Myslím, že si dám rybu.' },
      { cz: 'Sliby, nabídky, žádosti', en: "I'll call you later.", tr: 'Zavolám ti později.' },
      { cz: 'Předpověď podle názoru (think, probably)', en: 'I think it will be sunny tomorrow.', tr: 'Myslím, že zítra bude slunečno.' },
      { cz: 'Fakta o budoucnosti', en: "She'll be thirty next year.", tr: 'Příští rok jí bude třicet.' },
    ],
    forms: {
      plus: ['will + základní tvar', "I'll help. She will come."],
      minus: ["won't + základní tvar", "She won't come."],
      q: ['Will + podmět + základní tvar?', 'Will she come?'],
    },
    signals: ['tomorrow', 'next week', 'I think', 'probably', 'I promise', 'maybe', 'soon'],
    tips: [
      'Po will nikdy „to“ ani -s: She will come (ne will to come, ne will comes).',
      'Po when / if / before v budoucnosti will NENÍ: When I get home, I\'ll call you (ne When I will get).',
      'Will not = won\'t.',
    ],
    timeline: 'future-point',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'going',
    en: 'Going to',
    cz: 'Budoucnost s going to',
    group: 'future',
    level: 1,
    when: 'Plány a úmysly, jasné náznaky',
    form: "I'm going to work",
    example: { en: "I'm going to visit my grandma this weekend.", cz: 'Tento víkend jedu za babičkou.' },
    uses: [
      { cz: 'Plán nebo úmysl (rozhodnuto předem)', en: "We're going to buy a new car.", tr: 'Koupíme si nové auto. (Máme to v plánu.)' },
      { cz: 'Předpověď podle toho, co vidím', en: "Look at those clouds! It's going to rain.", tr: 'Podívej na ty mraky! Bude pršet.' },
    ],
    forms: {
      plus: ['am / is / are going to + základní tvar', "She's going to study."],
      minus: ["am not / isn't / aren't going to", "She isn't going to study."],
      q: ['Am / Is / Are + podmět + going to…?', 'Is she going to study?'],
    },
    signals: ['tonight', 'this weekend', 'next year', 'Look!', 'I\'ve decided'],
    tips: [
      'Will = rozhodnu se teď. Going to = rozhodnuto už dřív. „Telefon zvoní!“ – I\'ll get it. × „Zítra jdu k zubaři.“ – I\'m going to see the dentist.',
      'Going to go se dá zkrátit: I\'m going to the cinema tonight.',
    ],
    timeline: 'plan',
    color: 'from-lime-500 to-green-600',
  },
  {
    id: 'fc',
    en: 'Future Continuous',
    cz: 'Budoucí čas průběhový',
    group: 'future',
    level: 3,
    when: 'Bude to právě probíhat v určitém čase v budoucnu',
    form: 'I will be working',
    example: { en: 'This time tomorrow I will be lying on a beach.', cz: 'Zítra touhle dobou budu ležet na pláži.' },
    uses: [
      { cz: 'Děj bude probíhat v určitém okamžiku v budoucnu', en: "At ten tomorrow I'll be flying to Rome.", tr: 'Zítra v deset poletím do Říma.' },
      { cz: 'Zdvořilý dotaz na plány', en: 'Will you be using the car tonight?', tr: 'Budeš dnes večer potřebovat auto?' },
    ],
    forms: {
      plus: ['will be + sloveso-ing', "I'll be working."],
      minus: ["won't be + -ing", "I won't be working."],
      q: ['Will + podmět + be + -ing?', 'Will you be working?'],
    },
    signals: ['this time tomorrow', 'at 8 tomorrow', 'all day tomorrow', 'in a week'],
    tips: ['Je to „budoucí verze“ průběhového času: teď I\'m working, zítra v osm I\'ll be working.'],
    timeline: 'future-range',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    id: 'fp',
    en: 'Future Perfect',
    cz: 'Předbudoucí čas',
    group: 'future',
    level: 4,
    when: 'Bude hotové do určité doby v budoucnu',
    form: 'I will have worked',
    example: { en: "I'll have finished the report by Friday.", cz: 'Do pátku tu zprávu dokončím.' },
    uses: [
      { cz: 'Děj bude ukončený před určitým okamžikem v budoucnu', en: 'By the time you arrive, I will have cooked dinner.', tr: 'Než přijedeš, budu mít uvařeno.' },
      { cz: 'Jak dlouho to v budoucnu bude trvat', en: 'By June we will have lived here for ten years.', tr: 'V červnu tu budeme bydlet už deset let.' },
    ],
    forms: {
      plus: ['will have + 3. tvar', "I'll have finished."],
      minus: ["won't have + 3. tvar", "I won't have finished."],
      q: ['Will + podmět + have + 3. tvar?', 'Will you have finished?'],
    },
    signals: ['by Friday', 'by the time', 'by next year', 'before'],
    tips: ['Typické slovo je „by“ = do (určité doby): by Monday, by 2030.'],
    timeline: 'before-future',
    color: 'from-indigo-500 to-blue-700',
  },
];

export const tenseById = (id: TenseId) => TENSES.find((t) => t.id === id)!;

/** Pairs Czechs mix up, with the difference in one sentence. */
export const CONFUSIONS: { a: TenseId; b: TenseId; cz: string; ex: [string, string] }[] = [
  { a: 'ps', b: 'pc', cz: 'Prostý = obecně, pravidelně. Průběhový = právě teď nebo dočasně.', ex: ['I work in Brno.', "I'm working from home this week."] },
  { a: 'pas', b: 'pp', cz: 'Řekneš-li kdy (yesterday, in 2019), je to minulý. Když je důležitý výsledek nebo zkušenost a ne čas, je to předpřítomný.', ex: ['I saw that film last week.', "I've seen that film."] },
  { a: 'pas', b: 'pac', cz: 'Krátký ukončený děj × děj, který zrovna probíhal.', ex: ['The phone rang.', 'I was sleeping when the phone rang.'] },
  { a: 'pp', b: 'ppc', cz: 'Výsledek / kolik × jak dlouho probíhá činnost.', ex: ["I've written three emails.", "I've been writing emails all morning."] },
  { a: 'will', b: 'going', cz: 'Rozhodnutí teď × plán, který už máš.', ex: ["The phone's ringing. I'll get it.", "I'm going to see the dentist tomorrow."] },
  { a: 'pas', b: 'pap', cz: 'Předminulý jen tehdy, když je potřeba ukázat, co bylo ještě dřív.', ex: ['When I arrived, she left. (pak)', 'When I arrived, she had left. (už předtím)'] },
];

// ---------- verb forms ----------

const DOUBLE = new Set(['stop', 'sit', 'run', 'swim', 'get', 'put', 'begin', 'plan', 'shop', 'travel', 'chat', 'cut', 'win', 'forget', 'prefer', 'hit', 'set', 'jog', 'drop']);
const IRREG = new Map(VERBS.map((v) => [v.base, v]));

type Person = '1' | '3' | 'p';
function person(subj: string): Person {
  const s = subj.toLowerCase();
  if (s === 'i') return '1';
  if (s.startsWith('*') || ['you', 'we', 'they'].includes(s)) return 'p';
  return '3';
}
const showSubj = (s: string) => s.replace(/^\*/, '');

function s3(v: string) {
  if (v === 'be') return 'is';
  if (v === 'have') return 'has';
  if (/(s|sh|ch|x|z|o)$/.test(v)) return `${v}es`;
  if (/[^aeiou]y$/.test(v)) return `${v.slice(0, -1)}ies`;
  return `${v}s`;
}
function ing(v: string) {
  if (v === 'be') return 'being';
  if (v.endsWith('ie')) return `${v.slice(0, -2)}ying`;
  if (/(ee|ye|oe)$/.test(v)) return `${v}ing`;
  if (v.endsWith('e')) return `${v.slice(0, -1)}ing`;
  if (DOUBLE.has(v)) return `${v}${v.slice(-1)}ing`;
  return `${v}ing`;
}
function regPast(v: string) {
  if (v.endsWith('e')) return `${v}d`;
  if (/[^aeiou]y$/.test(v)) return `${v.slice(0, -1)}ied`;
  if (DOUBLE.has(v)) return `${v}${v.slice(-1)}ed`;
  return `${v}ed`;
}
const past = (v: string) => IRREG.get(v)?.past.split('/')[0] ?? regPast(v);
const pp = (v: string) => IRREG.get(v)?.pp.split('/')[0] ?? regPast(v);

const beNow = (p: Person) => (p === '1' ? 'am' : p === '3' ? 'is' : 'are');
const beNowNeg = (p: Person) => (p === '1' ? 'am not' : p === '3' ? "isn't" : "aren't");
const bePast = (p: Person) => (p === 'p' ? 'were' : 'was');

export type Pol = '+' | '-' | '?';

/** The verb phrase; for questions it includes the subject ("does she work"). */
export function conjugate(t: TenseId, pol: Pol, subj: string, v: string): string {
  const p = person(subj);
  const S = showSubj(subj);
  const have = p === '3' ? 'has' : 'have';
  const q = (aux: string, rest: string) => `${aux} ${S} ${rest}`.trim();
  switch (t) {
    case 'ps':
      if (v === 'be') return pol === '+' ? beNow(p) : pol === '-' ? beNowNeg(p) : `${beNow(p)} ${S}`;
      if (pol === '+') return p === '3' ? s3(v) : v;
      if (pol === '-') return `${p === '3' ? "doesn't" : "don't"} ${v}`;
      return q(p === '3' ? 'does' : 'do', v);
    case 'pc':
      return pol === '+' ? `${beNow(p)} ${ing(v)}` : pol === '-' ? `${beNowNeg(p)} ${ing(v)}` : q(beNow(p), ing(v));
    case 'pas':
      if (v === 'be') return pol === '+' ? bePast(p) : pol === '-' ? `${bePast(p)}n't` : `${bePast(p)} ${S}`;
      return pol === '+' ? past(v) : pol === '-' ? `didn't ${v}` : q('did', v);
    case 'pac':
      return pol === '+' ? `${bePast(p)} ${ing(v)}` : pol === '-' ? `${bePast(p)}n't ${ing(v)}` : q(bePast(p), ing(v));
    case 'pp':
      return pol === '+' ? `${have} ${pp(v)}` : pol === '-' ? `${have}n't ${pp(v)}` : q(have, pp(v));
    case 'ppc':
      return pol === '+' ? `${have} been ${ing(v)}` : pol === '-' ? `${have}n't been ${ing(v)}` : q(have, `been ${ing(v)}`);
    case 'pap':
      return pol === '+' ? `had ${pp(v)}` : pol === '-' ? `hadn't ${pp(v)}` : q('had', pp(v));
    case 'will':
      return pol === '+' ? `will ${v}` : pol === '-' ? `won't ${v}` : q('will', v);
    case 'going':
      return pol === '+' ? `${beNow(p)} going to ${v}` : pol === '-' ? `${beNowNeg(p)} going to ${v}` : q(beNow(p), `going to ${v}`);
    case 'fc':
      return pol === '+' ? `will be ${ing(v)}` : pol === '-' ? `won't be ${ing(v)}` : q('will', `be ${ing(v)}`);
    case 'fp':
      return pol === '+' ? `will have ${pp(v)}` : pol === '-' ? `won't have ${pp(v)}` : q('will', `have ${pp(v)}`);
  }
}

/** Wrong agreement (he work / they works) as an extra distractor for the present simple. */
export function agreementSlip(t: TenseId, pol: Pol, subj: string, v: string): string | null {
  if (t !== 'ps' || pol !== '+' || v === 'be') return null;
  return person(subj) === '3' ? v : s3(v);
}

// ---------- practice bank ----------

export interface TenseItem {
  id: string;
  tense: TenseId;
  pol: Pol;
  subj: string;
  verb: string;
  /** sentence with "_" where the verb phrase goes */
  tpl: string;
  cz: string;
  /** other tenses that are also correct here */
  also: TenseId[];
}

type Row = [Pol, string, string, string, string, string?];
const BANK: Record<TenseId, Row[]> = {
  ps: [
    ['+', 'she', 'work', 'She _ in a hospital.', 'Pracuje v nemocnici.'],
    ['+', 'I', 'get', 'I usually _ up at seven.', 'Obvykle vstávám v sedm.'],
    ['-', 'he', 'like', 'He _ coffee.', 'Nemá rád kávu.'],
    ['?', 'you', 'live', 'Where _?', 'Kde bydlíš?'],
    ['+', '*my parents', 'live', 'My parents _ in Brno.', 'Moji rodiče bydlí v Brně.'],
    ['+', 'the shop', 'open', 'The shop _ at nine every day.', 'Obchod otvírá každý den v devět.'],
    ['-', 'we', 'watch', 'We _ TV in the morning.', 'Ráno se nedíváme na televizi.'],
    ['?', 'she', 'speak', '_ English?', 'Mluví anglicky?'],
    ['+', 'water', 'boil', 'Water _ at 100 degrees.', 'Voda vře při 100 stupních.'],
    ['+', 'he', 'go', 'He _ to the gym twice a week.', 'Chodí do posilovny dvakrát týdně.'],
    ['?', 'it', 'cost', 'How much _?', 'Kolik to stojí?'],
    ['-', 'I', 'understand', 'Sorry, I _.', 'Promiň, nerozumím.'],
    ['+', 'my brother', 'study', 'My brother _ law.', 'Bratr studuje práva.'],
  ],
  pc: [
    ['+', 'I', 'cook', 'I _ dinner right now.', 'Zrovna vařím večeři.'],
    ['+', 'she', 'talk', 'Listen! She _ on the phone.', 'Poslouchej! Telefonuje.'],
    ['-', 'it', 'rain', 'It _ any more.', 'Už neprší.'],
    ['?', 'you', 'do', 'What _?', 'Co děláš?'],
    ['+', '*the children', 'play', 'The children _ in the garden at the moment.', 'Děti si zrovna hrají na zahradě.'],
    ['+', 'we', 'stay', 'We _ at a hotel this week.', 'Tento týden bydlíme v hotelu.'],
    ['?', 'he', 'work', '_ from home today?', 'Pracuje dnes z domova?'],
    ['-', 'I', 'listen', 'Sorry, I _.', 'Promiň, neposlouchám.'],
    ['+', '*prices', 'go', 'Prices _ up at the moment.', 'Ceny momentálně rostou.'],
    ['+', 'he', 'wait', 'Hurry up! He _ for us.', 'Pospěš si! Čeká na nás.'],
    ['+', 'I', 'meet', 'I _ Tom tomorrow at six.', 'Zítra v šest se vidím s Tomem. (domluveno)', 'going'],
    ['?', 'you', 'sit', 'Why _ on the floor?', 'Proč sedíš na zemi?'],
  ],
  pas: [
    ['+', 'I', 'go', 'I _ to Prague yesterday.', 'Včera jsem jel do Prahy.'],
    ['+', 'she', 'buy', 'She _ a new phone last week.', 'Minulý týden si koupila nový telefon.'],
    ['-', 'we', 'see', 'We _ the film last night.', 'Včera večer jsme ten film neviděli.'],
    ['?', 'you', 'enjoy', '_ the concert on Saturday?', 'Užil sis sobotní koncert?'],
    ['+', 'they', 'move', 'They _ to London in 2019.', 'V roce 2019 se přestěhovali do Londýna.'],
    ['+', 'he', 'be', 'He _ ill last week.', 'Minulý týden byl nemocný.'],
    ['+', 'we', 'be', 'We _ at home all evening yesterday.', 'Včera jsme byli celý večer doma.'],
    ['?', 'you', 'go', 'Where _ on holiday last year?', 'Kam jste loni jeli na dovolenou?'],
    ['-', 'I', 'sleep', 'I _ well last night.', 'Včera v noci jsem se dobře nevyspal.'],
    ['+', 'the train', 'arrive', 'The train _ ten minutes ago.', 'Vlak přijel před deseti minutami.'],
    ['+', 'I', 'stop', 'I _ smoking three years ago.', 'Před třemi lety jsem přestal kouřit.'],
    ['?', 'she', 'call', 'When _ you?', 'Kdy ti volala?'],
    ['+', 'we', 'study', 'We _ together at university.', 'Na univerzitě jsme studovali spolu.'],
  ],
  pac: [
    ['+', 'I', 'read', 'I _ a book when the phone rang.', 'Četl jsem knihu, když zazvonil telefon.'],
    ['+', 'they', 'watch', 'They _ TV at eight last night.', 'Včera v osm se dívali na televizi.'],
    ['+', 'it', 'rain', 'It _ when we left the house.', 'Pršelo, když jsme odcházeli z domu.'],
    ['?', 'you', 'do', 'What _ at ten last night?', 'Co jsi dělal včera v deset večer?'],
    ['-', 'I', 'listen', 'Sorry, I _. Can you repeat it?', 'Promiň, neposlouchal jsem. Můžeš to zopakovat?'],
    ['+', 'she', 'drive', 'She _ home when she saw the accident.', 'Jela domů, když uviděla nehodu.'],
    ['+', 'we', 'have', 'We _ dinner when the lights went out.', 'Večeřeli jsme, když zhasla světla.'],
    ['?', 'he', 'wear', '_ a suit at the party?', 'Měl na večírku oblek?'],
    ['-', '*the kids', 'sleep', 'The kids _ when we got home.', 'Děti nespaly, když jsme přišli domů.'],
    ['+', 'I', 'walk', 'While I _ to work, I met an old friend.', 'Když jsem šel do práce, potkal jsem starého kamaráda.'],
  ],
  pp: [
    ['+', 'I', 'be', 'I _ to London three times.', 'Byl jsem v Londýně třikrát.'],
    ['-', 'she', 'finish', 'She _ her homework yet.', 'Ještě nedodělala úkol.'],
    ['?', 'you', 'eat', '_ sushi before?', 'Jedl jsi už někdy sushi?'],
    ['+', 'we', 'live', 'We _ here for five years.', 'Bydlíme tady pět let.', 'ppc'],
    ['+', 'he', 'lose', "Oh no, he _ his keys! He can't get in.", 'Ale ne, ztratil klíče! Nemůže dovnitř.'],
    ['+', 'I', 'know', 'I _ her since school.', 'Znám ji od školy.'],
    ['?', 'you', 'see', "_ my phone? I can't find it.", 'Neviděl jsi můj telefon? Nemůžu ho najít.'],
    ['-', 'I', 'see', 'I _ him since Christmas.', 'Od Vánoc jsem ho neviděl.'],
    ['+', '*prices', 'go', 'Prices _ up a lot this year.', 'Ceny letos hodně vzrostly.'],
    ['?', 'he', 'work', 'How long _ here?', 'Jak dlouho tu pracuje?', 'ppc'],
    ['-', 'we', 'decide', 'We _ yet.', 'Ještě jsme se nerozhodli.'],
  ],
  ppc: [
    ['+', 'I', 'wait', 'I _ for an hour!', 'Čekám už hodinu!', 'pp'],
    ['+', 'it', 'rain', 'It _ all day.', 'Celý den prší.', 'pp'],
    ['?', 'you', 'learn', 'How long _ English?', 'Jak dlouho se učíš anglicky?'],
    ['+', 'she', 'work', 'She _ here since March.', 'Pracuje tady od března.', 'pp'],
    ['-', 'I', 'sleep', 'I _ well recently.', 'Poslední dobou nespím dobře.'],
    ['+', 'we', 'try', 'We _ to call you all morning.', 'Celé dopoledne se ti snažíme dovolat.'],
    ['?', 'he', 'play', '_ football? His clothes are dirty.', 'Hrál fotbal? Má špinavé oblečení.'],
    ['+', '*my neighbours', 'argue', 'My neighbours _ for hours.', 'Sousedi se hádají už celé hodiny.', 'pp'],
    ['+', 'I', 'run', "I'm tired because I _.", 'Jsem unavený, protože jsem běhal.'],
    ['-', 'you', 'listen', 'You _ to me at all!', 'Vůbec mě neposloucháš!'],
  ],
  pap: [
    ['+', 'the film', 'start', 'When we arrived, the film _.', 'Když jsme dorazili, film už začal.'],
    ['+', 'she', 'leave', 'She _ before I got there.', 'Odešla dřív, než jsem tam dorazil.', 'pas'],
    ['-', 'I', 'eat', 'I was hungry because I _ all day.', 'Měl jsem hlad, protože jsem celý den nejedl.'],
    ['?', 'you', 'be', '_ to Rome before that trip?', 'Byl jsi v Římě už před tím výletem?'],
    ['+', 'they', 'sell', 'When I called, they _ all the tickets.', 'Když jsem zavolal, už prodali všechny lístky.'],
    ['+', 'he', 'forget', 'He realised that he _ his passport.', 'Uvědomil si, že zapomněl pas.'],
    ['-', 'we', 'book', 'We _ a table, so we had to wait.', 'Neměli jsme rezervaci, takže jsme museli čekat.'],
    ['+', 'I', 'finish', 'After I _ work, I went home.', 'Když jsem dokončil práci, šel jsem domů.', 'pas'],
    ['?', 'she', 'meet', '_ him before the party?', 'Znala ho už před tím večírkem?'],
    ['+', 'the rain', 'stop', 'By the time we left, the rain _.', 'Než jsme odešli, přestalo pršet.'],
  ],
  will: [
    ['+', 'I', 'help', "Don't worry, I _ you.", 'Neboj, pomůžu ti.'],
    ['+', 'I', 'have', 'I think I _ the fish.', 'Myslím, že si dám rybu.'],
    ['-', 'it', 'take', 'It _ long.', 'Nebude to trvat dlouho.', 'going'],
    ['?', 'you', 'open', '_ the window, please?', 'Otevřeš prosím okno?'],
    ['+', 'she', 'be', 'She _ thirty next year.', 'Příští rok jí bude třicet.', 'going'],
    ['+', 'I', 'call', 'I _ you later.', 'Zavolám ti později.', 'going'],
    ['-', 'I', 'tell', 'I promise I _ anyone.', 'Slibuju, že to nikomu neřeknu.'],
    ['+', 'you', 'love', 'You _ this film.', 'Ten film se ti bude líbit.', 'going'],
    ['?', 'we', 'need', '_ a car there?', 'Budeme tam potřebovat auto?', 'going'],
    ['+', 'the weather', 'be', 'I think the weather _ nice tomorrow.', 'Myslím, že zítra bude hezky.', 'going'],
  ],
  going: [
    ['+', 'I', 'visit', 'I _ my grandma this weekend.', 'Tento víkend jedu za babičkou. (plán)', 'pc'],
    ['+', 'it', 'rain', 'Look at those clouds! It _.', 'Podívej na ty mraky! Bude pršet.'],
    ['?', 'you', 'do', 'What _ after school?', 'Co budeš dělat po škole?', 'pc'],
    ['-', 'we', 'buy', 'We _ a new car this year.', 'Letos si nové auto kupovat nebudeme.', 'pc'],
    ['+', 'she', 'have', 'She _ a baby.', 'Bude mít miminko.', 'pc'],
    ['+', 'they', 'get', 'They _ married in June.', 'V červnu se budou brát.', 'pc,will'],
    ['?', 'he', 'apply', '_ for that job?', 'Bude se hlásit na tu práci?'],
    ['-', 'I', 'eat', 'I _ any more sweets.', 'Už nebudu jíst sladkosti. (rozhodl jsem se)'],
    ['+', 'I', 'learn', 'Next year I _ to drive.', 'Příští rok se naučím řídit. (plán)', 'will'],
    ['+', 'he', 'fall', 'Be careful! He _.', 'Pozor! Spadne.'],
  ],
  fc: [
    ['+', 'I', 'work', 'This time tomorrow I _.', 'Zítra touhle dobou budu pracovat.'],
    ['+', 'we', 'fly', 'At ten tomorrow we _ over the Alps.', 'Zítra v deset poletíme nad Alpami.'],
    ['?', 'you', 'use', '_ the car tonight?', 'Budeš dnes večer potřebovat auto?'],
    ['+', 'I', 'watch', "Don't call at eight, I _ the match.", 'Nevolej v osm, budu se dívat na zápas.'],
    ['-', 'she', 'come', 'She _ to the meeting tomorrow.', 'Zítra na schůzku nepřijde.', 'will,pc'],
    ['+', 'they', 'wait', 'They _ for you at the airport.', 'Budou na tebe čekat na letišti.', 'will'],
    ['+', 'I', 'lie', 'In a week I _ on a beach.', 'Za týden budu ležet na pláži.'],
    ['?', 'he', 'stay', 'How long _ with you?', 'Jak dlouho u vás bude bydlet?', 'will'],
    ['+', 'we', 'drive', 'We _ all night, so we need coffee.', 'Budeme řídit celou noc, takže potřebujeme kávu.', 'will'],
  ],
  fp: [
    ['+', 'I', 'finish', 'I _ the report by Friday.', 'Do pátku tu zprávu dokončím.'],
    ['+', 'we', 'live', 'By next year we _ here for ten years.', 'Příští rok tu budeme bydlet už deset let.'],
    ['?', 'you', 'read', '_ the book by Monday?', 'Přečteš tu knihu do pondělí?'],
    ['-', 'they', 'arrive', 'They _ by six.', 'Do šesti nedorazí.'],
    ['+', 'the film', 'start', 'By the time we get there, the film _.', 'Než tam dojedeme, film už začne.'],
    ['+', 'she', 'save', 'By December she _ enough money.', 'Do prosince si našetří dost peněz.'],
    ['+', 'he', 'leave', 'When you get home, he _.', 'Až přijdeš domů, už bude pryč.'],
    ['-', 'I', 'finish', "I _ by tomorrow, sorry.", 'Do zítřka to nestihnu, promiň.'],
  ],
};

export const TENSE_ITEMS: TenseItem[] = (Object.keys(BANK) as TenseId[]).flatMap((tense) =>
  BANK[tense].map(([pol, subj, verb, tpl, cz, also], i) => ({ id: `${tense}-${i}`, tense, pol, subj, verb, tpl, cz, also: (also?.split(',') ?? []) as TenseId[] })),
);

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** The answer as it sits in the sentence (capitalised at the start). */
export function answerOf(it: TenseItem, t: TenseId = it.tense) {
  const a = conjugate(t, it.pol, it.subj, it.verb);
  return it.tpl.startsWith('_') ? cap(a) : a;
}
export const fullSentence = (it: TenseItem) => it.tpl.replace('_', answerOf(it));
export const hintOf = (it: TenseItem) => (it.pol === '?' ? `${showSubj(it.subj)} / ${it.verb}` : it.verb);

/** Which tenses are easy to confuse with each one (used for wrong options). */
export const CONFUSABLE: Record<TenseId, TenseId[]> = {
  ps: ['pc', 'pas', 'pp'],
  pc: ['ps', 'pac', 'going'],
  pas: ['pp', 'pac', 'pap'],
  pac: ['pas', 'pc', 'pap'],
  pp: ['pas', 'ppc', 'ps'],
  ppc: ['pp', 'pc', 'pac'],
  pap: ['pas', 'pp', 'pac'],
  will: ['going', 'pc', 'ps'],
  going: ['will', 'pc', 'fc'],
  fc: ['will', 'fp', 'pc'],
  fp: ['will', 'fc', 'pp'],
};
