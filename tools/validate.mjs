// Offline release gate: artwork, pack references, scenes aligned on the layout.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import sharp from "sharp";
import { ClassicLevel } from "classic-level";
import { GRID, INN, PASS, DOORS, PASS_DOORS, PASS_RUNS, FOYERS, wallSegments } from "../src/layout.mjs";

const manifest = JSON.parse(fs.readFileSync("module.json", "utf8"));
const files = fs.readdirSync("assets", { recursive: true }).filter(f => f.endsWith(".webp")).map(f => f.replaceAll("\\", "/"));
for (const file of files.filter(f => f.startsWith("tokens/"))) {
  const { data, info } = await sharp(`assets/${file}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(data[3], 0, `${file} : coin transparent requis`);
  assert.equal(data[((info.height / 2 * info.width + info.width / 2) * 4) + 3], 255, `${file} : centre opaque requis`);
}

const pack = manifest.packs.find(p => p.type === "Adventure");
// ClassicLevel recovers logs and rewrites its manifest even when only reading.
// Inspect a disposable copy so validation never changes the shipped compendium.
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "neige-pack-"));
const db = new ClassicLevel(scratch, { valueEncoding: "json", createIfMissing: false });
let adventures;
try {
  fs.cpSync(pack.path, scratch, { recursive: true, filter: src => !/(^|[\/])(LOCK|LOG|LOG\.old)$/.test(src) });
  await db.open();
  adventures = (await db.iterator().all()).filter(([key]) => key.startsWith("!adventures!")).map(([, value]) => value);
} finally {
  try { await db.close(); } finally { fs.rmSync(scratch, { recursive: true, force: true }); }
}
assert.equal(adventures.length, 1);
const [adventure] = adventures;
assert.equal(adventure.flags[manifest.id].version, manifest.version, "Reconstruire le compendium pour cette version");
const prefix = `modules/${manifest.id}/`;
const paths = new Set();
(function walk(node) {
  if (typeof node === "string") for (const match of node.matchAll(/modules\/ce-que-la-neige-efface\/assets\/[^\s"'<>)]+/g)) paths.add(match[0]);
  else if (node && typeof node === "object") Object.values(node).forEach(walk);
})([adventure, manifest]);
for (const file of paths) assert.ok(fs.existsSync(file.slice(prefix.length)), `Référence absente : ${file}`);
const asset = file => `${prefix}assets/${file}`;
// Kōta's face is only used by the masked token and the runtime.
const runtime = fs.readFileSync("scripts/module.mjs", "utf8");
for (const file of files) assert.ok(paths.has(asset(file)) || runtime.includes(file), `Image inutilisée dans le module : ${file}`);

assert.equal(adventure.actors.length, 15);
for (const actor of adventure.actors) {
  const key = actor.flags[manifest.id].key;
  assert.equal(actor.img, asset(`portraits/${key}.webp`));
  assert.equal(actor.prototypeToken.texture.src, asset(`tokens/${key}.webp`));
}
const uuids = JSON.stringify(adventure).matchAll(/@UUID\[(Actor|Item|JournalEntry)\.([A-Za-z0-9]{16})(?:\.JournalEntryPage\.([A-Za-z0-9]{16}))?\]/g);
const ids = { Actor: adventure.actors, Item: adventure.items, JournalEntry: adventure.journal };
for (const [, type, id, page] of uuids) {
  const doc = ids[type].find(d => d._id === id);
  assert.ok(doc, `Lien cassé : ${type}.${id}`);
  if (page) assert.ok(doc.pages.some(p => p._id === page), `Page cassée : ${id}.${page}`);
}

assert.equal(adventure.scenes.length, 2);
const checkScene = (key, map, runs, doors, bg, tokens) => {
  const scene = adventure.scenes.find(s => s.flags[manifest.id].key === key);
  assert.equal(scene.width, map.w * GRID);
  assert.equal(scene.height, map.h * GRID);
  assert.equal(scene.padding, 0);
  assert.equal(scene.grid.distance, 1.5);
  assert.equal(scene.levels[0].background.src, asset(`maps/${bg}.webp`));
  assert.deepEqual(scene.walls.map(w => w.c), [...wallSegments(runs, doors), ...doors.map(d => d.c)].map(c => c.map(v => v * GRID)));
  assert.equal(scene.tokens.length, tokens);
  for (const token of scene.tokens) assert.ok(adventure.actors.some(a => a._id === token.actorId), `Acteur du token absent : ${token.name}`);
  for (const note of scene.notes) assert.ok(adventure.journal.find(j => j._id === note.entryId)?.pages.some(p => p._id === note.pageId), `Pastille cassée : ${note.text}`);
  return scene;
};
checkScene("col", PASS, PASS_RUNS, PASS_DOORS, "col", 7);
const inn = checkScene("auberge", INN, undefined, DOORS, "auberge", 16);
assert.equal(inn.lights.filter(l => l.flags?.[manifest.id]?.foyer).length, FOYERS.length);
assert.equal(inn.walls.filter(w => w.flags?.[manifest.id]?.breach).length, DOORS.filter(d => d.breach).length);
console.log(`${files.length} images ; ${paths.size} références présentes ; 15 acteurs, 2 scènes alignées, liens @UUID et pastilles résolus`);
