import { useEffect, useRef, useSyncExternalStore } from 'react';

/**
 * Tiny ephemeral UI bus (not persisted):
 *  - the current answer text, so Word Rescue knows the context
 *  - an "insert" handler so a rescued word can be appended to the answer
 *  - hotkey actions (R = replay, S = save) registered by whatever card is on screen
 *  - toasts
 */
type Action = 'replay' | 'save';
interface UiState {
  rescueOpen: boolean;
  context: string;
  toast: { id: number; text: string } | null;
  /** changes whenever confetti should burst */
  confetti: number;
}
let ui: UiState = { rescueOpen: false, context: '', toast: null, confetti: 0 };
const ls = new Set<() => void>();
const emit = () => ls.forEach((l) => l());
const sub = (l: () => void) => (ls.add(l), () => ls.delete(l));

export function useUi<T>(sel: (s: UiState) => T) {
  return useSyncExternalStore(sub, () => sel(ui));
}
export function setUi(patch: Partial<UiState>) {
  ui = { ...ui, ...patch };
  emit();
}

let insertHandler: ((t: string) => void) | null = null;
export function setInsertHandler(fn: ((t: string) => void) | null) {
  insertHandler = fn;
}
export function insertIntoAnswer(t: string) {
  insertHandler?.(t);
  return !!insertHandler;
}

const actions: Record<Action, (() => void)[]> = { replay: [], save: [] };
export function runAction(a: Action) {
  const list = actions[a];
  const fn = list[list.length - 1];
  if (fn) fn();
  return !!fn;
}
/** Register a hotkey action; the most recently mounted handler wins. */
export function useAction(a: Action, fn: (() => void) | null) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!fn) return;
    const wrapper = () => ref.current?.();
    actions[a].push(wrapper);
    return () => {
      actions[a] = actions[a].filter((x) => x !== wrapper);
    };
  }, [a, !!fn]); // eslint-disable-line react-hooks/exhaustive-deps
}

let toastId = 0;
export function toast(text: string) {
  const id = ++toastId;
  setUi({ toast: { id, text } });
  setTimeout(() => {
    if (ui.toast?.id === id) setUi({ toast: null });
  }, 2200);
}

export function isTypingTarget(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
}

/** true while the browser has a network connection */
export function useOnline() {
  return useSyncExternalStore(
    (l) => {
      window.addEventListener('online', l);
      window.addEventListener('offline', l);
      return () => {
        window.removeEventListener('online', l);
        window.removeEventListener('offline', l);
      };
    },
    () => navigator.onLine,
  );
}

/** Burst of confetti over the whole screen. */
export function celebrate() {
  setUi({ confetti: Date.now() });
}
