import type { AccentColor } from './types';

// [dark theme, light theme] accent values
export const ACCENTS: Record<AccentColor, { name: string; dark: string; light: string }> = {
  violet: { name: 'Fialová', dark: '#8b6cff', light: '#6d4aff' },
  blue: { name: 'Modrá', dark: '#4f8cff', light: '#2563eb' },
  teal: { name: 'Tyrkysová', dark: '#22c3b4', light: '#0d9488' },
  green: { name: 'Zelená', dark: '#34c771', light: '#16a34a' },
  orange: { name: 'Oranžová', dark: '#ff8a3d', light: '#ea580c' },
  pink: { name: 'Růžová', dark: '#f0609e', light: '#db2777' },
};
