export const SUBJECT_COLORS = [
  '#6366f1', // indigo
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#8b5cf6', // violet
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#e11d48', // rose
];

export function getNextColor(usedColors) {
  for (const c of SUBJECT_COLORS) {
    if (!usedColors.includes(c)) return c;
  }
  return SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)];
}
