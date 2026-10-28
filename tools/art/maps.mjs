// Draft battlemaps painted from src/layout.mjs, so walls, doors and furniture
// line up with the Foundry scene square for square.
import { rng, f, mix, noiseFilter, shadowFilter, svg, render } from "./common.mjs";
import { GRID, INN, ZONES, DOORS, FOYERS, POI, PASS, PASS_HUT, PASS_DOORS, PASS_RUNS, PASS_POI, wallSegments } from "../../src/layout.mjs";

const px = v => f(v * GRID);
const WALL = "#2a1f18";

function pine(x, y, k, r) {
  const pts = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2, rad = (i % 2 ? 0.55 : 1) * k * r.range(0.9, 1.1);
    return `${f(x + Math.cos(a) * rad)},${f(y + Math.sin(a) * rad)}`; }).join(" ");
  return `<g filter="url(#shadow)"><polygon points="${pts}" fill="#22402f"/><polygon points="${pts}" fill="#f4f8fb" opacity="0.55" transform="translate(${f(x * 0.12)} ${f(y * 0.12)}) scale(0.88)"/>
    <circle cx="${f(x)}" cy="${f(y)}" r="${f(k * 0.18)}" fill="#3b2a1c"/></g>`;
}
const rock = (x, y, k, r) => `<g filter="url(#shadow)"><path d="M${f(x - k)} ${f(y)} q${f(k * 0.3)} ${f(-k)} ${f(k)} ${f(-k * 0.8)} q${f(k)} ${f(r.range(0, k * 0.4))} ${f(k)} ${f(k * 0.9)} q${f(-k * 0.6)} ${f(k * 0.7)} ${f(-k * 1.4)} ${f(k * 0.6)}Z" fill="#7d8287"/>
  <path d="M${f(x - k * 0.6)} ${f(y - k * 0.4)} q${f(k * 0.4)} ${f(-k * 0.5)} ${f(k)} ${f(-k * 0.3)}" stroke="#f4f8fb" stroke-width="${f(k * 0.25)}" fill="none" opacity="0.8"/></g>`;

const commonDefs = (w, h, seed) => `${noiseFilter("snow", { freq: "0.004", octaves: 4, seed, dark: "#c9d6e2", light: "#f7fafc" })}
  ${noiseFilter("snowfine", { freq: "0.08", octaves: 2, seed: seed + 1, dark: "#d9e3eb", light: "#ffffff" })}
  ${noiseFilter("earth", { freq: "0.03", octaves: 3, seed: seed + 2, dark: "#5e4a36", light: "#8a7058" })}
  ${noiseFilter("stone", { freq: "0.05", octaves: 3, seed: seed + 3, dark: "#6f716f", light: "#a3a49f" })}
  ${noiseFilter("path", { freq: "0.02", octaves: 3, seed: seed + 4, dark: "#a9b6c2", light: "#d5dee6" })}
  ${noiseFilter("ice", { freq: "0.03", octaves: 2, seed: seed + 5, dark: "#9fc4e0", light: "#e6f3fb" })}
  ${shadowFilter("shadow", 8, 6, 10, 0.45)}
  <filter id="blur"><feGaussianBlur stdDeviation="22"/></filter>
  <pattern id="planks" width="400" height="50" patternUnits="userSpaceOnUse"><rect width="400" height="50" fill="#8a6440"/><rect y="0" width="400" height="24" fill="#94704a"/>
    <path d="M0 0 h400 M0 25 h400 M130 0 v25 M300 25 v25" stroke="#5a3e24" stroke-width="3"/></pattern>
  <pattern id="darkplanks" width="300" height="50" patternUnits="userSpaceOnUse"><rect width="300" height="50" fill="#5d4a38"/><path d="M0 0 h300 M0 25 h300 M90 0 v25 M220 25 v25" stroke="#3a2c20" stroke-width="3"/></pattern>
  <pattern id="tatami" width="200" height="200" patternUnits="userSpaceOnUse"><rect width="200" height="200" fill="#c9c08a"/>
    <rect x="2" y="2" width="196" height="96" fill="#cfc690" stroke="#3e4a2a" stroke-width="5"/><rect x="2" y="102" width="96" height="96" fill="#c4bb84" stroke="#3e4a2a" stroke-width="5"/><rect x="102" y="102" width="96" height="96" fill="#c4bb84" stroke="#3e4a2a" stroke-width="5"/>
    ${Array.from({ length: 20 }, (_, i) => `<path d="M${i * 10 + 5} 6 v88" stroke="#b5ac76" stroke-width="1"/>`).join("")}</pattern>
  <pattern id="tiles" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="#8d8d88"/><rect x="3" y="3" width="94" height="44" fill="#9a9a94"/><rect x="3" y="53" width="44" height="44" fill="#96968f"/><rect x="53" y="53" width="44" height="44" fill="#9a9a94"/></pattern>`;

const FLOOR = { tatami: "url(#tatami)", planks: "url(#planks)", stone: "url(#tiles)", earth: "#7a6248" };

function walls(runs, doors, outer = []) {
  const isOuter = ([x0, y0, x1, y1]) => outer.some(([a, b, c, d]) => (y0 === y1 && b === d && b === y0 && x0 >= a && x1 <= c) || (x0 === x1 && a === c && a === x0 && y0 >= b && y1 <= d));
  return wallSegments(runs, doors).map(s => `<line x1="${px(s[0])}" y1="${px(s[1])}" x2="${px(s[2])}" y2="${px(s[3])}" stroke="${WALL}" stroke-width="${isOuter(s) ? 30 : 20}" stroke-linecap="square"/>`).join("");
}

function door(d) {
  const [x0, y0, x1, y1] = d.c.map(v => v * GRID);
  const horizontal = y0 === y1;
  const shutter = d.key.startsWith("volet");
  const main = d.key === "porte";
  const fill = main ? "#7a3a24" : shutter ? "#4a3a2c" : "#c8a676";
  const t = main ? 26 : 16;
  const rect = horizontal ? `x="${f(x0)}" y="${f(y0 - t / 2)}" width="${f(x1 - x0)}" height="${t}"` : `x="${f(x0 - t / 2)}" y="${f(y0)}" width="${t}" height="${f(y1 - y0)}"`;
  const slats = shutter ? Array.from({ length: 6 }, (_, i) => horizontal
    ? `<line x1="${f(x0 + (i + 0.5) * (x1 - x0) / 6)}" y1="${f(y0 - 8)}" x2="${f(x0 + (i + 0.5) * (x1 - x0) / 6)}" y2="${f(y0 + 8)}" stroke="#2a1f18" stroke-width="4"/>`
    : `<line x1="${f(x0 - 8)}" y1="${f(y0 + (i + 0.5) * (y1 - y0) / 6)}" x2="${f(x0 + 8)}" y2="${f(y0 + (i + 0.5) * (y1 - y0) / 6)}" stroke="#2a1f18" stroke-width="4"/>`).join("") : "";
  return `<rect ${rect} fill="${fill}" stroke="${WALL}" stroke-width="5"/>${slats}`;
}

const fire = (x, y, r) => `<circle cx="${px(x)}" cy="${px(y)}" r="${f(r * 1.6)}" fill="#ff9a3c" opacity="0.18" filter="url(#blur)"/>
  ${[[0, 0, 0.5, "#ffd27a"], [-0.25, 0.1, 0.32, "#ff8a2a"], [0.22, -0.12, 0.3, "#e0461e"], [0.05, 0.28, 0.26, "#ff6a2a"]].map(([dx, dy, k, c]) => `<circle cx="${px(x + dx * r / 100)}" cy="${px(y + dy * r / 100)}" r="${f(k * r)}" fill="${c}"/>`).join("")}`;

function furniture() {
  const g = [];
  const [ix, iy] = FOYERS.find(h => h.key === "irori").at;
  g.push(`<g filter="url(#shadow)"><rect x="${px(ix - 1)}" y="${px(iy - 1)}" width="200" height="200" fill="#6a4a2a"/><rect x="${px(ix - 0.8)}" y="${px(iy - 0.8)}" width="160" height="160" fill="#3a3330"/></g>${fire(ix, iy, 46)}
    <circle cx="${px(ix)}" cy="${px(iy)}" r="26" fill="#1a1a1a" stroke="#555" stroke-width="4"/>`);
  for (const [dx, dy] of [[-1.6, 0], [1.6, 0], [0, -1.6], [0, 1.6], [-1.6, 1.2], [1.6, -1.2]]) g.push(`<rect x="${px(ix + dx - 0.3)}" y="${px(iy + dy - 0.3)}" width="60" height="60" rx="8" fill="#5b4a7a" stroke="#2a2040" stroke-width="3"/>`);
  for (const [x, y] of [[11.4, 19.6], [18.4, 12.6]]) g.push(`<rect x="${px(x)}" y="${px(y)}" width="160" height="70" fill="#5a3a22" stroke="${WALL}" stroke-width="4" filter="url(#shadow)"/>`);
  const [fx, fy] = FOYERS.find(h => h.key === "fourneau").at;
  g.push(`<g filter="url(#shadow)"><rect x="${px(fx - 1)}" y="${px(fy - 0.7)}" width="200" height="140" rx="30" fill="#b07a50" stroke="#5a3a22" stroke-width="5"/>
    <circle cx="${px(fx - 0.45)}" cy="${px(fy)}" r="34" fill="#1a1a1a"/><circle cx="${px(fx + 0.45)}" cy="${px(fy)}" r="34" fill="#1a1a1a"/></g>${fire(fx, fy + 0.55, 22)}`);
  g.push(`<rect x="${px(POI.kitchenTable[0] - 1.5)}" y="${px(POI.kitchenTable[1] - 0.6)}" width="300" height="120" fill="#7a5a3a" stroke="${WALL}" stroke-width="4" filter="url(#shadow)"/>
    <rect x="${px(24.4)}" y="${px(5.3)}" width="140" height="60" fill="#5a3a22"/><circle cx="${px(25.3)}" cy="${px(9.9)}" r="40" fill="#6a4a2a" stroke="${WALL}" stroke-width="5"/><circle cx="${px(25.3)}" cy="${px(9.9)}" r="30" fill="#5f8aa8"/>`);
  const [cx, cy] = FOYERS.find(h => h.key === "chaudiere").at;
  g.push(`<circle cx="${px(cx)}" cy="${px(cy)}" r="60" fill="#2b2b2e" stroke="#111" stroke-width="6" filter="url(#shadow)"/>${fire(cx, cy, 24)}`);
  g.push(`<g filter="url(#shadow)"><circle cx="${px(POI.tub[0])}" cy="${px(POI.tub[1])}" r="150" fill="#b88a58" stroke="#6a4a2a" stroke-width="10"/><circle cx="${px(POI.tub[0])}" cy="${px(POI.tub[1])}" r="130" fill="#7fb2c8"/></g>
    <circle cx="${px(POI.tub[0])}" cy="${px(POI.tub[1])}" r="140" fill="#fff" opacity="0.25" filter="url(#blur)"/>`);
  const [bx, by] = FOYERS.find(h => h.key === "brasero").at;
  g.push(`<circle cx="${px(bx)}" cy="${px(by)}" r="44" fill="#2b2b2e" stroke="#111" stroke-width="5" filter="url(#shadow)"/>${fire(bx, by, 18)}`);
  g.push(`<rect x="${px(POI.shoeShelf[0] - 0.6)}" y="${px(POI.shoeShelf[1] - 1.2)}" width="70" height="240" fill="#6a4a2a" stroke="${WALL}" stroke-width="4"/>`);
  for (const [x, y] of POI.futons) g.push(`<g filter="url(#shadow)"><rect x="${px(x - 0.7)}" y="${px(y - 1.2)}" width="140" height="240" rx="12" fill="#f1ede4" stroke="#8a8478" stroke-width="3"/>
    <rect x="${px(x - 0.7)}" y="${px(y - 0.3)}" width="140" height="150" rx="12" fill="#4a6a9a"/></g>`);
  g.push(`<path d="M${px(6.9)} ${px(5)} v600 M${px(9.3)} ${px(5)} v600" stroke="#d8cfb8" stroke-width="10" opacity="0.8"/>`);
  g.push(`<rect x="${px(POI.desk[0] - 1)}" y="${px(POI.desk[1] - 0.5)}" width="200" height="100" fill="#4a3220" stroke="${WALL}" stroke-width="4" filter="url(#shadow)"/>
    <rect x="${px(POI.registry[0] - 0.4)}" y="${px(POI.registry[1] - 0.3)}" width="80" height="60" fill="#2f4f6b"/><rect x="${px(12.4)}" y="${px(9)}" width="90" height="130" fill="#3a2a1a" stroke="${WALL}" stroke-width="4"/>
    <rect x="${px(14.1)}" y="${px(5.3)}" width="120" height="60" fill="#1a1414" stroke="#c9a84a" stroke-width="4"/>`);
  return g.join("");
}

function outdoors(r) {
  const g = [];
  const { cx, cy, rx, ry } = POI.rotenburo;
  g.push(`<path d="${POI.path.map((p, i) => `${i ? "L" : "M"}${px(p[0])} ${px(p[1])}`).join(" ")}" stroke="#b9c6d2" stroke-width="160" fill="none" stroke-linecap="round" filter="url(#path)" opacity="0.9"/>
    <path d="M${px(26)} ${px(16)} L${px(29.6)} ${px(16)}" stroke="#b9c6d2" stroke-width="120" fill="none" stroke-linecap="round" opacity="0.8"/>
    <path d="M${px(23)} ${px(5)} Q${px(26)} ${px(2)} ${px(29)} ${px(4)}" stroke="#c9d4de" stroke-width="80" fill="none" opacity="0.6"/>`);
  g.push(`<ellipse cx="${px(cx)}" cy="${px(cy)}" rx="${px(rx + 0.5)}" ry="${px(ry + 0.5)}" fill="#6f716f" filter="url(#shadow)"/><ellipse cx="${px(cx)}" cy="${px(cy)}" rx="${px(rx)}" ry="${px(ry)}" fill="#5f97b2"/>
    ${Array.from({ length: 22 }, (_, i) => { const a = (i / 22) * Math.PI * 2; return rock(cx * GRID + Math.cos(a) * (rx + 0.45) * GRID, cy * GRID + Math.sin(a) * (ry + 0.45) * GRID, r.range(28, 46), r); }).join("")}
    ${Array.from({ length: 6 }, () => `<ellipse cx="${f(r.range(cx - rx, cx + rx) * GRID)}" cy="${f(r.range(cy - ry, cy + ry) * GRID)}" rx="${f(r.range(80, 160))}" ry="${f(r.range(50, 90))}" fill="#fff" opacity="0.35" filter="url(#blur)"/>`).join("")}`);
  const hi = ZONES.I;
  g.push(`<rect x="${px(hi.x0)}" y="${px(hi.y0)}" width="${px(hi.x1 - hi.x0)}" height="${px(hi.y1 - hi.y0)}" fill="url(#darkplanks)"/>
    ${[[29.4, 1.4], [30.4, 1.4], [29.4, 2.4], [34.6, 5.4], [34.6, 4.4], [33.6, 5.4]].map(([x, y]) => `<rect x="${px(x)}" y="${px(y)}" width="92" height="92" fill="#cfe6f4" stroke="#7fa6c4" stroke-width="4" filter="url(#ice)"/>`).join("")}
    ${Array.from({ length: 10 }, () => `<ellipse cx="${f(r.range(30, 35.5) * GRID)}" cy="${f(r.range(3, 6.6) * GRID)}" rx="${f(r.range(40, 90))}" ry="${f(r.range(20, 40))}" fill="#c9b060" opacity="0.8"/>`).join("")}
    <path d="M${px(POI.remains[0] - 0.8)} ${px(POI.remains[1] - 0.5)} q80 -30 160 0 q20 60 -10 110 q-70 20 -140 0Z" fill="#3a3a40" filter="url(#shadow)"/>
    <rect x="${px(POI.bag[0] - 0.4)}" y="${px(POI.bag[1] - 0.3)}" width="80" height="60" rx="14" fill="#7a5232" stroke="${WALL}" stroke-width="4"/>
    <rect x="${px(31.4)}" y="${px(1.15)}" width="230" height="40" fill="#5a3a22"/>`);
  // Snow drifts piled against the outer walls of the inn.
  const b = INN.building;
  g.push(`<g filter="url(#blur)" opacity="0.9" fill="#ffffff"><rect x="${px(b.x0 - 0.8)}" y="${px(b.y0 - 0.8)}" width="${px(b.x1 - b.x0 + 1.6)}" height="80"/><rect x="${px(b.x0 - 0.8)}" y="${px(b.y0)}" width="80" height="${px(b.y1 - b.y0)}"/>
    <rect x="${px(b.x1)}" y="${px(b.y0)}" width="80" height="${px(b.y1 - b.y0)}"/><rect x="${px(b.x0 - 0.8)}" y="${px(b.y1)}" width="${px(b.x1 - b.x0 + 1.6)}" height="70"/></g>`);
  for (const [x, y] of [[2, 3], [1.5, 9], [2, 16], [1.5, 22], [14, 2], [20, 1.6], [26.5, 2], [38, 3], [38.5, 9], [38, 22], [32, 24.5], [26, 25.5], [18, 25.5], [14, 24], [38.5, 15], [28, 9.5], [36.5, 26.5], [1.8, 26.5]]) g.push(pine(x * GRID, y * GRID, r.range(110, 170), r));
  for (const [x, y] of [[11.5, 26.4], [27.6, 22.6], [37.5, 11.5], [24, 2.4]]) g.push(rock(x * GRID, y * GRID, r.range(40, 70), r));
  g.push(`<rect x="${px(8.3)}" y="${px(21.3)}" width="34" height="50" rx="12" fill="#c43a2a" stroke="${WALL}" stroke-width="4"/>`);
  return g.join("");
}

function innMap() {
  const r = rng("auberge");
  const W = INN.w * GRID, H = INN.h * GRID;
  const floors = Object.entries(ZONES).filter(([, z]) => FLOOR[z.floor]).map(([, z]) => `<rect x="${px(z.x0)}" y="${px(z.y0)}" width="${px(z.x1 - z.x0)}" height="${px(z.y1 - z.y0)}" fill="${FLOOR[z.floor]}"/>
    ${z.floor === "earth" ? `<rect x="${px(z.x0)}" y="${px(z.y0)}" width="${px(z.x1 - z.x0)}" height="${px(z.y1 - z.y0)}" filter="url(#earth)" opacity="0.8"/>` : ""}`).join("");
  const b = INN.building;
  return svg(W, H, commonDefs(W, H, 11), `
    <rect width="${W}" height="${H}" fill="#eef3f7"/><rect width="${W}" height="${H}" filter="url(#snow)"/><rect width="${W}" height="${H}" filter="url(#snowfine)" opacity="0.35"/>
    ${outdoors(r)}
    <rect x="${px(b.x0)}" y="${px(b.y0)}" width="${px(b.x1 - b.x0)}" height="${px(b.y1 - b.y0)}" fill="#3a2c20" filter="url(#shadow)"/>
    ${floors}${furniture()}
    ${walls(undefined, DOORS, [[b.x0, b.y0, b.x1, b.y0], [b.x0, b.y1, b.x1, b.y1], [b.x0, b.y0, b.x0, b.y1], [b.x1, b.y0, b.x1, b.y1], [29, 1, 36, 1], [29, 7, 36, 7], [29, 1, 29, 7], [36, 1, 36, 7]])}
    ${DOORS.map(door).join("")}`);
}

function innPlan() {
  const W = 1200, H = 840, k = W / INN.w;
  const q = v => f(v * k);
  const colors = { A: "#b9b4a8", B: "#d8d0a0", C: "#b89a78", D: "#d8d0a0", E: "#c8a882", F: "#a8c4d4", H: "#9cc2d6", I: "#c9dff0" };
  const zone = (key, z) => `<rect x="${q(z.x0)}" y="${q(z.y0)}" width="${q(z.x1 - z.x0)}" height="${q(z.y1 - z.y0)}" fill="${colors[key] ?? "none"}" ${key === "H" ? 'rx="60"' : ""}/>
    <text x="${q((z.x0 + z.x1) / 2)}" y="${q((z.y0 + z.y1) / 2) + 12}" font-family="Georgia" font-size="34" font-weight="bold" fill="#2a1f18" text-anchor="middle">${key}</text>`;
  const ws = wallSegments(undefined, DOORS).map(s => `<line x1="${q(s[0])}" y1="${q(s[1])}" x2="${q(s[2])}" y2="${q(s[3])}" stroke="#2a1f18" stroke-width="7"/>`).join("");
  return svg(W, H, "", `<rect width="${W}" height="${H}" fill="#f3f1ec"/>${Object.entries(ZONES).filter(([key]) => key !== "G").map(([key, z]) => zone(key, z)).join("")}${ws}
    ${FOYERS.map(h => `<circle cx="${q(h.at[0])}" cy="${q(h.at[1])}" r="12" fill="#e0602a"/>`).join("")}
    <text x="${q(7)}" y="${q(25.5)}" font-family="Georgia" font-size="30" fill="#2f4f6b" text-anchor="middle">G · cour, vers le col</text>
    <text x="${q(33)}" y="${q(23)}" font-family="Georgia" font-size="22" fill="#56616d" text-anchor="middle">● foyer</text>`);
}

function passMap() {
  const r = rng("col");
  const W = PASS.w * GRID, H = PASS.h * GRID;
  const hut = PASS_HUT;
  const [jx, jy] = PASS_POI.jizo, [sx, sy] = PASS_POI.sled, [px0, py0] = PASS_POI.porter;
  return svg(W, H, commonDefs(W, H, 23) + `<linearGradient id="slope" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a6a78" stop-opacity="0.55"/><stop offset="0.4" stop-color="#5a6a78" stop-opacity="0"/></linearGradient>`, `
    <rect width="${W}" height="${H}" fill="#eef3f7"/><rect width="${W}" height="${H}" filter="url(#snow)"/><rect width="${W}" height="${H}" filter="url(#snowfine)" opacity="0.35"/>
    <path d="M0 0 L${px(14)} 0 Q${px(9)} ${px(2.5)} 0 ${px(6)}Z" fill="#6a7480" filter="url(#stone)"/><rect width="${W}" height="${H}" fill="url(#slope)"/>
    <path d="${PASS_POI.path.map((p, i) => `${i ? "L" : "M"}${px(p[0])} ${px(p[1])}`).join(" ")}" stroke="#b9c6d2" stroke-width="170" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#path)"/>
    <g filter="url(#shadow)"><rect x="${px(hut.x0)}" y="${px(hut.y0)}" width="${px(hut.x1 - hut.x0)}" height="${px(hut.y1 - hut.y0)}" fill="#55524c"/></g>
    <rect x="${px(hut.x0)}" y="${px(hut.y0)}" width="${px(hut.x1 - hut.x0)}" height="${px(hut.y1 - hut.y0)}" fill="url(#tiles)" opacity="0.8"/>
    <g filter="url(#shadow)"><ellipse cx="${px(jx)}" cy="${px(jy)}" rx="45" ry="55" fill="#8d8d88"/><circle cx="${px(jx)}" cy="${px(jy - 0.45)}" r="30" fill="#9a9a94"/><path d="M${px(jx - 0.4)} ${px(jy - 0.1)} h80 l-40 40Z" fill="#c43a2a"/></g>
    <ellipse cx="${px(PASS_POI.offering[0])}" cy="${px(PASS_POI.offering[1])}" rx="20" ry="12" fill="#6b3a2a"/>
    ${walls(PASS_RUNS, PASS_DOORS, PASS_RUNS).replaceAll(WALL, "#4a4842")}
    <g transform="rotate(-24 ${px(sx)} ${px(sy)})" filter="url(#shadow)"><rect x="${px(sx - 1.2)}" y="${px(sy - 0.5)}" width="240" height="100" fill="#7a5232" stroke="${WALL}" stroke-width="6"/>
      <path d="M${px(sx - 1.4)} ${px(sy + 0.6)} h280" stroke="#3a2a1a" stroke-width="12"/></g>
    ${[[sx + 1.4, sy + 0.9], [sx - 1.6, sy + 1.4], [sx + 0.4, sy - 1.3]].map(([x, y]) => `<rect x="${px(x - 0.3)}" y="${px(y - 0.25)}" width="60" height="50" rx="10" fill="#a88a5a" stroke="${WALL}" stroke-width="3" filter="url(#shadow)"/>`).join("")}
    <path d="M${px(px0 - 0.6)} ${px(py0)} q60 -50 120 0 q-60 40 -120 0Z" fill="#4a3a3a"/>${Array.from({ length: 8 }, () => `<circle cx="${f((px0 + r.range(-0.8, 0.8)) * GRID)}" cy="${f((py0 + r.range(-0.6, 0.8)) * GRID)}" r="${f(r.range(5, 14))}" fill="#8a1f1f" opacity="0.7"/>`).join("")}
    ${PASS_POI.rocks.map(([x, y]) => rock(x * GRID, y * GRID, r.range(40, 80), r)).join("")}
    ${PASS_POI.pines.map(([x, y]) => pine(x * GRID, y * GRID, r.range(110, 170), r)).join("")}`);
}

export async function renderMaps() {
  const inn = innMap();
  const pass = passMap();
  return [
    await render(inn, "maps/auberge.webp", { quality: 82 }),
    await render(inn, "maps/auberge-thumb.webp", { width: 400, height: 280 }),
    await render(innPlan(), "maps/auberge-plan.webp"),
    await render(pass, "maps/col.webp", { quality: 82 }),
    await render(pass, "maps/col-thumb.webp", { width: 400, height: 240 }),
  ];
}
