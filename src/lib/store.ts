import { useSyncExternalStore } from 'react';
import type { AppState, CzenglishWarning, DayStats, Evaluation, Mistake, Settings, VocabCard } from './types';
import { newSrs } from './srs';
import { toast } from './ui';

const KEY = 'ajna-state-v1';

export const defaultSettings: Settings = {
  provider: 'gemini',
  openaiKey: '',
  anthropicKey: '',
  geminiKey: '',
  openaiModel: 'gpt-4o-mini',
  anthropicModel: 'claude-sonnet-5-5',
  geminiModel: 'gemini-flash-latest',
  accent: 'en-US',
  theme: 'dark',
  ttsRate: 1,
  micMode: 'toggle',
  autoSaveMistakes: true,
  autoPlayRoleplay: true,
  level: 2,
  focus: null,
  dailyGoal: 100,
  sttEngine: 'auto',
  sound: true,
  onboarded: false,
  color: 'violet',
};

function initial(): AppState {
  return { version: 1, settings: { ...defaultSettings }, vocab: [], mistakes: [], days: {}, addedPacks: [], levelLog: [], phraseStats: {}, games: {}, badgesSeen: [], wordle: null };
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
    settings: migrateSettings({
      ...base.settings,
      // people who already practised don't need the welcome tour
      onboarded: !!(d.days && Object.keys(d.days).length) || !!d.settings?.geminiKey,
      ...(d.settings ?? {}),
    }),
    vocab: Array.isArray(d.vocab) ? d.vocab : [],
    mistakes: Array.isArray(d.mistakes) ? d.mistakes : [],
    days: d.days && typeof d.days === 'object' ? d.days : {},
    addedPacks: Array.isArray(d.addedPacks) ? d.addedPacks : [],
    levelLog: Array.isArray(d.levelLog) ? d.levelLog : [],
    phraseStats: d.phraseStats && typeof d.phraseStats === 'object' ? d.phraseStats : {},
    games: d.games && typeof d.games === 'object' ? d.games : {},
    wordle: d.wordle && typeof d.wordle === 'object' ? d.wordle : null,
    // existing users: don't celebrate everything they unlocked before badges existed
    badgesSeen: Array.isArray(d.badgesSeen) ? d.badgesSeen : d.days && Object.keys(d.days).length ? ['__legacy'] : [],
  };
}

function migrateSettings(s: Settings): Settings {
  // gemini-2.5-flash (old default) is no longer offered to new API users
  if (s.geminiModel === 'gemini-2.5-flash') return { ...s, geminiModel: 'gemini-flash-latest' };
  return s;
}

let state: AppState = load();
persist(); // write back any migrated settings
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

export function dayXp(d: DayStats | undefined) {
  if (!d) return 0;
  return d.xp ?? d.answers * 10;
}

export function totalXp(days: Record<string, DayStats>) {
  return Object.values(days).reduce((a, d) => a + dayXp(d), 0);
}

/** Player rank from total XP: every rank needs a bit more than the previous one. */
export function rankOf(xp: number) {
  let rank = 1;
  let need = 200;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    rank++;
    need = 200 + (rank - 1) * 100;
  }
  const names = ['Začátečník', 'Odvážlivec', 'Mluvka', 'Konverzátor', 'Vypravěč', 'Řečník', 'Diplomat', 'Mistr slova'];
  return { rank, name: names[Math.min(rank, names.length) - 1], into: rest, need };
}

function currentRoute() {
  return location.hash.replace(/^#\/?/, '') || 'home';
}

/** Add XP to today; celebrates when the daily goal is reached. */
export function addXp(n: number) {
  const k = todayKey();
  const before = dayXp(state.days[k]);
  setState((s) => {
    const cur = s.days[k] ?? { words: 0, answers: 0 };
    return { ...s, days: { ...s.days, [k]: { ...cur, xp: dayXp(cur) + n } } };
  });
  const goal = state.settings.dailyGoal;
  if (before < goal && before + n >= goal) toast(`Denní cíl splněn! +${goal} XP · série ${streak(state.days)} ${streak(state.days) === 1 ? 'den' : 'dní'}`);
}

/** Record a spoken/typed answer for streak + words-today stats + XP. */
export function recordSpeech(text: string) {
  const words = countWords(text);
  if (!words) return;
  const k = todayKey();
  const route = currentRoute();
  setState((s) => {
    const cur = s.days[k] ?? { words: 0, answers: 0 };
    const modes = { ...(cur.modes ?? {}), [route]: (cur.modes?.[route] ?? 0) + 1 };
    return { ...s, days: { ...s.days, [k]: { ...cur, xp: dayXp(cur), words: cur.words + words, answers: cur.answers + 1, modes } } };
  });
  // 5 XP for answering + up to 10 for saying more
  addXp(5 + Math.min(10, Math.floor(words / 2)));
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

/** Remember whether an exercise at the current level was passed (last 40 kept). */
export function recordLevelResult(ok: boolean) {
  if (ok) addXp(5);
  setState((s) => ({
    ...s,
    levelLog: [...s.levelLog, { level: s.settings.level, ok, at: new Date().toISOString(), focus: s.settings.focus }].slice(-40),
  }));
}

/** Suggest moving up (8+/10 passed) or down (3 or fewer of 10) from the last 10 results at the current level. */
export function levelSuggestion(log: AppState['levelLog'], level: number): 'up' | 'down' | null {
  const recent = log.filter((x) => x.level === level).slice(-10);
  if (recent.length < 10) return null;
  const ok = recent.filter((x) => x.ok).length;
  if (ok >= 8 && level < 5) return 'up';
  if (ok <= 3 && level > 1) return 'down';
  return null;
}

export function recordPhrase(id: string, ok: boolean) {
  setState((s) => {
    const cur = s.phraseStats[id] ?? { ok: 0, fail: 0, at: '' };
    return { ...s, phraseStats: { ...s.phraseStats, [id]: { ok: cur.ok + (ok ? 1 : 0), fail: cur.fail + (ok ? 0 : 1), at: new Date().toISOString() } } };
  });
  if (ok) addXp(3);
}

/** A non-spoken answer (games): counts for the streak, the daily plan and XP. */
export function recordActivity(route: string, xp: number) {
  const k = todayKey();
  setState((s) => {
    const cur = s.days[k] ?? { words: 0, answers: 0 };
    const modes = { ...(cur.modes ?? {}), [route]: (cur.modes?.[route] ?? 0) + 1 };
    return { ...s, days: { ...s.days, [k]: { ...cur, xp: dayXp(cur), answers: cur.answers + 1, modes } } };
  });
  if (xp > 0) addXp(xp);
}

/** Store the result of a finished game round. Returns true if it is a new best. */
export function recordGame(id: string, score: number, total: number, time?: number): boolean {
  const cur = state.games[id] ?? { plays: 0, best: 0, correct: 0 };
  const newBest = score > cur.best || (time !== undefined && score === total && (cur.bestTime === undefined || time < cur.bestTime));
  setState((s) => ({
    ...s,
    games: {
      ...s.games,
      [id]: {
        plays: cur.plays + 1,
        best: Math.max(cur.best, score),
        correct: cur.correct + score,
        bestTime: time !== undefined && score === total ? Math.min(cur.bestTime ?? Infinity, time) : cur.bestTime,
        perfect: (cur.perfect ?? 0) + (score === total ? 1 : 0),
      },
    },
  }));
  return newBest && cur.plays > 0;
}
