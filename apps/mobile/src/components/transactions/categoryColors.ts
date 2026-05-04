/**
 * Maps any category string to a stable accent color from a fixed palette.
 * Uses a simple hash so the same category always returns the same color,
 * regardless of how OpenAI phrased it (case-normalised before hashing).
 */
const PALETTE = [
  '#FF6B6B', // coral red
  '#FF9F43', // warm orange
  '#FECA57', // golden yellow
  '#20BF6B', // fresh green
  '#26DE81', // mint
  '#2BCBBA', // teal
  '#45AAF2', // sky blue
  '#4B7BEC', // blue
  '#A55EEA', // purple
  '#FD9644', // amber
];

function hashCategory(category: string): number {
  const lower = category.toLowerCase();
  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = (hash * 31 + lower.charCodeAt(i)) & 0xffff;
  }
  return hash;
}

export function getCategoryColor(category: string): string {
  return PALETTE[hashCategory(category) % PALETTE.length];
}
