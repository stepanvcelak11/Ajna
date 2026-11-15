import type { SrsState } from './types';

const DAY = 24 * 60 * 60 * 1000;

export function newSrs(): SrsState {
  return { dueDate: new Date().toISOString(), easeFactor: 2.5, interval: 0, level: 0, lapses: 0 };
}

/**
 * SM-2. quality 0..5 (>=3 counts as recalled).
 * 5 = perfect, 4 = correct after hesitation, 3 = correct with difficulty, <3 = failed.
 */
export function review(s: SrsState, quality: number, now = new Date()): SrsState {
  let { easeFactor, interval, level, lapses } = s;
  if (quality < 3) {
    level = 0;
    interval = 0; // see it again in ~10 minutes
    lapses += 1;
  } else {
    level += 1;
    if (level === 1) interval = 1;
    else if (level === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);
  }
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  const due = interval === 0 ? new Date(now.getTime() + 10 * 60 * 1000) : new Date(now.getTime() + interval * DAY);
  return { dueDate: due.toISOString(), easeFactor, interval, level, lapses, lastReviewed: now.toISOString() };
}

export function isDue(dueDate: string, now = new Date()) {
  return new Date(dueDate).getTime() <= now.getTime();
}

export function formatInterval(days: number) {
  if (days === 0) return '10 min';
  if (days < 1) return `${Math.round(days * 24)} h`;
  if (days < 30) return `${days} d`;
  return `${Math.round(days / 30)} mo`;
}
