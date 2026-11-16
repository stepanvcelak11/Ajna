// Difficulty levels. Each level lists the grammar it focuses on; a learner can also pick one
// topic as a "focus" so every generated sentence practises it. Textbook units can later be
// mapped onto these topic ids (or added as extra topics).

import { textbookTopic } from './textbook';

export type LevelId = 1 | 2 | 3 | 4 | 5;

export interface GrammarTopic {
  id: string;
  en: string; // used in prompts
  cz: string; // shown to the learner
}

export interface Level {
  id: LevelId;
  cefr: string;
  name: string;
  desc: string;
  monologueSec: number;
  /** hard limit for generated Czech prompts (words) */
  maxWords: number;
  /** how many fluency chunks a drill sentence uses */
  chunks: 1 | 2;
  /** few-shot examples of good Czech prompts at this level */
  examplesCz: string[];
  /** guidance for the sentence generator */
  sentences: string;
  /** guidance for the sentence-expansion ladder */
  ladder: string;
  /** how strictly to judge naturalness */
  strictness: string;
  grammar: GrammarTopic[];
}

export const LEVELS: Level[] = [
  {
    id: 1,
    cefr: 'A1',
    name: 'Úplné základy',
    desc: 'Nejjednodušší věty: já, rodina, jídlo, domov. Jen přítomný čas.',
    monologueSec: 30,
    maxWords: 6,
    chunks: 1,
    examplesCz: ['Mám rád čaj.', 'Bydlím v Brně.', 'Mám jednu sestru.', 'Kde je nádraží?', 'Moje auto je modré.', 'V pondělí pracuju.'],
    sentences:
      'TRUE BEGINNER (A1). 3-6 words, ONE simple clause, ONLY present tense of: be, have (got), like, live, work, want, need, go, eat, drink, can. ' +
      'Vocabulary ONLY from the first 300 words a beginner learns: family, numbers, colours, days, food and drink, home and rooms, simple jobs, city places (shop, station, bank), weather, time. ' +
      'No past, no future, no "because/when/if", no idioms, no abstract topics, nothing about projects, meetings or feelings beyond happy/tired/hungry.',
    ladder:
      'TRUE BEGINNER. step1: 3-4 word present-tense sentence ("Mám rád kávu."). step2: add ONE simple detail with "a" or a time/place word ("každé ráno", "v práci"). step3: add "ale" + a short simple clause. Final sentence max 10 words, present tense only.',
    strictness: 'Be very gentle: report only errors that break meaning or very basic ones (be/have, -s in he/she, a/an, word order). Simple correct answers always pass.',
    grammar: [
      { id: 'to-be', en: 'verb to be (I am, he is, they are; negatives and questions)', cz: 'Sloveso „být“ (am/is/are)' },
      { id: 'have-got', en: 'have / have got (possession, family)', cz: 'Have / have got (mít)' },
      { id: 'present-simple', en: 'present simple (habits, facts; does/doesn\'t)', cz: 'Přítomný čas prostý' },
      { id: 'can', en: 'can / can\'t (ability, asking)', cz: 'Can / can\'t (umět, moct)' },
      { id: 'there-is', en: 'there is / there are', cz: 'There is / there are' },
      { id: 'articles-basic', en: 'a/an/the and plural nouns', cz: 'Členy a množné číslo' },
      { id: 'questions', en: 'simple questions (Where is…? Do you…? How much…?)', cz: 'Jednoduché otázky' },
      { id: 'possessives', en: 'my/your/his/her, this/that', cz: 'Můj/tvůj, tento/tamten' },
    ],
  },
  {
    id: 2,
    cefr: 'A2',
    name: 'Základy',
    desc: 'Minulý čas, plány, porovnávání. Krátké věty se spojkami a, ale, protože.',
    monologueSec: 45,
    maxWords: 9,
    chunks: 1,
    examplesCz: ['Včera jsem byl v kině.', 'Zítra jdu k doktorovi.', 'Teď vařím večeři.', 'Můj brácha je vyšší než já.', 'Nešel jsem ven, protože pršelo.'],
    sentences:
      'ELEMENTARY (A2). 5-9 words, one clause or two very short ones joined by and/but/because/so. Present simple and continuous, past simple, "going to", will for quick decisions, comparatives. ' +
      'Common everyday vocabulary only (daily routine, shopping, free time, travel basics, health basics, simple work situations). No idioms, no present perfect, no conditionals.',
    ladder:
      'ELEMENTARY. step1: 4-5 word sentence in present or past simple. step2: add a reason or time with "protože", "když", "potom". step3: add "ale" or "tak". Final sentence ~12-15 words.',
    strictness: 'Be gentle: report real grammar errors (tenses, articles, word order, prepositions) and obvious Czenglish; accept simple correct answers.',
    grammar: [
      { id: 'present-continuous', en: 'present continuous (now / temporary) vs present simple', cz: 'Přítomný čas průběhový' },
      { id: 'past-simple', en: 'past simple (regular and irregular verbs, did/didn\'t)', cz: 'Minulý čas prostý' },
      { id: 'going-to', en: '"going to" for plans', cz: 'Budoucnost s „going to“' },
      { id: 'will-future', en: 'will for quick decisions, offers and promises', cz: 'Budoucnost s „will“' },
      { id: 'comparatives', en: 'comparatives and superlatives', cz: 'Stupňování přídavných jmen' },
      { id: 'countable', en: 'countable/uncountable nouns, some/any, much/many', cz: 'Počitatelná a nepočitatelná' },
      { id: 'prepositions-time-place', en: 'prepositions of time and place (in/on/at)', cz: 'Předložky času a místa' },
      { id: 'frequency', en: 'adverbs of frequency (always, usually, never)', cz: 'Příslovce četnosti' },
    ],
  },
  {
    id: 3,
    cefr: 'B1',
    name: 'Střední',
    desc: 'Předpřítomný čas, podmínky, modální slovesa, vedlejší věty.',
    monologueSec: 60,
    maxWords: 15,
    chunks: 2,
    examplesCz: ['Upřímně řečeno, ještě jsem ten film neviděl.', 'Kdybych měl víc času, víc bych cestoval.', 'Ukázalo se, že obchod byl zavřený, tak jsme šli domů.'],
    sentences:
      'INTERMEDIATE (B1). 9-15 words, up to two clauses, B1 vocabulary and common phrasal verbs. Present perfect, past continuous, first and second conditional, modals, used to, relative clauses.',
    ladder:
      'INTERMEDIATE. step1: 4-6 word sentence. step2: add reason/time/purpose. step3: add contrast or consequence ("i když", "takže", "což znamenalo"). Final sentence ~18-22 words.',
    strictness: 'Report grammar errors and Czenglish; mention unnatural phrasing briefly.',
    grammar: [
      { id: 'present-perfect', en: 'present perfect (experience, recent past, unfinished time; for/since)', cz: 'Předpřítomný čas' },
      { id: 'pp-vs-past', en: 'present perfect vs past simple', cz: 'Předpřítomný vs. minulý čas' },
      { id: 'past-continuous', en: 'past continuous vs past simple (was doing when ... happened)', cz: 'Minulý čas průběhový' },
      { id: 'first-conditional', en: 'first conditional (if + present, will)', cz: '1. kondicionál' },
      { id: 'second-conditional', en: 'second conditional (if + past, would)', cz: '2. kondicionál' },
      { id: 'modals-basic', en: 'must, have to, should, might, could', cz: 'Modální slovesa' },
      { id: 'used-to', en: 'used to / be used to / get used to', cz: 'Used to / be used to' },
      { id: 'relative-clauses', en: 'relative clauses (who, which, that, where)', cz: 'Vztažné věty' },
      { id: 'gerund-infinitive', en: 'verb + -ing vs verb + to-infinitive', cz: 'Gerundium vs. infinitiv' },
      { id: 'phrasal-verbs', en: 'common phrasal verbs', cz: 'Frázová slovesa' },
    ],
  },
  {
    id: 4,
    cefr: 'B2',
    name: 'Pokročilý',
    desc: 'Všechny časy, trpný rod, nepřímá řeč, 3. kondicionál.',
    monologueSec: 90,
    maxWords: 25,
    chunks: 2,
    examplesCz: ['Kdybych to věděl dřív, nekupoval bych lístky tak brzy.', 'Ukázalo se, že projekt byl schválen, i když jsme odevzdali zprávu pozdě.'],
    sentences: 'UPPER-INTERMEDIATE (B2). 15-25 words, multiple clauses, B2 vocabulary, collocations and linking words.',
    ladder:
      'step1: 5-7 word sentence in a less common tense. step2: add a time clause or reason using past perfect or a participle. step3: add contrast/consequence/condition ("despite", "whereas", "otherwise", "if ... had"). Final sentence ~25-30 words.',
    strictness: 'Be strict: report grammar, Czenglish, wrong collocations and unnatural register.',
    grammar: [
      { id: 'pp-continuous', en: 'present perfect continuous (have been doing for/since)', cz: 'Předpřítomný průběhový' },
      { id: 'past-perfect', en: 'past perfect and past perfect continuous', cz: 'Předminulý čas' },
      { id: 'future-forms', en: 'future continuous, future perfect, present tenses for future', cz: 'Budoucí časy (pokročilé)' },
      { id: 'third-conditional', en: 'third conditional (if + had done, would have done)', cz: '3. kondicionál' },
      { id: 'passive', en: 'passive voice in all tenses, have something done', cz: 'Trpný rod' },
      { id: 'reported-speech', en: 'reported speech and reporting verbs', cz: 'Nepřímá řeč' },
      { id: 'modals-past', en: 'modals of deduction and past modals (must have, should have, could have)', cz: 'Modální slovesa v minulosti' },
      { id: 'wish', en: 'wish / if only', cz: 'Wish / if only' },
      { id: 'linking', en: 'linking words (despite, whereas, however, therefore)', cz: 'Spojovací výrazy' },
    ],
  },
  {
    id: 5,
    cefr: 'C1',
    name: 'Expert',
    desc: 'Smíšené kondicionály, inverze, idiomy, styl.',
    monologueSec: 120,
    maxWords: 35,
    chunks: 2,
    examplesCz: ['Kdyby mi tehdy kolega nepomohl, asi bych tu práci dodnes nedělal, i když mě to vlastně baví.'],
    sentences: 'ADVANCED (C1). complex, natural sentences (20-35 words), advanced structures, idiomatic language and precise vocabulary.',
    ladder:
      'step1: 5-8 word sentence. step2: add an advanced subordinate clause (participle clause, "having done", "by the time"). step3: add a nuanced contrast or hypothetical ("had it not been for", "even if", "were it not"). Final sentence ~30-35 words.',
    strictness: 'Be very strict: also report awkward style, register and anything a native speaker would not say.',
    grammar: [
      { id: 'mixed-conditionals', en: 'mixed conditionals', cz: 'Smíšené kondicionály' },
      { id: 'inversion', en: 'inversion (never have I, not only ... but also, hardly ... when)', cz: 'Inverze' },
      { id: 'cleft', en: 'cleft sentences (what I need is, it was ... that)', cz: 'Vytýkací věty' },
      { id: 'participle-clauses', en: 'participle clauses (having finished, given that)', cz: 'Participiální vazby' },
      { id: 'advanced-passive', en: 'advanced passive (it is said that, he is believed to have)', cz: 'Pokročilý trpný rod' },
      { id: 'subjunctive', en: 'subjunctive and formal structures (I suggest he be, it\'s time we left)', cz: 'Konjunktiv a formální vazby' },
      { id: 'idioms', en: 'idioms and fixed expressions', cz: 'Idiomy' },
    ],
  },
];

export function getLevel(id: number): Level {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[1];
}

export function findTopic(id: string | null | undefined): (GrammarTopic & { level: LevelId; vocab?: string; lessonN?: number }) | null {
  if (!id) return null;
  const tb = textbookTopic(id);
  if (tb) return { id: tb.id, en: tb.en, cz: tb.cz, vocab: tb.vocab, lessonN: tb.lesson.n, level: 3 };
  for (const l of LEVELS) {
    const t = l.grammar.find((g) => g.id === id);
    if (t) return { ...t, level: l.id };
  }
  return null;
}
