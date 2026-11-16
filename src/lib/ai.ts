import { callJson, type JsonSchema } from './llm';
import type { CzenglishWarning, Evaluation } from './types';
import { findTopic, getLevel } from '../data/levels';
import { getState } from './store';

/** Current difficulty level + optional grammar focus, for prompts. */
function lvl() {
  const s = getState().settings;
  const level = getLevel(s.level);
  const topic = findTopic(s.focus);
  const who = `a Czech learner of English at level ${level.cefr} ("${level.name}")`;
  const focus = topic
    ? `GRAMMAR FOCUS: the English translation MUST require ${topic.en}. Build the Czech sentence so this structure is the natural way to translate it.`
    : `Grammar: pick naturally from the structures typical for this level: ${level.grammar.map((g) => g.en).join('; ')}.`;
  const vocab = topic?.vocab ? `\nVOCABULARY: use words and situations from the topic "${topic.vocab}" (the learner's current textbook lesson).` : '';
  return { level, topic, who, focus: focus + vocab };
}

// ---------- schema helpers (kept simple so both providers' structured modes accept them) ----------
const str = { type: 'string' };
const bool = { type: 'boolean' };
const arr = (items: JsonSchema) => ({ type: 'array', items });
const obj = (props: Record<string, JsonSchema>) => ({
  type: 'object',
  properties: props,
  required: Object.keys(props),
  additionalProperties: false,
});

const TRAP_CATEGORIES = [
  'articles',
  'prepositions',
  'tense',
  'word_order',
  'false_friend',
  'word_choice',
  'missing_subject',
  'countable_plural',
  'question_form',
  'negation',
  'other',
];

const warningSchema = obj({
  category: { type: 'string', enum: TRAP_CATEGORIES },
  error: str,
  correction: str,
  tip_cz: str,
});

const evaluationSchema = obj({
  user_transcript: str,
  grammatical_fix: str,
  native_version: str,
  czenglish_warnings: arr(warningSchema),
  explanation_cz: arr(str),
  is_correct: bool,
  passed: bool,
  main_pattern: str,
});

const COACH = `You are an encouraging but sharp English speaking coach for a Czech native speaker at B1 level.
The learner understands English passively but freezes when building sentences and speaking. Their answers come from
speech-to-text, so IGNORE capitalisation, punctuation, filler words ("um", "eh") and obvious speech-recognition glitches.
Focus on what a listener would actually hear as wrong or unnatural.
Typical Czech-to-English interference ("Czenglish") you must detect: missing or wrong articles (a/the), literal prepositions
(e.g. "depend from", "on the photo", "in the TV"), wrong tenses (Present Simple instead of Present Perfect for unfinished
duration, "I am here since Monday"), Czech word order, false friends (actual/aktuální, eventually/eventuálně, sympathetic/sympatický),
dropped subjects ("Is raining"), uncountable plurals ("informations", "advices"), question forms without do/does, double negation.
Keep it short. Never invent errors: if the sentence is fine, say so and return an empty czenglish_warnings array.
Write explanation_cz in Czech: max 3 short bullet points explaining WHY the native version sounds better.
tip_cz must be Czech, max ~12 words.`;

const NATURAL_CZ = `Czech quality rules: the sentence must be something a real Czech person would naturally say in that situation; every part must logically fit together; concrete and everyday (no abstract, philosophical or strange content); correct Czech grammar, spelling and diacritics. Re-read it before answering and simplify or fix anything that sounds odd.`;

const EVAL_FIELDS = `Field rules:
- user_transcript: the learner's answer, cleaned of fillers only.
- grammatical_fix: MINIMAL edit of the learner's own sentence to make it grammatical (keep their words). If already fine, repeat it.
- native_version: how a native speaker would naturally say the same thought in casual everyday English.
- czenglish_warnings: one entry per real Czech-interference error (category, the wrong fragment, the correct fragment, Czech tip).
- explanation_cz: 1-3 short Czech bullet strings.
- is_correct: true if the sentence is grammatical and conveys the meaning (small naturalness issues allowed).
- main_pattern: name of the single most important structure or trap tested/failed, in short English (e.g. "Present Perfect with 'for' + duration", "Article before singular countable noun"). If no error, name the key structure used.`;

export function evaluate(params: {
  task: string;
  prompt_cz?: string;
  answer: string;
  passRule?: string;
}): Promise<Evaluation> {
  const user = `TASK: ${params.task}
${params.prompt_cz ? `CZECH PROMPT: ${params.prompt_cz}\n` : ''}LEARNER SAID: """${params.answer}"""

passed: ${params.passRule ?? 'true if is_correct is true and the answer conveys the full meaning of the prompt.'}`;
  return callJson<Evaluation>({
    system: `${COACH}\n\n${EVAL_FIELDS}\n\nLEARNER LEVEL: ${lvl().level.cefr}. ${lvl().level.strictness}`,
    user,
    schema: evaluationSchema,
  }).then(sanitizeEval);
}

function sanitizeEval(e: Evaluation): Evaluation {
  return {
    user_transcript: e.user_transcript ?? '',
    grammatical_fix: e.grammatical_fix ?? '',
    native_version: e.native_version ?? '',
    czenglish_warnings: Array.isArray(e.czenglish_warnings) ? e.czenglish_warnings : [],
    explanation_cz: Array.isArray(e.explanation_cz) ? e.explanation_cz.slice(0, 3) : [],
    is_correct: !!e.is_correct,
    passed: !!e.passed,
    main_pattern: e.main_pattern ?? '',
  };
}

// ---------- Mode A: Sentence Expansion Ladder ----------
export interface Ladder {
  topic: string;
  step1_cz: string;
  step2_instruction_cz: string;
  step3_instruction_cz: string;
  reference_en: string[]; // 3 reference English sentences (one per step)
}

export function generateLadder(theme: string): Promise<Ladder> {
  return callJson<Ladder>({
    system: `You create "sentence expansion ladder" exercises for ${lvl().who}. Output Czech prompts.`,
    user: `Theme: ${theme}.
DIFFICULTY: ${lvl().level.ladder}
The step-1 sentence must have at most ${Math.max(4, Math.round(lvl().level.maxWords * 0.7))} Czech words.
${lvl().focus}
${NATURAL_CZ}
All three steps must describe ONE coherent, realistic situation.
Create:
${
  lvl().level.id === 1
    ? `- step1_cz: a very short Czech present-tense sentence, e.g. "Mám rád kávu."
- step2_instruction_cz: Czech instruction adding ONE simple detail, format: "Přidej kdy: každé ráno."
- step3_instruction_cz: Czech instruction adding a short contrast with "ale", format: "Přidej: ale nemám rád čaj."`
    : lvl().level.id === 2
      ? `- step1_cz: a short Czech core sentence, e.g. "Včera jsem zmeškal autobus."
- step2_instruction_cz: Czech instruction adding a reason or time, format: "Přidej důvod: protože jsem zaspal."
- step3_instruction_cz: Czech instruction adding "ale" or "tak", format: "Přidej: tak jsem šel pěšky."`
      : `- step1_cz: a short Czech core sentence about everyday life, e.g. "Včera jsem zmeškal vlak."
- step2_instruction_cz: Czech instruction that extends the SAME situation with a reason/time/purpose, format: "Rozšiř to o důvod: protože jsem zaspal."
- step3_instruction_cz: Czech instruction adding a contrast or consequence, format: "Přidej kontrast: i když jsem si nastavil dva budíky." or "Přidej důsledek: takže jsem přišel pozdě na poradu."`
}
- reference_en: 3 natural English sentences at this level: the step-1 sentence, the combined step-2 sentence, the final full sentence.
- topic: 2-4 word English label.
Vary tenses and connectors appropriate to the level. Pick a fresh, concrete situation.`,
    schema: obj({ topic: str, step1_cz: str, step2_instruction_cz: str, step3_instruction_cz: str, reference_en: arr(str) }),
  });
}

// ---------- Mode B: Drill ----------
export interface DrillItem {
  prompt_cz: string;
  /** chosen fluency chunks; cz = the exact Czech words used for it in prompt_cz */
  chunks: { en: string; cz: string }[];
  note_cz: string;
}

const czWords = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

export async function generateDrill(context: string, pool: { en: string; cz: string }[], avoid: string[]): Promise<DrillItem> {
  const { level, focus, who } = lvl();
  const ask = (tooLong?: string) =>
    callJson<DrillItem>({
      system: `You create Czech-to-English speaking drills for ${who}.`,
      user: `Context / situation: ${context}.
Step 1 – write ONE Czech sentence the learner will translate into spoken English.
LENGTH AND COMPLEXITY: ${level.sentences}
HARD LIMIT: at most ${level.maxWords} Czech words.
Good examples at this level: ${level.examplesCz.map((e) => `"${e}"`).join(' ')}
${focus}
${NATURAL_CZ}
Step 2 – from this list of English fluency chunks choose exactly ${level.chunks} that fit the MEANING of your sentence most naturally (never force a chunk that does not fit; if needed, adjust the sentence so it fits naturally):
${pool.map((c) => `"${c.en}" (= ${c.cz})`).join(', ')}
The Czech sentence MUST contain the Czech equivalent of each chosen chunk at its natural place, so that a natural translation uses the English chunk.
Return chunks as [{en: exactly as in the list, cz: the exact Czech words for it as they appear in prompt_cz}].
note_cz: a very short Czech hint (max 8 words), without giving away the translation.
Do not repeat these earlier prompts: ${avoid.slice(-5).join(' | ') || 'none'}${tooLong ? `\nYOUR PREVIOUS ATTEMPT WAS TOO LONG OR TOO COMPLEX: "${tooLong}". Make it shorter and simpler.` : ''}`,
      schema: obj({ prompt_cz: str, chunks: arr(obj({ en: str, cz: str })), note_cz: str }),
    });
  let item = await ask();
  // Enforce the level's length limit (models sometimes ignore it): one retry with feedback.
  if (czWords(item.prompt_cz) > level.maxWords + 2) item = await ask(item.prompt_cz);
  const chunks = (Array.isArray(item.chunks) ? item.chunks : []).filter((c) => c?.en).slice(0, level.chunks);
  return { ...item, chunks: chunks.length ? chunks : pool.slice(0, level.chunks) };
}

// ---------- Mode C: Monologue ----------
export interface Reformulation {
  corrected: string;
  native_b2: string;
  czenglish_warnings: CzenglishWarning[];
  explanation_cz: string[];
  key_phrases: { en: string; cz: string }[];
  main_pattern: string;
}

export function reformulate(prompt: string, transcript: string): Promise<Reformulation> {
  return callJson<Reformulation>({
    system: `${COACH}`,
    user: `The learner spoke freely for ~60 seconds on: "${prompt}".
TRANSCRIPT: """${transcript}"""
Return:
- corrected: the learner's exact words, LIGHTLY corrected (grammar only, keep their vocabulary and sentence order).
- native_b2: a "Native Reformulation": same ideas and story, phrased the way a fluent speaker would naturally say it out loud (spoken register, contractions, good connectors), pitched ONE step above the learner's level (${lvl().level.cefr}) so it stays learnable. Similar length. Suitable for shadowing.
- czenglish_warnings: the most important interference errors (max 5).
- explanation_cz: max 3 short Czech bullets.
- key_phrases: 3-5 useful phrases from native_b2 with Czech translation.
- main_pattern: the most important structure to work on, short English.`,
    schema: obj({
      corrected: str,
      native_b2: str,
      czenglish_warnings: arr(warningSchema),
      explanation_cz: arr(str),
      key_phrases: arr(obj({ en: str, cz: str })),
      main_pattern: str,
    }),
    maxTokens: 3000,
  });
}

// ---------- Mode D: Roleplay ----------
export interface RoleplayTurn {
  reply: string;
  coach_tip: { has_issue: boolean; user_said: string; better: string; explanation_cz: string; category: string };
  finished: boolean;
}

export function roleplayTurn(params: {
  scenario: string;
  aiRole: string;
  userRole: string;
  goal: string;
  history: { who: 'ai' | 'user'; text: string }[];
  turnsLeft: number;
}): Promise<RoleplayTurn> {
  const transcript = params.history.map((h) => `${h.who === 'ai' ? params.aiRole : 'LEARNER'}: ${h.text}`).join('\n');
  return callJson<RoleplayTurn>({
    system: `${COACH}

You are ALSO playing a character in a short spoken roleplay. Stay in character in "reply": natural spoken English,
1-2 short sentences (max ~30 words), friendly, vocabulary suited to ${lvl().who}, end with something the learner can respond to.
${lvl().level.id === 1 ? 'The learner is a TRUE BEGINNER: use only very simple present-tense sentences (max 10 words each), the most common words, and ask simple questions they can answer in 3-5 words.' : lvl().level.id === 2 ? 'Keep your English simple (A2): short sentences, common words, present/past simple.' : ''}
Never correct the learner inside "reply". Corrections go ONLY to coach_tip.`,
    user: `SCENARIO: ${params.scenario}
YOU PLAY: ${params.aiRole}. LEARNER PLAYS: ${params.userRole}. LEARNER'S GOAL: ${params.goal}.
CONVERSATION SO FAR:
${transcript}

Respond to the learner's last line.
coach_tip: has_issue=true only if the LAST learner line had a real grammar/phrasing error or something clearly unnatural.
Then user_said = the wrong fragment, better = natural version of their whole line, explanation_cz = one short Czech sentence,
category = one of ${TRAP_CATEGORIES.join(', ')}. If no issue, has_issue=false and other fields empty strings.
${params.turnsLeft <= 1 ? 'This is the LAST turn: wrap the conversation up politely and set finished=true.' : 'finished=false unless the learner clearly ended the conversation.'}`,
    schema: obj({
      reply: str,
      coach_tip: obj({ has_issue: bool, user_said: str, better: str, explanation_cz: str, category: str }),
      finished: bool,
    }),
  });
}

// ---------- Word Rescue + Lookup ----------
export interface Rescue {
  options: { en: string; when_cz: string }[];
  best_en: string;
  pos: string;
  cz: string;
  example: string; // with target in {braces}
  collocation: string;
}

export function rescueWord(czWord: string, context: string): Promise<Rescue> {
  return callJson<Rescue>({
    system: `You are a quick Czech→English "panic dictionary" for a B1 learner speaking in real time. Be fast and practical.`,
    user: `Czech word/phrase the learner can't say in English: "${czWord}"
What they were trying to say so far (may be empty): "${context}"
Return:
- options: 1-3 best English translations for THIS context, each with when_cz (very short Czech usage note).
- best_en: the single best option (base form, e.g. "postpone", "get used to").
- pos: part of speech in English (verb, noun, phrasal verb, adjective, expression...).
- cz: Czech meaning (the word as given, normalised).
- example: a short natural English example sentence using best_en, with the target wrapped in curly braces, e.g. "We had to {postpone} the meeting."
- collocation: the most common collocation or pattern (e.g. "postpone sth until / to + time").`,
    schema: obj({
      options: arr(obj({ en: str, when_cz: str })),
      best_en: str,
      pos: str,
      cz: str,
      example: str,
      collocation: str,
    }),
  });
}

export interface Lookup {
  lemma: string;
  cz: string;
  pos: string;
  collocation: string;
  example: string; // with {target}
}

const lookupCache = new Map<string, Lookup>();

export async function lookupWord(word: string, sentence: string): Promise<Lookup> {
  const k = `${word.toLowerCase()}|${sentence}`;
  const hit = lookupCache.get(k);
  if (hit) return hit;
  const res = await callJson<Lookup>({
    system: `You are a compact English→Czech learner's dictionary for a Czech B1 learner.`,
    user: `Word "${word}" as used in: "${sentence}".
If it is part of a phrasal verb or fixed expression in this sentence (e.g. "turns out", "pick up", "as far as"), return the whole expression as lemma.
Return lemma (base form), cz (Czech translation for this context), pos, collocation (most common collocation/pattern),
example: a NEW short example sentence with the lemma's form wrapped in {curly braces}.`,
    schema: obj({ lemma: str, cz: str, pos: str, collocation: str, example: str }),
    maxTokens: 600,
  });
  lookupCache.set(k, res);
  return res;
}

// ---------- Mistake Bank practice ----------
export interface PatternDrill {
  prompt_cz: string;
  target_structure: string;
}

export function generatePatternDrill(pattern: string, originalWrong: string, originalFix: string): Promise<PatternDrill> {
  return callJson<PatternDrill>({
    system: `You create targeted Czech-to-English drills that re-test one grammar structure or Czenglish trap.`,
    user: `The learner previously failed this pattern: "${pattern}".
Their wrong sentence: "${originalWrong}". Correct: "${originalFix}".
Write ONE NEW Czech sentence (complexity: ${lvl().level.sentences}; at most ${lvl().level.maxWords + 4} words) whose natural English translation REQUIRES exactly the same structure/trap,\n${NATURAL_CZ}\n
but with completely different vocabulary and situation. target_structure: short English description of what must be used.`,
    schema: obj({ prompt_cz: str, target_structure: str }),
  });
}
