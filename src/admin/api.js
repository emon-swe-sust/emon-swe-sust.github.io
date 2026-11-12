// Thin client for the dev-only API in scripts/admin-api.js.
const BASE = "/__admin";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: { "X-Admin-Request": "1", ...(options.headers || {}) },
  });

  let body = null;
  try {
    body = await res.json();
  } catch (e) {
    // Not JSON: e.g. the dev server's index.html when the API isn't mounted.
  }

  if (!res.ok) {
    const error = new Error((body && body.error) || `Request failed (${res.status}).`);
    error.status = res.status;
    error.body = body;
    throw error;
  }
  return body;
}

export const getData = () => request("/data");

export const putData = (data, baseRev) =>
  request("/data", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, baseRev }),
  });

export const listImages = () => request("/images");

/** Browser file names can contain spaces etc.; the server only accepts a safe subset. */
export function safeFileName(name) {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : "";
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^[^A-Za-z0-9]+/, "")
    .replace(/-+$/, "");
  return `${base || "image"}${ext}`;
}

export const uploadImage = (file, dir) =>
  request(`/upload?dir=${encodeURIComponent(dir)}&name=${encodeURIComponent(safeFileName(file.name))}`, {
    method: "POST",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

/** Upload a PDF into public/. With replace, overwrites the existing file of that name (old copy is backed up). */
export const uploadPdf = (file, name, replace = false) =>
  request(`/upload?kind=pdf&name=${encodeURIComponent(safeFileName(name || file.name))}${replace ? "&replace=1" : ""}`, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: file,
  });
