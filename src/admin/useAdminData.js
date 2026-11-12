import { useCallback, useEffect, useMemo, useState } from "react";
import { getData, putData } from "./api";
import { getIn, setIn } from "./schema";

const DRAFT_KEY = "portfolio-admin-draft";
const FLASH_KEY = "portfolio-admin-flash";

const readJson = (storage, key) => {
  try {
    return JSON.parse(storage.getItem(key));
  } catch (e) {
    return null;
  }
};
const writeJson = (storage, key, value) => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Storage full or blocked: drafts just won't survive a reload.
  }
};
const remove = (storage, key) => {
  try {
    storage.removeItem(key);
  } catch (e) {}
};

/** A message to show after the dev server reloads the page following a save. */
export function takeFlash() {
  const message = readJson(window.sessionStorage, FLASH_KEY);
  remove(window.sessionStorage, FLASH_KEY);
  return message;
}

/**
 * Loads src/data.json through the admin API and keeps an editable draft.
 *
 * The draft is mirrored to localStorage keyed by the file revision it was
 * based on. The dev server reloads the page whenever data.json or anything in
 * public/ changes (a save, an image upload), and the draft makes sure that never
 * costs you unsaved edits. A draft for an older revision is ignored.
 */
export default function useAdminData() {
  const [phase, setPhase] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(null); // { data, rev }: what is on disk
  const [draft, setDraft] = useState(null);
  const [restored, setRestored] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(null); // { rev, message }

  const load = useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      const res = await getData();
      if (!res || !res.data || !res.rev) {
        throw new Error(
          "The admin API did not answer. Start the site with `npm start` (the admin does not exist in a built site)."
        );
      }
      const stored = readJson(window.localStorage, DRAFT_KEY);
      if (stored && stored.baseRev === res.rev && stored.data) {
        setDraft(stored.data);
        setRestored(true);
      } else {
        remove(window.localStorage, DRAFT_KEY);
        setDraft(res.data);
        setRestored(false);
      }
      setSaved(res);
      setConflict(null);
      setPhase("ready");
    } catch (e) {
      setError(e.message);
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(
    () => phase === "ready" && JSON.stringify(draft) !== JSON.stringify(saved.data),
    [phase, draft, saved]
  );

  useEffect(() => {
    if (phase !== "ready") return;
    if (dirty) writeJson(window.localStorage, DRAFT_KEY, { baseRev: saved.rev, data: draft });
    else remove(window.localStorage, DRAFT_KEY);
  }, [phase, dirty, draft, saved]);

  /** update(path, value) or update(path, (old) => new) */
  const update = useCallback((path, valueOrFn) => {
    setDraft((current) => {
      const next = typeof valueOrFn === "function" ? valueOrFn(getIn(current, path)) : valueOrFn;
      return setIn(current, path, next);
    });
  }, []);

  const replaceAll = useCallback((data) => setDraft(data), []);

  const discard = useCallback(() => {
    setDraft(saved.data);
    setRestored(false);
    remove(window.localStorage, DRAFT_KEY);
  }, [saved]);

  /** Pass `overwriteRev` (from a conflict) to knowingly replace a newer file on disk. */
  const save = useCallback(
    async (overwriteRev) => {
      setSaving(true);
      setConflict(null);
      try {
        const res = await putData(draft, overwriteRev || saved.rev);
        setSaved({ data: draft, rev: res.rev });
        setRestored(false);
        remove(window.localStorage, DRAFT_KEY);
        writeJson(window.sessionStorage, FLASH_KEY, "Saved to src/data.json.");
        return { ok: true, changed: res.changed };
      } catch (e) {
        if (e.status === 409) {
          setConflict({ rev: e.body.rev, message: e.message });
          return { ok: false, conflict: true };
        }
        return { ok: false, message: e.message, details: e.body && e.body.errors };
      } finally {
        setSaving(false);
      }
    },
    [draft, saved]
  );

  const dismissConflict = useCallback(() => setConflict(null), []);

  return {
    phase, error, draft, saved, dirty, restored, saving, conflict,
    update, replaceAll, discard, save, dismissConflict, reload: load,
  };
}
