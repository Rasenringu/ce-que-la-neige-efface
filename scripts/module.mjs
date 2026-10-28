// Ce que la neige efface — runtime for Foundry v14 and Breathe and Live 0.6.
// The GM dashboard tracks the investigation (conclusions, preparations) and the
// finale (dawn, hearths, snow figures, civilians, Hyōe); the hooks below keep it
// in sync with what happens on the scene.
const MID = "ce-que-la-neige-efface";
const { ApplicationV2, DialogV2 } = foundry.applications.api;

const CLUES = {
  face: ["Un démon porte un visage volé", "Kozō, dessin de Hina, carnet d'Onoda, Kuma, absence de buée."],
  kota: ["« Kōta » est le démon", "Lettre (le 15), billet et sac dans la glacière, plateaux intacts, la chanson."],
  hyoe: ["C'est Hyōe ; il veut Fuyuko dehors", "Offrande du jizō, registre, aveu, plaque de guide, griffures de la porte."],
  heat: ["La chaleur le gêne", "Coin le plus froid, étincelle, Enneigés qui fondent, fourneau (Yaeko)."],
};
const PREPS = {
  gather: ["Civils autour de l'irori", "Ils commencent dans la salle commune, foyer allumé."],
  barricade: ["Volets barricadés", "Le premier Appel de la neige arrive au round suivant."],
  glycine: ["Encens de glycine", "3 rounds sans Étreinte dans la pièce ; 1d6 à Hyōe au début de ses tours."],
  onoda: ["Onoda armé et convaincu", "Garde une porte, tire une fois par round (d20 + 3, 1d8 + 1)."],
  ryoan: ["Poste de soins du Dr Ryōan", "1d6 + 2 PV à un PJ adjacent, une fois par round."],
  fuyuko: ["Fuyuko prête à parler", "Une fois : elle parle à Hyōe, il perd une action ce round."],
};
const CIVILIANS = ["fuyuko", "tae", "hina", "yaeko", "ryoan", "onoda"];
const STATUS = { abri: "À l'abri", agrippe: "Agrippé(e)", dehors: "Dehors", mort: "Mort(e)" };
const DAWN = [
  "5 h 30 — nuit noire, le blizzard hurle.", "5 h 40 — les volets claquent.", "5 h 50 — la neige entre sous les portes.",
  "6 h 00 — le vent tourne.", "6 h 10 — on distingue la crête.", "6 h 20 — la tempête faiblit.",
  "6 h 30 — le ciel blanchit : Hyōe ne peut plus appeler la neige.", "6 h 40 — l'horizon rosit : Hyōe cherche un abri.",
  "6 h 50 — le soleil se lève : dehors et derrière chaque ouverture ouverte, c'est la mort pour un démon.",
];
const DAWN_MAX = 8;
const SNOW_MAX = 6;
const REGEN = 5;
const REGEN_RANGE_M = 4.5;
const MELT_RANGE_M = 3;
const NIGHT = 0.65;

const defaultState = () => ({
  final: false, masked: true, dawn: 0,
  clues: Object.fromEntries(Object.keys(CLUES).map(k => [k, false])),
  prep: Object.fromEntries(Object.keys(PREPS).map(k => [k, false])),
  civilians: Object.fromEntries(CIVILIANS.map(k => [k, "abri"])),
  fuyukoSpoke: false, summonRound: null, ryoanRound: null, regenTurn: null, processedRound: null, alerts: {},
});

/* -------------------------------------------- */
/*  State                                       */
/* -------------------------------------------- */

export function getState() {
  return foundry.utils.mergeObject(defaultState(), game.settings.get(MID, "state") ?? {}, { inplace: false });
}

// Hooks fire concurrently (end of round, regeneration, thresholds): writes are
// queued so each patch merges onto the previous one instead of a stale copy.
let writes = Promise.resolve();
function setState(patch) {
  if (!game.user.isGM) throw new Error("Seul le MJ peut modifier l'état du scénario.");
  const run = writes.then(async () => {
    const next = foundry.utils.mergeObject(getState(), patch, { inplace: false });
    await game.settings.set(MID, "state", next);
    return next;
  });
  writes = run.catch(() => {});
  return run;
}

const byKey = key => game.actors.find(a => a.getFlag(MID, "key") === key);
const hyoe = () => byKey("hyoe");
const inn = () => game.scenes.find(s => s.getFlag(MID, "key") === "auberge");
const hyoeToken = () => inn()?.tokens.find(t => t.actorLink && t.actorId === hyoe()?.id);
const snowTokens = (scene = inn()) => scene?.tokens.filter(t => t.actor?.getFlag(MID, "key") === "enneige" && !t.getFlag(MID, "himuro") && !t.hidden) ?? [];
const foyers = () => inn()?.lights.filter(l => l.getFlag(MID, "foyer")) ?? [];
const breaches = () => inn()?.walls.filter(w => w.getFlag(MID, "breach")) ?? [];
const isActiveGM = () => game.users.activeGM?.isSelf;
const roundKey = () => (game.combat ? `${game.combat.id}:${game.combat.round}` : null);
const FOYER_NAMES = { irori: "Grand irori", fourneau: "Fourneau", chaudiere: "Chaudière du bain", brasero: "Brasero du genkan" };

/** Distance in metres between a token's centre and a point in pixels. */
function metres(token, x, y) {
  const size = token.parent.grid.size;
  const cx = token.x + (token.width * size) / 2;
  const cy = token.y + (token.height * size) / 2;
  return (Math.hypot(cx - x, cy - y) / size) * token.parent.grid.distance;
}
const nearLitFoyer = (token, range) => foyers().some(l => !l.hidden && metres(token, l.x, l.y) <= range);

async function post(content, { gmOnly = false } = {}) {
  return ChatMessage.create({
    content: `<div class="neige-chat">${content}</div>`,
    speaker: { alias: "Ce que la neige efface" },
    whisper: gmOnly ? ChatMessage.getWhisperRecipients("GM") : [],
  });
}

/* -------------------------------------------- */
/*  Mask and finale                             */
/* -------------------------------------------- */

export async function unmask(reveal = true) {
  const token = hyoeToken();
  const actor = hyoe();
  if (!token || !actor) return ui.notifications.warn("Le token de Hyōe est introuvable sur la scène de l'auberge.");
  // Foundry 14 does not redraw a token whose texture is updated in place, so the
  // mask swaps the whole token and carries its combatants over.
  const scene = token.parent;
  const data = token.toObject();
  delete data._id;
  foundry.utils.mergeObject(data, reveal
    ? { name: actor.prototypeToken.name, texture: { src: actor.prototypeToken.texture.src }, disposition: -1, flags: { [MID]: { masked: false } } }
    : { name: "Kōta", texture: { src: `modules/${MID}/assets/tokens/kota.webp` }, disposition: 0, flags: { [MID]: { masked: true } } });
  const [created] = await scene.createEmbeddedDocuments("Token", [data]);
  for (const combat of game.combats.filter(c => c.scene?.id === scene.id)) {
    const old = combat.combatants.filter(c => c.tokenId === token.id);
    if (old.length) await combat.createEmbeddedDocuments("Combatant", old.map(c => ({ tokenId: created.id, sceneId: scene.id, actorId: actor.id, initiative: c.initiative })));
  }
  await token.delete();
  await setState({ masked: !reveal });
  if (reveal) await post(`<h3>Le masque tombe</h3><p>La peau de Kōta se craquelle comme la glace d'un lac. La voix qui sort de sa bouche n'est plus la sienne : « Vingt ans, Fuyuko. Vingt hivers que je frappe. »</p>`);
}

export async function startFinale() {
  const state = getState();
  if (state.masked) await unmask(true);
  await setState({ final: true, dawn: 0 });
  await post(`<h3>La nuit la plus longue</h3><p><strong>Aube 0/8.</strong> ${DAWN[0]} L'aube avance d'un cran à chaque fin de round.</p>
    <p><strong>Foyers :</strong> à 4,5 m d'un foyer allumé, Hyōe ne se régénère pas. Un Enneigé au contact d'un foyer peut le souffler. Rallumer : 1 action avec une lanterne.</p>
    <p><strong>Civils :</strong> agrippé, on le libère avec 10 dégâts d'un coup sur Hyōe ou Force DD 14. Dehors, il perd 2 PV par fin de round.</p>`);
  dashboard();
}

export async function setDawn(value) {
  const dawn = Math.max(0, Math.min(DAWN_MAX, value));
  await setState({ dawn });
  const scene = inn();
  if (scene) await scene.update({ "environment.darknessLevel": dawn >= DAWN_MAX ? 0.1 : Math.max(0.25, NIGHT - dawn * 0.05) });
  return dawn;
}

export async function endRound() {
  const state = getState();
  if (!state.final) return;
  const dawn = await setDawn(state.dawn + 1);
  const lines = [`<p><strong>Aube ${dawn}/${DAWN_MAX}</strong> — ${DAWN[dawn]}</p>`];
  // Snow figures close to a lit hearth melt.
  for (const token of snowTokens()) {
    if (!nearLitFoyer(token, MELT_RANGE_M)) continue;
    const hp = token.actor.system.resources.hp.value;
    await token.actor.update({ "system.resources.hp.value": Math.max(0, hp - 3) });
    lines.push(`<p>Un Enneigé fond près du feu (−3 PV).</p>`);
  }
  // Civilians thrown into the storm freeze.
  for (const key of CIVILIANS) {
    if (getState().civilians[key] !== "dehors") continue;
    const actor = byKey(key);
    if (!actor) continue;
    const hp = actor.system.resources.hp.value;
    if (hp <= 0) continue;
    const next = Math.max(0, hp - 2);
    await actor.update({ "system.resources.hp.value": next });
    lines.push(`<p>${actor.name}, dehors dans la tempête : ${next} PV${next === 0 ? " — elle ne bouge plus." : "."}</p>`);
  }
  if (dawn === DAWN_MAX) {
    lines.push("<p><strong>Le soleil se lève.</strong> Les Enneigés s'affaissent en tas de neige. Toute case dehors, et 1,5 m derrière chaque ouverture ouverte, est au soleil.</p>");
    await meltAll(false);
  }
  return post(lines.join(""));
}

/* -------------------------------------------- */
/*  Hearths and snow figures                    */
/* -------------------------------------------- */

export async function setFoyer(key, lit) {
  const light = foyers().find(l => l.getFlag(MID, "foyer") === key);
  if (!light) return ui.notifications.warn("Foyer introuvable : importez l'aventure.");
  lit ??= light.hidden;
  await light.update({ hidden: !lit });
  if (getState().final) await post(lit ? `<p><strong>${FOYER_NAMES[key]}</strong> reprend. La chaleur repousse le givre.</p>` : `<p><strong>${FOYER_NAMES[key]}</strong> s'éteint dans un sifflement de vapeur.</p>`);
}

/** Toggle the hearth nearest to the selected token (macro helper). */
export async function toggleNearestFoyer() {
  const token = canvas.tokens?.controlled[0]?.document;
  if (!token || token.parent !== inn()) return ui.notifications.warn("Sélectionnez un token sur la scène de l'auberge, près d'un foyer.");
  const [nearest] = foyers().sort((a, b) => metres(token, a.x, a.y) - metres(token, b.x, b.y));
  if (nearest) return setFoyer(nearest.getFlag(MID, "foyer"));
}

export async function summonSnow(breachKey, { free = false } = {}) {
  const scene = inn();
  const demon = hyoe();
  if (!scene || !demon) return ui.notifications.warn("Importez d'abord l'aventure.");
  const state = getState();
  if (state.final && state.dawn >= 6) return ui.notifications.warn("Le ciel blanchit : Hyōe ne peut plus appeler la neige.");
  const key = roundKey();
  if (!free && key && state.summonRound === key) return ui.notifications.warn("Appel de la neige déjà utilisé ce round.");
  const room = SNOW_MAX - snowTokens(scene).length;
  if (room <= 0) return ui.notifications.warn(`Déjà ${SNOW_MAX} Enneigés sur la scène.`);
  if (!breachKey) {
    const result = await DialogV2.prompt({
      window: { title: "Appel de la neige" },
      content: `<p>Par quelle ouverture les Enneigés entrent-ils ?</p><select name="breach" autofocus>${breaches().map(w => `<option value="${w.getFlag(MID, "door")}">${w.getFlag(MID, "breach").label}</option>`).join("")}</select>
        <label class="checkbox"><input type="checkbox" name="free"> Gratuit (mise en place, sans BDP)</label>`,
      ok: { label: "Appeler", callback: (event, button) => ({ breach: button.form.elements.breach.value, free: button.form.elements.free.checked }) },
      rejectClose: false,
    });
    if (!result) return;
    ({ breach: breachKey, free } = result);
  }
  const wall = breaches().find(w => w.getFlag(MID, "door") === breachKey);
  if (!wall) return;
  const bdp = demon.system.resources.bdp.value;
  if (!free && bdp < 4) return ui.notifications.warn("Hyōe n'a plus assez de BDP (4 requis).");
  const proto = byKey("enneige");
  if (!proto) return ui.notifications.warn("L'acteur Enneigé est introuvable.");
  const size = scene.grid.size;
  const spawn = wall.getFlag(MID, "breach").spawn.slice(0, Math.min(2, room));
  const docs = [];
  for (const [cx, cy] of spawn) docs.push((await proto.getTokenDocument({ x: Math.round((cx - 0.5) * size), y: Math.round((cy - 0.5) * size), hidden: false })).toObject());
  const created = await scene.createEmbeddedDocuments("Token", docs);
  await wall.update({ ds: CONST.WALL_DOOR_STATES.OPEN });
  if (!free) await demon.update({ "system.resources.bdp.value": bdp - 4 });
  await setState({ summonRound: free ? state.summonRound : key });
  const combat = game.combats.find(c => c.scene?.id === scene.id && c.active);
  if (combat) {
    const init = combat.combatants.find(c => c.actorId === demon.id)?.initiative;
    await combat.createEmbeddedDocuments("Combatant", created.map(t => ({ tokenId: t.id, sceneId: scene.id, actorId: proto.id, initiative: init != null ? init - 0.5 : null })));
  }
  await post(`<p><strong>${wall.getFlag(MID, "breach").label}</strong> cède. ${created.length === 2 ? "Deux silhouettes" : "Une silhouette"} de neige entre${created.length === 2 ? "nt" : ""}, avec le visage de quelqu'un qu'on a connu.</p>`);
  return created;
}

async function melt(token, { announce = true } = {}) {
  const combat = game.combats.find(c => c.scene?.id === token.parent.id);
  const combatants = combat?.combatants.filter(c => c.tokenId === token.id).map(c => c.id) ?? [];
  if (combatants.length) await combat.deleteEmbeddedDocuments("Combatant", combatants);
  await token.delete();
  if (announce) await post("<p>L'Enneigé s'effondre : il ne reste qu'un tas de neige mouillée.</p>");
}

export async function meltAll(announce = true) {
  for (const token of snowTokens()) await melt(token, { announce: false });
  if (announce) await post("<p>Toutes les silhouettes de neige s'effondrent en même temps.</p>");
}

/* -------------------------------------------- */
/*  Civilians and helpers                       */
/* -------------------------------------------- */

export async function setCivilian(key, status) {
  await setState({ civilians: { [key]: status } });
  const actor = byKey(key);
  if (status === "dehors") await post(`<p><strong>${actor?.name ?? key}</strong> est jeté(e) dehors, dans la tempête. Il ou elle perdra 2 PV à chaque fin de round.</p>`);
}

export async function ryoanHeal(tokens = [...game.user.targets]) {
  if (!tokens.length) tokens = canvas.tokens?.controlled ?? [];
  const target = tokens[0]?.actor;
  if (!target) return ui.notifications.warn("Ciblez le PJ soigné par le Dr Ryōan.");
  const state = getState();
  const key = roundKey();
  if (key && state.ryoanRound === key) return ui.notifications.warn("Le Dr Ryōan a déjà soigné ce round.");
  const hp = target.system.resources.hp;
  const roll = await new Roll("1d6 + 2").evaluate();
  const next = Math.min(hp.healableMax ?? hp.max, hp.value + roll.total);
  await target.update({ "system.resources.hp.value": next });
  await roll.toMessage({ speaker: { alias: "Dr Ryōan Shimizu" }, flavor: `Soin de ${target.name} : +${next - hp.value} PV (une fois par round).` });
  await setState({ ryoanRound: key });
}

export async function fuyukoSpeaks() {
  if (getState().fuyukoSpoke) return ui.notifications.warn("Fuyuko a déjà parlé à Hyōe.");
  await setState({ fuyukoSpoke: true });
  await post(`<h3>Fuyuko</h3><p>« Hyōe. Je sais ton nom, maintenant. J'aurais dû ouvrir. Pardonne-moi, ou ne me pardonne pas, mais arrête. » Le démon s'immobilise. <strong>Hyōe perd une action ce round.</strong></p>`);
}

/* -------------------------------------------- */
/*  Automation hooks                            */
/* -------------------------------------------- */

async function regenerate(combat) {
  const state = getState();
  const combatant = combat.combatant;
  if (!state.final || !combatant || combatant.actorId !== hyoe()?.id) return;
  const key = `${combat.id}:${combat.round}:${combat.turn}`;
  if (state.regenTurn === key) return;
  await setState({ regenTurn: key });
  const token = combatant.token;
  const demon = hyoe();
  const hp = demon.system.resources.hp;
  if (!token || hp.value <= 0) return;
  if (nearLitFoyer(token, REGEN_RANGE_M)) return post("<p>Hyōe est trop près d'un foyer allumé : sa chair de givre ne se reforme pas.</p>", { gmOnly: true });
  const next = Math.min(hp.max, hp.value + REGEN);
  if (next === hp.value) return;
  await demon.update({ "system.resources.hp.value": next });
  await post(`<p><strong>Chair de givre :</strong> loin de tout feu, Hyōe se reforme (+${next - hp.value} PV).</p>`);
}

async function hyoeThresholds(actor) {
  const hp = actor.system.resources.hp.value;
  const state = getState();
  const once = async (key, html, gmOnly = true) => {
    if (state.alerts[key]) return;
    await setState({ alerts: { [key]: true } });
    await post(html, { gmOnly });
  };
  if (hp <= 0) {
    await once("dead", "<p>La tête de Hyōe roule sur les tatamis et commence à s'effriter comme de la neige au soleil. Ses yeux cherchent la porte principale. « Ouvre… » <strong>Toutes les silhouettes de neige s'effondrent.</strong></p>", false);
    return meltAll(false);
  }
  if (hp <= 25) await once("flee", "<p><strong>Hyōe (≤ 25 PV) tente de fuir</strong> vers la glacière par la porte de service. Il lâche le civil qu'il porte. Les PJ voient son intention.</p>");
  else if (hp <= 60) await once("sixty", `<p><strong>Hyōe (≤ 60 PV) :</strong> son visage se fend. Il parle avec la voix de Kōta, puis d'Ichirō, puis la sienne, rocailleuse. ${getState().prep.fuyuko ? "C'est le moment de faire parler Fuyuko (tableau de bord)." : "Fuyuko n'a pas été préparée : elle se fige."}</p>`);
}

/* -------------------------------------------- */
/*  Documents and handouts                      */
/* -------------------------------------------- */

const journal = key => game.journal.find(j => j.getFlag(MID, "key") === key);

export async function openImporter() {
  const pack = game.packs.get(`${MID}.aventure`);
  const [adventure] = (await pack?.getDocuments()) ?? [];
  if (!adventure) return ui.notifications.error("Compendium de l'aventure introuvable.");
  return adventure.sheet.render({ force: true });
}

export function openGuide() {
  const guide = journal("guide");
  if (!guide) return openImporter();
  return guide.sheet.render({ force: true });
}

export async function showHandout(key) {
  const entry = journal("handouts");
  if (!entry) return ui.notifications.warn("Importez d'abord l'aventure.");
  const pages = entry.pages.contents.sort((a, b) => a.sort - b.sort);
  if (!key) {
    key = await DialogV2.prompt({
      window: { title: "Montrer une pièce aux joueurs" },
      content: `<select name="page" autofocus>${pages.map(p => `<option value="${p.getFlag(MID, "key")}">${p.name}</option>`).join("")}</select>
        ${pages.map(p => `<p class="hint"><strong>${p.name}</strong> : ${p.getFlag(MID, "gmNote") ?? ""}</p>`).join("")}`,
      ok: { label: "Montrer", callback: (event, button) => button.form.elements.page.value },
      rejectClose: false,
    });
    if (!key) return;
  }
  const page = pages.find(p => p.getFlag(MID, "key") === key);
  if (!page) return;
  const popout = new foundry.applications.apps.ImagePopout({ src: page.src, caption: page.image?.caption, window: { title: page.name } });
  await popout.render({ force: true });
  return popout.shareImage();
}

export async function announce() {
  const state = getState();
  const lit = foyers().filter(l => !l.hidden).map(l => FOYER_NAMES[l.getFlag(MID, "foyer")]);
  await post(`<p><strong>Aube ${state.dawn}/${DAWN_MAX}</strong> — ${DAWN[state.dawn]}</p><p>Foyers allumés : ${lit.length ? lit.join(", ") : "aucun"}. Enneigés présents : ${snowTokens().length}.</p>`);
}

export async function reset() {
  const ok = await DialogV2.confirm({ window: { title: "Réinitialiser le scénario" },
    content: "<p>Remettre l'aube à 0, rallumer les foyers, refermer les ouvertures, retirer les Enneigés, remettre le masque de Kōta et rendre leurs PV à Hyōe et aux civils ?</p>" });
  if (!ok) return;
  await game.settings.set(MID, "state", defaultState());
  await meltAll(false);
  const scene = inn();
  if (scene) {
    await scene.updateEmbeddedDocuments("AmbientLight", foyers().map(l => ({ _id: l.id, hidden: false })));
    await scene.updateEmbeddedDocuments("Wall", scene.walls.filter(w => w.getFlag(MID, "door")).map(w => ({ _id: w.id, ds: w.getFlag(MID, "initial") ?? 0 })));
    await scene.update({ "environment.darknessLevel": NIGHT });
  }
  const demon = hyoe();
  if (demon) await demon.update({ "system.resources.hp.value": demon.system.resources.hp.max, "system.resources.bdp.value": 60, "system.resources.rp.value": 6 });
  for (const key of CIVILIANS) {
    const actor = byKey(key);
    if (actor) await actor.update({ "system.resources.hp.value": actor.system.resources.hp.max });
  }
  if (hyoeToken()) await unmask(false);
  ui.notifications.info("Ce que la neige efface : état réinitialisé.");
}

/* -------------------------------------------- */
/*  Dashboard                                   */
/* -------------------------------------------- */

class NeigeDashboard extends ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "neige-dashboard",
    classes: ["neige-dashboard"],
    window: { title: "Ce que la neige efface — tableau de bord", icon: "fas fa-snowflake", resizable: true },
    position: { width: 600, height: "auto" },
    actions: {
      finale: () => startFinale(),
      endRound: () => endRound(),
      dawn: (event, target) => setDawn(Number(target.dataset.value)),
      foyer: (event, target) => setFoyer(target.dataset.key),
      summon: () => summonSnow(),
      meltAll: () => meltAll(),
      civilian: (event, target) => setCivilian(target.dataset.key, target.dataset.status),
      unmask: (event, target) => unmask(target.dataset.reveal === "1"),
      heal: () => ryoanHeal(),
      fuyuko: () => fuyukoSpeaks(),
      announce: () => announce(),
      handout: () => showHandout(),
      guide: () => openGuide(),
      reset: () => reset(),
    },
  };

  async _renderHTML() {
    const state = getState();
    const demon = hyoe();
    const checks = (group, defs) => Object.entries(defs).map(([key, [label, hint]]) =>
      `<label title="${hint}"><input type="checkbox" data-group="${group}" data-key="${key}" ${state[group][key] ? "checked" : ""}> ${label}</label>`).join("");
    const dawn = Array.from({ length: DAWN_MAX + 1 }, (_, v) => `<button type="button" data-action="dawn" data-value="${v}" class="${v <= state.dawn ? "on" : ""}${v >= 6 ? " late" : ""}" title="${DAWN[v]}">${v}</button>`).join("");
    const hearths = foyers().map(l => { const key = l.getFlag(MID, "foyer"); const lit = !l.hidden;
      return `<button type="button" class="neige-card ${lit ? "lit" : "out"}" data-action="foyer" data-key="${key}"><strong>${FOYER_NAMES[key]}</strong><span>${lit ? "Allumé" : "Éteint"}</span></button>`; }).join("");
    const civilians = CIVILIANS.map(key => {
      const actor = byKey(key);
      if (!actor) return "";
      const hp = actor.system.resources.hp;
      const status = hp.value <= 0 ? "mort" : state.civilians[key];
      const buttons = ["abri", "agrippe", "dehors"].filter(s => s !== status && status !== "mort" && !(key === "hina" && s !== "abri"))
        .map(s => `<button type="button" data-action="civilian" data-key="${key}" data-status="${s}">${STATUS[s]}</button>`).join("");
      return `<tr class="${status}"><td>${actor.name}</td><td>${hp.value}/${hp.max} PV</td><td>${STATUS[status]}</td><td>${buttons}</td></tr>`;
    }).join("");
    const html = `
      <header class="neige-dash-status">
        <span class="badge ${state.final ? "on" : ""}">${state.final ? "Final en cours" : "Enquête"}</span>
        <span class="badge ${state.masked ? "danger" : "ok"}">${state.masked ? "Kōta masqué" : "Hyōe démasqué"}</span>
        ${state.final ? "" : `<button type="button" data-action="finale"><i class="fas fa-play"></i> Démarrer le final</button>`}
      </header>
      <section><h3>Enquête</h3>
        <div class="neige-checks">${checks("clues", CLUES)}</div>
        <h4>Préparatifs (scène 4)</h4>
        <div class="neige-checks">${checks("prep", PREPS)}</div>
      </section>
      <section><h3>Aube</h3>
        <div class="neige-dawn">${dawn}<button type="button" data-action="endRound" title="Automatique en combat une fois le final démarré."><i class="fas fa-forward-step"></i> Fin de round</button></div>
        <p class="hint">${DAWN[state.dawn]}</p>
      </section>
      <section><h3>Foyers</h3><div class="neige-grid">${hearths || "<p class='hint'>Scène de l'auberge non importée.</p>"}</div>
        <div class="neige-row"><strong>Enneigés : ${snowTokens().length}/${SNOW_MAX}</strong>
          <button type="button" data-action="summon" ${state.final && state.dawn >= 6 ? "disabled" : ""}><i class="fas fa-snowflake"></i> Appel de la neige (4 BDP)</button>
          <button type="button" data-action="meltAll"><i class="fas fa-fire"></i> Tout faire fondre</button></div>
      </section>
      <section><h3>Civils</h3><table class="neige-civilians"><tbody>${civilians}</tbody></table>
        <div class="neige-row">
          <button type="button" data-action="heal" ${state.prep.ryoan ? "" : "title='Préparatif non obtenu : à votre appréciation'"}><i class="fas fa-kit-medical"></i> Soin du Dr Ryōan (cible)</button>
          ${state.prep.fuyuko ? `<button type="button" data-action="fuyuko" ${state.fuyukoSpoke ? "disabled" : ""}><i class="fas fa-comment"></i> Fuyuko parle à Hyōe</button>` : ""}
        </div>
      </section>
      <section><h3>Hyōe</h3>
        ${demon ? `<div class="neige-row"><span>${demon.system.resources.hp.value}/${demon.system.resources.hp.max} PV · ${demon.system.resources.bdp.value} BDP · ${demon.system.resources.rp.value} RP</span>
          ${state.masked ? `<button type="button" data-action="unmask" data-reveal="1"><i class="fas fa-mask"></i> Démasquer Kōta</button>` : `<button type="button" data-action="unmask" data-reveal="0" title="Remettre le visage de Kōta">↺ Masque</button>`}</div>
          <p class="hint">Chair de givre : +${REGEN} PV au début de son tour s'il n'est à moins de ${REGEN_RANGE_M} m d'aucun foyer allumé (automatique).</p>` : "<p class='hint'>Hyōe n'est pas importé.</p>"}
      </section>
      <footer class="neige-row">
        <button type="button" data-action="announce"><i class="fas fa-bullhorn"></i> Annoncer</button>
        <button type="button" data-action="handout"><i class="fas fa-scroll"></i> Pièce à montrer</button>
        <button type="button" data-action="guide"><i class="fas fa-book"></i> Guide</button>
        <button type="button" data-action="reset"><i class="fas fa-rotate-left"></i> Réinitialiser</button>
      </footer>`;
    const div = document.createElement("div");
    div.className = "neige-dash";
    div.innerHTML = html;
    return div;
  }

  _replaceHTML(result, content) {
    content.replaceChildren(result);
  }

  _onRender(context, options) {
    super._onRender?.(context, options);
    for (const input of this.element.querySelectorAll("input[data-group]")) {
      input.addEventListener("change", () => setState({ [input.dataset.group]: { [input.dataset.key]: input.checked } }));
    }
  }
}

let dashboardApp;
export function dashboard() {
  if (!game.user.isGM) return ui.notifications.warn("Le tableau de bord est réservé au MJ.");
  dashboardApp ??= new NeigeDashboard();
  return dashboardApp.render({ force: true });
}
const refresh = foundry.utils.debounce(() => { if (dashboardApp?.rendered) dashboardApp.render(); }, 100);

class DashboardMenu extends ApplicationV2 {
  async render() { dashboard(); return this; }
}

/* -------------------------------------------- */
/*  Hooks                                       */
/* -------------------------------------------- */

const ACTIONS = { dashboard, finale: startFinale, unmask: () => unmask(true), summon: () => summonSnow(), heal: () => ryoanHeal(),
  guide: openGuide, import: openImporter, handout: () => showHandout() };

Hooks.once("init", () => {
  game.settings.register(MID, "state", { scope: "world", config: false, type: Object, default: defaultState(), onChange: () => refresh() });
  game.settings.register(MID, "welcomeVersion", { scope: "world", config: false, type: String, default: "" });
  game.settings.registerMenu(MID, "dashboard", { name: "Tableau de bord du scénario", label: "Ouvrir", hint: "Indices, préparatifs, aube, foyers, Enneigés, civils et Hyōe.",
    icon: "fas fa-snowflake", type: DashboardMenu, restricted: true });

  // @Neige[action]{label} in journals becomes a GM action link.
  CONFIG.TextEditor.enrichers.push({
    pattern: /@Neige\[(\w+)\]\{([^}]+)\}/g,
    enricher: match => {
      const link = document.createElement("a");
      link.className = "neige-action";
      link.dataset.neigeAction = match[1];
      link.innerHTML = `<i class="fas fa-snowflake"></i> ${foundry.utils.escapeHTML(match[2])}`;
      return link;
    },
  });
  document.addEventListener("click", event => {
    const link = event.target.closest?.("a.neige-action");
    if (!link) return;
    event.preventDefault();
    if (!game.user.isGM) return ui.notifications.warn("Action réservée au MJ.");
    ACTIONS[link.dataset.neigeAction]?.();
  });
});

Hooks.once("ready", async () => {
  game.modules.get(MID).api = { dashboard, getState, unmask, startFinale, setDawn, endRound, setFoyer, toggleNearestFoyer, summonSnow, meltAll,
    setCivilian, ryoanHeal, fuyukoSpeaks, announce, reset, showHandout, openGuide, openImporter };
  if (!isActiveGM()) return;
  const version = game.modules.get(MID).version;
  if (game.settings.get(MID, "welcomeVersion") === version) return;
  await game.settings.set(MID, "welcomeVersion", version);
  if (inn()) return ui.notifications.info(`Ce que la neige efface ${version} est prêt. Macro « Neige · Tableau de bord » pour suivre la nuit.`);
  const go = await DialogV2.confirm({
    window: { title: "Ce que la neige efface" },
    content: `<p>Importer l'aventure maintenant ? Tout sera rangé dans un dossier « Ce que la neige efface » (acteurs, objets, journaux, scènes, macros).</p>`,
    yes: { label: "Importer" }, no: { label: "Plus tard" }, rejectClose: false,
  });
  if (go) openImporter();
});

Hooks.on("updateCombat", async (combat, changed, options) => {
  if (!isActiveGM() || combat.scene?.id !== inn()?.id) return;
  if ("round" in changed && changed.round >= 2 && options.direction !== -1) {
    const state = getState();
    const key = `${combat.id}:${changed.round}`;
    if (state.final && state.processedRound !== key) {
      await setState({ processedRound: key });
      await endRound();
    }
  }
  if (("turn" in changed || "round" in changed) && options.direction !== -1) await regenerate(combat);
});

Hooks.on("updateActor", async (actor, changed) => {
  refresh();
  if (!isActiveGM() || !foundry.utils.hasProperty(changed, "system.resources.hp.value")) return;
  const key = actor.getFlag(MID, "key");
  if (key === "enneige" && actor.isToken && actor.system.resources.hp.value <= 0) return melt(actor.token);
  if (key === "hyoe") return hyoeThresholds(actor);
});

for (const hook of ["updateToken", "createToken", "deleteToken", "updateAmbientLight", "updateWall"]) Hooks.on(hook, () => refresh());
