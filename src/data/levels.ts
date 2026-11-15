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
    cefr: 'A2',
    name: 'Základy',
    desc: 'Krátké jednoduché věty, přítomný a minulý čas.',
    monologueSec: 30,
    sentences: 'very short simple sentences (5-9 words), one clause, very common everyday words, present simple, present continuous, past simple, "going to".',
    ladder:
      'step1: 3-5 word sentence in present simple or past simple. step2: add a simple reason/time with "because", "and", "when" or "after". step3: add "but" or "so". Final sentence max ~15 words.',
    strictness: 'Be gentle: only report errors that change meaning or are basic (articles, word order, verb forms). Accept simple but correct answers as passed.',
    grammar: [
      { id: 'present-simple', en: 'present simple (habits, facts; does/doesn\'t)', cz: 'Přítomný čas prostý' },
      { id: 'present-continuous', en: 'present continuous (now / temporary)', cz: 'Přítomný čas průběhový' },
      { id: 'past-simple', en: 'past simple (regular and irregular verbs, did/didn\'t)', cz: 'Minulý čas prostý' },
      { id: 'going-to', en: '"going to" for plans', cz: 'Budoucnost s „going to“' },
      { id: 'questions', en: 'questions with do/does/did and question words', cz: 'Tvoření otázek' },
      { id: 'articles-basic', en: 'articles a/an/the with everyday nouns', cz: 'Členy a/an/the' },
      { id: 'there-is', en: 'there is / there are', cz: 'There is / there are' },
    ],
  },
  {
    id: 2,
    cefr: 'A2+/B1−',
    name: 'Mírně pokročilý',
    desc: 'Delší věty se spojkami, budoucnost, porovnávání.',
    monologueSec: 45,
    sentences: 'short sentences (8-14 words), at most two clauses, everyday vocabulary, connectors and, but, because, so, when, if.',
    ladder:
      'step1: 4-6 word sentence. step2: add reason/time ("because", "when", "before", "after"). step3: add contrast or result ("but", "so", "although"). Final sentence ~15-20 words.',
    strictness: 'Report real grammar errors and the most obvious Czenglish; do not nitpick style.',
    grammar: [
      { id: 'past-continuous', en: 'past continuous vs past simple (was doing when ... happened)', cz: 'Minulý čas průběhový' },
      { id: 'will-future', en: 'will for decisions, promises and predictions', cz: 'Budoucnost s „will“' },
      { id: 'comparatives', en: 'comparatives and superlatives', cz: 'Stupňování přídavných jmen' },
      { id: 'modals-basic', en: 'can, could, must, have to, should', cz: 'Modální slovesa (základ)' },
      { id: 'first-conditional', en: 'first conditional (if + present, will)', cz: '1. kondicionál' },
      { id: 'countable', en: 'countable/uncountable nouns, some/any, much/many', cz: 'Počitatelná a nepočitatelná' },
      { id: 'prepositions-time-place', en: 'prepositions of time and place (in/on/at)', cz: 'Předložky času a místa' },
    ],
  },
  {
    id: 3,
    cefr: 'B1',
    name: 'Střední',
    desc: 'Předpřítomný čas, vedlejší věty, modální slovesa.',
    monologueSec: 60,
    sentences: 'natural sentences (12-20 words), two clauses, B1 vocabulary and common phrasal verbs.',
    ladder:
      'step1: 4-6 word sentence. step2: add reason/time/purpose. step3: add contrast or consequence ("although", "even though", "so", "which meant that"). Final multi-clause sentence ~20-25 words.',
    strictness: 'Report grammar errors and Czenglish; mention unnatural phrasing briefly.',
    grammar: [
      { id: 'present-perfect', en: 'present perfect (experience, recent past, unfinished time; for/since)', cz: 'Předpřítomný čas' },
      { id: 'pp-vs-past', en: 'present perfect vs past simple', cz: 'Předpřítomný vs. minulý čas' },
      { id: 'pp-continuous', en: 'present perfect continuous (have been doing for/since)', cz: 'Předpřítomný průběhový' },
      { id: 'relative-clauses', en: 'relative clauses (who, which, that, where)', cz: 'Vztažné věty' },
      { id: 'second-conditional', en: 'second conditional (if + past, would)', cz: '2. kondicionál' },
      { id: 'used-to', en: 'used to / be used to / get used to', cz: 'Used to / be used to' },
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
    sentences: 'longer sentences (16-28 words), multiple clauses, B2 vocabulary, collocations and linking words.',
    ladder:
      'step1: 5-7 word sentence in a less common tense. step2: add a time clause or reason using past perfect or a participle. step3: add contrast/consequence/condition ("despite", "whereas", "otherwise", "if ... had"). Final sentence ~25-30 words.',
    strictness: 'Be strict: report grammar, Czenglish, wrong collocations and unnatural register.',
    grammar: [
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
    sentences: 'complex, natural sentences (20-35 words), advanced structures, idiomatic language and precise vocabulary.',
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
