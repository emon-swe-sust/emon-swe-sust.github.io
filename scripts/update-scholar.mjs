// Reads the public Google Scholar profile and saves citation and paper counts
// to src/scholar.json. Run daily by .github/workflows/scholar.yml.
//
// Google has no official API and sometimes blocks automated requests. When
// anything goes wrong this script keeps the last saved numbers and exits
// without an error, so the site never shows a blank or broken bar.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const USER = "ugFyqqEAAAAJ";
const OUT = "src/scholar.json";
const URL_ = `https://scholar.google.com/citations?user=${USER}&hl=en&cstart=0&pagesize=100`;

export function parse(html) {
  // The side panel has six numbers: citations (all, since), h-index (all,
  // since), i10-index (all, since).
  const nums = [...html.matchAll(/class="gsc_rsb_std">(\d+)</g)].map((m) => Number(m[1]));
  if (nums.length < 4) return null;
  const rows = (html.match(/class="gsc_a_tr"/g) || []).length;
  return { citations: nums[0], hIndex: nums[2], publications: rows };
}

async function fetchProfile() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(URL_, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          "accept-language": "en-US,en;q=0.9",
        },
      });
      if (res.ok) {
        const parsed = parse(await res.text());
        if (parsed) return parsed;
        console.log(`Attempt ${attempt}: page loaded but had no profile numbers (likely a bot check).`);
      } else {
        console.log(`Attempt ${attempt}: HTTP ${res.status}`);
      }
    } catch (e) {
      console.log(`Attempt ${attempt}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 4000 * attempt));
  }
  return null;
}

async function main() {
  const old = JSON.parse(readFileSync(OUT, "utf8"));
  const got = await fetchProfile();
  if (!got) {
    console.log("::warning::Could not read Google Scholar. Keeping the last saved numbers.");
    return;
  }
  const same =
    old.citations === got.citations &&
    old.publications === got.publications &&
    old.hIndex === got.hIndex;
  if (same) {
    console.log("No change:", got);
    return;
  }
  const next = { ...got, updated: new Date().toISOString().slice(0, 10) };
  writeFileSync(OUT, JSON.stringify(next, null, 2) + "\n");
  console.log("Updated:", next);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
