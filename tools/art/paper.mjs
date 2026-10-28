// Draft item icons, handouts, zone pins and cover art.
import { rng, f, mix, paperDefs, paperRect, svg, render, noiseFilter, shadowFilter } from "./common.mjs";
import { HANDOUT_TEXT } from "../../src/journals.mjs";

const INK = "#1d1a1c";
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Greedy word wrap by character budget (fonts are proportional, budget is approximate). */
function wrap(text, max) {
  const lines = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      if ((line + " " + word).trim().length > max) { lines.push(line); line = word; } else line = (line + " " + word).trim();
    }
    lines.push(line);
  }
  return lines;
}

/* ---------- item icons, 256 × 256 ---------- */
const ICONS = {
  offrande: `<ellipse cx="128" cy="178" rx="70" ry="22" fill="#6b3a2a"/><path d="M58 170 Q128 230 198 170Z" fill="#8a4a32"/><ellipse cx="128" cy="168" rx="58" ry="16" fill="#f4f1ea"/>
    <path d="M150 60 l14 40 l-10 60 h-16 l-10 -60Z" fill="#d8b56a"/><circle cx="157" cy="58" r="14" fill="#d8b56a"/>`,
  lettre: `<path d="M50 70 h156 v120 h-156Z" fill="#f4eedf"/><path d="M50 70 l78 64 l78 -64" fill="none" stroke="${INK}" stroke-width="5"/>${[100, 120, 140, 160].map(y => `<path d="M70 ${y + 20} h${f(rng(y)() * 40 + 60)}" stroke="#5a4a3a" stroke-width="4"/>`).join("")}`,
  billet: `<rect x="40" y="86" width="176" height="90" rx="8" fill="#e8d9a8"/><circle cx="40" cy="131" r="12" fill="#2b2f36"/><circle cx="216" cy="131" r="12" fill="#2b2f36"/>
    <path d="M64 110 h120 M64 132 h90 M64 154 h110" stroke="#5a4a3a" stroke-width="5"/><circle cx="186" cy="152" r="12" fill="none" stroke="#a03030" stroke-width="4"/>`,
  plaque: `<rect x="78" y="40" width="100" height="180" rx="10" fill="#8a5a32"/><path d="M98 70 v120 M128 70 v120 M158 70 v90" stroke="#3a2414" stroke-width="7"/><path d="M128 40 l-10 60 l20 30 l-14 90" stroke="#2b2f36" stroke-width="4" fill="none"/><circle cx="128" cy="30" r="10" fill="none" stroke="#3a2414" stroke-width="5"/>`,
  registre: `<path d="M44 60 h168 v150 h-168Z" fill="#2f4f6b"/><path d="M60 72 h140 v128 h-140Z" fill="#f2ead8"/><path d="M128 72 v128" stroke="#8a7a5a" stroke-width="3"/>${[90, 110, 130, 150, 170].map(y => `<path d="M72 ${y} h44 M140 ${y} h46" stroke="#5a4a3a" stroke-width="3"/>`).join("")}<path d="M140 130 h46" stroke="#a03030" stroke-width="5"/>`,
  dessin: `<rect x="46" y="52" width="164" height="150" fill="#fbf8f0" transform="rotate(-4 128 128)"/><circle cx="96" cy="130" r="14" fill="none" stroke="#3a6ac4" stroke-width="4"/><circle cx="150" cy="130" r="14" fill="none" stroke="#c43a3a" stroke-width="4"/>
    <path d="M112 116 q10 -10 20 0" stroke="#9ab" stroke-width="4" fill="none"/><path d="M60 180 q20 -20 40 0 q20 -20 40 0 q20 -20 40 0" stroke="#e08a2a" stroke-width="5" fill="none"/>`,
  carnet: `<rect x="66" y="44" width="124" height="170" rx="6" fill="#3a3a32"/><rect x="78" y="56" width="104" height="146" fill="#efe9d8"/>${[80, 100, 120, 140, 160, 180].map(y => `<path d="M88 ${y} h${f(rng(y + 1)() * 30 + 50)}" stroke="#4a4a5a" stroke-width="3"/>`).join("")}<path d="M200 50 l-40 150" stroke="#c9a84a" stroke-width="6"/>`,
  glycine: `${[[110, 70], [140, 90], [100, 110], [150, 130], [115, 150], [135, 175], [125, 200]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${18 - i}" fill="${mix("#8a5ab8", "#d8c0f0", i / 7)}"/>`).join("")}<path d="M128 40 q-10 30 -2 60" stroke="#4a7a3a" stroke-width="6" fill="none"/>`,
  cle: `<circle cx="84" cy="96" r="34" fill="none" stroke="#5a5a62" stroke-width="16"/><path d="M110 120 L196 206 M160 170 l18 -18 M180 190 l18 -18" stroke="#5a5a62" stroke-width="16" stroke-linecap="round"/>`,
  griffes: `${[0, 1, 2].map(i => `<path d="M${70 + i * 40} 40 q30 90 -10 180" stroke="#7fb6e0" stroke-width="16" fill="none" stroke-linecap="round"/>`).join("")}`,
  eclats: `${[[128, 128, 0], [80, 90, -30], [176, 90, 30], [90, 180, -150], [170, 176, 150]].map(([x, y, a]) => `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 -46 L14 0 L0 46 L-14 0Z" fill="#bfe0f6" stroke="#4d7fa6" stroke-width="4"/>`).join("")}`,
  appel: `<path d="M128 128 m-80 0 a80 80 0 1 1 80 80 a56 56 0 1 1 -56 -56 a32 32 0 1 1 32 32" fill="none" stroke="#9fc4e0" stroke-width="12" stroke-linecap="round"/>`,
  etreinte: `<path d="M60 200 C60 120 80 70 110 70 L110 140 L120 60 L140 60 L140 140 L150 66 L170 66 L170 146 L180 90 L198 92 L196 200Z" fill="#c3d3dc" stroke="#4d7fa6" stroke-width="5"/>`,
  regeneration: `<g stroke="#9fc4e0" stroke-width="10" stroke-linecap="round">${[0, 60, 120].map(a => `<line x1="40" y1="128" x2="216" y2="128" transform="rotate(${a} 128 128)"/>`).join("")}</g><circle cx="128" cy="128" r="22" fill="#b3122a"/>`,
  visage: `<path d="M64 70 C64 40 192 40 192 70 C192 170 160 216 128 216 C96 216 64 170 64 70Z" fill="#f4eee4" stroke="${INK}" stroke-width="5"/><path d="M128 50 l-12 50 l20 30 l-16 60" stroke="#4d7fa6" stroke-width="4" fill="none"/>
    <ellipse cx="100" cy="110" rx="12" ry="6" fill="${INK}"/><ellipse cx="156" cy="110" rx="12" ry="6" fill="${INK}"/>`,
};

async function renderIcons() {
  const files = [];
  for (const [key, body] of Object.entries(ICONS)) {
    const defs = `${paperDefs("p", "#e8e2d6", key.length * 7)}${shadowFilter("s", 4, 2, 4, 0.4)}`;
    files.push(await render(svg(256, 256, defs, `${paperRect("p", 256, 256, "#e8e2d6")}<g filter="url(#s)">${body}</g><rect x="3" y="3" width="250" height="250" fill="none" stroke="#2f4f6b" stroke-width="6"/>`), `items/${key}.webp`));
  }
  return files;
}

/* ---------- zone pins, 128 × 128 ---------- */
async function renderPins() {
  const files = [];
  for (const letter of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "T"]) {
    const color = ["G", "H", "I", "J", "T"].includes(letter) ? "#2f4f6b" : "#8a3b2e";
    files.push(await render(svg(128, 128, shadowFilter("s", 3, 1, 3, 0.5), `<g filter="url(#s)"><circle cx="64" cy="62" r="50" fill="${color}" stroke="#f3f1ec" stroke-width="6"/>
      <text x="64" y="80" font-family="Georgia" font-size="52" font-weight="bold" fill="#f3f1ec" text-anchor="middle">${letter}</text></g>`), `icons/zone-${letter.toLowerCase()}.webp`));
  }
  return files;
}

/* ---------- handouts, 1000 × 1300 ---------- */
const HANDOUT_STYLE = {
  mission: { title: "Ordre du Corps", font: "Georgia", size: 40, max: 40, paper: "#efe6d2" },
  lettre: { title: "", font: "Segoe Script", size: 38, max: 36, paper: "#f2ecdc" },
  registre: { title: "Registre — hiver Meiji 29", font: "Segoe Script", size: 34, max: 40, paper: "#e9dfc6" },
  carnet: { title: "", font: "Ink Free", size: 38, max: 38, paper: "#ecebe2", ruled: true },
  billet: { title: "", font: "Georgia", size: 44, max: 30, paper: "#e8d9a8" },
};

function childDrawing() {
  const r = rng("hina");
  const people = [[220, 640, "#3a6ac4", true], [380, 600, "#c43a3a", true], [540, 640, "#3aa04a", true], [700, 600, "#8a5ab8", true], [830, 700, "#7a5a3a", false]];
  const figures = people.map(([x, y, c, breath]) => `
    <circle cx="${x}" cy="${y}" r="40" fill="none" stroke="${c}" stroke-width="7"/><circle cx="${x - 12}" cy="${y - 6}" r="5" fill="${c}"/><circle cx="${x + 12}" cy="${y - 6}" r="5" fill="${c}"/>
    <path d="M${x} ${y + 40} v100 M${x - 50} ${y + 80} h100 M${x} ${y + 140} l-40 70 M${x} ${y + 140} l40 70" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>
    ${breath ? `<path d="M${x + 40} ${y + 10} q30 -40 60 -10 q20 -30 40 0 q-10 30 -40 20 q-30 20 -60 -10Z" fill="#dfe8f0" stroke="#9ab" stroke-width="4"/>` : `<path d="M${x - 30} ${y + 22} h60" stroke="${c}" stroke-width="6"/>`}`).join("");
  return `<rect x="70" y="80" width="860" height="1140" fill="#fbf8f0" transform="rotate(-1.5 500 650)"/>
    <path d="M300 960 q200 -120 400 0" stroke="#e08a2a" stroke-width="14" fill="none"/><path d="M380 960 l40 -80 l40 80 l40 -100 l40 100 l40 -80" stroke="#c43a3a" stroke-width="10" fill="none"/>
    <rect x="290" y="960" width="420" height="40" fill="#6a4a3a"/>${figures}
    <g transform="translate(160 920)"><ellipse rx="60" ry="34" fill="#c98d4f"/><circle cx="-60" cy="-20" r="24" fill="#c98d4f"/><path d="M-90 -60 l20 -30 M-60 -70 l10 -30" stroke="#a06a3a" stroke-width="8"/></g>
    <text x="230" y="1060" font-family="Ink Free" font-size="40" fill="#c43a3a">wouf ! wouf !</text>
    <text x="760" y="790" font-family="Ink Free" font-size="38" fill="#7a5a3a">Kōta-niisan</text>
    <text x="560" y="1170" font-family="Ink Free" font-size="44" fill="#3a6ac4">Hina, 7 ans</text>
    <text x="150" y="240" font-family="Ink Free" font-size="60" fill="#3a3a5a">tout le monde au chaud</text>
    ${Array.from({ length: 30 }, () => `<circle cx="${f(r.range(100, 900))}" cy="${f(r.range(300, 480))}" r="${f(r.range(4, 9))}" fill="#9ab"/>`).join("")}`;
}

async function renderHandouts() {
  const files = [];
  for (const key of ["mission", "lettre", "registre", "dessin", "carnet", "billet"]) {
    const style = HANDOUT_STYLE[key] ?? { paper: "#efe6d2" };
    const defs = paperDefs("p", style.paper, key.length * 11) + shadowFilter("s", 6, 0, 4, 0.3);
    let body;
    if (key === "dessin") body = childDrawing();
    else if (key === "billet") {
      const lines = HANDOUT_TEXT.billet.split(". ").map(s => s.replace(/\.$/, ""));
      body = `<g filter="url(#s)"><rect x="100" y="420" width="800" height="420" rx="18" fill="#e8d9a8" stroke="#6a5a3a" stroke-width="6"/>
        <circle cx="100" cy="630" r="34" fill="#efe6d2"/><circle cx="900" cy="630" r="34" fill="#efe6d2"/></g>
        ${lines.map((l, i) => `<text x="160" y="${510 + i * 82}" font-family="Georgia" font-size="${i === 2 ? 56 : 40}" ${i === 2 ? "font-weight=\"bold\"" : ""} fill="#2b2620">${esc(l)}</text>`).join("")}
        <circle cx="790" cy="770" r="48" fill="none" stroke="#a03030" stroke-width="7"/><text x="790" y="784" font-family="Georgia" font-size="38" fill="#a03030" text-anchor="middle">11</text>`;
    } else {
      const lines = wrap(HANDOUT_TEXT[key], style.max);
      const lh = style.size * 1.55;
      const top = style.title ? 260 : 180;
      body = `${style.title ? `<text x="500" y="170" font-family="Georgia" font-size="56" font-weight="bold" fill="#2f4f6b" text-anchor="middle">${esc(style.title)}</text><path d="M260 200 h480" stroke="#8a3b2e" stroke-width="4"/>` : ""}
        ${style.ruled ? Array.from({ length: 22 }, (_, i) => `<path d="M90 ${f(top - style.size + i * lh + 12)} h820" stroke="#a9b8c8" stroke-width="2"/>`).join("") + `<path d="M150 80 v1160" stroke="#d08080" stroke-width="3"/>` : ""}
        ${lines.map((l, i) => `<text x="${style.ruled ? 170 : 120}" y="${f(top + i * lh)}" font-family="${style.font}" font-size="${style.size}" fill="#2b2620">${esc(l)}</text>`).join("")}
        ${key === "mission" ? `<g transform="translate(780 1110)"><path d="M0 0 l60 -30 l-10 30 l10 30Z M0 0 c-30 -40 -100 -30 -120 0 c20 30 90 40 120 0" fill="#1d1a1c"/><circle cx="-80" cy="-4" r="5" fill="#f3f1ec"/></g>` : ""}
        ${key === "registre" ? `<path d="M120 ${f(top + 4.2 * lh)} h760" stroke="#a03030" stroke-width="3" opacity="0.6"/>` : ""}`;
    }
    files.push(await render(svg(1000, 1300, defs, `${paperRect("p", 1000, 1300, style.paper)}${body}`), `handouts/${key}.webp`));
  }
  return files;
}

/* ---------- cover and banner ---------- */
function nightScene(w, h, { title = true, sub = true } = {}) {
  const r = rng("cover" + w);
  const s = w / 1920;
  const flakes = Array.from({ length: 260 }, () => `<circle cx="${f(r.range(0, w))}" cy="${f(r.range(0, h))}" r="${f(r.range(1, 4) * s)}" fill="#fff" opacity="${f(r.range(0.4, 0.95))}"/>`).join("");
  const pines = Array.from({ length: 18 }, (_, i) => { const x = r.range(0, w), y = h * r.range(0.45, 0.7), k = r.range(0.6, 1.4) * s;
    return `<path transform="translate(${f(x)} ${f(y)}) scale(${f(k)})" d="M0 -260 L60 -150 L30 -150 L90 -60 L50 -60 L120 40 L-120 40 L-50 -60 L-90 -60 L-30 -150 L-60 -150Z" fill="${mix("#1b2a36", "#3a5266", r())}"/>`; }).join("");
  return svg(w, h, `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1620"/><stop offset="0.6" stop-color="#22374a"/><stop offset="1" stop-color="#8aa2b8"/></linearGradient>
      <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffb766" stop-opacity="0.9"/><stop offset="1" stop-color="#ffb766" stop-opacity="0"/></radialGradient>`,
    `<rect width="${w}" height="${h}" fill="url(#sky)"/>
    <path d="M0 ${f(h * 0.55)} L${f(w * 0.2)} ${f(h * 0.3)} L${f(w * 0.38)} ${f(h * 0.5)} L${f(w * 0.6)} ${f(h * 0.22)} L${f(w * 0.85)} ${f(h * 0.48)} L${w} ${f(h * 0.36)} L${w} ${h} L0 ${h}Z" fill="#3c5568"/>
    ${pines}
    <path d="M0 ${f(h * 0.78)} Q${f(w * 0.5)} ${f(h * 0.68)} ${w} ${f(h * 0.8)} L${w} ${h} L0 ${h}Z" fill="#dfe8f0"/>
    <g transform="translate(${f(w * 0.62)} ${f(h * 0.7)}) scale(${f(s)})">
      <path d="M-260 0 L-300 -40 L0 -200 L300 -40 L260 0Z" fill="#1a1414"/><rect x="-240" y="0" width="480" height="150" fill="#2a2018"/>
      <path d="M-300 -40 L0 -200 L300 -40" fill="none" stroke="#eef3f7" stroke-width="18"/>
      <rect x="-60" y="40" width="120" height="110" fill="#ffcf8a"/><rect x="-200" y="50" width="80" height="50" fill="#ffcf8a" opacity="0.8"/><rect x="120" y="50" width="80" height="50" fill="#ffcf8a" opacity="0.8"/>
      <circle cx="90" cy="20" r="160" fill="url(#glow)"/><ellipse cx="90" cy="20" rx="18" ry="26" fill="#d0402a"/>
      <path d="M-30 150 l10 -70 h20 l10 70" fill="#2b2f36"/>
    </g>
    ${flakes}
    ${title ? `<text x="${f(w * 0.06)}" y="${f(Math.max(h * 0.2, 130 * s))}" font-family="Georgia" font-size="${f(110 * s)}" fill="#f3f1ec" font-style="italic">Ce que la neige efface</text>` : ""}
    ${sub ? `<text x="${f(w * 0.06)}" y="${f(Math.max(h * 0.2, 130 * s) + 70 * s)}" font-family="Georgia" font-size="${f(40 * s)}" fill="#c9d6e2">Un one-shot pour Breathe and Live</text>` : ""}`);
}

async function renderCover() {
  return [
    await render(nightScene(1920, 1080), "art/cover.webp"),
    await render(nightScene(1920, 1080), "art/cover-thumb.webp", { width: 480, height: 270 }),
    await render(nightScene(1600, 400, { sub: false }), "art/banner.webp"),
  ];
}

export async function renderPaper() {
  return [...await renderIcons(), ...await renderPins(), ...await renderHandouts(), ...await renderCover()];
}
