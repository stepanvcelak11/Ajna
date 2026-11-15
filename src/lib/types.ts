export type Provider = 'openai' | 'anthropic';
export type Accent = 'en-US' | 'en-GB';
export type MicMode = 'toggle' | 'ptt';

export interface Settings {
  provider: Provider;
  openaiKey: string;
  anthropicKey: string;
  openaiModel: string;
  anthropicModel: string;
  accent: Accent;
  theme: 'dark' | 'light';
  ttsRate: 0.8 | 1;
  micMode: MicMode;
  autoSaveMistakes: boolean;
  autoPlayRoleplay: boolean;
}

export interface SrsState {
  dueDate: string; // ISO date-time
  easeFactor: number;
  interval: number; // days
  level: number; // successful repetitions in a row
  lapses: number;
  lastReviewed?: string;
}

export type VocabSource = 'starter' | 'rescue' | 'click';

export interface VocabCard {
  id: string;
  en: string; // target word / phrase
  cz: string; // Czech meaning
  pos: string; // part of speech
  example: string; // example sentence; target wrapped in {curly braces}
  collocation?: string;
  source: VocabSource;
  pack?: string;
  createdAt: string;
  srs: SrsState;
}

export type TrapCategory =
  | 'articles'
  | 'prepositions'
  | 'tense'
  | 'word_order'
  | 'false_friend'
  | 'word_choice'
  | 'missing_subject'
  | 'countable_plural'
  | 'question_form'
  | 'negation'
  | 'other';

export interface CzenglishWarning {
  category: TrapCategory;
  error: string; // what the user said
  correction: string; // correct form
  tip_cz: string; // short Czech note
}

export interface Evaluation {
  user_transcript: string;
  grammatical_fix: string;
  native_version: string;
  czenglish_warnings: CzenglishWarning[];
  explanation_cz: string[];
  is_correct: boolean;
  passed: boolean; // task-specific verdict (e.g. target word used naturally)
  main_pattern: string; // the single key structure/trap, in English, short
}

export interface Mistake {
  id: string;
  createdAt: string;
  mode: string;
  prompt_cz?: string;
  user_text: string;
  fix: string;
  native: string;
  warnings: CzenglishWarning[];
  pattern: string;
  dueDate: string;
  interval: number;
  successCount: number; // mastered after 2 successful attempts
  mastered: boolean;
}

export interface DayStats {
  words: number;
  answers: number;
}

export interface AppState {
  version: 1;
  settings: Settings;
  vocab: VocabCard[];
  mistakes: Mistake[];
  days: Record<string, DayStats>; // key YYYY-MM-DD (local)
  addedPacks: string[];
}
