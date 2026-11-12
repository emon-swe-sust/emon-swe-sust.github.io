// Throwaway end-to-end check of scripts/admin-api.js against a TEMP COPY of the
// project (never the real src/data.json). Usage: node admin-api-smoke-test.js <projectRoot>
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const assert = require("assert");

const projectRoot = path.resolve(process.argv[2]);
const { mountAdminApi, validate, serialize } = require(path.join(projectRoot, "scripts", "admin-api.js"));
const express = require(path.join(projectRoot, "node_modules", "express"));

// Temp copy: data.json + a couple of public images.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "admin-smoke-"));
fs.mkdirSync(path.join(tmp, "src"));
fs.mkdirSync(path.join(tmp, "public", "projects", "demo"), { recursive: true });
fs.copyFileSync(path.join(projectRoot, "src", "data.json"), path.join(tmp, "src", "data.json"));
fs.writeFileSync(path.join(tmp, "public", "projects", "demo", "1.png"), "x");
fs.writeFileSync(path.join(tmp, "public", "index.html"), "<html>");
fs.writeFileSync(path.join(tmp, "public", ".DS_Store"), "x");

const app = express();
mountAdminApi(app, { root: tmp });
const server = app.listen(0, "127.0.0.1");

const call = (method, url, { headers = {}, body, host } = {}) =>
  new Promise((resolve, reject) => {
    const { port } = server.address();
    const req = http.request(
      { host: "127.0.0.1", port, method, path: url, headers: { ...(host ? { Host: host } : {}), ...headers } },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString();
          let json = null;
          try { json = JSON.parse(text); } catch (e) {}
          resolve({ status: res.statusCode, json, text });
        });
      }
    );
    req.on("error", reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
const ADMIN = { "X-Admin-Request": "1" };
const put = (payload, extra = {}) =>
  call("PUT", "/__admin/data", { headers: { ...ADMIN, "Content-Type": "application/json", ...extra }, body: JSON.stringify(payload) });

let passed = 0;
const ok = (name) => { passed++; console.log("  ✓", name); };

(async () => {
  if (!server.listening) await new Promise((resolve) => server.once("listening", resolve));

  // --- read + formatting round trip ---------------------------------------
  const raw = fs.readFileSync(path.join(tmp, "src", "data.json"), "utf8");
  assert.strictEqual(serialize(JSON.parse(raw), raw), raw, "serialize() must reproduce the existing file byte-for-byte");
  // ...and in the other known style too.
  const plain = JSON.stringify(JSON.parse(raw), null, 2) + "\n";
  assert.strictEqual(serialize(JSON.parse(plain), plain), plain);
  ok("serialize() reproduces the current data.json byte-for-byte");

  let r = await call("GET", "/__admin/data");
  assert.strictEqual(r.status, 200);
  assert.ok(r.json.rev && r.json.data.projects.length === 8);
  assert.deepStrictEqual(validate(r.json.data), []);
  ok("GET /data returns the data + a revision, and the real data validates");
  const rev0 = r.json.rev;

  // --- no-op save does not touch the file ---------------------------------
  const mtime0 = fs.statSync(path.join(tmp, "src", "data.json")).mtimeMs;
  r = await put({ data: r.json.data, baseRev: rev0 });
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.json.changed, false);
  assert.strictEqual(fs.statSync(path.join(tmp, "src", "data.json")).mtimeMs, mtime0);
  assert.ok(!fs.existsSync(path.join(tmp, ".admin-backups")));
  ok("saving unchanged data writes nothing (no churn, no backup)");

  // --- real edit: write, backup, new rev ----------------------------------
  const edited = JSON.parse(raw);
  edited.projects.unshift({ title: "Smoke test project", pictures: [], year: "2026", titleSecond: "t", association_with: "", technologies: ["X"], features: [], involvements: [] });
  edited.about.descriptions[0] = "Edited — with “unicode” & <b>html</b>";
  r = await put({ data: edited, baseRev: rev0 });
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.json.changed, true);
  const onDisk = JSON.parse(fs.readFileSync(path.join(tmp, "src", "data.json"), "utf8"));
  assert.strictEqual(onDisk.projects[0].title, "Smoke test project");
  assert.strictEqual(onDisk.projects.length, 9);
  assert.strictEqual(onDisk.about.descriptions[0], "Edited — with “unicode” & <b>html</b>");
  const backups = fs.readdirSync(path.join(tmp, ".admin-backups"));
  assert.strictEqual(backups.length, 1);
  assert.strictEqual(fs.readFileSync(path.join(tmp, ".admin-backups", backups[0]), "utf8"), raw, "backup holds the previous content");
  assert.deepStrictEqual(fs.readdirSync(path.join(tmp, "src")).filter((f) => f.includes("tmp")), [], "no temp file left behind");
  ok("PUT writes the file, keeps a backup of the old version, leaves no temp file");
  const rev1 = r.json.rev;

  // --- stale revision is refused ------------------------------------------
  r = await put({ data: edited, baseRev: rev0 });
  assert.strictEqual(r.status, 409);
  assert.strictEqual(r.json.rev, rev1);
  ok("stale baseRev -> 409 with the current rev (no silent overwrite)");

  // --- validation ---------------------------------------------------------
  const broken = JSON.parse(JSON.stringify(edited));
  delete broken.projects[0].pictures;
  broken.education[0].course_works = { first_row: [] };
  r = await put({ data: broken, baseRev: rev1 });
  assert.strictEqual(r.status, 422);
  assert.ok(r.json.errors.some((e) => e.includes("projects[0].pictures")));
  assert.ok(r.json.errors.some((e) => e.includes("course_works")));
  r = await put({ data: { nope: 1 }, baseRev: rev1 });
  assert.strictEqual(r.status, 422);
  ok("structurally broken data is rejected (422) and not written");
  assert.strictEqual(JSON.parse(fs.readFileSync(path.join(tmp, "src", "data.json"), "utf8")).projects.length, 9);

  r = await call("PUT", "/__admin/data", { headers: { ...ADMIN }, body: "{not json" });
  assert.strictEqual(r.status, 400);
  ok("malformed JSON body -> 400");

  // --- request guards -----------------------------------------------------
  r = await call("PUT", "/__admin/data", { headers: { "Content-Type": "application/json" }, body: "{}" });
  assert.strictEqual(r.status, 403);
  ok("write without X-Admin-Request header -> 403");
  r = await put({ data: edited, baseRev: rev1 }, { Origin: "https://evil.example" });
  assert.strictEqual(r.status, 403);
  ok("write with a foreign Origin -> 403");
  r = await call("GET", "/__admin/data", { host: "evil.example" });
  assert.strictEqual(r.status, 403);
  ok("non-localhost Host header (DNS rebinding) -> 403");
  r = await call("GET", "/__admin/nope");
  assert.strictEqual(r.status, 404);
  ok("unknown route -> 404");

  // --- images -------------------------------------------------------------
  r = await call("GET", "/__admin/images");
  assert.strictEqual(r.status, 200);
  assert.deepStrictEqual(r.json.images.map((i) => i.path), ["/projects/demo/1.png"]);
  ok("GET /images lists only image files (skips index.html and dotfiles)");

  const png = Buffer.from("89504e470d0a1a0a", "hex");
  const upload = (dir, name, body = png) =>
    call("POST", `/__admin/upload?dir=${encodeURIComponent(dir)}&name=${encodeURIComponent(name)}`, { headers: { ...ADMIN, "Content-Type": "image/png" }, body });
  r = await upload("projects/demo", "2.png");
  assert.strictEqual(r.json.path, "/projects/demo/2.png");
  r = await upload("projects/demo", "2.png");
  assert.strictEqual(r.json.path, "/projects/demo/2-1.png");
  assert.deepStrictEqual(fs.readFileSync(path.join(tmp, "public", "projects", "demo", "2.png")), png);
  ok("upload saves under public/<dir>, and never overwrites (2.png -> 2-1.png)");
  r = await upload("", "root.png");
  assert.strictEqual(r.json.path, "/root.png");
  r = await upload("brand/new/dir", "logo.svg", Buffer.from("<svg/>"));
  assert.strictEqual(r.json.path, "/brand/new/dir/logo.svg");
  ok("upload can target the public root and create new folders");

  for (const [dir, name, label] of [
    ["../src", "x.png", "dir traversal"],
    ["projects/../../src", "x.png", "nested dir traversal"],
    ["/etc", "x.png", "absolute-looking dir is normalised, not escaped"],
    ["projects", "../../src/data.json", "name traversal"],
    ["projects", "evil.js", "non-image extension"],
    ["projects", "evil.png.html", "double extension to html"],
    ["projects", ".htaccess", "dotfile name"],
  ]) {
    r = await upload(dir, name);
    if (label.startsWith("absolute")) {
      assert.strictEqual(r.status, 200);
      assert.ok(fs.existsSync(path.join(tmp, "public", "etc", "x.png")), "stays inside public/");
      assert.ok(!fs.existsSync("/etc/x.png"));
    } else {
      assert.strictEqual(r.status, 400, `${label} should be refused, got ${r.status}`);
    }
  }
  ok("upload refuses traversal, non-image extensions, dotfiles; stays inside public/");
  assert.strictEqual(JSON.parse(fs.readFileSync(path.join(tmp, "src", "data.json"), "utf8")).projects.length, 9, "data.json untouched by upload attempts");

  r = await call("POST", "/__admin/upload?dir=projects&name=big.png", { headers: { ...ADMIN }, body: Buffer.alloc(16 * 1024 * 1024) });
  assert.strictEqual(r.status, 413);
  ok("upload over 15 MB -> 413");

  // --- backup pruning -----------------------------------------------------
  let rev = rev1;
  let cur = edited;
  for (let i = 0; i < 25; i++) {
    cur = JSON.parse(JSON.stringify(cur));
    cur.about.researchInterest.push("n" + i);
    r = await put({ data: cur, baseRev: rev });
    assert.strictEqual(r.status, 200, "save " + i);
    rev = r.json.rev;
    await new Promise((res) => setTimeout(res, 2)); // distinct timestamps
  }
  assert.strictEqual(fs.readdirSync(path.join(tmp, ".admin-backups")).length, 20);
  ok("backups are pruned to the newest 20");

  console.log(`\nAll ${passed} checks passed.`);
  server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
})().catch((err) => {
  console.error("\nFAILED:", err.message);
  console.error(err.stack.split("\n").slice(1, 4).join("\n"));
  server.close();
  process.exit(1);
});
