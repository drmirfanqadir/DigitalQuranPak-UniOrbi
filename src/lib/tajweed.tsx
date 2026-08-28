import type { ReactNode } from "react";

export const TAJWEED_COLORS = {
  qalqalah: { color: "#3b82f6", label: "Qalqalah (Echo)" },
  tafkhim:  { color: "#ef4444", label: "Tafkhim (Heavy)" },
  shaddah:  { color: "#ec4899", label: "Shaddah (Stress)" },
  madd:     { color: "#f59e0b", label: "Madd (Elongation)" },
  ghunna:   { color: "#22c55e", label: "Ghunna (Nasalization)" },
};

const RULES: { pattern: RegExp; color: string }[] = [
  // Shaddah diacritic U+0651
  { pattern: /[\u064B-\u065F]*\u0651[\u064B-\u065F]*/g, color: TAJWEED_COLORS.shaddah.color },
  // Qalqalah letters: ق ط ب ج د
  { pattern: /[\u0642\u0637\u0628\u062C\u062F]/g, color: TAJWEED_COLORS.qalqalah.color },
  // Tafkhim letters: خ ص ض ط ظ غ ق
  { pattern: /[\u062E\u0635\u0636\u0637\u0638\u063A\u0642]/g, color: TAJWEED_COLORS.tafkhim.color },
];

export function applyTajweedColors(text: string): ReactNode {
  if (!text) return text;

  const ranges: { start: number; end: number; color: string }[] = [];
  for (const rule of RULES) {
    const re = new RegExp(rule.pattern.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      ranges.push({ start: m.index, end: m.index + m[0].length, color: rule.color });
    }
  }

  if (ranges.length === 0) return text;

  ranges.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number; color: string }[] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.start < last.end) continue;
    merged.push(r);
  }

  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const r of merged) {
    if (r.start > cursor) parts.push(text.slice(cursor, r.start));
    parts.push(
      <span key={`tj-${r.start}`} style={{ color: r.color }}>
        {text.slice(r.start, r.end)}
      </span>
    );
    cursor = r.end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}
