export const isUrl = (value) =>
  typeof value === "string" && /^https?:\/\//i.test(value);

// Resolve a path from data.json ("/projects/x.png", "sust-logo.png") against
// the public folder; leave absolute URLs alone.
export const asset = (path) => {
  if (!path) return "";
  if (isUrl(path)) return path;
  return `${process.env.PUBLIC_URL || ""}/${String(path).replace(/^\/+/, "")}`;
};

// "Nov 2023 - Present" -> "Nov 2023 – Present", "2018-2022" -> "2018–2022"
export const tidyRange = (text) =>
  (text || "")
    .replace(/\s+-\s+/g, " – ")
    .replace(/(\d)-(\d)/g, "$1–$2");

// Group neighbouring items that share a key, keeping the original order.
export const groupConsecutive = (items, keyFn) => {
  const groups = [];
  items.forEach((item) => {
    const key = keyFn(item);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(item);
    } else {
      groups.push({ key, items: [item] });
    }
  });
  return groups;
};
