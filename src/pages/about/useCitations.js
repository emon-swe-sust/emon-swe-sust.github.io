import { useEffect, useState } from "react";

// Pulls "cited by" counts for a paper from its DOI. Free, key-less APIs, called from the browser.
// OpenAlex first (broader coverage), Crossref as the fallback. Counts are cached for a day so the
// page does not call them again on every visit. Any failure just means no number is shown.

const DAY = 24 * 60 * 60 * 1000;
const memory = new Map();

/** "https://link.springer.com/chapter/10.1007/978-3-031-41676-7_19" or "10.1007/..." -> bare DOI */
export function doiFrom(value) {
  const m = String(value || "").match(/10\.\d{4,9}\/[^\s?#]+/i);
  return m ? decodeURIComponent(m[0]).replace(/[.,;)]+$/, "") : null;
}

const readCache = (doi) => {
  try {
    const hit = JSON.parse(window.localStorage.getItem(`cites:${doi}`));
    if (hit && Date.now() - hit.at < DAY) return hit;
  } catch (e) {}
  return null;
};
const writeCache = (doi, value) => {
  try {
    window.localStorage.setItem(`cites:${doi}`, JSON.stringify({ ...value, at: Date.now() }));
  } catch (e) {}
};

async function lookup(doi) {
  try {
    const res = await fetch(`https://api.openalex.org/works/doi:${encodeURIComponent(doi)}`);
    if (res.ok) {
      const work = await res.json();
      if (typeof work.cited_by_count === "number") return { count: work.cited_by_count, source: "OpenAlex" };
    }
  } catch (e) {}
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    if (res.ok) {
      const body = await res.json();
      const count = body && body.message && body.message["is-referenced-by-count"];
      if (typeof count === "number") return { count, source: "Crossref" };
    }
  } catch (e) {}
  return null;
}

/** Same lookup for a whole list at once: returns [{count, source} | null, ...] in the same order. */
export function useCitationMap(values) {
  const key = values.map((v) => doiFrom(v) || "").join("|");
  const [map, setMap] = useState(() =>
    values.map((v) => {
      const doi = doiFrom(v);
      return (doi && (memory.get(doi) || readCache(doi))) || null;
    })
  );

  useEffect(() => {
    let live = true;
    key.split("|").forEach((doi, i) => {
      if (!doi) return;
      const known = memory.get(doi) || readCache(doi);
      const done = (found) => {
        if (!found) return;
        memory.set(doi, found);
        if (live) setMap((cur) => cur.map((c, j) => (j === i ? found : c)));
      };
      if (known) done(known);
      else lookup(doi).then((found) => {
        if (found) writeCache(doi, found);
        done(found);
      });
    });
    return () => {
      live = false;
    };
  }, [key]);

  return map;
}

export default function useCitations(doiValue) {
  const doi = doiFrom(doiValue);
  const [state, setState] = useState(() => (doi && (memory.get(doi) || readCache(doi))) || null);

  useEffect(() => {
    if (!doi) return undefined;
    const known = memory.get(doi) || readCache(doi);
    if (known) {
      memory.set(doi, known);
      setState(known);
      return undefined;
    }
    let live = true;
    lookup(doi).then((found) => {
      if (!found) return;
      memory.set(doi, found);
      writeCache(doi, found);
      if (live) setState(found);
    });
    return () => {
      live = false;
    };
  }, [doi]);

  return state; // { count, source } or null
}
