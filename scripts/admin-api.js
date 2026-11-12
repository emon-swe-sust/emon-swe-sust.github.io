"use strict";

/**
 * Local-only admin API for the portfolio.
 *
 * Mounted by src/setupProxy.js, which Create React App runs ONLY inside the
 * development server (`npm start`). It is never part of `npm run build`, so the
 * deployed GitHub Pages site contains no admin code and no write access.
 *
 *   GET  /__admin/data     -> { data, rev }            current src/data.json
 *   PUT  /__admin/data     <- { data, baseRev }        validate, back up, write atomically
 *   GET  /__admin/images   -> { images: [...] }        image files under public/
 *   POST /__admin/upload   <- raw image bytes          saved under public/<dir>/<name>
 *
 * Because this endpoint writes files, every request must come from this machine
 * (loopback socket, localhost Host header). Writes also need a custom header,
 * which makes browsers preflight any cross-origin attempt.
 */

const fs = require("fs");
const os = require("os");
const { execFileSync } = require("child_process");
const path = require("path");
const crypto = require("crypto");

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]);
// iPhone photos. Browsers cannot show these, so they are converted to JPEG on upload.
const HEIC_EXT = new Set([".heic", ".heif"]);
const MAX_JSON_BYTES = 5 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const MAX_BACKUPS = 20;
const LOCAL_ADDRESSES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);
const SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

const sha1 = (text) => crypto.createHash("sha1").update(text).digest("hex");

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(payload);
}

function hostnameOf(hostHeader = "") {
  // "localhost:3000" -> "localhost", "[::1]:3000" -> "[::1]"
  if (hostHeader.startsWith("[")) return hostHeader.slice(0, hostHeader.indexOf("]") + 1);
  return hostHeader.split(":")[0].toLowerCase();
}

/** Returns an error message if the request must be refused, otherwise null. */
function guard(req) {
  if (!LOCAL_ADDRESSES.has(req.socket.remoteAddress)) {
    return "The admin API only accepts connections from this machine.";
  }
  if (!LOCAL_HOSTNAMES.has(hostnameOf(req.headers.host))) {
    return "Unexpected Host header.";
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (req.headers["x-admin-request"] !== "1") {
      return "Missing X-Admin-Request header.";
    }
    const origin = req.headers.origin;
    if (origin) {
      let originHost;
      try {
        originHost = new URL(origin).host;
      } catch (e) {
        return "Malformed Origin header.";
      }
      if (originHost !== req.headers.host) return "Cross-origin request refused.";
    }
  }
  return null;
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        tooLarge = true; // keep draining so the 413 can still be delivered
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (tooLarge) reject(new HttpError(413, "Request body is too large."));
      else resolve(Buffer.concat(chunks));
    });
    req.on("error", reject);
  });
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isStringList = (v) => Array.isArray(v) && v.every((s) => typeof s === "string");

/**
 * Structural checks only: the things that would crash a page on the site.
 * Content rules (empty titles etc.) are the admin UI's job.
 */
function validate(data) {
  const errors = [];
  if (!isObject(data)) return ["data.json must be a JSON object."];

  const about = data.about;
  if (!isObject(about)) {
    errors.push("about must be an object.");
  } else {
    if (!isStringList(about.descriptions)) errors.push("about.descriptions must be a list of strings.");
    if (!isStringList(about.researchInterest)) errors.push("about.researchInterest must be a list of strings.");
    const skills = about.skills;
    if (!isObject(skills)) {
      errors.push("about.skills must be an object.");
    } else {
      if (typeof skills.descriptions !== "string") errors.push("about.skills.descriptions must be a string.");
      for (const key of ["languages", "web_dev", "tools", "data_science"]) {
        if (!isStringList(skills[key])) errors.push(`about.skills.${key} must be a list of strings.`);
      }
    }
    const orgs = about.organizations;
    if (!isObject(orgs) || !Array.isArray(orgs.organization_list) || !orgs.organization_list.every(isObject)) {
      errors.push("about.organizations.organization_list must be a list of objects.");
    } else if (typeof orgs.description !== "string") {
      errors.push("about.organizations.description must be a string.");
    }
  }

  for (const key of ["education", "experience", "projects", "researches"]) {
    if (!Array.isArray(data[key]) || !data[key].every(isObject)) {
      errors.push(`${key} must be a list of objects.`);
    }
  }
  if (Array.isArray(data.projects)) {
    data.projects.forEach((p, i) => {
      if (isObject(p) && !Array.isArray(p.pictures)) {
        errors.push(`projects[${i}].pictures must be a list (it can be empty).`);
      }
    });
  }
  if (Array.isArray(data.education)) {
    data.education.forEach((e, i) => {
      if (!isObject(e)) return;
      const cw = e.course_works;
      if (cw !== undefined && !(isObject(cw) && isStringList(cw.first_row) && isStringList(cw.second_row))) {
        errors.push(`education[${i}].course_works needs first_row and second_row lists.`);
      }
      if (e.publications !== undefined && !Array.isArray(e.publications)) {
        errors.push(`education[${i}].publications must be a list.`);
      }
    });
  }
  return errors;
}

const PRINT_WIDTH = 80;
const isPrimitive = (v) => v === null || typeof v !== "object";

/**
 * Formats JSON the way Prettier does for this repo's data.json: objects always
 * expanded, lists of plain values kept on one line when they fit in 80 columns,
 * otherwise one value per line. Saving unchanged data therefore reproduces the
 * file exactly, and git diffs only show what you actually edited.
 *
 * `used` is how many columns the line already holds before the value starts
 * (indent + `"key": `), `trailing` is the comma that follows it, if any.
 */
function formatJson(value, level = 0, used = 0, trailing = "") {
  const pad = "  ".repeat(level);
  const inner = "  ".repeat(level + 1);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (value.every(isPrimitive)) {
      const flat = "[" + value.map((v) => JSON.stringify(v)).join(", ") + "]";
      if (pad.length + used + flat.length + trailing.length <= PRINT_WIDTH) return flat;
    }
    const items = value.map((item, i) =>
      inner + formatJson(item, level + 1, 0, i < value.length - 1 ? "," : "")
    );
    return "[\n" + items.join(",\n") + "\n" + pad + "]";
  }

  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return "{}";
    const lines = keys.map((key, i) => {
      const prefix = JSON.stringify(key) + ": ";
      const last = i === keys.length - 1;
      return inner + prefix + formatJson(value[key], level + 1, prefix.length, last ? "" : ",");
    });
    return "{\n" + lines.join(",\n") + "\n" + pad + "}";
  }

  return JSON.stringify(value);
}

const plainJson = (data) => JSON.stringify(data, null, 2) + "\n";
const prettierJson = (data) => formatJson(data) + "\n";

/**
 * Writes `data` in the same style as the file it replaces, so unchanged data
 * gives an identical file and git diffs only show real edits. Pass the current
 * file text as `reference`; if it matches neither known style, plain 2-space
 * JSON is used.
 */
function serialize(data, reference) {
  if (typeof reference === "string") {
    let parsed;
    try {
      parsed = JSON.parse(reference);
    } catch (e) {
      return plainJson(data);
    }
    if (prettierJson(parsed) === reference) return prettierJson(data);
  }
  return plainJson(data);
}

function listImages(publicDir) {
  const images = [];
  const walk = (dir, depth) => {
    if (depth > 6) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, depth + 1);
      else if (entry.isFile() && IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
        const rel = path.relative(publicDir, full).split(path.sep).join("/");
        images.push({ path: "/" + rel, bytes: fs.statSync(full).size });
      }
    }
  };
  walk(publicDir, 0);
  images.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
  return images;
}

function safeUploadTarget(publicDir, dirParam, nameParam) {
  const segments = String(dirParam || "").split("/").filter(Boolean);
  if (segments.length > 4 || !segments.every((s) => SAFE_SEGMENT.test(s) && s !== "..")) {
    throw new HttpError(400, "Folder may only use letters, numbers, '.', '_' and '-' (max 4 levels).");
  }
  const name = String(nameParam || "");
  if (!SAFE_SEGMENT.test(name)) {
    throw new HttpError(400, "File name may only use letters, numbers, '.', '_' and '-'.");
  }
  const ext = path.extname(name).toLowerCase();
  if (!IMAGE_EXT.has(ext) && !HEIC_EXT.has(ext)) {
    throw new HttpError(400, `Only image files are accepted (${[...IMAGE_EXT, ...HEIC_EXT].join(", ")}).`);
  }
  const dir = path.resolve(publicDir, ...segments);
  if (dir !== publicDir && !dir.startsWith(publicDir + path.sep)) {
    throw new HttpError(400, "Folder escapes the public directory.");
  }
  return { dir, base: name.slice(0, name.length - ext.length), ext };
}

/** HEIC/HEIF -> JPEG using macOS's built-in `sips`. */
function heicToJpeg(buffer) {
  if (process.platform !== "darwin") {
    throw new HttpError(415, "HEIC files can only be converted on macOS. Export the photo as JPEG and upload that.");
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "admin-heic-"));
  const src = path.join(dir, "in.heic");
  const out = path.join(dir, "out.jpg");
  try {
    fs.writeFileSync(src, buffer);
    execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "90", src, "--out", out], { stdio: "ignore" });
    return fs.readFileSync(out);
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(415, "Could not convert that HEIC file. Export it as JPEG and upload that.");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function writeUnique(dir, base, ext, buffer) {
  fs.mkdirSync(dir, { recursive: true });
  for (let n = 0; n < 1000; n++) {
    const file = path.join(dir, n === 0 ? `${base}${ext}` : `${base}-${n}${ext}`);
    try {
      fs.writeFileSync(file, buffer, { flag: "wx" }); // never overwrite an existing file
      return file;
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }
  }
  throw new HttpError(409, "Too many files with that name.");
}

function pruneBackups(backupDir) {
  const files = fs.readdirSync(backupDir).filter((f) => f.startsWith("data-") && f.endsWith(".json")).sort();
  for (const f of files.slice(0, Math.max(0, files.length - MAX_BACKUPS))) {
    fs.unlinkSync(path.join(backupDir, f));
  }
}

function createHandlers({ root }) {
  const dataFile = path.join(root, "src", "data.json");
  const publicDir = path.join(root, "public");
  const backupDir = path.join(root, ".admin-backups");

  const readRaw = () => fs.readFileSync(dataFile, "utf8");

  return {
    getData() {
      const raw = readRaw();
      return { data: JSON.parse(raw), rev: sha1(raw) };
    },

    async putData(req) {
      const body = await readBody(req, MAX_JSON_BYTES);
      let payload;
      try {
        payload = JSON.parse(body.toString("utf8"));
      } catch (e) {
        throw new HttpError(400, "Request body is not valid JSON.");
      }
      const { data, baseRev } = payload || {};

      const errors = validate(data);
      if (errors.length) throw new HttpError(422, "data.json would be invalid.", { errors });

      const current = readRaw();
      const currentRev = sha1(current);
      if (baseRev !== currentRev) {
        throw new HttpError(
          409,
          "src/data.json changed on disk after the admin loaded it. Reload to pick up the new version, or overwrite it.",
          { rev: currentRev }
        );
      }

      const next = serialize(data, current);
      if (next === current) return { rev: currentRev, changed: false };

      fs.mkdirSync(backupDir, { recursive: true });
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      fs.writeFileSync(path.join(backupDir, `data-${stamp}.json`), current);
      pruneBackups(backupDir);

      // Write a temp file next to the target, then rename: the dev server's
      // file watcher never sees a half-written data.json.
      const tmp = path.join(path.dirname(dataFile), `.data.json.${process.pid}.tmp`);
      fs.writeFileSync(tmp, next);
      fs.renameSync(tmp, dataFile);
      return { rev: sha1(next), changed: true };
    },

    getImages() {
      return { images: listImages(publicDir) };
    },

    async upload(req, query) {
      const target = safeUploadTarget(publicDir, query.get("dir"), query.get("name"));
      const body = await readBody(req, MAX_UPLOAD_BYTES);
      if (!body.length) throw new HttpError(400, "Empty upload.");
      const isHeic = HEIC_EXT.has(target.ext);
      const file = writeUnique(target.dir, target.base, isHeic ? ".jpg" : target.ext, isHeic ? heicToJpeg(body) : body);
      const rel = path.relative(publicDir, file).split(path.sep).join("/");
      return { path: "/" + rel };
    },
  };
}

function mountAdminApi(app, { root }) {
  const handlers = createHandlers({ root });

  app.use("/__admin", async (req, res) => {
    try {
      const refusal = guard(req);
      if (refusal) throw new HttpError(403, refusal);

      const url = new URL(req.url, "http://localhost");
      const route = `${req.method} ${url.pathname}`;
      switch (route) {
        case "GET /data":
          return send(res, 200, handlers.getData());
        case "PUT /data":
          return send(res, 200, await handlers.putData(req));
        case "GET /images":
          return send(res, 200, handlers.getImages());
        case "POST /upload":
          return send(res, 200, await handlers.upload(req, url.searchParams));
        default:
          throw new HttpError(404, `No admin route for ${route}.`);
      }
    } catch (err) {
      const status = err.status || 500;
      if (status === 500) console.error("[admin]", err);
      send(res, status, { error: err.message, ...(err.extra || {}) });
    }
  });

  console.log("[admin] Admin API mounted. Open <dev server URL>/#/admin to edit src/data.json.");
}

module.exports = { mountAdminApi, createHandlers, validate, serialize, guard };
