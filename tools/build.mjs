// Builds the single Adventure compendium from src/. Every document type gets a
// "Ce que la neige efface" folder so an import never scatters the scenario.
import fs from "node:fs";
import { ClassicLevel } from "classic-level";
import { loadSystemCatalog, stableId, SYSTEM_ID } from "./lib/system-catalog.mjs";
import { buildActors, MID } from "../src/actors.mjs";
import { buildItems } from "../src/items.mjs";
import { buildJournals } from "../src/journals.mjs";
import { buildScenes, buildMacros } from "../src/scene.mjs";

const manifest = JSON.parse(fs.readFileSync("module.json", "utf8"));
const catalog = loadSystemCatalog();
const ROOT = "Ce que la neige efface";
const COLOR = "#2f4f6b";
const stats = { coreVersion: "14.368", systemId: SYSTEM_ID, systemVersion: catalog.version, createdTime: null, modifiedTime: null, lastModifiedBy: null };

const folder = (type, name, parent = null, sort = 0, color = COLOR) =>
  ({ _id: stableId(`folder:${type}:${parent ?? ""}:${name}`), name, type, folder: parent, sorting: "m", sort, color, description: "", flags: { [MID]: { root: !parent } } });
const roots = Object.fromEntries(["Actor", "Item", "JournalEntry", "Scene", "Macro"].map(t => [t, folder(t, ROOT)]));
const actorFolders = {
  pregens: folder("Actor", "Prétirés", roots.Actor._id, 100000, "#8a3b2e"),
  npcs: folder("Actor", "Habitants de l'auberge", roots.Actor._id, 200000, "#7a6a4f"),
  demons: folder("Actor", "Démons", roots.Actor._id, 300000, "#3a2340"),
};

const withMeta = (doc, folderId, sort = 0) => ({
  ownership: { default: 0 }, flags: {}, ...doc, folder: folderId, sort: doc.sort ?? sort,
  _stats: { ...stats, ...(doc._stats || {}) },
  ...(doc.items ? { items: doc.items.map(i => ({ ownership: { default: 0 }, flags: {}, effects: [], ...i, _stats: { ...stats, ...(i._stats || {}) } })) } : {}),
});

const actors = buildActors(catalog);
const journals = buildJournals();
const adventure = {
  _id: stableId("adventure"),
  name: "Ce que la neige efface",
  img: `modules/${MID}/assets/art/cover.webp`,
  caption: "One-shot Kimetsu no Yaiba pour Breathe and Live · 5 prétirés · 3 à 4 heures",
  description: `<p>Une auberge de montagne bloquée par le blizzard. Un fils revenu de Tokyo dont le souffle ne fait pas de buée. Une porte qui, il y a vingt ans, ne s'est pas ouverte. Démasquez le démon, puis tenez les foyers jusqu'à l'aube.</p>
<p>L'import crée un dossier <strong>${ROOT}</strong> dans les acteurs, objets, journaux, scènes et macros. Commencez par le journal <em>Guide du MJ</em>.</p>`,
  actors: Object.entries(actors).flatMap(([group, list]) => list.map((a, i) => withMeta(a, actorFolders[group]._id, (i + 1) * 100000))),
  items: buildItems().map((d, i) => withMeta(d, roots.Item._id, (i + 1) * 100000)),
  journal: journals.map(j => withMeta({ ...j, pages: j.pages.map(p => ({ ownership: { default: -1 }, flags: {}, ...p, _stats: stats })) }, roots.JournalEntry._id)),
  scenes: buildScenes(actors).map((s, i) => withMeta(s, roots.Scene._id, (i + 1) * 100000)),
  macros: buildMacros().map((d, i) => withMeta(d, roots.Macro._id, (i + 1) * 100000)),
  folders: [...Object.values(roots), ...Object.values(actorFolders)].map(f => ({ ...f, _stats: stats })),
  tables: [], playlists: [], cards: [], combats: [],
  sort: 0, folder: null,
  flags: { [MID]: { version: manifest.version } },
  _stats: stats,
};

// Foundry silently replaces malformed ids on import, which breaks token and link references.
const badIds = [];
(function walk(node, at) {
  if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${at}[${i}]`));
  if (!node || typeof node !== "object") return;
  if ("_id" in node && !/^[a-zA-Z0-9]{16}$/.test(node._id)) badIds.push(`${at}: ${node._id}`);
  for (const [k, v] of Object.entries(node)) if (k !== "_stats") walk(v, `${at}.${k}`);
})(adventure, "adventure");
if (badIds.length) throw new Error("Identifiants invalides :\n" + badIds.join("\n"));

const pack = manifest.packs.find(p => p.type === "Adventure");
fs.rmSync(pack.path, { recursive: true, force: true });
const db = new ClassicLevel(pack.path, { valueEncoding: "json" });
await db.open();
await db.put(`!adventures!${adventure._id}`, adventure);
await db.compactRange("\u0000", "￿");
await db.close();
fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/adventure.json", JSON.stringify(adventure, null, 1));
const count = k => adventure[k].length;
console.log(`${pack.path}: ${count("actors")} acteurs, ${count("items")} objets, ${count("journal")} journaux, ${count("scenes")} scènes, ${count("macros")} macros, ${count("folders")} dossiers (système ${catalog.version})`);
