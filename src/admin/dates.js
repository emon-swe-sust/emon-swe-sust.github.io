// Dates in data.json are display text such as "Nov 2023 - Present", "2018-2022" or "Present".
// These helpers turn that text into editable parts and back, keeping the same style, so the
// site renders exactly what it did before.

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PART = new RegExp(`^(?:(${MONTHS.join("|")})[a-z]*\\.?\\s+)?(\\d{4})$`, "i");

function parsePart(text) {
  const s = text.trim();
  if (/^present$/i.test(s)) return { present: true };
  const m = s.match(PART);
  if (!m) return null;
  const month = m[1] ? MONTHS.findIndex((x) => x.toLowerCase() === m[1].toLowerCase()) + 1 : 0;
  return { month, year: m[2] };
}

/** -> { start: {month,year}, end: {month,year} | null, present } , or null if the text is free-form. */
export function parseRange(text) {
  const raw = String(text || "").trim();
  const empty = { start: { month: 0, year: "" }, end: { month: 0, year: "" }, present: false };
  if (!raw) return empty;
  const parts = raw.split(/\s*[-–—]\s*|\s+to\s+/i);
  if (parts.length > 2) return null;
  const a = parsePart(parts[0]);
  if (!a) return null;
  if (a.present) return parts.length === 1 ? { ...empty, present: true } : null;
  if (parts.length === 1) return { ...empty, start: a };
  const b = parsePart(parts[1]);
  if (!b) return null;
  if (b.present) return { start: a, end: { month: 0, year: "" }, present: true };
  return { start: a, end: b, present: false };
}

const fmt = (p, short) => {
  if (!p.year) return "";
  return p.month ? `${MONTHS[p.month - 1]} ${p.year}` : p.year;
};

/** Inverse of parseRange. Years-only ranges keep the compact "2018-2022" style. */
export function formatRange({ start, end, present }) {
  const s = fmt(start);
  const e = present ? "Present" : fmt(end);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  const compact = !start.month && !end.month && !present;
  return compact ? `${s}-${e}` : `${s} - ${e}`;
}
