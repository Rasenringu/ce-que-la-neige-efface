// End-to-end check on a disposable Foundry v14 world (neige-qa) with Breathe and Live 0.6.
// Start the server first:  node C:/FoundryVTT-Node-14/main.mjs --dataPath=<repo>/.qa --port=30018 --world=neige-qa
import fs from "node:fs";
import { chromium } from "playwright";

const URL = process.env.FOUNDRY_QA_URL || "http://localhost:30018";
const MID = "ce-que-la-neige-efface";
const ROOT = "Ce que la neige efface";
fs.mkdirSync("test-results", { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.QA_CHANNEL ?? (process.platform === "win32" ? "msedge" : undefined), args: process.env.QA_SWIFTSHADER ? ["--enable-unsafe-swiftshader"] : ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on("pageerror", e => errors.push(e.message));
if (process.env.QA_TRACE) page.on("console", m => { if (m.text().startsWith("QA ")) console.log(m.text()); });
page.on("console", m => { if (m.type() === "error" && !/favicon|Failed to load resource|hardware acceleration|WebGL/.test(m.text())) errors.push(m.text()); });

async function join() {
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => globalThis.game?.ready || document.querySelector("input[name=username], select[name=userid]"), null, { timeout: 120000 });
  if (await page.locator("input[name=username]").count()) await page.locator("input[name=username]").fill("Gamemaster");
  else if (await page.locator("select[name=userid]").count()) await page.locator("select[name=userid]").selectOption({ label: "Gamemaster" });
  if (await page.locator("button[name=join]").count()) await page.locator("button[name=join]").click();
  await page.waitForFunction(() => game.ready && !canvas.loading, null, { timeout: 180000 });
}

try {
  await join();
  if (await page.evaluate(() => game.world.id) !== "neige-qa") throw new Error("Monde QA « neige-qa » requis");
  if (!await page.evaluate(m => game.modules.get(m)?.active, MID)) {
    await page.evaluate(async m => game.settings.set("core", "moduleConfiguration", { ...game.settings.get("core", "moduleConfiguration"), [m]: true }), MID);
    await page.waitForTimeout(3000);
    await join();
  }
  const report = await page.evaluate(async ({ MID, ROOT }) => {
    const checks = [];
    const check = (label, ok, detail = "") => { if (!ok) throw new Error(`ÉCHEC : ${label} ${detail}`); checks.push(label); console.log("QA " + label); };
    const info = { version: game.version, system: game.system.version, module: game.modules.get(MID).version };
    check("Foundry 14", game.version.startsWith("14"));
    check("Breathe and Live 0.6", game.system.version.startsWith("0.6"));

    // Clean previous imports so the run is repeatable.
    for (const coll of [game.combats, game.scenes, game.actors, game.items, game.journal, game.macros]) {
      const ids = coll.filter(d => d.getFlag?.(MID, "key") || d.combatants).map(d => d.id);
      if (ids.length) await coll.documentClass.deleteDocuments(ids);
    }
    const folderIds = game.folders.filter(f => f.name === ROOT || f.folder?.name === ROOT).map(f => f.id);
    if (folderIds.length) await Folder.deleteDocuments(folderIds);
    await game.settings.set(MID, "state", {});

    const pack = game.packs.get(`${MID}.aventure`);
    check("Compendium Adventure présent", pack?.documentName === "Adventure");
    const [adventure] = await pack.getDocuments();
    check("Adventure valide", adventure && !adventure.invalid);
    await adventure.import({ dialog: false });
    await new Promise(r => setTimeout(r, 1500));

    for (const type of ["Actor", "Item", "JournalEntry", "Scene", "Macro"]) {
      const root = game.folders.find(f => f.type === type && f.name === ROOT && !f.folder);
      check(`Dossier racine ${type}`, !!root);
      const docs = game.collections.get(type).filter(d => d.getFlag(MID, "key"));
      const inside = d => { let f = d.folder; while (f) { if (f.id === root.id) return true; f = f.folder; } return false; };
      check(`Tous les ${type} dans le dossier (${docs.length})`, docs.length > 0 && docs.every(inside), docs.filter(d => !inside(d)).map(d => d.name).join(", "));
    }
    const invalid = [...game.actors, ...game.items, ...game.journal, ...game.scenes, ...game.macros].filter(d => d.invalid);
    check("Aucun document invalide", invalid.length === 0, invalid.map(d => d.name).join(", "));

    // Pregens: system-derived resources (CA = 10 + Vitesse, E = 20 + Courage, RP = 5 + Vitesse + Intellect).
    const expected = { akane: [24, 8, 12], tetsuya: [23, 9, 14], shion: [21, 12, 15], masaomi: [22, 10, 10], haru: [22, 6, 11] };
    const actor = key => game.actors.find(a => a.getFlag(MID, "key") === key);
    const sheets = {};
    for (const [key, [e, rp, ca]] of Object.entries(expected)) {
      const a = actor(key), r = a.system.resources;
      sheets[key] = { hp: r.hp.max, e: r.e.max, rp: r.rp.max, ca: r.ca };
      check(`${a.name} : PV 20, E ${e}, RP ${rp}, CA ${ca}`, r.hp.max === 20 && r.e.max === e && r.rp.max === rp && r.ca === ca, JSON.stringify(sheets[key]));
      check(`${a.name} : souffle et trois formes`, a.items.filter(i => i.type === "technique").length === 3 && a.items.some(i => i.type === "breath"));
    }
    const kozo = actor("kozo"), hyoe = actor("hyoe"), snow = actor("enneige");
    check("Kozō : PV 20, CA 14, RP 4, 1 action", kozo.system.resources.hp.max === 20 && kozo.system.resources.ca === 14 && kozo.system.resources.rp.max === 4 && kozo.system.combat.actionEconomy.actionsPerTurn === 1,
      JSON.stringify([kozo.system.resources.hp.max, kozo.system.resources.ca, kozo.system.resources.rp.max]));
    check("Hyōe : PV 120, CA 15, 60 BDP, 6 RP, 2 actions", hyoe.system.resources.hp.max === 120 && hyoe.system.resources.ca === 15 && hyoe.system.resources.bdp.value === 60 && hyoe.system.resources.rp.value === 6 && hyoe.system.combat.actionEconomy.actionsPerTurn === 2,
      JSON.stringify([hyoe.system.resources.hp.max, hyoe.system.resources.ca, hyoe.system.resources.bdp.value, hyoe.system.resources.rp.value, hyoe.system.combat.actionEconomy.actionsPerTurn]));
    check("Enneigé : PV 6, CA 10, 1 action", snow.system.resources.hp.max === 6 && snow.system.resources.ca === 10 && snow.system.combat.actionEconomy.actionsPerTurn === 1,
      JSON.stringify([snow.system.resources.hp.max, snow.system.resources.ca]));
    for (const key of ["fuyuko", "yaeko", "ryoan", "onoda", "tae"]) check(`${actor(key).name} : PV 8`, actor(key).system.resources.hp.max === 8);

    // Scenes.
    const pass = game.scenes.find(s => s.getFlag(MID, "key") === "col");
    const inn = game.scenes.find(s => s.getFlag(MID, "key") === "auberge");
    for (const scene of [pass, inn]) {
      check(`${scene.name} : fond de carte`, !!scene.levels.contents[0]?.background.src?.endsWith(".webp"));
      check(`${scene.name} : sans marge, grille 1,5 m`, scene.padding === 0 && scene.grid.distance === 1.5 && scene.grid.size === 100);
      check(`${scene.name} : tokens liés`, scene.tokens.every(t => t.actor), scene.tokens.filter(t => !t.actor).map(t => t.name).join());
      check(`${scene.name} : pastilles liées`, scene.notes.size > 0 && scene.notes.every(n => n.entry && n.page));
    }
    check("Auberge : 4 foyers", inn.lights.filter(l => l.getFlag(MID, "foyer")).length === 4);
    check("Auberge : 5 ouvertures", inn.walls.filter(w => w.getFlag(MID, "breach")).length === 5);
    const masked = inn.tokens.find(t => t.actorId === hyoe.id);
    check("Hyōe porte le visage de Kōta", masked.name === "Kōta" && masked.texture.src.endsWith("tokens/kota.webp") && masked.disposition === 0);

    const paths = new Set([...game.scenes.map(s => s.levels.contents[0]?.background.src), ...game.scenes.map(s => s.thumb), ...game.actors.map(a => a.img), ...game.actors.map(a => a.prototypeToken.texture.src), ...game.items.map(i => i.img),
      ...game.journal.contents.flatMap(j => j.pages.contents.map(p => p.src).filter(Boolean)), ...game.scenes.contents.flatMap(s => s.notes.map(n => n.texture.src)), ...game.actors.contents.flatMap(a => a.items.contents.map(i => i.img))].filter(p => /^(modules|systems|icons)\//.test(p ?? "")));
    const missing = [];
    for (const p of paths) if (!(await fetch(p, { method: "HEAD" })).ok) missing.push(p);
    check(`Images présentes (${paths.size})`, missing.length === 0, missing.join(", "));
    const html = game.journal.map(j => j.pages.map(p => p.text?.content ?? "").join("")).join("");
    for (const src of new Set([...html.matchAll(/src="(modules\/[^"]+)"/g)].map(m => m[1]))) check(`Image de journal ${src.split("/").pop()}`, (await fetch(src, { method: "HEAD" })).ok);
    const guide = game.journal.find(j => j.getFlag(MID, "key") === "guide");
    let broken = 0, actions = 0;
    for (const p of guide.pages) {
      const enriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(p.text.content);
      broken += (enriched.match(/content-link broken/g) ?? []).length;
      actions += (enriched.match(/neige-action/g) ?? []).length;
    }
    check("Liens @UUID du guide résolus", broken === 0, broken);
    check("Liens @Neige enrichis", actions > 5, actions);

    await inn.activate();
    await inn.view();
    await new Promise(r => setTimeout(r, 2500));
    return { info, checks, sheets };
  }, { MID, ROOT });

  const play = await page.evaluate(async MID => {
    const checks = [];
    const check = (label, ok, detail = "") => { if (!ok) throw new Error(`ÉCHEC : ${label} ${detail}`); checks.push(label); console.log("QA " + label); };
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const api = game.modules.get(MID).api;
    const notes = [];
    for (const k of ["warn", "error"]) { const original = ui.notifications[k].bind(ui.notifications); ui.notifications[k] = (m, ...a) => { notes.push(m); return original(m, ...a); }; }
    const actor = key => game.actors.find(a => a.getFlag(MID, "key") === key);
    const scene = canvas.scene;
    const tok = key => scene.tokens.find(t => t.actorLink && t.actor?.getFlag(MID, "key") === key);
    // v14 constrains token updates by walls: teleport the test tokens through them.
    const place = async (token, x, y) => { await token.update({ x, y }, { animate: false, movement: { [token.id]: { constrainOptions: { ignoreWalls: true, ignoreCost: true } } } }); await wait(300); };
    const snowCount = () => scene.tokens.filter(t => t.actor?.getFlag(MID, "key") === "enneige" && !t.getFlag(MID, "himuro")).length;

    // The system's V1 prompts (e.g. the Flame passive « Coeur flamboyant ») crash headless rendering: answer "no".
    foundry.appv1.api.Dialog.prototype.render = function () {
      const buttons = this.data.buttons ?? {};
      const key = "no" in buttons ? "no" : this.data.default ?? Object.keys(buttons)[0];
      console.log(`QA dialogue « ${this.data.title} » : ${key}`);
      buttons[key]?.callback?.(document.createElement("div"));
      return this;
    };
    // Software rendering in headless Edge cannot afford token vision recomputation on every test move.
    await scene.update({ tokenVision: false });
    check("Fond de carte chargé sur le canvas", canvas.primary.background?.texture?.valid && canvas.primary.background.texture.width >= 4000, canvas.primary.background?.texture?.width);

    // System rolls: Akane's katana and a Flame form against Hyōe.
    const akane = actor("akane"), hyoe = actor("hyoe");
    await place(tok("akane"), 1100, 1200); await place(tok("hyoe"), 1200, 1200); await wait(1200);
    const combat = await Combat.create({ scene: scene.id, active: true });
    await combat.createEmbeddedDocuments("Combatant", ["akane", "hyoe"].map((k, i) => ({ tokenId: tok(k).id, sceneId: scene.id, actorId: actor(k).id, initiative: 30 - i * 10 })));
    await combat.startCombat();
    const ready = async a => { for (let i = 0; i < 40 && !(a.system.combat.actionEconomy.remainingActions > 0); i++) await wait(100); };
    await ready(akane);
    const slash = await game.system.api.rollBasicAttack(akane, { item: akane.items.find(i => i.name.includes("Katana")), targetToken: tok("hyoe").object, attackMode: "force", targetLimb: "" });
    check("Katana d'Akane : jet d'attaque système", !!slash?.attackRoll, notes.join(" ; "));
    await combat.nextTurn(); await ready(hyoe);
    const claws = hyoe.items.find(i => i.name.startsWith("Griffes de givre"));
    const hit = await game.system.api.rollBasicAttack(hyoe, { item: claws, targetToken: tok("akane").object, attackMode: "force", targetLimb: "", forceAutoHit: true, free: true });
    check("Griffes de Hyōe : d20 + 7 et 1d6 + 3", /\+ ?7\b/.test(hit?.attackRoll?.formula ?? "") || /1d6 ?\+ ?3/.test(hit?.damageRoll?.formula ?? ""), `${hit?.attackRoll?.formula} | ${hit?.damageRoll?.formula}`);
    await combat.nextRound(); await ready(akane);
    const form = akane.items.find(i => i.name === "Feu Inconscient");
    const e0 = akane.system.resources.e.value;
    tok("hyoe").object.setTarget(true, { releaseOthers: true });
    await game.system.api.useTechnique(akane, form, { controlledToken: tok("akane").object });
    check("Forme de la Flamme : coût en E payé", akane.system.resources.e.value === e0 - 2, `${e0} -> ${akane.system.resources.e.value}`);
    await combat.delete();
    await akane.update({ "system.resources.e.value": akane.system.resources.e.max });
    await hyoe.update({ "system.resources.hp.value": 120 });
    await wait(300);

    // Finale automation.
    await api.startFinale();
    await wait(400);
    check("Démarrer le final démasque Kōta", tok("hyoe").name === "Hyōe" && tok("hyoe").texture.src.endsWith("tokens/hyoe.webp") && tok("hyoe").disposition === -1, JSON.stringify([tok("hyoe").name, tok("hyoe").texture.src, tok("hyoe").disposition, api.getState().masked, notes]));
    // Park Hyōe far from every hearth (the ice house) so his regeneration triggers.
    await place(tok("hyoe"), 3150, 350);
    await hyoe.update({ "system.resources.hp.value": 100 });
    const final = await Combat.create({ scene: scene.id, active: true });
    await final.createEmbeddedDocuments("Combatant", [{ tokenId: tok("akane").id, sceneId: scene.id, actorId: akane.id, initiative: 20 }, { tokenId: tok("hyoe").id, sceneId: scene.id, actorId: hyoe.id, initiative: 10 }]);
    await final.startCombat();
    await final.nextTurn(); await wait(700);
    check("Chair de givre : +5 PV loin du feu", hyoe.system.resources.hp.value === 105, hyoe.system.resources.hp.value);
    // Next to the irori: no regeneration.
    await place(tok("hyoe"), 1500, 1450);
    await final.nextRound(); await final.nextTurn(); await wait(700);
    check("Près de l'irori : pas de régénération", hyoe.system.resources.hp.value === 105, hyoe.system.resources.hp.value);
    check("Aube avancée en fin de round", api.getState().dawn === 1, api.getState().dawn);

    // Snow figures.
    await final.nextRound(); await wait(400);
    const bdp = hyoe.system.resources.bdp.value;
    await api.summonSnow("voletB");
    await wait(600);
    check("Appel de la neige : 2 Enneigés, −4 BDP", snowCount() === 2 && hyoe.system.resources.bdp.value === bdp - 4, `${snowCount()} ${bdp} -> ${hyoe.system.resources.bdp.value}`);
    check("Appel de la neige : volet ouvert", scene.walls.find(w => w.getFlag(MID, "door") === "voletB").ds === CONST.WALL_DOOR_STATES.OPEN);
    check("Enneigés ajoutés au combat", final.combatants.filter(c => c.actor?.getFlag(MID, "key") === "enneige").length === 2);
    await api.summonSnow("porte");
    check("Une seule fois par round", snowCount() === 2 && notes.some(n => /déjà utilisé/.test(n)));
    const [first] = scene.tokens.filter(t => t.actor?.getFlag(MID, "key") === "enneige" && !t.getFlag(MID, "himuro"));
    await first.actor.update({ "system.resources.hp.value": 0 });
    await wait(800);
    check("Enneigé à 0 PV : il fond", snowCount() === 1, snowCount());
    // The remaining figure stands next to the irori (volet de la salle is 4 squares away): it melts by 3 at round end.
    const second = scene.tokens.find(t => t.actor?.getFlag(MID, "key") === "enneige" && !t.getFlag(MID, "himuro"));
    await place(second, 1500, 1650);
    await final.nextRound(); await wait(900);
    check("Enneigé près d'un foyer : −3 PV en fin de round", second.actor?.system.resources.hp.value === 3, second.actor?.system.resources.hp.value);

    // Hearths.
    await api.setFoyer("irori", false); await wait(300);
    check("Foyer éteint : lumière masquée", scene.lights.find(l => l.getFlag(MID, "foyer") === "irori").hidden === true);
    await api.setFoyer("irori", true); await wait(300);
    check("Foyer rallumé", scene.lights.find(l => l.getFlag(MID, "foyer") === "irori").hidden === false);

    // Civilians thrown outside freeze.
    await api.setCivilian("fuyuko", "dehors");
    await final.nextRound(); await wait(900);
    check("Fuyuko dehors : −2 PV en fin de round", actor("fuyuko").system.resources.hp.value === 6, actor("fuyuko").system.resources.hp.value);
    await api.setCivilian("fuyuko", "abri");

    // Ryōan's heal on Akane.
    await akane.update({ "system.resources.hp.value": 10 });
    await api.ryoanHeal([tok("akane").object]);
    check("Soin du Dr Ryōan : 1d6 + 2", akane.system.resources.hp.value >= 13 && akane.system.resources.hp.value <= 18, akane.system.resources.hp.value);

    // Thresholds and death.
    await hyoe.update({ "system.resources.hp.value": 55 }); await wait(500);
    check("Alerte à 60 PV", api.getState().alerts.sixty === true);
    await hyoe.update({ "system.resources.hp.value": 0 }); await wait(900);
    check("Mort de Hyōe : tous les Enneigés fondent", snowCount() === 0 && api.getState().alerts.dead === true, snowCount());

    // Dawn.
    await api.setDawn(7);
    await api.endRound(); await wait(500);
    check("Aube 8 : la scène s'éclaire", api.getState().dawn === 8 && scene.environment.darknessLevel <= 0.15, scene.environment.darknessLevel);
    await final.delete();

    await api.dashboard();
    await wait(800);
    check("Tableau de bord affiché", !!document.querySelector("#neige-dashboard .neige-civilians"));
    return { checks };
  }, MID);

  await page.screenshot({ path: "test-results/01-dashboard.png" });
  // Reset puts the inn back as the GM found it.
  const reset = await page.evaluate(async MID => {
    const { DialogV2 } = foundry.applications.api;
    const confirm = DialogV2.confirm;
    DialogV2.confirm = async () => true;
    await game.modules.get(MID).api.reset();
    DialogV2.confirm = confirm;
    const scene = game.scenes.find(s => s.getFlag(MID, "key") === "auberge");
    const hyoe = game.actors.find(a => a.getFlag(MID, "key") === "hyoe");
    const token = scene.tokens.find(t => t.actorId === hyoe.id);
    return token.name === "Kōta" && hyoe.system.resources.hp.value === 120 && scene.walls.find(w => w.getFlag(MID, "door") === "voletB").ds === 2;
  }, MID);
  if (!reset) throw new Error("ÉCHEC : réinitialisation");
  await page.evaluate(MID => { foundry.applications.instances.get("neige-dashboard")?.close(); game.journal.find(j => j.getFlag(MID, "key") === "guide").sheet.render({ force: true }); }, MID);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "test-results/02-guide.png" });
  const closeAll = () => { for (const app of [...foundry.applications.instances.values(), ...Object.values(ui.windows)]) if (app.document || app.id === "neige-dashboard") app.close(); };
  await page.evaluate(`(${closeAll})(); game.actors.find(a => a.getFlag("${MID}", "key") === "haru").sheet.render({ force: true });`);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "test-results/03-haru.png" });
  await page.evaluate(`(${closeAll})(); game.actors.find(a => a.getFlag("${MID}", "key") === "hyoe").sheet.render({ force: true });`);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "test-results/04-hyoe.png" });
  await page.evaluate(`(${closeAll})(); canvas.animatePan({ x: 2000, y: 1400, scale: 0.38, duration: 0 });`);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "test-results/05-auberge.png" });

  const result = { ...report, gameplay: play.checks, errors };
  fs.writeFileSync("test-results/qa.json", JSON.stringify(result, null, 2));
  console.log(`OK ${report.checks.length + play.checks.length + 1} vérifications`, JSON.stringify(report.info));
  if (errors.length) console.log("Erreurs navigateur :\n" + errors.join("\n"));
} catch (error) {
  await page.screenshot({ path: "test-results/failure.png" }).catch(() => {});
  console.error(error.message);
  if (errors.length) console.error("Erreurs navigateur :\n" + errors.join("\n"));
  process.exitCode = 1;
} finally {
  await browser.close();
}
