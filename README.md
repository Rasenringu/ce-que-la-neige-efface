# Ce que la neige efface

![Ce que la neige efface](assets/art/cover.webp)

One-shot **Kimetsu no Yaiba** pour le système **Breathe and Live** sur Foundry VTT : cinq pourfendeurs Mizunoto bloqués par le blizzard dans une auberge de montagne, un fils revenu de Tokyo dont le souffle ne fait pas de buée, et une porte qui, il y a vingt ans, ne s'est pas ouverte. Comptez 3 à 4 heures de jeu.

## Prérequis

| | Version |
|---|---|
| Foundry VTT | 14 (vérifié en 14.368) |
| Système Breathe and Live | 0.6.0 ou plus récent |

## Installation

Dans Foundry : **Modules complémentaires → Installer un module**, puis collez l'URL du manifeste :

```
https://github.com/PrevotYann/ce-que-la-neige-efface/releases/latest/download/module.json
```

## Lancer le scénario

1. Activez le module dans votre monde Breathe and Live.
2. À la première connexion, le module propose d'importer l'aventure (sinon : compendium **Ce que la neige efface — aventure**, puis **Importer**).
3. Tout arrive dans un dossier **Ce que la neige efface** de chaque onglet : acteurs, objets, journaux, scènes et macros.
4. Ouvrez le journal **Ce que la neige efface — Guide du MJ**, page *Démarrage rapide*.

## L'histoire en bref

Hiver de l'ère Taishō. Au col de Shirakami, trois voyageurs ont disparu en dix jours. Les PJ, cinq survivants de la même Sélection finale, montent à l'auberge Yukimi-ya juste avant la tempête. Le démon Hyōe, un guide mort de froid devant la porte de l'auberge il y a vingt ans, y vit déjà sous le visage du fils de l'okami. L'enquête consiste à le démasquer (aucune buée, pas de traces dans la neige, un chien qui le fuit, une chanson qu'il ne devrait pas connaître) ; le final consiste à tenir les foyers et protéger les habitants jusqu'à l'aube.

## Contenu

- **Cinq prétirés** prêts à jouer (Flamme, Eau, Brume, Serpent, Neige), construits avec les formes, talents, sens et armes du système 0.6, chacun avec un rôle clair dans l'enquête et le final.
- **PNJ** : l'okami Fuyuko, Yaeko, le Dr Ryōan, le sergent Onoda, Tae et Hina Kanzaki, Kuma le chien ; **démons** : Kozō (combat d'apprentissage), Hyōe et ses Enneigés.
- **Deux scènes** : le col de Shirakami et l'auberge Yukimi-ya, avec murs, portes, ouvertures à briser, quatre foyers (lumières), pastilles liées aux lieux et tokens placés. Hyōe y porte le visage de Kōta.
- **Journaux** : guide du MJ scène par scène (textes à lire, tableau des indices et conclusions, préparatifs, règles du final, branches), lieux, aide des joueurs, fiches d'identité des prétirés, six pièces à remettre.
- **Tableau de bord MJ** (macro *Neige · Tableau de bord*) : conclusions et préparatifs cochables, masque de Kōta en un clic, aube avancée automatiquement à chaque fin de round, foyers allumés/éteints sur la scène, régénération de Hyōe automatique loin du feu, Enneigés appelés par une ouverture (BDP dépensés, tokens placés, ajoutés au combat) et fondus près du feu, civils jetés dehors qui gèlent, soin du Dr Ryōan, alertes à 60 et 25 PV.
- **Macros** : tableau de bord, guide, montrer une pièce, démasquer, appel de la neige, soin, foyer le plus proche.

Les **72 illustrations** (portraits et tokens, cartes, objets, pièces à remettre, pastilles et couverture) suivent le style de l'anime **Demon Slayer / Kimetsu no Yaiba**, avec des personnages originaux. Elles sont issues de 47 illustrations générées individuellement avec l'outil imagegen intégré. Les chemins et dimensions du module sont conservés ; les tokens sont dérivés des portraits, les cartes reprennent les plans des scènes et le texte français des indices est composé depuis les journaux pour préserver les dates et les heures. Les sources et les prompts sont conservés dans [`tools/art/`](tools/art/README.md).

## Développement

```bash
npm install
npm run art       # prépare les 72 images finales depuis les illustrations conservées
npm run build     # reconstruit packs/aventure depuis src/
npm run validate  # vérifie images, références du pack, liens, scènes et murs
npm run release:check # vérifie versions, URLs et notes de version
npm run release   # prépare dist/ce-que-la-neige-efface.zip et dist/module.json
npm run qa        # test complet sur un serveur Foundry 14 local (monde neige-qa)
```

Le build lit les données du système dans `../breathe-and-live` (ou `BL_SYSTEM_PATH`) pour embarquer ses formes, armes et talents à l'identique.

`npm run qa` attend un serveur Foundry 14 sur `localhost:30018` (ou `FOUNDRY_QA_URL`) avec un monde jetable `neige-qa`, le système et `dist/ce-que-la-neige-efface` installés ; il importe l'aventure, vérifie dossiers, fiches, scènes, images, jets et automatisations du final, puis enregistre des captures dans `test-results/`.

**Publier une version** : synchronisez la version dans `module.json`, `package.json` et `package-lock.json`, adaptez l'URL `download` et ajoutez les notes au `CHANGELOG.md`. Reconstruisez le compendium avec `npm run build`, vérifiez avec `npm run validate` et `npm run release:check`, puis poussez sur `main`. Le workflow crée le tag `vX.Y.Z` et publie l'archive, le manifeste et la somme SHA-256.

## Licence

Code sous licence MIT. Scénario de fan non officiel, sans affiliation : Kimetsu no Yaiba appartient à Koyoharu Gotouge et à ses ayants droit. Personnages, lieux et illustrations du module sont originaux.
