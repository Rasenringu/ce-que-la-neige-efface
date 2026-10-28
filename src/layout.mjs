// Single source of truth for both maps. The painted drafts (tools/art) and the
// Foundry scenes (walls, doors, lights, notes, tokens) all read it.
// Units are grid squares: 1 square = 100 px = 1,5 m (the system's fixed scale).

export const GRID = 100;

/* -------------------------------------------- */
/*  Auberge Yukimi-ya                           */
/* -------------------------------------------- */

export const INN = { w: 40, h: 28, building: { x0: 4, y0: 5, x1: 26, y1: 21 } };

// x0, y0, x1, y1 in squares. G is the snowy yard around the inn (pin only).
export const ZONES = {
  A: { name: "Genkan", x0: 4, y0: 11, x1: 10, y1: 21, floor: "stone" },
  B: { name: "Salle commune", x0: 10, y0: 11, x1: 20, y1: 21, floor: "tatami" },
  C: { name: "Cuisine", x0: 18, y0: 5, x1: 26, y1: 11, floor: "earth" },
  D: { name: "Chambres", x0: 4, y0: 5, x1: 12, y1: 11, floor: "tatami" },
  E: { name: "Bureau de l'okami", x0: 12, y0: 5, x1: 18, y1: 11, floor: "planks" },
  F: { name: "Bains intérieurs", x0: 20, y0: 11, x1: 26, y1: 21, floor: "planks" },
  G: { name: "Cour et sentier", x0: 3, y0: 22, x1: 12, y1: 27, floor: "snow" },
  H: { name: "Bain extérieur", x0: 29, y0: 12, x1: 37, y1: 20, floor: "rock" },
  I: { name: "Glacière", x0: 29, y0: 1, x1: 36, y1: 7, floor: "ice" },
};

// Door openings: wall segment [x0,y0,x1,y1] in squares. "breach" doors are where
// Hyōe's snow figures burst in during the finale; "spawn" are the inside squares.
export const DOORS = [
  { key: "porte", label: "Porte principale", c: [6, 21, 8, 21], breach: true, spawn: [[6.5, 19.5], [7.5, 19.5]] },
  { key: "AD", c: [6, 11, 8, 11] },
  { key: "AB", c: [10, 15, 10, 17] },
  { key: "DE", c: [12, 7, 12, 9] },
  { key: "EB", c: [14, 11, 16, 11] },
  { key: "EC", c: [18, 7, 18, 9] },
  { key: "CB", c: [18, 11, 20, 11] },
  { key: "BF", c: [20, 15, 20, 17] },
  { key: "CF", c: [23, 11, 25, 11] },
  { key: "bain", label: "Porte du bain", c: [26, 15, 26, 17], breach: true, spawn: [[24.5, 15.5], [24.5, 16.5]] },
  { key: "service", label: "Porte de service", c: [22, 5, 24, 5], state: "locked", breach: true, spawn: [[22.5, 6.5], [23.5, 6.5]] },
  { key: "voletD", label: "Volet des chambres", c: [4, 7, 4, 9], state: "locked", breach: true, spawn: [[5.5, 7.5], [5.5, 8.5]] },
  { key: "voletB", label: "Volet de la salle", c: [15, 21, 18, 21], state: "locked", breach: true, spawn: [[15.5, 19.5], [16.5, 19.5]] },
  { key: "glaciere", label: "Porte de la glacière", c: [31, 7, 33, 7] },
];
export const BREACHES = DOORS.filter(d => d.breach);

// Straight wall runs; door openings are cut out of them automatically.
export const WALL_RUNS = [
  [4, 5, 26, 5], [4, 5, 4, 21], [4, 21, 26, 21], [26, 5, 26, 21],
  [4, 11, 26, 11], [12, 5, 12, 11], [18, 5, 18, 11], [10, 11, 10, 21], [20, 11, 20, 21],
  [29, 1, 36, 1], [29, 1, 29, 7], [36, 1, 36, 7], [29, 7, 36, 7],
];

// The four hearths of the finale. Lit = AmbientLight visible on the scene.
export const FOYERS = [
  { key: "irori", name: "Grand irori", zone: "B", at: [15, 15.5] },
  { key: "fourneau", name: "Fourneau", zone: "C", at: [19.6, 6.4] },
  { key: "chaudiere", name: "Chaudière du bain", zone: "F", at: [23, 19.6] },
  { key: "brasero", name: "Brasero du genkan", zone: "A", at: [7, 14.5] },
];

// Points of interest in squares (centre of the object).
export const POI = {
  desk: [15, 7], registry: [16.5, 6.2], futons: [[6, 6.6], [8.2, 6.6], [10.4, 6.6]], kitchenTable: [22.5, 8.8],
  tub: [23, 14], rotenburo: { cx: 33, cy: 16, rx: 3.2, ry: 2.4 }, remains: [31, 3], bag: [34.5, 2.6], shelf: [32.5, 1.6],
  shoeShelf: [5, 13.5], path: [[7, 21], [7, 24], [5, 27.9]], trackLine: [[26, 16], [29.5, 14], [31.5, 9], [32, 7]],
};

/* -------------------------------------------- */
/*  Col de Shirakami                            */
/* -------------------------------------------- */

export const PASS = { w: 30, h: 18 };
export const PASS_HUT = { x0: 19, y0: 3, x1: 23, y1: 7 };
export const PASS_DOORS = [{ key: "jizo", label: "Abri du jizō", c: [20, 7, 22, 7] }];
export const PASS_RUNS = [[19, 3, 23, 3], [19, 3, 19, 7], [23, 3, 23, 7], [19, 7, 23, 7]];
export const PASS_POI = {
  path: [[1, 17], [6, 14], [11, 11.5], [16, 9.5], [21, 8.5], [26, 5], [29.9, 2.5]],
  sled: [13.5, 10.2], porter: [12.2, 11.6], jizo: [21, 4.2], offering: [21.9, 4.4],
  pines: [[3, 4], [5, 7], [2.5, 10], [8, 3], [10, 6.5], [15, 3.5], [16.5, 14], [20, 13], [24, 12], [27, 9], [26.5, 15], [8.5, 16], [13, 16.5], [4, 13]],
  rocks: [[7, 10], [18, 11.5], [25, 7.5], [12, 4.5], [28, 12]],
};

/** Split each wall run around the door openings that lie on it. */
export function wallSegments(runs = WALL_RUNS, doors = DOORS) {
  const segments = [];
  for (const [x0, y0, x1, y1] of runs) {
    const horizontal = y0 === y1;
    const [a, b] = horizontal ? [x0, x1] : [y0, y1];
    const cuts = doors.filter(d => horizontal
      ? d.c[1] === y0 && d.c[3] === y0 && d.c[0] >= a && d.c[2] <= b
      : d.c[0] === x0 && d.c[2] === x0 && d.c[1] >= a && d.c[3] <= b)
      .map(d => horizontal ? [d.c[0], d.c[2]] : [d.c[1], d.c[3]]).sort((p, q) => p[0] - q[0]);
    let start = a;
    for (const [c0, c1] of cuts) {
      if (c0 > start) segments.push(horizontal ? [start, y0, c0, y0] : [x0, start, x0, c0]);
      start = c1;
    }
    if (start < b) segments.push(horizontal ? [start, y0, b, y0] : [x0, start, x0, b]);
  }
  return segments;
}
