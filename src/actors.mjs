// Pregens, inn residents, the two demons and the snow figures. Talent bonuses
// (+3 Force, Finesse or Intellect in combat…) are NOT baked into the derived
// stats: Breathe and Live 0.6 adds them from the embedded talent items.
// The system derives CA (10 + Vitesse), demon PV (base + 5 × Force), BDP max
// (10 × Courage), demon RP max and demon actions (1 + Vitesse / 5).
import { stableId } from "../tools/lib/system-catalog.mjs";

export const MID = "ce-que-la-neige-efface";
const ART = `modules/${MID}/assets`;
const DERIVED = ["athletisme", "puissanceBrute", "dexterite", "equilibre", "precision", "mithridatisme", "endurance", "tolerance",
  "reflexes", "agilite", "rapidite", "ruse", "tromperie", "performance", "intimidation", "perception", "intuition",
  "medecine", "nature", "sciences", "enquete", "survie"];
const derived = values => Object.fromEntries(DERIVED.map((key, i) => [key, values[i] ?? 0]));
const BREATH_KEYS = ["sun", "moon", "flame", "water", "wind", "thunder", "stone", "flower", "mist", "serpent", "sound", "insect", "love", "beast", "ocean", "west", "snow", "custom"];
// Storm lantern carried by every slayer: the scenes are dark and the finale is about light.
const LANTERN = { bright: 3, dim: 7.5, color: "#ffb766", alpha: 0.4, animation: { type: "torch", speed: 2, intensity: 2 } };

function token(key, name, { linked = false, disposition = -1, sight = 0, bar2 = "resources.e", light = null, bars = 40 } = {}) {
  return {
    name,
    texture: { src: `${ART}/tokens/${key}.webp` },
    actorLink: linked,
    disposition,
    displayName: 30,
    displayBars: bars,
    bar1: { attribute: "resources.hp" },
    bar2: { attribute: bar2 },
    sight: { enabled: sight > 0, range: sight },
    ...(light ? { light } : {}),
    lockRotation: true,
  };
}

const PREGENS = [
  {
    key: "akane", id: "nei01slayer00001", name: "Akane Hōjō", breath: "flame", breathName: "Souffle de la Flamme",
    age: "23 ans", sex: "Femme", role: "Rempart : tenir une pièce, protéger les civils",
    base: { force: 5, finesse: 3, courage: 4, vitesse: 2, social: 0, intellect: 1 },
    derived: [2, 3, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    talents: ["Agilité et souplesse accrues", "Force physique accrue", "Connaissances médicales", "Esprit"], senses: ["Sens auditif — niveau 1"],
    forms: ["Feu Inconscient", "Soleil Levant Brûlant", "Ondulation de la Flamme en Fleurs"],
    trainer: "Tōjirō, pourfendeur de la Flamme retiré à Seki ; une tresse rouge nouée à la garde.",
    crow: "Hibana", crowNote: "Hibana gonfle ses plumes près du feu et refuse de voler par grand froid. Il vous adore.",
    kit: "Briquet à silex, amadou et deux torches de résine",
  },
  {
    key: "tetsuya", id: "nei02slayer00001", name: "Tetsuya Mibu", breath: "water", breathName: "Souffle de l'Eau",
    age: "21 ans", sex: "Homme", role: "Meneur calme : coordonner, dévier les tirs",
    base: { force: 2, finesse: 5, courage: 3, vitesse: 4, social: 1, intellect: 0 },
    derived: [2, 0, 2, 1, 2, 1, 2, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    talents: ["Agilité et souplesse accrues", "Force physique accrue"], senses: ["Sens olfactif — niveau 1", "Sens auditif — niveau 1"],
    forms: ["Surface de l'eau coupée", "Roue à eau", "Éclaboussure d'eau"],
    trainer: "Isshin, ancien pourfendeur devenu pêcheur sur le lac Suwa ; un hameçon d'os pendu au cordon du sabre.",
    crow: "Shio", crowNote: "Shio récite les ordres de mission mot pour mot, deux fois. Il vous adore.",
    kit: "Couteau de cuisine, sachet de sel et boulettes de riz",
  },
  {
    key: "shion", id: "nei03slayer00001", name: "Shion Kirishima", breath: "mist", breathName: "Souffle de la Brume",
    age: "19 ans", sex: "Femme", role: "Éclaireuse : passer partout, voir sans être vue",
    base: { force: 3, finesse: 4, courage: 1, vitesse: 5, social: 0, intellect: 2 },
    derived: [2, 1, 2, 1, 1, 0, 1, 0, 2, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    talents: ["Agilité et souplesse accrues", "Force physique accrue"], senses: ["Vision — niveau 1", "Sens auditif — niveau 1"],
    forms: ["Brume à huit couches", "Barre oblique d'advection", "Explosion de désembuage"],
    trainer: "Kasane, ancienne pourfendeuse de la Brume ; un ruban gris cousu sous le col.",
    crow: "Usugumo", crowNote: "Usugumo ne parle qu'à voix basse et se pose toujours sur l'épaule gauche. Il vous adore.",
    kit: "Corde fine de 9 m et petit grappin",
  },
  {
    key: "masaomi", id: "nei04slayer00001", name: "Masaomi Kuze", breath: "serpent", breathName: "Souffle du Serpent",
    age: "29 ans", sex: "Homme", role: "Enquêteur et soigneur : lire les corps et les mensonges",
    base: { force: 1, finesse: 4, courage: 2, vitesse: 0, social: 3, intellect: 5 },
    derived: [1, 0, 1, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 0, 0, 2, 0],
    talents: ["Agilité et souplesse accrues", "Intelligence supérieure", "Connaissances médicales"], senses: ["Vision — niveau 1"],
    forms: ["Serpent sinueux Slash", "starter à bobine", "Reptile à deux têtes"],
    trainer: "Jūbei, pourfendeur du Serpent ; une écaille laquée au revers du haori.",
    crow: "Bunta", crowNote: "Bunta prend des notes : il répète chaque heure et chaque nom entendus. Il vous adore.",
    kit: "Carnet, loupe et pince d'examen",
  },
  {
    key: "haru", id: "nei05slayer00001", name: "Haru Imai", breath: "snow", breathName: "Souffle de la Neige",
    age: "26 ans", sex: "Homme", role: "Guide et conteur : lire la neige, parler aux gens",
    base: { force: 4, finesse: 3, courage: 2, vitesse: 1, social: 5, intellect: 0 },
    derived: [2, 2, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1],
    talents: ["Agilité et souplesse accrues", "Force physique accrue", "Intelligence supérieure"], senses: ["Sens auditif — niveau 1"],
    forms: ["Tranche Fendante du Flocon", "Pas Léger", "Femme de Neige"],
    trainer: "Toya, pourfendeuse de la Neige à Hokkaidō ; un grelot fêlé à la ceinture.",
    crow: "Fubuki", crowNote: "Fubuki adore la tempête et vole contre le vent pour le plaisir. Il vous adore.",
    kit: "Raquettes à neige et corde de guide",
  },
];

function pregen(p, catalog) {
  const item = (pack, name, overrides) => catalog.item(pack, name, p.key, overrides);
  const items = [
    item("items-weapons", "Katana Nichirin standard"),
    item("items-weapons", "Pistolet standard"),
    item("items-medical-utility", "Bandage", { _id: stableId(p.key + ":bandage1") }),
    item("items-medical-utility", "Bandage", { _id: stableId(p.key + ":bandage2") }),
    item("items-medical-utility", "Pansement compressif"),
    item("items-medical-utility", "Uniforme du Corps", { system: { equipped: true } }),
    item("breaths-styles", p.breathName),
    ...p.forms.map(name => item("techniques-breaths", name)),
    ...p.talents.map(name => item("progression-features", name)),
    ...p.senses.map(name => item("items-medical-utility", name)),
    {
      _id: stableId(p.key + ":kit"), name: "Matériel de mission", type: "gear", img: "icons/containers/bags/pack-leather-white-tan.webp",
      system: {
        description: `<p>Lanterne-tempête, gourde, manteau ouaté, 6 cartouches de rechange, ${p.kit.toLowerCase()}.</p>`,
        usageNote: `Lanterne-tempête (rallume un foyer en 1 action), manteau, 6 cartouches, ${p.kit.toLowerCase()}.`,
        sourceSection: "Ce que la neige efface", activation: "passive", quantity: 1, tags: ["scenario"],
      },
    },
  ];
  const breaths = Object.fromEntries(BREATH_KEYS.map(k => [k, { enabled: k === p.breath }]));
  return {
    _id: p.id, name: p.name, type: "slayer", img: `${ART}/portraits/${p.key}.webp`,
    system: {
      class: { type: "Pourfendeur", rank: "Mizunoto", level: 1, subclass: "Aucune", era: "taisho" },
      stats: { base: p.base, derived: derived(p.derived), remaining: {} },
      resources: { hp: { value: 20, max: 20, healableMax: 20, base: 20, temporary: 0 }, e: { value: 20 + p.base.courage, max: 20 + p.base.courage, temporary: 0 },
        rp: { value: 5 + p.base.vitesse + p.base.intellect, max: 5 + p.base.vitesse + p.base.intellect } },
      creation: {
        statMethod: "array", statArrayApplied: true,
        trainerBackground: "Épéiste ordinaire ; formation talentueuse ; survivant de la Sélection finale du printemps.",
        trainerPoints: { axis1: 0, axis2: 2, axis3: 1 }, kasugaiPoints: { axis1: 2, axis2: 1, axis3: 0 },
        kasugaiType: "Corbeau", startingEquipment: "Dotation du Corps (p. 33) et matériel d'hiver prêté pour la mission.",
        notes: "Prétiré « Ce que la neige efface » : série 0-5, 15 points de talents dépensés, aucun Souffle maîtrisé.",
      },
      profile: {
        characterType: "slayer", combatStyle: "breath", favoredBreath: p.breath, primaryWeapon: "Katana Nichirin standard",
        trainerContext: p.trainer, partnerContext: p.crowNote, kasugaiCrow: p.crow, age: p.age, sex: p.sex,
        role: p.role, yen: 0, bag: `Lanterne-tempête, gourde, manteau, 6 cartouches, ${p.kit.toLowerCase()}.`,
      },
      breaths,
      npc: { role: p.role },
    },
    items,
    prototypeToken: token(p.key, p.name, { linked: true, disposition: 1, sight: 18, light: LANTERN }),
    flags: { [MID]: { key: p.key, pregen: true } },
  };
}

const HUMANS = [
  { key: "fuyuko", id: "nei01human000001", name: "Fuyuko Hamura", age: "50 ans", role: "Okami (patronne) de l'auberge Yukimi-ya",
    threat: "« Tant que je tiens cette maison, personne ne dort dehors. »",
    behavior: "Ferme sur les règles, tendre avec les clients. Porte la culpabilité de la porte close d'il y a vingt ans. Avoue quand on lui montre le registre ou quand on lui parle de l'offrande du jizō. Prête à parler à Hyōe si un PJ l'y prépare.",
    loot: "Registre de l'auberge, lettre de Kōta" },
  { key: "yaeko", id: "nei02human000001", name: "Yaeko", age: "17 ans", role: "Servante de l'auberge",
    threat: "« Le jeune maître ne mange jamais ce que je lui sers. »",
    behavior: "Bavarde quand on l'aide en cuisine, muette devant l'okami. Sait que les plateaux de Kōta reviennent pleins et que Kuma refuse les restes. Peut rallumer un foyer (1 action) pendant le final.",
    loot: "Clé de la porte de service" },
  { key: "ryoan", id: "nei03human000001", name: "Dr Ryōan Shimizu", age: "47 ans", role: "Médecin itinérant",
    threat: "« Je ne transporte que des remèdes. Rien qui vous regarde. »",
    behavior: "Ment sur sa destination : il fuit un usurier de Matsumoto. Sa mallette fermée contient de l'encens de glycine acheté à une maison du Corps. Cède dès qu'on promet de taire ses dettes. Au final : soigne 1d6 + 2 PV à un PJ adjacent, une fois par round.",
    loot: "Encens de glycine (3 bâtonnets), trousse" },
  { key: "onoda", id: "nei04human000001", name: "Sergent Masaru Onoda", age: "41 ans", role: "Sergent de gendarmerie bloqué par la tempête",
    threat: "« Le port du sabre est interdit depuis Meiji 9. Posez-les sur la table. »",
    behavior: "Veut confisquer les sabres (édit Haitōrei). Cède devant une preuve qu'il a lui-même notée : son carnet de garde. Convaincu, il garde une porte et tire une fois par round (d20 + 3, 1d8 + 1).",
    loot: "Carnet de garde, pistolet" },
  { key: "tae", id: "nei05human000001", name: "Tae Kanzaki", age: "32 ans", role: "Épouse du marchand disparu",
    threat: "« Mon mari est allé au bain. Le bain est à vingt pas. »",
    behavior: "Exige qu'on cherche Ichirō, refuse d'attendre l'aube. Se calme si un PJ lui confie une tâche (tenir une lanterne, veiller Hina). Se met en danger si on la laisse seule.",
    loot: "Pipe et blague à tabac d'Ichirō" },
  { key: "hina", id: "nei06human000001", name: "Hina Kanzaki", age: "7 ans", role: "Fille de Tae et d'Ichirō",
    threat: "« Kōta-niisan a les mains froides comme la neige. »",
    behavior: "Dessine tout le monde. Hyōe ne lui fait jamais de mal : il ne l'attrape pas et l'écarte de ses attaques. Elle donne son dessin à qui lui demande gentiment.",
    loot: "Dessin de Hina" },
];

const humanBase = { force: 0, finesse: 1, courage: 1, vitesse: 1, social: 2, intellect: 2 };
function human(h, catalog) {
  const items = h.key === "onoda" ? [catalog.item("items-weapons", "Pistolet standard", "onoda")]
    : h.key === "ryoan" ? [catalog.item("items-medical-utility", "Trousse de premiers secours", "ryoan")] : [];
  return {
    _id: h.id, name: h.name, type: "npcHuman", img: `${ART}/portraits/${h.key}.webp`,
    system: {
      class: { type: "Civil", rank: "", level: 1, subclass: "Aucune", era: "taisho" },
      stats: { base: h.key === "hina" ? { ...humanBase, force: 0, finesse: 0, social: 1, intellect: 1 } : humanBase, derived: derived([]), remaining: {} },
      resources: { hp: { value: h.key === "hina" ? 6 : 8, max: h.key === "hina" ? 6 : 8, healableMax: h.key === "hina" ? 6 : 8, base: 8, temporary: 0 } },
      profile: { characterType: "npc-human", combatStyle: "variable", age: h.age, role: h.role },
      npc: { role: h.role, threat: h.threat, behavior: h.behavior, loot: h.loot },
    },
    items,
    prototypeToken: token(h.key, h.name.replace(/^(Dr|Sergent) /, ""), { linked: true, disposition: 0 }),
    flags: { [MID]: { key: h.key, civilian: true } },
  };
}

const kuma = {
  _id: "nei07human000001", name: "Kuma, chien de l'auberge", type: "npc", img: `${ART}/portraits/kuma.webp`,
  system: {
    class: { type: "Animal", rank: "", level: 1, subclass: "", era: "taisho" },
    stats: { base: { force: 1, finesse: 1, courage: 2, vitesse: 2, social: 0, intellect: 0 }, derived: derived([]), remaining: {} },
    resources: { hp: { value: 6, max: 6, healableMax: 6, base: 6, temporary: 0 } },
    profile: { characterType: "npc", combatStyle: "variable", role: "Vieil akita de l'auberge" },
    npc: { role: "Chien de garde", threat: "Grogne contre Kōta", behavior: "Ne s'approche jamais de Kōta et refuse la nourriture qu'il a touchée. Montre les traces de traîne derrière le bain si on le suit.", loot: "" },
  },
  items: [],
  prototypeToken: token("kuma", "Kuma", { linked: true, disposition: 1, bars: 0 }),
  flags: { [MID]: { key: "kuma" } },
};

function demonBase({ base, hpBase, bdp, rp, rank, danger, role, threat, behavior, loot, movement = 9 }) {
  return {
    class: { type: "Demon", rank, level: 1, subclass: "", era: "taisho" },
    stats: { base, derived: derived([]), remaining: {} },
    resources: { hp: { base: hpBase, value: hpBase + 5 * base.force, max: hpBase + 5 * base.force, healableMax: hpBase + 5 * base.force, temporary: 0 },
      bdp: { value: bdp, max: 10 * base.courage }, rp: { value: rp, max: Math.floor((5 + base.vitesse + base.intellect) / 2) } },
    demonology: { bodyType: "humanoid", baseHpChoice: hpBase, movementType: "biped", movementBase: movement, dangerLevel: danger },
    profile: { characterType: "npc-demon", combatStyle: "bda", role },
    npc: { role, threat, behavior, loot },
  };
}

function natural(owner, key, label, hit, dice, damage, img) {
  return {
    // Named with its profile so it stands apart from the system's generic rank line.
    _id: stableId(`${owner}:${key}`), name: `${label} (d20 + ${hit}, ${dice} + ${damage})`, type: "weapon", img,
    system: {
      description: `<p>Action, contact (1,5 m) : d20 + ${hit}, ${dice} + ${damage} dégâts.</p>`, usageNote: `d20 + ${hit} contre CA ; ${dice} + ${damage}.`,
      sourceSection: "Ce que la neige efface", activation: "action", quantity: 1, tags: ["demon", "natural"],
      damage: dice, range: 1.5, category: "melee", weaponFamily: "natural", attackMod: 0, damageMod: 0, properties: [],
      usesAmmo: false, isNichirin: false, canDecapitate: false,
      // Printed profile: the system uses these values instead of the half-stat demon rule.
      attackProfiles: { force: { hit, damage }, finesse: { hit, damage } },
    },
  };
}

function kozo() {
  return {
    _id: "neikozo000000001", name: "Kozō, démon affamé", type: "npcDemon", img: `${ART}/portraits/kozo.webp`,
    system: demonBase({
      base: { force: 3, finesse: 3, courage: 2, vitesse: 4, social: 0, intellect: 0 }, hpBase: 5, bdp: 0, rp: 4, rank: "Demon faible", danger: "moderate",
      role: "Démon errant chassé du col par Hyōe", threat: "PV 20 · CA 14 · RP 4 · 1 action · Griffes d20 + 5, 1d4 + 2",
      behavior: "Affamé, il attaque le PJ le plus proche. Dépense au plus 1 RP par round. À 8 PV, il tente de fuir entre les pins. Ses derniers mots : « Celui qui porte des visages… la montagne est à lui… il chante la chanson des guides. »",
      loot: "Rien",
    }),
    items: [natural("kozo", "claws", "Griffes", 5, "1d4", 2, "icons/creatures/claws/claw-hooked-curved.webp")],
    prototypeToken: token("kozo", "Kozō", { linked: true, bar2: "resources.rp" }),
    flags: { [MID]: { key: "kozo" } },
  };
}

function hyoe(catalog) {
  const bda = (key, name, extra, flags = {}) => ({
    _id: stableId("hyoe:" + key), name, type: "bda", img: `${ART}/items/${key}.webp`,
    system: {
      sourceSection: "Ce que la neige efface — profil original", activation: "action", quantity: 1, tags: ["scenario", "hyoe"],
      demonisationGain: 0, attackStat: "finesse", specialLines: [],
      automation: { area: "single", unlimitedRange: false, cannotBeDodged: false, cannotBeReactedTo: false, afflictionCondition: "", afflictionIntensity: 0, markAsh: false, noDamage: false, delayedDamageRounds: 0, delayedDamageFormula: "", targetCapBase: 0, targetCapScalePerLevel: 0, summonFormula: "", teleportToBurned: false },
      ...extra,
    },
    flags: { [MID]: { art: key, ...flags } },
  });
  const ability = (key, name, description, usageNote, img = `${ART}/items/${key}.webp`) => ({
    _id: stableId("hyoe:" + key), name, type: "demonAbility", img,
    system: { description, usageNote, sourceSection: "Ce que la neige efface — profil original", activation: "action", quantity: 1, tags: ["scenario", "hyoe"], costBdp: 0, damage: "", range: 0 },
  });
  return {
    _id: "neihyoe000000001", name: "Hyōe, le guide sans visage", type: "npcDemon", img: `${ART}/portraits/hyoe.webp`,
    system: {
      ...demonBase({
        base: { force: 6, finesse: 7, courage: 6, vitesse: 5, social: 5, intellect: 6 }, hpBase: 90, bdp: 60, rp: 6, rank: "Demon eleve", danger: "abnormal",
        role: "Antagoniste — guide de montagne mort devant la porte close", threat: "PV 120 · CA 15 · 6 RP · 60 BDP · 2 actions · 9 m · initiative d20 + 4",
        behavior: "Porte le visage de Kōta jusqu'à ce qu'on le démasque. Commence avec 6 RP et n'en récupère pas ; au plus 2 par round. Veut jeter Fuyuko dehors dans la tempête. Ne touche jamais Hina. Ne frappe pas un PJ à terre. À 60 PV : son visage se fend et parle avec les voix de ses victimes. À 25 PV : il fuit vers la glacière par la porte de service.",
        loot: "Plaque de guide fendue",
      }),
    },
    items: [
      natural("hyoe", "claws", "Griffes de givre", 7, "1d6", 3, `${ART}/items/griffes.webp`),
      bda("eclats", "Éclats de givre", { costBdp: 3, damage: "1d8 + 2", range: 9, rangeText: "9 m",
        description: "<p>Action, 9 m, 3 BDP : d20 + 7 contre CA, 1d8 + 2 dégâts. Projectile : esquivable, et le Souffle de l'Eau peut le dévier.</p>",
        usageNote: "d20 + 7 ; 1d8 + 2 ; 9 m ; esquivable." }),
      bda("appel", "Appel de la neige", { costBdp: 4, damage: "0", range: 0, rangeText: "Une ouverture de l'auberge", automation: { noDamage: true },
        description: "<p>Action, 4 BDP, une fois par round : un volet ou une porte cède et deux Enneigés entrent par cette ouverture. Six Enneigés au plus en même temps. Impossible quand le ciel blanchit (Aube 6+).</p><p>Utilisez le bouton du tableau de bord : il dépense les BDP, ouvre l'ouverture et place les tokens.</p>",
        usageNote: "4 BDP : 2 Enneigés à une ouverture (tableau de bord). Max 6 ; plus possible à l'Aube 6." }, { summon: true }),
      ability("etreinte", "Étreinte du col",
        "<p>Action, contact, contre un civil (jamais Hina) : Hyōe l'agrippe. Un PJ adjacent au civil peut dépenser 2 RP (Porter secours) pour l'arracher avant. Chargé, Hyōe se déplace de 6 m. S'il atteint une ouverture, il jette le civil dehors, dans la tempête (dashboard : « Dehors »).</p><p>Le civil lâche prise si Hyōe subit 10 dégâts ou plus d'un seul coup, ou sur un jet de Force (Athlétisme) DD 14 au contact (1 action).</p>",
        "Contact, civil : agrippé. Lâche à 10+ dégâts d'un coup ou Force DD 14 (1 action)."),
      ability("regeneration", "Chair de givre",
        "<p>Passif : au début de chacun de ses tours, Hyōe récupère 5 PV s'il n'est à moins de 4,5 m d'aucun foyer allumé. Le module l'applique tout seul en combat et l'annonce au chat.</p>",
        "Début de tour : +5 PV si aucun foyer allumé à 4,5 m (automatique)."),
      ability("visage", "Visage d'emprunt",
        "<p>Passif hors combat : Hyōe porte l'apparence et la voix d'une personne qu'il a dévorée. Indices qui le trahissent : son souffle ne fait pas de buée dans le froid, sa peau est glacée, il ne mange pas, il ne laisse aucune trace dans la neige fraîche, les chiens le fuient.</p><p>Bouton « Démasquer » du tableau de bord : remplace le token de Kōta par Hyōe.</p>",
        "Apparence volée ; aucune buée, aucune trace (tableau de bord : Démasquer)."),
      catalog.item("abilities-demons", "Repousse", "hyoe"),
    ],
    // Linked so HP thresholds and the regeneration follow the single world actor.
    prototypeToken: token("hyoe", "Hyōe", { linked: true, bar2: "resources.bdp" }),
    flags: { [MID]: { key: "hyoe" } },
  };
}

function enneige() {
  return {
    _id: "neienneige000001", name: "Enneigé", type: "npcDemon", img: `${ART}/portraits/enneige.webp`,
    system: demonBase({
      base: { force: 0, finesse: 2, courage: 0, vitesse: 0, social: 0, intellect: 0 }, hpBase: 6, bdp: 0, rp: 0, rank: "Demon faible", danger: "moderate",
      role: "Silhouette de neige animée par Hyōe", threat: "PV 6 · CA 10 · aucune réaction · 1 action · Étreinte glacée d20 + 3, 1d4 + 1",
      behavior: "Porte vaguement le visage d'une victime. Marche droit vers le foyer allumé le plus proche : au contact, 1 action pour le souffler, puis il s'effondre. Sinon il agrippe le PJ le plus proche. Fond de 3 PV à chaque fin de round à 3 m ou moins d'un foyer allumé (automatique). Ni décapitation ni sang : à 0 PV il redevient de la neige.",
      loot: "", movement: 6,
    }),
    items: [natural("enneige", "grip", "Étreinte glacée", 3, "1d4", 1, "icons/magic/water/snowflake-ice-blue.webp")],
    prototypeToken: { ...token("enneige", "Enneigé", { bar2: "" }), displayBars: 50 },
    flags: { [MID]: { key: "enneige", snow: true } },
  };
}

export function buildActors(catalog) {
  return {
    pregens: PREGENS.map(p => pregen(p, catalog)),
    npcs: [...HUMANS.map(h => human(h, catalog)), kuma],
    demons: [kozo(), hyoe(catalog), enneige()],
  };
}

export { PREGENS, HUMANS };
