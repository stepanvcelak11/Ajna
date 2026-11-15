import { useSyncExternalStore } from 'react';
import type { AppState, CzenglishWarning, Evaluation, Mistake, Settings, VocabCard } from './types';
import { newSrs } from './srs';

const KEY = 'ajna-state-v1';

export const defaultSettings: Settings = {
  provider: 'gemini',
  openaiKey: '',
  anthropicKey: '',
  geminiKey: '',
  openaiModel: 'gpt-4o-mini',
  anthropicModel: 'claude-sonnet-5-5',
  geminiModel: 'gemini-2.5-flash',
  accent: 'en-US',
  theme: 'dark',
  ttsRate: 1,
  micMode: 'toggle',
  autoSaveMistakes: true,
  autoPlayRoleplay: true,
};

function initial(): AppState {
  return { version: 1, settings: { ...defaultSettings }, vocab: [], mistakes: [], days: {}, addedPacks: [] };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial();
    return normalize(JSON.parse(raw));
  } catch {
    return initial();
  }
}

export function normalize(data: unknown): AppState {
  const d = (data ?? {}) as Partial<AppState>;
  const base = initial();
  return {
    version: 1,
    settings: { ...base.settings, ...(d.settings ?? {}) },
    vocab: Array.isArray(d.vocab) ? d.vocab : [],
    mistakes: Array.isArray(d.mistakes) ? d.mistakes : [],
    days: d.days && typeof d.days === 'object' ? d.days : {},
    addedPacks: Array.isArray(d.addedPacks) ? d.addedPacks : [],
  };
}

let state: AppState = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

export function getState() {
  return state;
}

export function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state));
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---------- actions ----------

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Record a spoken/typed answer for streak + words-today stats. */
export function recordSpeech(text: string) {
  const words = countWords(text);
  if (!words) return;
  const k = todayKey();
  setState((s) => {
    const cur = s.days[k] ?? { words: 0, answers: 0 };
    return { ...s, days: { ...s.days, [k]: { words: cur.words + words, answers: cur.answers + 1 } } };
  });
}

export function streak(days: Record<string, { answers: number }>) {
  let n = 0;
  const d = new Date();
  // today counts if practised; otherwise the streak is still alive from yesterday
  if (!days[todayKey(d)]?.answers) d.setDate(d.getDate() - 1);
  while (days[todayKey(d)]?.answers) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function normEn(s: string) {
  return s.trim().toLowerCase().replace(/[.,!?;:"]/g, '');
}

export function addVocab(card: Omit<VocabCard, 'id' | 'createdAt' | 'srs'>): boolean {
  const exists = state.vocab.some((v) => normEn(v.en) === normEn(card.en));
  if (exists) return false;
  const full: VocabCard = { ...card, id: uid(), createdAt: new Date().toISOString(), srs: newSrs() };
  setState((s) => ({ ...s, vocab: [full, ...s.vocab] }));
  return true;
}

export function hasVocab(en: string) {
  return state.vocab.some((v) => normEn(v.en) === normEn(en));
}

export function saveMistake(e: Evaluation, mode: string, prompt_cz?: string): Mistake | null {
  if (state.mistakes.some((m) => m.user_text === e.user_transcript && !m.mastered)) return null;
  const m: Mistake = {
    id: uid(),
    createdAt: new Date().toISOString(),
    mode,
    prompt_cz,
    user_text: e.user_transcript,
    fix: e.grammatical_fix,
    native: e.native_version,
    warnings: e.czenglish_warnings,
    pattern: e.main_pattern || e.czenglish_warnings[0]?.correction || 'General phrasing',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), // first review in ~12h
    interval: 0.5,
    successCount: 0,
    mastered: false,
  };
  setState((s) => ({ ...s, mistakes: [m, ...s.mistakes] }));
  return m;
}

export function isMistakeSaved(userText: string) {
  return state.mistakes.some((m) => m.user_text === userText);
}

export function topTraps(mistakes: Mistake[], n = 3) {
  const counts = new Map<string, { category: CzenglishWarning['category']; count: number; example: CzenglishWarning }>();
  for (const m of mistakes) {
    for (const w of m.warnings) {
      const c = counts.get(w.category);
      if (c) c.count++;
      else counts.set(w.category, { category: w.category, count: 1, example: w });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, n);
}

export function exportJson() {
  const { settings, ...rest } = state;
  // never export API keys
  const safe = { ...rest, settings: { ...settings, openaiKey: '', anthropicKey: '', geminiKey: '' } };
  return JSON.stringify({ ...safe, exportedAt: new Date().toISOString() }, null, 2);
}

export function importJson(text: string) {
  const parsed = normalize(JSON.parse(text));
  setState((s) => ({
    ...parsed,
    settings: { ...parsed.settings, openaiKey: s.settings.openaiKey, anthropicKey: s.settings.anthropicKey, geminiKey: s.settings.geminiKey },
  }));
}

export function resetAll() {
  setState((s) => ({ ...initial(), settings: s.settings }));
}
