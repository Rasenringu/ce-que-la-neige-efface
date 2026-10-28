// Clues and props the GM can hand to a pregen. All are plain "gear" items.
import { stableId } from "../tools/lib/system-catalog.mjs";
import { MID } from "./actors.mjs";

const ITEMS = [
  ["offrande", "Offrande du jizō", "Un bol de riz gelé, une poupée de paille et un papier plié : « Pardon. Nous aurions dû ouvrir. — F. » Déposés il y a quelques jours dans l'abri du col.", "Indice : quelqu'un de l'auberge se sent coupable d'une porte restée fermée. Montrée à Fuyuko, elle avoue."],
  ["lettre", "Lettre de Kōta", "« Mère, j'ai obtenu mon congé. Je prendrai le train du soir pour Matsumoto le 14 et je monterai au col le 15 au matin. Gardez-moi du riz aux châtaignes. — Kōta »", "Indice : Kōta devait arriver le 15. « Kōta » a frappé à la porte le 12, de nuit."],
  ["billet", "Billet de train de Kōta", "Billet de troisième classe Shinjuku → Matsumoto, poinçonné le 11. Trouvé dans un sac de voyage gelé, au fond de la glacière.", "Preuve : le vrai Kōta est mort au col avant l'arrivée du « Kōta » de l'auberge."],
  ["plaque", "Plaque de guide fendue", "Plaque de bois laquée : « Hyōe — guide agréé de Kamiyu — Meiji 22 ». Trouvée dans la glacière parmi les affaires des disparus.", "Indice : relie le démon au guide mort devant la porte de l'auberge il y a vingt ans."],
  ["registre", "Registre de l'auberge", "Registre relié de toile, ouvert sur l'hiver Meiji 29. L'écriture de Fuyuko Hamura tremble sur une seule ligne.", "Indice : identité et mobile de Hyōe (la nuit de la porte close)."],
  ["dessin", "Dessin de Hina", "Dessin au crayon : tous les clients autour de l'irori, chacun avec un petit nuage devant la bouche. Kōta-niisan n'en a pas. Kuma aboie dans un coin.", "Indice : le souffle de Kōta ne fait pas de buée."],
  ["carnet", "Carnet de garde d'Onoda", "Relevés minutieux du sergent : heures, noms, météo.", "Indice : Kōta sort à 2 h 10 sans manteau ni lanterne, rentre à 2 h 40 sans trace de pas. Convainc Onoda lui-même."],
  ["glycine", "Encens de glycine", "Trois bâtonnets violets dans un étui de bambou, achetés par le Dr Ryōan à une maison des glycines.", "Allumé (1 action) dans une pièce : pendant 3 rounds, Hyōe ne peut pas y utiliser Étreinte du col et y subit 1d6 dégâts au début de chacun de ses tours."],
  ["cle", "Clé de la porte de service", "Clé de fer que Yaeko porte à la ceinture.", "Ouvre la porte de service de la cuisine, verrouillée de l'intérieur (chemin le plus court vers la glacière)."],
];

export function buildItems() {
  return ITEMS.map(([key, name, description, usage]) => ({
    _id: stableId("item:" + key), name, type: "gear", img: `modules/${MID}/assets/items/${key}.webp`,
    system: { description: `<p>${description}</p><p><strong>En jeu :</strong> ${usage}</p>`, usageNote: usage,
      sourceSection: "Ce que la neige efface", activation: "passive", quantity: 1, tags: ["scenario", key] },
    flags: { [MID]: { key } },
  }));
}

export const ITEM_KEYS = ITEMS.map(i => i[0]);
export const itemId = key => stableId("item:" + key);
