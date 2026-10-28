// Draft bust portraits (512 × 512) and round tokens for every actor.
// Simple ink-and-wash shapes: they only need to tell the characters apart at a
// glance until the final paintings replace them at the same paths.
import { rng, f, mix, paperDefs, paperRect, svg, render, tokenFrom, inkFilter } from "./common.mjs";
import sharp from "sharp";

const INK = "#1d1a1c";
const SKIN = { light: "#f2d3b6", warm: "#e6bb93", tan: "#d6a47a", pale: "#efe2d6", old: "#e2c2a6", ice: "#c3d3dc", demon: "#a3a891", snow: "#f4f8fb" };

function motif(kind, color, r) {
  const g = [];
  if (kind === "flame") for (let i = 0; i < 9; i++) {
    const x = r.range(0, 512), y = r.range(260, 540), s = r.range(0.6, 1.3);
    g.push(`<path transform="translate(${f(x)} ${f(y)}) scale(${f(s)})" d="M0 0 C -40 -40 -10 -80 -20 -140 C 20 -100 40 -70 30 -30 C 50 -50 50 -80 45 -100 C 80 -50 60 0 0 0Z" fill="${color}"/>`);
  }
  if (kind === "water") for (let row = 0; row < 7; row++) for (let i = -1; i < 8; i++) {
    const x = i * 80 + (row % 2) * 40, y = 70 + row * 66;
    g.push(`<path d="M${x - 40} ${y} a40 40 0 0 1 80 0 M${x - 26} ${y} a26 26 0 0 1 52 0 M${x - 12} ${y} a12 12 0 0 1 24 0" fill="none" stroke="${color}" stroke-width="5"/>`);
  }
  if (kind === "mist") for (let i = 0; i < 9; i++) {
    const x = r.range(-60, 480), y = r.range(20, 500), w = r.range(120, 260);
    g.push(`<path d="M${f(x)} ${f(y)} q ${f(w / 4)} -40 ${f(w / 2)} 0 q ${f(w / 4)} -30 ${f(w / 2)} 0" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/>`);
  }
  if (kind === "serpent") for (let row = 0; row < 9; row++) for (let i = 0; i < 9; i++) {
    const x = i * 64 + (row % 2) * 32, y = row * 60;
    g.push(`<path d="M${x - 32} ${y} q32 46 64 0" fill="none" stroke="${color}" stroke-width="5"/>`);
  }
  if (kind === "snow") for (let i = 0; i < 16; i++) {
    const x = r.range(0, 512), y = r.range(0, 512), s = r.range(8, 24);
    g.push(`<g transform="translate(${f(x)} ${f(y)})" stroke="${color}" stroke-width="3">${[0, 60, 120].map(a => `<line x1="${-s}" y1="0" x2="${s}" y2="0" transform="rotate(${a})"/>`).join("")}</g>`);
  }
  if (kind === "lines") for (let i = 0; i < 14; i++) {
    const y = r.range(0, 512);
    g.push(`<path d="M-10 ${f(y)} C 160 ${f(y + r.range(-40, 40))}, 340 ${f(y + r.range(-40, 40))}, 522 ${f(y)}" stroke="${color}" stroke-width="${f(r.range(1, 3))}" fill="none"/>`);
  }
  if (kind === "blood") for (let i = 0; i < 16; i++) g.push(`<circle cx="${f(r.range(0, 512))}" cy="${f(r.range(0, 512))}" r="${f(r.range(4, 26))}" fill="${color}"/>`);
  return g.join("");
}

// Hair: back layer behind the head, front layer over the forehead.
const HAIR = {
  ponytail: { back: "M170 262 C158 140 210 78 256 78 C302 78 354 140 342 262 L194 332Z M322 112 C392 140 410 270 380 430 C366 388 356 312 330 222Z",
    front: "M182 206 C178 138 212 96 256 94 C304 94 336 138 330 206 C320 176 304 152 290 140 C286 166 272 180 258 186 C262 166 258 150 250 138 C236 166 218 182 198 188 C204 172 206 160 204 150 C194 166 188 186 182 206Z" },
  short: { back: "M176 210 C166 124 214 78 256 76 C302 76 350 124 336 210Z",
    front: "M182 204 C176 150 200 104 256 100 C312 104 336 150 330 204 C318 174 300 156 276 150 L268 168 L254 148 L238 170 L232 150 C210 158 192 178 182 204Z" },
  messy: { back: "M176 214 C166 130 214 80 256 78 C302 78 350 130 338 214Z",
    front: "M182 208 C176 160 186 120 214 102 L208 84 L236 96 L246 70 L264 94 L290 76 L292 102 L322 98 L316 122 C334 140 336 176 330 208 C326 190 318 172 306 162 L300 180 L288 160 L276 184 L268 156 L254 186 L246 158 L232 184 L226 160 L210 182 L204 162 C194 174 186 190 182 208Z" },
  bob: { back: "M166 300 C150 150 206 80 256 80 C306 80 362 150 346 300 L318 300 L318 220 L194 220 L194 300Z",
    front: "M180 210 C178 140 210 98 256 96 C302 98 334 140 332 210 L300 188 L296 160 L280 186 L270 158 L256 188 L244 160 L232 188 L220 160 L214 190Z" },
  bun: { back: "M178 212 C168 130 214 86 256 86 C298 86 344 130 334 212Z M222 70 a34 30 0 1 0 68 0 a34 30 0 1 0 -68 0Z",
    front: "M184 204 C182 150 212 108 256 106 C300 108 330 150 328 204 C312 160 290 136 256 134 C222 136 200 160 184 204Z" },
  parted: { back: "M178 210 C168 126 214 82 256 80 C300 80 346 126 334 210Z",
    front: "M184 200 C180 140 214 100 262 100 C300 102 330 134 330 196 C314 156 286 132 262 128 C250 150 220 176 184 200Z" },
  bald: { back: "M178 200 C176 168 186 150 196 142 L196 200Z M334 200 C336 168 326 150 316 142 L316 200Z", front: "" },
  cap: { back: "M180 206 C172 150 208 120 256 118 C304 120 340 150 332 206Z",
    front: "M172 150 C176 100 214 74 256 74 C300 74 338 100 340 150 Z M150 150 L362 150 L356 168 L156 168Z" },
  wild: { back: "M150 330 C120 220 150 100 256 70 C362 100 392 220 362 330 L330 360 L330 220 L182 220 L182 360Z",
    front: "M178 214 C170 150 200 96 256 92 C312 96 342 150 334 214 L314 170 L304 200 L290 160 L276 196 L262 156 L250 198 L236 156 L222 196 L210 162 L198 200Z" },
  kerchief: { back: "M176 212 C166 130 214 84 256 82 C298 84 346 130 336 212Z",
    front: "M176 176 C180 112 214 84 256 84 C298 84 332 112 336 176 C300 150 212 150 176 176Z" },
};

/** Generic bust; `opt` describes colors, hair and the few distinctive props. */
function bust(opt) {
  const r = rng(opt.key);
  const skin = SKIN[opt.skin ?? "light"];
  const hair = HAIR[opt.hair ?? "short"];
  const scale = opt.child ? 0.9 : 1;
  const eyes = opt.eyes ?? INK;
  const eyeY = 236;
  const defs = `${paperDefs("p", opt.paper ?? "#ece4d6", r.int(1, 90))}${inkFilter("ink", 2, 0.05, r.int(1, 40))}
    <radialGradient id="vig" cx="0.5" cy="0.45" r="0.7"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></radialGradient>`;
  const collar = opt.uniform ? `<path d="M196 360 L256 430 L316 360 L304 352 L256 404 L208 352Z" fill="#202024"/><path d="M212 356 L256 404 L300 356" fill="none" stroke="#e9e3d6" stroke-width="5"/>` : "";
  const body = `
    <path d="M70 512 C80 410 150 360 214 346 L298 346 C362 360 432 410 442 512Z" fill="${opt.coat}" stroke="${INK}" stroke-width="5"/>
    ${opt.coatPattern ?? ""}
    ${opt.apron ? `<path d="M178 512 L196 380 L316 380 L334 512Z" fill="#f1ede4" stroke="${INK}" stroke-width="4"/>` : ""}
    ${collar}
    <path d="M226 300 L226 352 Q256 372 286 352 L286 300Z" fill="${mix(skin, "#000000", 0.12)}" stroke="${INK}" stroke-width="4"/>`;
  const head = `
    <path d="${hair.back}" fill="${opt.hairColor}" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="256" cy="226" rx="${opt.child ? 74 : 70}" ry="${opt.child ? 84 : 92}" fill="${skin}" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="${256 - 28}" cy="${eyeY}" rx="10" ry="${opt.narrow ? 4 : 8}" fill="${eyes}"/><ellipse cx="${256 + 28}" cy="${eyeY}" rx="10" ry="${opt.narrow ? 4 : 8}" fill="${eyes}"/>
    ${opt.narrow ? "" : `<circle cx="${256 - 25}" cy="${eyeY - 3}" r="2.6" fill="#fff"/><circle cx="${256 + 31}" cy="${eyeY - 3}" r="2.6" fill="#fff"/>`}
    <path d="M${256 - 42} ${eyeY - 18} q14 -8 28 0 M${256 + 14} ${eyeY - 18} q14 -8 28 0" stroke="${INK}" stroke-width="4" fill="none"/>
    <path d="M256 246 q-6 18 0 22" stroke="${mix(skin, INK, 0.5)}" stroke-width="3" fill="none"/>
    <path d="${opt.mouth ?? "M238 290 q18 10 36 0"}" stroke="${INK}" stroke-width="4" fill="none"/>
    ${hair.front ? `<path d="${hair.front}" fill="${opt.hairColor}" stroke="${INK}" stroke-width="5"/>` : ""}
    ${opt.extra ?? ""}`;
  return svg(512, 512, defs, `${paperRect("p", 512, 512, opt.paper ?? "#ece4d6")}
    <g opacity="0.28">${motif(opt.motif ?? "lines", opt.accent ?? opt.coat, r)}</g>
    <g filter="url(#ink)" transform="translate(${f(256 - 256 * scale)} ${f(30 + 512 - 512 * scale)}) scale(${scale})">${body}${head}</g>
    <rect width="512" height="512" fill="url(#vig)"/>`);
}

const stripe = c => `<path d="M120 440 L170 380 M150 470 L200 400 M330 400 L380 470 M360 380 L410 440" stroke="${c}" stroke-width="10"/>`;
const glasses = `<g fill="none" stroke="${INK}" stroke-width="4"><circle cx="228" cy="236" r="20"/><circle cx="284" cy="236" r="20"/><path d="M248 236 h16"/></g>`;
const cracks = c => `<path d="M200 160 l22 30 l-10 22 l26 26 M300 150 l-14 36 l20 18 l-8 30 M240 300 l10 -24 l24 -6" stroke="${c}" stroke-width="3" fill="none"/>`;

export const PEOPLE = {
  akane: { coat: "#c4532a", accent: "#d9632f", hair: "ponytail", hairColor: "#5a1e14", skin: "warm", uniform: true, motif: "flame", coatPattern: stripe("#f3c24d"), ring: "#c4532a" },
  tetsuya: { coat: "#2f6aa0", accent: "#3d7fbf", hair: "messy", hairColor: "#1c1c24", skin: "light", uniform: true, motif: "water", coatPattern: stripe("#d8e6f2"), ring: "#2f6aa0" },
  shion: { coat: "#9aa3ad", accent: "#7d8794", hair: "bob", hairColor: "#5f5970", skin: "pale", uniform: true, motif: "mist", narrow: true, ring: "#8a94a0" },
  masaomi: { coat: "#3f6b4a", accent: "#4f8a5d", hair: "parted", hairColor: "#18181c", skin: "tan", uniform: true, motif: "serpent", extra: glasses, mouth: "M240 292 h32", ring: "#3f6b4a" },
  haru: { coat: "#d6e4ee", accent: "#7fa6c4", hair: "messy", hairColor: "#4a3423", skin: "tan", uniform: true, motif: "snow", coatPattern: stripe("#7fa6c4"), mouth: "M236 286 q20 16 40 0", ring: "#7fa6c4" },
  fuyuko: { coat: "#2c3550", hair: "bun", hairColor: "#55524f", skin: "old", apron: true, motif: "lines", accent: "#2c3550", mouth: "M242 292 q14 -4 28 0", ring: "#7a6a4f" },
  yaeko: { coat: "#a8655b", hair: "kerchief", hairColor: "#2a1d18", skin: "light", apron: true, motif: "lines", accent: "#a8655b", ring: "#7a6a4f" },
  ryoan: { coat: "#4b3a2b", hair: "bald", hairColor: "#8a867f", skin: "old", extra: glasses, motif: "lines", accent: "#4b3a2b", mouth: "M242 292 h28", ring: "#7a6a4f" },
  onoda: { coat: "#1f2a3c", hair: "cap", hairColor: "#1f2a3c", skin: "tan", motif: "lines", accent: "#1f2a3c", mouth: "M238 292 h36",
    coatPattern: `<g fill="#d8b04a"><circle cx="256" cy="420" r="7"/><circle cx="256" cy="460" r="7"/><circle cx="256" cy="500" r="7"/></g>`,
    extra: `<path d="M226 276 q30 -14 60 0 q-30 6 -60 0Z" fill="#1a1414"/><rect x="236" y="128" width="40" height="12" fill="#d8b04a"/>`, ring: "#7a6a4f" },
  tae: { coat: "#6d3b55", hair: "bun", hairColor: "#16131a", skin: "light", motif: "lines", accent: "#6d3b55", mouth: "M242 294 q14 -6 28 0", ring: "#7a6a4f" },
  hina: { coat: "#c23b3b", hair: "bob", hairColor: "#1b1416", skin: "light", child: true, motif: "lines", accent: "#c23b3b",
    coatPattern: `<g fill="#fff">${[[150, 440], [210, 470], [300, 450], [360, 480], [250, 500], [400, 450]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"/>`).join("")}</g>`, ring: "#7a6a4f" },
  kota: { coat: "#7a5a3a", hair: "short", hairColor: "#141214", skin: "light", motif: "lines", accent: "#7a5a3a", mouth: "M232 284 q24 18 48 0", ring: "#7a6a4f" },
  hyoe: { coat: "#8a7a4a", hair: "wild", hairColor: "#e6edf1", skin: "ice", eyes: "#b3122a", narrow: true, motif: "snow", accent: "#7fa6c4", paper: "#dfe6ea",
    coatPattern: `<g stroke="#5e5230" stroke-width="4">${Array.from({ length: 14 }, (_, i) => `<line x1="${90 + i * 26}" y1="380" x2="${80 + i * 26}" y2="512"/>`).join("")}</g>`,
    extra: cracks("#4d7fa6") + `<path d="M232 288 l8 8 l8 -8 l8 8 l8 -8 l8 8" stroke="${INK}" stroke-width="3" fill="none"/>`, mouth: "M230 288 h52", ring: "#3a2340" },
  kozo: { coat: "#5b4a3a", hair: "wild", hairColor: "#24201c", skin: "demon", eyes: "#b3122a", narrow: true, motif: "blood", accent: "#7a1f1f", mouth: "M226 290 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8",
    extra: `<path d="M196 200 l20 10 M316 200 l-20 10" stroke="#5a1010" stroke-width="4"/>`, ring: "#3a2340" },
  enneige: { coat: "#f4f8fb", hair: "bald", hairColor: "#f4f8fb", skin: "snow", eyes: "#3d6a8f", motif: "snow", accent: "#9fbcd4", paper: "#dbe5ec", mouth: "M240 292 q16 -8 32 0", extra: cracks("#9fbcd4"), ring: "#3a2340" },
};

function dog() {
  const defs = `${paperDefs("p", "#ece4d6", 33)}${inkFilter("ink", 2, 0.05, 9)}`;
  return svg(512, 512, defs, `${paperRect("p", 512, 512)}
    <g filter="url(#ink)" stroke="${INK}" stroke-width="5">
      <path d="M90 512 C110 400 170 350 256 350 C342 350 402 400 422 512Z" fill="#c98d4f"/>
      <path d="M150 170 L170 70 L232 140Z M362 170 L342 70 L280 140Z" fill="#b97a3e"/>
      <ellipse cx="256" cy="230" rx="120" ry="110" fill="#d49a5c"/>
      <path d="M196 250 C200 330 312 330 316 250 C300 300 212 300 196 250Z" fill="#f2e3cc"/>
      <ellipse cx="256" cy="270" rx="26" ry="18" fill="${INK}"/>
      <circle cx="212" cy="214" r="10" fill="${INK}"/><circle cx="300" cy="214" r="10" fill="${INK}"/>
      <path d="M232 300 q24 16 48 0" fill="none"/>
    </g>`);
}

export async function renderPeople() {
  const files = [];
  for (const [key, opt] of Object.entries(PEOPLE)) {
    const portrait = await render(bust({ key, ...opt }), `portraits/${key}.webp`);
    files.push(portrait, await tokenFrom(await sharp(portrait).toBuffer(), `tokens/${key}.webp`, opt.ring, { size: 400, focus: { left: 96, top: 60, size: 320 } }));
  }
  const kuma = await render(dog(), "portraits/kuma.webp");
  files.push(kuma, await tokenFrom(await sharp(kuma).toBuffer(), "tokens/kuma.webp", "#7a6a4f", { size: 400, focus: { left: 76, top: 40, size: 360 } }));
  return files;
}
