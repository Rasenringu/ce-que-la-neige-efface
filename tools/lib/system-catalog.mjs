// Reads the Breathe and Live system packs so the pregens embed the system's own
// technique, weapon, talent and sense data instead of stale copies.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const SYSTEM_ID = "breathe-and-live";
export const SYSTEM_PATH = path.resolve(process.env.BL_SYSTEM_PATH || "../breathe-and-live");

// System 0.6.0 items that point to icons absent from Foundry 14's core set.
const ICON_FIXES = {
  "icons/weapons/guns/gun-pistol.webp": "icons/weapons/guns/gun-pistol-flintlock-metal.webp",
  "icons/consumables/potions/potion-bottle-corked-red.webp": "icons/tools/medical/bandage-rough.webp",
  "icons/consumables/potions/potion-flask-corked-red.webp": "icons/tools/medical/bandages-gauze.webp",
  "icons/equipment/chest/coat-leather-black.webp": "icons/equipment/chest/jacket-modern-military.webp",
  "icons/magic/life/root-vine-heart.webp": "icons/magic/nature/plant-sprout-hands-vines.webp",
  "icons/containers/bags/case-medical-red.webp": "icons/tools/medical/medkit-heavy.webp",
};

const fold = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'").toLowerCase().trim();

/** Stable 16-character Foundry id derived from a key. */
export function stableId(key) {
  const hex = crypto.createHash("sha256").update("ce-que-la-neige-efface:" + key).digest("hex");
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; id.length < 16; i += 2) id += alphabet[parseInt(hex.slice(i, i + 2), 16) % alphabet.length];
  return id;
}

function readNedb(file) {
  return fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
}

export function loadSystemCatalog() {
  const manifest = JSON.parse(fs.readFileSync(path.join(SYSTEM_PATH, "system.json"), "utf8"));
  const docs = [];
  for (const pack of manifest.packs.filter(p => p.type === "Item")) {
    const file = path.join(SYSTEM_PATH, pack.path);
    const source = path.join(SYSTEM_PATH, "packs/_source", pack.name);
    if (fs.existsSync(source)) {
      for (const dir of fs.readdirSync(source)) {
        const folder = path.join(source, dir);
        const files = fs.statSync(folder).isDirectory() ? fs.readdirSync(folder).map(f => path.join(folder, f)) : [folder];
        for (const f of files.filter(f => f.endsWith(".json"))) docs.push({ pack: pack.name, doc: JSON.parse(fs.readFileSync(f, "utf8")) });
      }
    } else if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      for (const doc of readNedb(file)) docs.push({ pack: pack.name, doc });
    }
  }
  return {
    version: manifest.version,
    /** Clone a system item by pack and name (accent-insensitive). */
    item(pack, name, ownerKey, overrides = {}) {
      const found = docs.find(d => d.pack === pack && fold(d.doc.name) === fold(name));
      if (!found) throw new Error(`Item système introuvable : ${pack} / ${name}`);
      const { _key, folder, sort, ownership, ...doc } = structuredClone(found.doc);
      doc._id = stableId(`${ownerKey}:${pack}:${found.doc._id}`);
      doc.img = ICON_FIXES[doc.img] ?? doc.img;
      doc.flags = { ...(doc.flags || {}) };
      doc._stats = { compendiumSource: `Compendium.${SYSTEM_ID}.${pack}.Item.${found.doc._id}` };
      return mergeDeep(doc, overrides);
    },
  };
}

export function mergeDeep(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value) && target[key] && typeof target[key] === "object") mergeDeep(target[key], value);
    else target[key] = value;
  }
  return target;
}
