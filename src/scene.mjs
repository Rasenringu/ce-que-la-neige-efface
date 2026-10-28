// The two battlemaps: walls and doors from src/layout.mjs, lights (the four
// hearths are flagged so the dashboard can light or snuff them), zone pins
// linked to the journal and the starting tokens.
import { stableId } from "../tools/lib/system-catalog.mjs";
import { GRID, INN, ZONES, DOORS, FOYERS, PASS, PASS_DOORS, PASS_RUNS, PASS_POI, wallSegments } from "./layout.mjs";
import { MID, PREGENS } from "./actors.mjs";
import { ZONE_PAGE } from "./journals.mjs";

const ART = `modules/${MID}/assets`;
const px = v => Math.round(v * GRID);
const NORMAL = 20;

export const INN_SCENE_ID = "neiscene00000001";
export const PASS_SCENE_ID = "neiscene00000002";
const LEVEL_ID = "defaultLevel0000";
export const HIMURO_SNOW = [[30.5, 2.5], [33.5, 4.5], [35.2, 2.5]];

function tokenAt(key, actor, [cx, cy], extra = {}) {
  const proto = actor.prototypeToken;
  return {
    _id: stableId("token:" + key), actorId: actor._id, x: px(cx - 0.5), y: px(cy - 0.5), width: 1, height: 1,
    name: proto.name, texture: proto.texture, actorLink: proto.actorLink, disposition: proto.disposition,
    displayName: proto.displayName, displayBars: proto.displayBars, bar1: proto.bar1, bar2: proto.bar2,
    sight: proto.sight, ...(proto.light ? { light: proto.light } : {}), lockRotation: true, hidden: false, ...extra,
  };
}

function light(key, [cx, cy], bright, dim, color, animation = null, alpha = 0.45, extra = {}) {
  return { _id: stableId("light:" + key), x: px(cx), y: px(cy), config: { bright, dim, color, alpha, animation: animation ? { type: animation, speed: 3, intensity: 4 } : { type: null } }, ...extra };
}

const walls = (runs, doors) => [
  ...wallSegments(runs, doors).map(c => ({ _id: stableId("wall:" + c.join(",")), c: c.map(px), move: NORMAL, sight: NORMAL, light: NORMAL, sound: NORMAL, door: 0, ds: 0 })),
  ...doors.map(d => ({ _id: stableId("door:" + d.key), c: d.c.map(px), move: NORMAL, sight: NORMAL, light: NORMAL, sound: NORMAL, door: 1, ds: d.state === "locked" ? 2 : 0,
    flags: { [MID]: { door: d.key, initial: d.state === "locked" ? 2 : 0, ...(d.breach ? { breach: { label: d.label, spawn: d.spawn } } : {}) } } })),
];

const level = (map, src) => ({
  levels: [{ _id: LEVEL_ID, name: "Rez-de-chaussée", elevation: { bottom: 0, top: null }, background: { src: `${ART}/maps/${src}.webp`, color: "#0d1418" }, textures: { fit: "fill" } }],
  initialLevel: LEVEL_ID,
  thumb: `${ART}/maps/${src}-thumb.webp`,
  // No padding: placeable coordinates then match the painted map pixel for pixel.
  width: px(map.w), height: px(map.h), padding: 0,
  initial: { x: px(map.w / 2), y: px(map.h / 2), scale: 0.45 },
  grid: { type: 1, size: GRID, distance: 1.5, units: "m", color: "#000000", alpha: 0.12 },
  tokenVision: true,
  fog: { exploration: false },
});

export function buildScenes(actors) {
  const byKey = Object.fromEntries([...actors.pregens, ...actors.npcs, ...actors.demons].map(a => [a.flags[MID].key, a]));
  const pcs = start => PREGENS.map((p, i) => tokenAt(`${start}:${p.key}`, byKey[p.key], [start === "col" ? 1.5 + (i % 3) : 4.5 + i, start === "col" ? 14.5 + Math.floor(i / 3) : 24.5]));

  const pass = {
    _id: PASS_SCENE_ID, name: "1 · Le col de Shirakami", navigation: true, navName: "Le col", navOrder: 1, ...level(PASS, "col"),
    environment: { darknessLevel: 0.45, globalLight: { enabled: false } },
    walls: walls(PASS_RUNS, PASS_DOORS),
    lights: [light("col:jizo", [21, 5], 1.5, 4.5, "#ffcf8a", "torch", 0.35), light("col:ciel", [15, 9], 12, 30, "#9fb8d8", null, 0.12)],
    notes: [
      { _id: stableId("note:col:jizo"), ...ZONE_PAGE("J"), x: px(22.6), y: px(2.4), texture: { src: `${ART}/icons/zone-j.webp` }, iconSize: 64, text: "Abri du jizō", fontSize: 28, textAnchor: 1, global: false },
      { _id: stableId("note:col:traineau"), ...ZONE_PAGE("T"), x: px(14.8), y: px(9.2), texture: { src: `${ART}/icons/zone-t.webp` }, iconSize: 64, text: "Traîneau renversé", fontSize: 28, textAnchor: 1, global: false },
    ],
    tokens: [
      ...pcs("col"),
      tokenAt("col:ryoan", byKey.ryoan, [21, 5.5]),
      tokenAt("col:kozo", byKey.kozo, [17.5, 8.5]),
    ],
    flags: { [MID]: { key: "col" } },
  };

  const foyers = FOYERS.map(f => light("foyer:" + f.key, f.at, 3, 9, "#ff9a3c", "fire", 0.55, { flags: { [MID]: { foyer: f.key } } }));
  const inn = {
    _id: INN_SCENE_ID, name: "2 · Auberge Yukimi-ya", navigation: true, navName: "Auberge Yukimi-ya", navOrder: 2, ...level(INN, "auberge"),
    environment: { darknessLevel: 0.65, globalLight: { enabled: false } },
    walls: walls(undefined, DOORS),
    lights: [
      ...foyers,
      light("lampe:D", [8, 8], 2, 6, "#ffd28a", "torch", 0.35), light("lampe:E", [15, 8.5], 2, 6, "#ffd28a", "torch", 0.35),
      light("lampe:F", [21.5, 13], 1.5, 5, "#ffe0b0", null, 0.3), light("lanterne:porte", [8.6, 22], 1.5, 6, "#ffc06a", "torch", 0.4),
      light("neige", [32, 16], 4, 14, "#a9c4e8", null, 0.12),
    ],
    notes: Object.entries(ZONES).map(([key, z]) => ({
      _id: stableId("note:" + key), ...ZONE_PAGE(key), x: px(z.x0 + 1), y: px(z.y0 + 1),
      texture: { src: `${ART}/icons/zone-${key.toLowerCase()}.webp` }, iconSize: 56, text: `${key} · ${z.name}`, fontSize: 24, textAnchor: 1, global: false,
    })),
    tokens: [
      ...pcs("inn"),
      tokenAt("inn:ryoan", byKey.ryoan, [9.5, 24.5]),
      tokenAt("inn:fuyuko", byKey.fuyuko, [12.5, 13.5]),
      // Hyōe starts wearing Kōta's face: name and image of the son, neutral, bars hidden from players.
      tokenAt("inn:hyoe", byKey.hyoe, [19.3, 20.3], { name: "Kōta", texture: { src: `${ART}/tokens/kota.webp` }, disposition: 0, displayBars: 40,
        flags: { [MID]: { masked: true } } }),
      tokenAt("inn:yaeko", byKey.yaeko, [24.5, 8.5]),
      tokenAt("inn:onoda", byKey.onoda, [8.5, 13]),
      tokenAt("inn:tae", byKey.tae, [8.5, 7.5]),
      tokenAt("inn:hina", byKey.hina, [9.5, 8.5]),
      tokenAt("inn:kuma", byKey.kuma, [13.5, 16.5]),
      // Optional skirmish in the ice house (scene 3): hidden until the GM reveals them.
      ...HIMURO_SNOW.map((at, i) => tokenAt("inn:snow" + i, byKey.enneige, at, { hidden: true, name: "Enneigé", flags: { [MID]: { himuro: true } } })),
    ],
    flags: { [MID]: { key: "auberge" } },
  };
  return [pass, inn];
}

export function buildMacros() {
  const api = `game.modules.get("${MID}")?.api`;
  const macro = (key, name, img, command) => ({ _id: stableId("macro:" + key), name, type: "script", scope: "global", img, command, flags: { [MID]: { key } } });
  return [
    macro("dashboard", "Neige · Tableau de bord", "icons/magic/water/snowflake-ice-blue.webp", `${api}.dashboard();`),
    macro("guide", "Neige · Guide du MJ", "icons/sundries/books/book-red-exclamation.webp", `${api}.openGuide();`),
    macro("handout", "Neige · Montrer une pièce", "icons/sundries/scrolls/scroll-rolled-white.webp", `${api}.showHandout();`),
    macro("unmask", "Neige · Démasquer Kōta", "icons/magic/perception/silhouette-stealth-shadow.webp", `${api}.unmask();`),
    macro("summon", "Neige · Appel de la neige", "icons/magic/air/wind-weather-snow-gusts.webp", `${api}.summonSnow();`),
    macro("heal", "Neige · Soin du Dr Ryōan (cible)", "icons/tools/medical/bandage-rough.webp", `${api}.ryoanHeal();`),
    macro("hearth", "Neige · Foyer le plus proche (allumer/éteindre)", "icons/magic/fire/flame-burning-campfire-orange.webp", `${api}.toggleNearestFoyer();`),
  ];
}
