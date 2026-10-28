// Shared helpers for the procedural draft artwork (SVG painted in code, rasterized by sharp).
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export const OUT = "assets";

/** Deterministic pseudo-random generator so re-running the art script is stable. */
export function rng(seed) {
  let s = typeof seed === "string" ? [...seed].reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 2654435761) >>> 0, 2166136261) : seed >>> 0;
  const next = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  next.range = (a, b) => a + (b - a) * next();
  next.int = (a, b) => Math.floor(next.range(a, b + 1));
  next.pick = list => list[Math.floor(next() * list.length)];
  return next;
}

export const f = n => Math.round(n * 10) / 10;

/** Mix two #rrggbb colors; t = 0 keeps a, t = 1 gives b. */
export function mix(a, b, t) {
  const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/** Turbulence-based texture filter tinted between two colors. */
export function noiseFilter(id, { freq = "0.02", octaves = 4, seed = 1, dark = "#000000", light = "#ffffff", type = "fractalNoise", contrast = 1 } = {}) {
  const d = dark.match(/\w\w/g).map(h => parseInt(h, 16) / 255), l = light.match(/\w\w/g).map(h => parseInt(h, 16) / 255);
  const row = i => `${f((l[i] - d[i]) * contrast * 100) / 100} 0 0 0 ${f((d[i] - (l[i] - d[i]) * (contrast - 1) / 2) * 100) / 100}`;
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feTurbulence type="${type}" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed}" result="n"/>
    <feColorMatrix in="n" type="matrix" values="${row(0)} ${row(1)} ${row(2)} 0 0 0 0 1"/>
    <feComposite in2="SourceGraphic" operator="in"/></filter>`;
}

/** Slight wobble so strokes look hand-inked. */
export function inkFilter(id, scale = 2.5, freq = 0.04, seed = 3) {
  return `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" result="w"/>
    <feDisplacementMap in="SourceGraphic" in2="w" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
}

export function shadowFilter(id, blur = 6, dx = 4, dy = 6, opacity = 0.45) {
  return `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${blur}"/><feOffset dx="${dx}" dy="${dy}" result="b"/>
    <feComponentTransfer><feFuncA type="linear" slope="${opacity}"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
}

/** Washi paper background used by portraits, items and handouts. */
export function paperDefs(id = "paper", base = "#efe4cc", seed = 7) {
  return `${noiseFilter(id + "-fib", { freq: "0.9 0.035", octaves: 2, seed, dark: "#000000", light: "#ffffff" })}
    ${noiseFilter(id + "-mot", { freq: "0.012", octaves: 4, seed: seed + 1, dark: mix(base, "#8a6a3a", 0.35), light: mix(base, "#ffffff", 0.35) })}`;
}
export function paperRect(id, w, h, base = "#efe4cc") {
  return `<rect width="${w}" height="${h}" fill="${base}"/>
    <rect width="${w}" height="${h}" filter="url(#${id}-mot)" opacity="0.55" style="mix-blend-mode:multiply"/>
    <rect width="${w}" height="${h}" filter="url(#${id}-fib)" opacity="0.07"/>`;
}

export function svg(w, h, defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
}

export async function render(markup, file, { width, height, quality = 88, alpha = false } = {}) {
  const out = path.join(OUT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  let img = sharp(Buffer.from(markup), { limitInputPixels: false, density: 72 });
  if (width || height) img = img.resize(width, height);
  await img.webp({ quality, alphaQuality: 95, effort: 5, ...(alpha ? {} : {}) }).toFile(out);
  if (process.env.ART_DEBUG) fs.writeFileSync(out.replace(/\.webp$/, ".svg"), markup);
  return out;
}

/** Circular token from a square image buffer, with a colored ring. */
export async function tokenFrom(source, file, ring = "#27676b", { size = 400, focus } = {}) {
  const meta = await sharp(source).metadata();
  const crop = focus ?? { left: 0, top: 0, size: Math.min(meta.width, meta.height) };
  const face = await sharp(source).extract({ left: crop.left, top: crop.top, width: crop.size, height: crop.size }).resize(size, size).toBuffer();
  const r = size / 2;
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r - 14}" fill="#fff"/></svg>`);
  const frame = Buffer.from(`<svg width="${size}" height="${size}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${mix(ring, "#ffffff", 0.35)}"/><stop offset="1" stop-color="${mix(ring, "#000000", 0.35)}"/></linearGradient></defs>
    <circle cx="${r}" cy="${r}" r="${r - 9}" fill="none" stroke="url(#g)" stroke-width="16"/>
    <circle cx="${r}" cy="${r}" r="${r - 1.5}" fill="none" stroke="#14100c" stroke-width="3"/><circle cx="${r}" cy="${r}" r="${r - 17}" fill="none" stroke="#14100c" stroke-width="2.5"/></svg>`);
  const masked = await sharp(face).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const out = path.join(OUT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: masked }, { input: frame }]).webp({ quality: 90, alphaQuality: 100 }).toFile(out);
  return out;
}
