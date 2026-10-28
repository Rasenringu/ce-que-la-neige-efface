// Mechanical production only: sizes, token masks and exact French typesetting.
// All illustration pixels come from the built-in imagegen sources in generated/.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { tokenFrom } from "./common.mjs";
import { SOURCES } from "./catalog.mjs";
import { ZONES } from "../../src/layout.mjs";

const esc = text => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);
const sourcePath = id => path.join("tools/art/generated", `${id}.webp`);
const assetPath = id => path.join("assets", `${id}.webp`);

async function save(img, id) {
  const target = assetPath(id);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await img.webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(target);
  return target;
}

function wrap(text, max) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && (line + " " + word).length > max) { lines.push(line); line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

function handoutText(entry) {
  const ticket = entry.id.endsWith("/billet");
  const lines = ticket ? ["Troisième classe", "Shinjuku → Matsumoto", "Poinçonné le 11."] : wrap(entry.text, 37);
  const font = ticket ? 43 : 37;
  const leading = ticket ? 108 : 60;
  const titleY = ticket ? 385 : 220;
  const start = ticket ? 510 : 330;
  return svg(1000, 1300, `
    <text x="500" y="${titleY}" text-anchor="middle" font-family="Georgia, serif" font-size="${ticket ? 43 : 44}" font-weight="bold" fill="#2d292b">${esc(entry.title)}</text>
    <path d="M180 ${titleY + 28} H820" stroke="#8e3b36" stroke-width="2"/>
    <g font-family="Georgia, serif" font-size="${font}" fill="#28252a">
      ${lines.map((line, i) => `<text x="${ticket ? 500 : 125}" y="${start + i * leading}" ${ticket ? 'text-anchor="middle"' : ""}>${esc(line)}</text>`).join("")}
    </g>`);
}

export async function renderSource(entry) {
  const source = sourcePath(entry.id);
  if (!fs.existsSync(source)) throw new Error(`Missing generated source: ${source}. See tools/art/README.md.`);
  const files = [];
  if (entry.kind === "portrait") {
    files.push(await save(sharp(source).resize(512, 512, { fit: "cover" }).removeAlpha(), entry.id));
    const key = entry.id.split("/")[1];
    files.push(await tokenFrom(await sharp(assetPath(entry.id)).toBuffer(), `tokens/${key}.webp`, entry.ring, { size: 400, focus: { left: 64, top: 20, size: 384 } }));
  } else if (entry.kind === "item") {
    files.push(await save(sharp(source).resize(256, 256, { fit: "cover" }).flatten({ background: "#172333" }), entry.id));
  } else if (entry.kind === "handout" || entry.kind === "drawing") {
    let img = sharp(source).resize(1000, 1300, { fit: "fill" }).removeAlpha();
    if (entry.kind === "handout") img = img.composite([{ input: handoutText(entry) }]);
    files.push(await save(img, entry.id));
    const key = entry.id.split("/")[1];
    if (key !== "mission") {
      files.push(await save(sharp(assetPath(entry.id)).resize(256, 256, { fit: "cover", position: "centre" }), `items/${key}`));
    }
  } else if (entry.kind === "pin") {
    // An opaque label plate keeps letters readable even when the generated
    // medallion's empty center includes alpha. The outer alpha is preserved.
    const letter = svg(128, 128, `<circle cx="64" cy="64" r="33" fill="#fff2d5"/><text x="64" y="88" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="70" fill="#292331" stroke="#fbf0d5" stroke-width="1" paint-order="stroke">${entry.letter}</text>`);
    files.push(await save(sharp(source).resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).composite([{ input: letter }]), entry.id));
  } else if (entry.kind === "map") {
    const inn = entry.id === "maps/auberge";
    const [w, h] = inn ? [4000, 2800] : [3000, 1800];
    files.push(await save(sharp(source).resize(w, h, { fit: "fill" }).removeAlpha(), entry.id));
    files.push(await save(sharp(assetPath(entry.id)).resize(400, inn ? 280 : 240), `${entry.id}-thumb`));
    if (inn) {
      const labels = Object.entries(ZONES).map(([key, z]) => {
        const x = (z.x0 + z.x1) / 2 * 30, y = (z.y0 + z.y1) / 2 * 30;
        return `<g><circle cx="${x}" cy="${y}" r="21" fill="#182534" fill-opacity=".9" stroke="#f1dcb2" stroke-width="2"/><text x="${x}" y="${y + 9}" text-anchor="middle" font-family="Georgia" font-size="26" fill="#fff4db">${key}</text></g>`;
      }).join("");
      files.push(await save(sharp(assetPath(entry.id)).resize(1200, 840).composite([{ input: svg(1200, 840, labels) }]), "maps/auberge-plan"));
    }
  } else if (entry.kind === "cover") {
    files.push(await save(sharp(source).resize(1920, 1080, { fit: "cover" }).removeAlpha(), entry.id));
    files.push(await save(sharp(assetPath(entry.id)).resize(480, 270), "art/cover-thumb"));
  } else if (entry.kind === "banner") {
    files.push(await save(sharp(source).resize(1600, 400, { fit: "cover" }).removeAlpha(), entry.id));
  } else throw new Error(`Unknown artwork kind: ${entry.kind}`);
  return files;
}

export async function importSource(id, input) {
  const entry = SOURCES.find(source => source.id === id);
  if (!entry) throw new Error(`Unknown source: ${id}`);
  const target = sourcePath(id);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  // Preserve generated transparency, and keep the high-resolution master.
  await sharp(input).webp({ quality: 97, alphaQuality: 100, effort: 6 }).toFile(target);
  return renderSource(entry);
}

export async function renderFinals(group) {
  const entries = SOURCES.filter(entry => !group || entry.id.startsWith(`${group}/`));
  if (!entries.length) throw new Error(`Unknown artwork group: ${group}`);
  // Fail before touching any finals when a master is missing.
  for (const entry of entries) if (!fs.existsSync(sourcePath(entry.id))) throw new Error(`Missing generated master: ${sourcePath(entry.id)}`);
  const files = [];
  for (const entry of entries) files.push(...await renderSource(entry));
  return files;
}
