// Journal entries. Text is French, kept short: one page per scene, read-aloud
// boxes, and a table of what each choice changes. @Neige[action]{label} links
// are enriched by scripts/module.mjs into buttons for the GM.
import { stableId } from "../tools/lib/system-catalog.mjs";
import { MID, PREGENS } from "./actors.mjs";
import { itemId } from "./items.mjs";

const ART = `modules/${MID}/assets`;
const A = (id, label) => `@UUID[Actor.${id}]{${label}}`;
const I = (key, label) => `@UUID[Item.${itemId(key)}]{${label}}`;
const ID = {
  fuyuko: "nei01human000001", yaeko: "nei02human000001", ryoan: "nei03human000001", onoda: "nei04human000001",
  tae: "nei05human000001", hina: "nei06human000001", kuma: "nei07human000001",
  kozo: "neikozo000000001", hyoe: "neihyoe000000001", enneige: "neienneige000001",
};
export const JOURNAL_IDS = {
  guide: stableId("journal:guide"), zones: stableId("journal:zones"), players: stableId("journal:players"),
  pregens: stableId("journal:pregens"), handouts: stableId("journal:handouts"),
};
const P = (journal, key) => stableId(`page:${journal}:${key}`);
const pageLink = (journal, key, label) => `@UUID[JournalEntry.${JOURNAL_IDS[journal]}.JournalEntryPage.${P(journal, key)}]{${label}}`;
const read = text => `<blockquote class="neige-read">${text}</blockquote>`;
const tip = text => `<aside class="neige-tip">${text}</aside>`;
const table = (head, rows) => `<table class="neige-table"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
const wrap = html => `<div class="neige-journal">${html}</div>`;

const GUIDE = [
  ["start", "Démarrage rapide", `
<img class="neige-banner" src="${ART}/art/banner.webp" alt="">
<h1>Ce que la neige efface</h1>
<p class="neige-lead">One-shot de 3 à 4 heures pour cinq pourfendeurs Mizunoto (rang 1). Hiver de l'ère Taishō, col de montagne fictif, personnages originaux.</p>
${read("Dans le froid, tout ce qui vit fume. Les chevaux, les marmites, les enfants qui rient. Cette nuit, à l'auberge Yukimi-ya, quelqu'un parle, sourit, vous sert le thé… et son souffle ne fait aucune buée.")}
<h2>L'essentiel en cinq lignes</h2>
<ol>
<li>Il y a vingt ans, l'aubergiste a refusé d'ouvrir sa porte à un guide de montagne, <strong>Hyōe</strong>, venu chercher du secours dans la tempête. Hyōe est mort de froid ; Muzan en a fait un démon.</li>
<li>Hyōe est revenu. Il porte le <strong>visage de ceux qu'il dévore</strong> : depuis trois jours, il vit à l'auberge sous les traits de <strong>Kōta</strong>, le fils de l'okami, qu'il a tué au col.</li>
<li>Son but : que l'okami Fuyuko vive ce qu'il a vécu — <strong>la jeter dehors dans la tempête</strong> et la regarder frapper à la porte.</li>
<li>Les PJ, bloqués par le blizzard, doivent <strong>démasquer le faux Kōta</strong> : son souffle ne fume pas, le chien le fuit, il ne mange pas, il ne laisse pas de traces.</li>
<li>Le final se joue <strong>jusqu'à l'aube</strong> : tenir les quatre foyers allumés (ils l'empêchent de se régénérer et font fondre ses créatures de neige), protéger les civils, puis le décapiter.</li>
</ol>
<h2>Préparer (15 minutes)</h2>
<ol>
<li>Lire cette page, puis ${pageLink("guide", "clues", "Indices et conclusions")}, ${pageLink("guide", "s5", "Scène 5")} et ${pageLink("guide", "rules", "Règles et arbitrages")}.</li>
<li>Activer la scène <em>1 · Le col de Shirakami</em>. Donner à chaque joueur la propriété d'un prétiré.</li>
<li>Montrer aux joueurs les journaux <em>Aide des joueurs</em> et <em>Prétirés</em>, et la pièce @Neige[handout]{« Ordre de mission »}.</li>
<li>Garder sous la main le @Neige[dashboard]{tableau de bord du scénario} : indices, préparatifs, foyers, Enneigés, civils, aube et Hyōe.</li>
</ol>
<h2>Séquence</h2>
${table(["Étape", "3 h", "4 h", "But"], [
  ["Accueil et personnages", "15 min", "20 min", "Présenter le groupe, E, RP et la mort à 0 PV."],
  [pageLink("guide", "s1", "1 · Le col"), "20 min", "25 min", "Combat d'apprentissage contre Kozō, rencontre du Dr Ryōan, l'offrande du jizō."],
  [pageLink("guide", "s2", "2 · L'auberge sous la neige"), "20 min", "25 min", "Les habitants, la disparition d'Ichirō, le sergent et les sabres."],
  [pageLink("guide", "s3", "3 · La nuit des visages"), "40 min", "50 min", "Enquête libre : quatre conclusions."],
  [pageLink("guide", "s4", "4 · Le masque"), "15 min", "20 min", "Démasquer Kōta et préparer la défense."],
  ["Pause", "5 min", "10 min", "Placer tokens, foyers et civils."],
  [pageLink("guide", "s5", "5 · La nuit la plus longue"), "60 min", "70 min", "Le final jusqu'à l'aube."],
  [pageLink("guide", "end", "Épilogue"), "15 min", "20 min", "La porte ouverte, une image par PJ."],
])}
<h2>Objectifs des PJ</h2>
<p>Trouver le démon · protéger les six habitants (surtout Fuyuko) · tenir jusqu'à l'aube ou décapiter Hyōe · décider de ce qu'on dit à une mère dont le fils est mort depuis quatre jours.</p>
${tip("<strong>Ton :</strong> c'est une histoire de porte fermée et de froid, pas de gore. Les disparus ne sont jamais décrits en détail. Hyōe est monstrueux et triste à la fois, comme les démons de la série : on peut le plaindre sans l'épargner.")}`],

  ["truth", "Ce qui s'est passé", `
<h1>Ce qui s'est passé</h1>
<h2>La porte close (il y a vingt ans)</h2>
<p>Hiver Meiji 29. ${A(ID.hyoe, "Hyōe")}, guide de Kamiyu, conduisait une famille de voyageurs au col de Shirakami quand le blizzard les a surpris. Il les a abrités dans le petit sanctuaire du jizō et il est descendu seul à l'auberge Yukimi-ya chercher des hommes et des couvertures. Il a frappé une partie de la nuit. Gonzō Hamura, le mari de ${A(ID.fuyuko, "Fuyuko")}, a refusé d'ouvrir : un mois plus tôt, des brigands avaient pillé une auberge de la vallée en se faisant passer pour des voyageurs perdus. Fuyuko voulait ouvrir. Elle a obéi.</p>
<p>Au matin, il ne restait que des griffures dans le bois. La famille du jizō est morte de froid. Le corps de Hyōe n'a jamais été retrouvé : Muzan l'avait trouvé agonisant dans la neige.</p>
<h2>Le retour</h2>
<p>Hyōe a erré vingt ans loin du col. Cet hiver, il est revenu. Depuis dix jours, il dévore les voyageurs isolés au col (trois disparus). Le 11, il y a croisé <strong>Kōta Hamura</strong>, le fils de Fuyuko, qui rentrait de Tokyo par surprise avec quatre jours d'avance. Il l'a tué et a pris son visage. Le 12 au soir, « Kōta » a frappé à la porte de l'auberge — et cette fois, Fuyuko a ouvert.</p>
<p>Dans la nuit du 13, il a enlevé Ichirō Kanzaki, un marchand, au bain extérieur. Ce soir, le 14, le blizzard bloque le col et les PJ arrivent.</p>
<h2>Ce qu'il veut</h2>
<p>Pas seulement manger. Il veut que Fuyuko <strong>frappe à une porte qui ne s'ouvre pas</strong>. Il compte vider l'auberge un client après l'autre et finir par elle, jetée dehors dans la tempête. Il ne touche pas aux enfants : la famille qu'il guidait avait une petite fille.</p>
<h2>Son art sanguinaire : le Linceul</h2>
${table(["Pouvoir", "Ce qui le trahit ou l'arrête"], [
  ["<strong>Visage d'emprunt</strong> : apparence et voix d'une personne dévorée.", "Son souffle ne fait pas de buée dans le froid ; sa peau est glacée ; il ne mange pas ; les chiens le fuient ; il fredonne la chanson des guides du col."],
  ["<strong>Pas sans trace</strong> : il marche sur la neige fraîche sans s'y enfoncer.", "Aucune empreinte quand il sort : Onoda l'a noté."],
  ["<strong>Enneigés</strong> : silhouettes de neige au visage de ses victimes.", "Elles fondent près du feu et se jettent sur les foyers pour les éteindre."],
  ["<strong>Chair de givre</strong> : il se régénère dans le froid.", "Près d'un foyer allumé (4,5 m), il ne se régénère pas."],
])}
<h2>Chronologie</h2>
${table(["Quand", "Événement"], [
  ["Meiji 29 (il y a 20 ans)", "La porte close. Hyōe disparaît, la famille du jizō meurt."],
  ["Il y a dix jours", "Premières disparitions au col."],
  ["Le 11", "Kōta, en avance, est tué au col. Son sac finit dans la glacière."],
  ["Le 12, de nuit", "« Kōta » frappe à la porte. Fuyuko ouvre, folle de joie."],
  ["Le 13, 22 h", "Ichirō Kanzaki disparaît au bain extérieur."],
  ["Le 14, crépuscule", "Le blizzard se lève. Les PJ arrivent au col."],
  ["Le 15, vers 4 h", "Hyōe passe à l'acte si personne ne l'a démasqué (scène 4)."],
  ["Le 15, vers 6 h 50", "Lever du soleil."],
])}`],

  ["npcs", "Les PNJ en un coup d'œil", `
<h1>Les PNJ</h1>
<p>Un désir, un geste, une phrase. Chaque PNJ <strong>cède à quelque chose de précis</strong> et rapporte un avantage concret pour le final (cochez-le dans les <em>Préparatifs</em> du tableau de bord).</p>
${table(["PNJ", "Joue-le ainsi", "Il ou elle cède…", "Ce que ça rapporte"], [
  [`${A(ID.fuyuko, "Fuyuko Hamura")}<br><small>okami, 50 ans</small>`, "Lisse son tablier, sert le thé avant de répondre. « Tant que je tiens cette maison, personne ne dort dehors. »", "Quand on lui montre l'offrande du jizō ou le registre, ou qu'on lui parle de Hyōe avec douceur.", "Avoue la porte close. Préparée par un PJ, elle peut parler à Hyōe pendant le final : il perd une action."],
  [`<img class="neige-thumb" src="${ART}/portraits/kota.webp" alt="">« Kōta Hamura »<br><small>${A(ID.hyoe, "Hyōe")} masqué</small>`, "Chaleureux, serviable, toujours au coin le plus froid. Fredonne un air de montagne. « Je vais vous guider, je connais le col par cœur. »", "Jamais. Accusé sans preuve, il joue l'offensé et se réfugie derrière sa « mère ».", "Démasqué, il passe à l'acte (scène 4)."],
  [`${A(ID.yaeko, "Yaeko")}<br><small>servante, 17 ans</small>`, "Parle en rangeant. « Le jeune maître ne mange jamais ce que je lui sers. »", "Si on l'aide en cuisine ou qu'on la protège de l'okami.", "Plateaux intacts, clé de la porte de service. Au final, rallume un foyer (1 action, son tour)."],
  [`${A(ID.ryoan, "Dr Ryōan Shimizu")}<br><small>médecin, 47 ans</small>`, "Serre sa mallette contre lui. « Je ne transporte que des remèdes. »", "Si on promet de taire ses dettes (il fuit un usurier).", "Encens de glycine ; poste de soins au final (1d6 + 2, une fois par round)."],
  [`${A(ID.onoda, "Sergent Onoda")}<br><small>gendarme, 41 ans</small>`, "Note tout dans un carnet. « Le port du sabre est interdit depuis Meiji 9. »", "Devant les faits qu'il a lui-même notés, ou devant un démon. Jamais devant l'uniforme du Corps.", "Garde une porte et tire une fois par round (d20 + 3, 1d8 + 1)."],
  [`${A(ID.tae, "Tae Kanzaki")}<br><small>épouse d'Ichirō, 32 ans</small>`, "Tient la pipe de son mari. « Le bain est à vingt pas. »", "Si on lui confie une tâche (tenir une lanterne, veiller Hina).", "Reste à l'abri au final au lieu de courir chercher Ichirō."],
  [`${A(ID.hina, "Hina Kanzaki")}<br><small>7 ans</small>`, "Dessine. « Kōta-niisan a les mains froides comme la neige. »", "Si on lui parle à sa hauteur.", "Son dessin : le seul sans nuage de buée."],
  [`${A(ID.kuma, "Kuma")}<br><small>vieil akita</small>`, "Grogne dès que Kōta entre.", "À qui lui donne à manger.", "Mène aux traces de traîne derrière le bain."],
])}
${tip("Ne jouez pas les débats entre PNJ : posez une question à un PJ, puis faites agir quelqu'un. Le Dr Ryōan et Onoda sont des fausses pistes rassurantes : un secret honteux mais humain, résolu en une conversation.")}`],

  ["clues", "Indices et conclusions", `
<h1>Indices et conclusions</h1>
<p>L'enquête repose sur <strong>quatre conclusions</strong>. Chacune a au moins trois sources : si les PJ en ratent une, une autre arrive. <strong>Examiner un lieu ou parler à la bonne personne donne l'indice</strong> ; un jet réussi donne un détail en plus ou du temps, jamais l'autorisation de continuer. Cochez les conclusions dans le tableau de bord.</p>
${table(["Conclusion", "Sources (une suffit)"], [
  ["<strong>1. Le démon vit parmi eux et porte un visage volé.</strong>", `Derniers mots de Kozō (scène 1) · ${I("dessin", "dessin de Hina")} · ${I("carnet", "carnet d'Onoda")} (aucune trace) · Kuma qui grogne · absence de buée observée dehors ou au genkan.`],
  ["<strong>2. Ce « Kōta » est le démon ; le vrai Kōta est mort.</strong>", `${I("lettre", "Lettre de Kōta")} (arrivée prévue le 15, il est venu le 12) · ${I("billet", "billet de train")} et sac dans la glacière · plateaux intacts (Yaeko) · Tetsuya : il ne sent ni le riz ni la sueur, seulement la neige · il fredonne une chanson que Kōta, élevé à Tokyo dès dix ans, ne connaît pas.`],
  ["<strong>3. Le démon est Hyōe, le guide de la porte close. Il veut Fuyuko dehors.</strong>", `${I("offrande", "Offrande du jizō")} · ${I("registre", "registre de l'auberge")} · aveu de Fuyuko · ${I("plaque", "plaque de guide")} dans la glacière · Haru reconnaît la chanson des guides · griffures anciennes à l'intérieur de la porte principale.`],
  ["<strong>4. La chaleur le gêne.</strong>", "Il s'assoit toujours au coin le plus froid · une étincelle de l'irori le fait reculer, la brûlure ne guérit pas tout de suite · les Enneigés de la glacière fuient les torches et fondent · il n'est jamais entré dans la cuisine quand le fourneau est allumé (Yaeko)."],
])}
<h2>Si la table bloque</h2>
<ul>
<li><strong>Après 30 minutes de scène 3 :</strong> Kuma aboie à la porte du bain ; les PJ trouvent des traces de traîne vers la glacière.</li>
<li><strong>Après 45 minutes :</strong> Onoda vient trouver le PJ le plus calme avec son carnet : « Expliquez-moi ça. »</li>
<li><strong>Si les PJ accusent le mauvais suspect :</strong> laissez faire une scène, puis Hina tire la manche d'un PJ et montre son dessin.</li>
<li><strong>S'ils n'ont toujours pas compris à 4 h :</strong> Hyōe passe à l'acte (scène 4, branche B). Le final reste jouable : il se démasque lui-même.</li>
</ul>`],

  ["s1", "Scène 1 · Le col", `
<h1>1 · Le col de Shirakami <small>20-25 min</small></h1>
${read("La neige tombe en diagonale. Vos lanternes éclairent trois pas devant vous, pas un de plus. Fubuki crie au-dessus du vent : « Col de Shirakami ! Trois voyageurs disparus en dix jours ! Auberge Yukimi-ya avant la nuit ! » Plus haut, sur le sentier, une forme sombre : un traîneau renversé. Et un cri d'homme, qui vient du petit abri de pierre du jizō.")}
<p>Scène <em>1 · Le col de Shirakami</em>. Les PJ sont en bas à gauche. ${A(ID.ryoan, "Le Dr Ryōan")} s'est réfugié dans l'abri du jizō ; son porteur est mort près du traîneau. ${A(ID.kozo, "Kozō")}, un démon affamé, tourne autour de l'abri.</p>
<h2>Combat d'apprentissage : Kozō</h2>
${table(["Kozō", "Valeurs"], [["Défense", "PV 20 · CA 14 · RP 4 (au plus 1 par round) · 1 action · 9 m"], ["Griffes", "d20 + 5, contact, 1d4 + 2"], ["Conduite", "Attaque le PJ le plus proche. À 8 PV, il fuit entre les pins : un PJ rapide peut le rattraper."], ["Version courte", "Déjà blessé par le porteur : PV 10, RP 2."]])}
${tip("Profitez-en pour enseigner : annoncer une esquive (1 RP) avant les dégâts ; une forme de Souffle touche sans jet d'attaque et coûte de l'E même esquivée ; il faut une frappe Nichirin <em>annoncée à la tête</em> pour décapiter. Laissez chaque joueur essayer une forme.")}
<h2>Ce qu'on trouve</h2>
<ul>
<li><strong>Les derniers mots de Kozō</strong>, quand sa tête s'effrite : « Pas moi… Je n'ai rien pris ici… La montagne est à <em>lui</em>. Celui qui porte des visages. Il chante… la chanson des guides… »</li>
<li><strong>Le Dr Ryōan</strong>, choqué, serre une mallette fermée. Il veut descendre à l'auberge avec les PJ. Il remercie, ment sur sa destination (« Matsumoto, un patient »).</li>
<li><strong>L'abri du jizō</strong> : sur l'autel, une ${I("offrande", "offrande")} récente — riz gelé, poupée de paille, papier : « Pardon. Nous aurions dû ouvrir. — F. » Un PJ qui examine le sol trouve, sous la neige, de vieilles planches gravées de petits noms d'enfants (Nature ou Enquête DD 10 : une stèle, « famille Odagiri, morte ici, Meiji 29 »).</li>
<li><strong>Le traîneau</strong> : le porteur a été tué par Kozō (griffures nettes, il a été mordu). Rien à voir avec les disparitions : les disparus, eux, n'ont laissé ni corps ni sang.</li>
</ul>
<p>Transition : il reste dix minutes de marche jusqu'à l'auberge. Le blizzard se referme derrière eux : personne ne redescendra cette nuit. Passez à la scène <em>2 · Auberge Yukimi-ya</em>.</p>`],

  ["s2", "Scène 2 · L'auberge sous la neige", `
<h1>2 · L'auberge sous la neige <small>20-25 min</small></h1>
${read("Une lanterne rouge oscille au-dessus d'une grande porte de bois. Derrière, de la lumière, de la fumée, l'odeur du bouillon. Une femme en tablier vous ouvre avant même que vous frappiez. « Entrez, entrez vite. Tant que je tiens cette maison, personne ne dort dehors. » Derrière elle, un jeune homme souriant vous tend déjà des serviettes chaudes.")}
<h2>Les présentations (un tour de table)</h2>
<p>Présentez chaque habitant par <strong>un geste et une phrase</strong> (voir ${pageLink("guide", "npcs", "Les PNJ")}). Placez ensuite les PJ dans la salle commune, autour du grand irori.</p>
<ul>
<li><strong>Fuyuko</strong> rayonne : son fils Kōta est rentré de Tokyo il y a deux jours, « en avance, pour me faire la surprise ».</li>
<li><strong>« Kōta »</strong> propose de guider les PJ au col dès l'aube. Il reste près de la porte, loin du feu. Kuma grogne sous la table ; Kōta rit : « Il ne me reconnaît plus depuis Tokyo. »</li>
<li><strong>Le sergent Onoda</strong> se lève : les sabres sont interdits (édit Haitōrei). Il veut les confisquer jusqu'à l'aube.</li>
<li><strong>Tae Kanzaki</strong> supplie : son mari Ichirō est sorti hier soir vers le bain extérieur et n'est jamais revenu. L'okami dit qu'il a dû redescendre au village ; Tae n'y croit pas.</li>
</ul>
<h2>Le sergent et les sabres</h2>
<p>Ne bloquez pas la partie : Onoda n'a qu'un pistolet et il est seul. Il cède à une solution qui respecte la forme : sabres au fourreau, sous sa surveillance, « jusqu'à preuve d'un danger ». Si un PJ ex-policier (Masaomi) lui parle procédure : Performance ou Intuition DD 10, il accepte sans condition. S'ils l'humilient, il les surveille toute la nuit (ce qui peut servir : il verra Kōta sortir).</p>
<h2>Le dîner</h2>
<p>Yaeko sert du bouillon de miso et du riz aux châtaignes — « le plat préféré du jeune maître ». <strong>Kōta ne mange pas</strong> (« j'ai mangé en cuisine »). Tetsuya, s'il regarde la cuisine, voit que le bol du jeune maître revient plein depuis deux jours. Une étincelle de l'irori saute sur la main de Kōta : il recule trop vite, la brûlure ne cicatrise pas comme le reste (Perception DD 12, ou automatique si un PJ le surveille).</p>
${tip("Laissez les joueurs soupçonner tout le monde : c'est le plaisir de la scène. Ne confirmez rien. Si un PJ sort dans le froid avec Kōta (aller chercher du bois, voir le bain), décrivez la buée de chacun… <em>sauf la sienne</em>, sans insister : « Vous voyez la buée de vos camarades. Kōta vous sourit. »")}
<p>Transition : vers 22 h, tout le monde va se coucher. Les PJ ont leurs chambres (D). La nuit leur appartient : scène 3.</p>`],

  ["s3", "Scène 3 · La nuit des visages", `
<h1>3 · La nuit des visages <small>40-50 min</small></h1>
<p>Enquête libre de 22 h à 4 h. Les PJ peuvent se séparer : changez de groupe après une découverte ou deux minutes. Chaque lieu a une page dans <em>Auberge Yukimi-ya — lieux</em> (pastilles sur la carte).</p>
${table(["Lieu", "Ce qu'on trouve sans jet", "Avec un jet"], [
  ["<strong>Bain extérieur (H)</strong>", "Les sandales d'Ichirō, sa serviette gelée. Une seule ligne de pas va vers le bassin. Rien ne revient.", "Survie ou Nature DD 12 : sous la neige fraîche, une trace de traîne monte vers la glacière. Kuma la suit sans jet si on le nourrit."],
  ["<strong>Glacière (I)</strong>", `Blocs de glace, paille, et derrière : les affaires des disparus, le sac de Kōta avec son ${I("billet", "billet")}, la ${I("plaque", "plaque de guide")} de Hyōe. Le corps d'Ichirō, gelé (ne décrivez rien de plus).`, "Médecine DD 10 : morsures humaines, faites par une bouche « trop grande ». Enquête DD 12 : le sac de Kōta est là depuis au moins trois jours."],
  ["<strong>Bureau de l'okami (E)</strong>", `La ${I("lettre", "lettre de Kōta")} sur l'autel des ancêtres. Le ${I("registre", "registre")}, rangé avec soin.`, "Enquête DD 12 : le registre s'ouvre seul à l'hiver Meiji 29, la page a été relue cent fois."],
  ["<strong>Cuisine (C)</strong>", "Yaeko et les plateaux intacts. Kuma refuse les restes que Kōta a touchés.", "Si on l'aide (Performance ou Intuition DD 10) : « Il n'entre jamais quand le fourneau est allumé. Et il chante une chanson de montagne que je ne connais pas. »"],
  ["<strong>Genkan (A)</strong>", "Onoda veille. Il refuse d'abord de parler.", `Intuition DD 12 ou la confiance gagnée en scène 2 : il montre son ${I("carnet", "carnet")} — 2 h 10, Kōta sort sans manteau ; 2 h 40, il rentre ; aucune trace.`],
  ["<strong>Chambres (D)</strong>", `Tae ne dort pas. Hina dessine à la lanterne : son ${I("dessin", "dessin")}.`, "—"],
  ["<strong>Porte principale</strong>", "À l'intérieur, à hauteur d'homme, de vieilles griffures noircies que personne n'a poncées.", "—"],
])}
<h2>La chanson des guides</h2>
<p>Vers 1 h, on entend Kōta fredonner dans le couloir. <strong>Haru</strong> (ou tout PJ qui la fait écouter à Fuyuko) reconnaît le <em>Shirakami oiwake</em>, la chanson que chantent les guides pour que leurs voyageurs suivent la voix dans le brouillard. Fuyuko pâlit : « Kōta est parti à Tokyo à dix ans. Il ne connaît pas cet air. Lui, il le chantait… »</p>
<h2>Combat facultatif : la glacière</h2>
<p>Si les PJ entrent dans la glacière (et si vous avez le temps), trois ${A(ID.enneige, "Enneigés")} se relèvent de la paille (tokens cachés dans la glacière : révélez-les). Ils portent vaguement les visages des disparus. <strong>Ils fuient les torches et fondent près du feu</strong> : c'est la conclusion 4, et la répétition générale du final. Profil : PV 6, CA 10, Étreinte glacée d20 + 3, 1d4 + 1. Hyōe ne vient pas : il joue Kōta à l'auberge.</p>
<h2>L'aveu de Fuyuko</h2>
${read("« Il frappait. Toute la nuit. Il disait qu'il y avait une enfant, là-haut. Mon mari a barré la porte et m'a tenue par le bras. Au matin… il n'y avait que les griffures. Je monte au jizō chaque hiver. Je n'ai jamais su son nom. » — Hyōe, dit un PJ. Elle répète le nom tout bas.")}
<p>Ne lui faites pas deviner que son fils est mort. Si un PJ le lui annonce, laissez un silence, puis : « Alors qui ai-je laissé entrer ? »</p>`],

  ["s4", "Scène 4 · Le masque", `
<h1>4 · Le masque <small>15-20 min</small></h1>
<p>Deux façons d'arriver au final. Dans les deux cas, gardez quelques minutes de <strong>préparatifs</strong> : c'est là que l'enquête paie.</p>
<h2>A · Les PJ accusent Kōta</h2>
<p>Laissez-les mener la confrontation dans la salle commune. Kōta nie, se cache derrière Fuyuko (« Mère, ils sont fous »). À la <strong>deuxième preuve</strong> présentée, ou dès qu'on le force à souffler dehors / à s'approcher du feu, il cesse de jouer :</p>
${read("Kōta sourit encore, mais sa voix descend d'une octave. Elle devient rocailleuse, lointaine, comme portée par le vent. « Vingt ans, Fuyuko. Vingt hivers que je frappe. » Sa peau se craquelle comme de la glace sur un lac. Dehors, tous les volets de l'auberge tremblent en même temps.")}
<p>@Neige[unmask]{Démasquer Kōta} (le token devient Hyōe). Il ne combat pas tout de suite : il sort par l'ouverture la plus proche et disparaît dans la tempête (« Gardez vos feux. On verra combien de temps. »). Les PJ ont <strong>un court moment</strong> pour se préparer avant que les volets cèdent.</p>
<h2>B · Hyōe passe à l'acte (4 h)</h2>
<p>Si personne ne l'a démasqué, à 4 h il emporte Tae (ou Yaeko) vers la porte du bain. Un PJ éveillé l'entend ; Kuma aboie. Démasquez-le, lancez directement le final ; les préparatifs se limitent à ce que les PJ ont déjà fait.</p>
<h2>Préparatifs (cochez-les dans le tableau de bord)</h2>
<p>Demandez à chaque PJ : <strong>« Que fais-tu dans les minutes qui restent ? »</strong> Une action par PJ, sans jet si elle est raisonnable.</p>
${table(["Préparatif", "Condition", "Effet au final"], [
  ["Civils rassemblés autour de l'irori", "Une action de PJ (ou deux si Tae veut sortir chercher Ichirō).", "Ils commencent dans la salle commune, foyer allumé. Sinon : chacun dans sa pièce."],
  ["Volets barricadés", "Un PJ et des planches (Force ou outils).", "Le premier Appel de la neige arrive au round suivant au lieu du round même."],
  ["Encens de glycine", "Le Dr Ryōan l'a sorti de sa mallette (secret gardé, scène 2-3).", `Allumé dans une pièce : 3 rounds sans Étreinte et 1d6 dégâts à Hyōe au début de ses tours (${I("glycine", "objet")}).`],
  ["Onoda armé et convaincu", "Il a vu un démon ou lu son propre carnet avec un PJ.", "Il garde une porte et tire une fois par round (d20 + 3, 1d8 + 1)."],
  ["Poste de soins du Dr Ryōan", "Ryōan rassuré sur ses dettes ou simplement protégé.", "Une fois par round : 1d6 + 2 PV à un PJ adjacent (@Neige[heal]{soin sur la cible})."],
  ["Fuyuko prête à parler", "Un PJ lui a dit qui est Hyōe et l'a préparée.", "Une fois au final, elle lui parle : il perd une action ce round-là."],
])}
${tip("Il n'existe pas de « bonne » préparation. Six préparatifs pour cinq PJ : ils devront choisir. Tous les foyers sont allumés au début du final, quoi qu'ils fassent.")}`],

  ["s5", "Scène 5 · La nuit la plus longue", `
<h1>5 · La nuit la plus longue <small>60-70 min</small></h1>
<h2>Mise en place</h2>
<ol>
<li>Placer les PJ et les civils selon les préparatifs. Hyōe est dehors (il entrera par une ouverture).</li>
<li>Lancer le combat (initiative d20 + Vitesse − 1 ; Hyōe d20 + 4), puis @Neige[finale]{démarrer le final} : le module avance l'aube à chaque fin de round.</li>
<li><strong>Annoncer les règles du final avant le premier tour</strong> (encadré ci-dessous). Le danger doit être lisible.</li>
</ol>
<h2>Règles annoncées aux joueurs</h2>
${table(["Élément", "Règle"], [
  ["Aube", "Le final commence à 5 h 30. À chaque fin de round, l'aube avance d'un cran. À <strong>6</strong>, le ciel blanchit : Hyōe ne peut plus appeler la neige. À <strong>8</strong>, le soleil se lève : toute case dehors est au soleil."],
  ["Foyers", "Quatre foyers : grand irori (B), fourneau (C), chaudière du bain (F), brasero du genkan (A). Tant qu'un foyer brûle, Hyōe ne se régénère pas à 4,5 m de lui."],
  ["Enneigés", "Ils entrent par les volets et les portes, deux à la fois. Un Enneigé au contact d'un foyer peut le souffler (1 action) puis s'effondre. Un Enneigé à 3 m d'un foyer allumé perd 3 PV à chaque fin de round."],
  ["Rallumer", "1 action au contact avec une lanterne. Une forme de la Flamme lancée à 1,5 m d'un foyer éteint le rallume gratuitement."],
  ["Civils", "Hyōe veut les jeter dehors. Agrippé : on le libère en infligeant 10 dégâts ou plus d'un coup à Hyōe, ou Force DD 14 au contact (1 action). Dehors, un civil perd 2 PV par fin de round ; le ramener : 1 action au contact puis le déplacer."],
])}
<h2>Hyōe</h2>
${table(["Profil", "PV 120 · CA 15 · 6 RP (au plus 2 par round, aucune récupération) · 60 BDP · 2 actions · 9 m · initiative d20 + 4"], [
  ["Griffes de givre", "Action, contact : d20 + 7, 1d6 + 3."],
  ["Éclats de givre", "Action, 9 m, 3 BDP : d20 + 7, 1d8 + 2. Esquivable ; le Souffle de l'Eau peut le dévier."],
  ["Appel de la neige", "Action, 4 BDP, une fois par round : deux Enneigés à une ouverture (six au plus). @Neige[summon]{Appeler la neige}. Plus possible à l'aube 6."],
  ["Étreinte du col", "Action, contact, un civil (jamais Hina) : agrippé. Chargé, il se déplace de 6 m ; à une ouverture, il jette le civil dehors."],
  ["Chair de givre", "Début de tour : +5 PV si aucun foyer allumé à 4,5 m. <strong>Automatique.</strong>"],
  ["Repousse", "Action, 4 BDP : restaure un membre, pas de PV. Rien après une décapitation Nichirin."],
])}
<p><strong>Tactique.</strong> Round 1 : Appel de la neige à l'ouverture la plus éloignée des PJ, puis Éclats de givre sur le PJ qui garde Fuyuko. Ensuite : une action pour approcher Fuyuko et l'agripper, une contre le PJ qui le bloque. Ses Enneigés visent les foyers d'abord, les PJ ensuite. Il ne frappe pas un PJ à terre ; il ne frappe jamais Hina. Il ne dépense pas de RP contre une technique impossible à esquiver.</p>
<p><strong>À 60 PV :</strong> son visage se fend ; il parle avec la voix de Kōta, puis d'Ichirō, puis la sienne. Si <em>Fuyuko est prête</em>, c'est le moment de son monologue : elle s'excuse, dit son nom ; il perd une action ce round. <strong>À 25 PV :</strong> il fuit vers la glacière par la porte de service. Le module vous prévient à ces seuils.</p>
<h2>Trois plans qui doivent fonctionner</h2>
${table(["Plan des PJ", "Résolution"], [
  ["On tient les foyers et on frappe", "Plan classique : il ne se régénère plus, les PJ l'usent. Deux PJ sur les Enneigés, trois sur lui."],
  ["On l'attire près du feu", "Fuyuko est l'appât idéal près de l'irori. Hyōe vient quand même : il veut la porte, pas la victoire."],
  ["On ouvre tout à l'aube", "Très bonne idée : à l'aube 8, ouvrir portes et volets met des cases intérieures au soleil (1,5 m derrière chaque ouverture ouverte). Hyōe y brûle s'il y finit son tour."],
])}
${tip("<strong>Dernier coup :</strong> laissez son auteur décrire la frappe. Puis la tête de Hyōe, en s'effritant, regarde la porte principale : « Ouvre… » Si Fuyuko est vivante, elle ouvre. La lumière du matin entre. Pas de confession obligatoire.")}`],

  ["end", "Branches et épilogue", `
<h1>Branches et épilogue</h1>
<h2>Quand les joueurs changent le plan</h2>
${table(["Ils…", "Réponse"], [
  ["démasquent Kōta dès la scène 2", "Bravo : Hyōe s'enfuit dans la tempête et le final commence plus tôt, avec moins de préparatifs. L'aube compte quand même 8 rounds."],
  ["l'attaquent avant qu'il se démasque", "Il encaisse, se démasque et passe au final. Personne n'est puni pour avoir vu juste."],
  ["l'enferment dans la glacière", "Il en sort au round suivant par une ouverture qu'il crée : la glacière n'a qu'une porte, mais des murs de planches."],
  ["mettent Fuyuko en sûreté loin de lui", "Il prend un autre civil adulte et crie son nom à elle depuis la tempête. Elle voudra sortir : un PJ doit la retenir."],
  ["mettent le feu à l'auberge", "Annoncez d'abord fumée et sorties. Zone en flammes : 1d4 dégâts à la fin du tour d'un occupant. Hyōe ne se régénère plus nulle part, mais les civils doivent sortir… dans la tempête."],
  ["attendent l'aube sans combattre", "Possible si les foyers tiennent : Hyōe se réfugie dans la glacière à l'aube. Les PJ peuvent l'y finir de jour en arrachant le toit de planches."],
])}
<h2>Tenir le temps</h2>
<p>Version courte : réunissez les indices par Onoda et Hina à 1 h 20 ; lancez le final à 1 h 50 ; à 2 h 50, si le combat traîne, annoncez que l'aube est à 6 et jouez la fuite. Ne réduisez jamais ses PV en secret.</p>
<h2>Issues</h2>
${table(["Issue", "Ce qui reste à jouer"], [
  ["Hyōe décapité, tous vivants", "Fuyuko ouvre la porte au matin. Elle demande aux PJ de l'accompagner au jizō, poser un bol pour Hyōe à côté de celui de la famille Odagiri."],
  ["Hyōe brûlé par l'aube", "Même chose ; il meurt en regardant la porte ouverte. Quelqu'un peut dire son nom."],
  ["Hyōe en fuite dans la glacière", "Le jour le piège. Les PJ arrachent le toit : la scène est courte, triste, sans combat."],
  ["Fuyuko morte dehors", "Nommez-la. Le lendemain, la porte de l'auberge reste ouverte toute la journée ; personne n'ose la fermer."],
])}
<h2>Tour d'épilogue (une minute chacun)</h2>
<p><strong>Akane</strong> choisit un feu qu'elle entretient · <strong>Tetsuya</strong> un repas qu'il prépare · <strong>Shion</strong> une personne qu'elle surveille · <strong>Masaomi</strong> ce qu'il écrit dans son rapport · <strong>Haru</strong> un couplet qu'il chante au jizō.</p>
<p>Questions de clôture : qui annonce à Fuyuko que Kōta est mort, et comment ? Que fait Onoda de son carnet ? Le Dr Ryōan reste-t-il pour soigner ? Que dit Tae à Hina ? <strong>La dernière parole revient à Hina, puis aux PJ.</strong></p>`],

  ["rules", "Règles et arbitrages", `
<h1>Règles et arbitrages</h1>
<p>Les fiches Breathe and Live 0.6 calculent PV, E, CA, RP et les bonus de talents (en combat : +3 Force, Finesse ou Intellect). Les jets se lancent depuis la fiche ; les formes de Souffle et les attaques ouvrent une carte de réaction pour la cible.</p>
${table(["Règle", "À la table"], [
  ["Jets", "Stat de base : d20 + (valeur − 1). Stat dérivée : d20 + score. Les talents sont ajoutés par la fiche."],
  ["Tour", "Déplacement 9 m + 1 action (Hyōe : 2). Soigner, rallumer un foyer, arracher un civil ou récupérer sont des actions."],
  ["Attaque de base", "d20 + Force ou Finesse contre CA, égalité suffisante. Pas de coût d'endurance."],
  ["Forme de Souffle", "1 action, coût en E payé même si esquivée, touche sans jet sauf esquive permise."],
  ["Esquive", "1 RP : esquive automatique d'une attaque esquivable. Sans RP : évitement d20 + Finesse strictement supérieur au jet."],
  ["Porter secours", "2 RP : tirer vers soi une personne à 1,5 m, hors d'une attaque ou des mains de Hyōe (avant qu'il l'agrippe)."],
  ["Récupération", "1 action hors Concentration : +1d8 E. Aucun PV. Les RP reviennent après 8 h de repos seulement."],
  ["Soins", "1 action au contact + 1 consommable. Connaissances médicales : option 1d6 + 2, sans cumul."],
  ["À zéro", "0 E : aucune attaque, récupération obligatoire. 0 PV : mort selon le livre (voir variante)."],
])}
<h2>Conventions de la soirée</h2>
${table(["Point", "Convention"], [
  ["Initiative", "d20 + Vitesse − 1, ordre décroissant ; égalité : Vitesse brute, puis PJ."],
  ["Concentration intégrale", "Activer ou arrêter gratuitement sur son tour ; maintien 1 E à la fin du tour."],
  ["Endurance", "Coût payé à l'annonce. Entre deux scènes sûres (après Kozō, avant le final), 5 min suffisent à remplir E."],
  ["Décapitation", "Annoncer la tête avant les dégâts : une frappe Nichirin qui ramène à 0 PV décapite. Sinon le démon est inerte ; l'achever demande 1 action au contact."],
  ["Neige profonde", "Dehors, chaque case coûte le double de déplacement. Le Souffle du Serpent l'ignore ; Haru (raquettes) aussi."],
  ["Brume", "Le Souffle de la Brume laisse un voile où Shion peut se cacher (bonus de CA doublé) : à appliquer depuis la fiche."],
  ["Soleil", "À l'aube 8 : dehors et à 1,5 m derrière une ouverture ouverte. Un démon qui y finit son tour brûle et meurt."],
])}
${tip("<strong>Variante recommandée pour ce one-shot,</strong> à convenir avant la partie : à 0 PV, un PJ est mourant jusqu'à la fin de son prochain tour ; un soin le sauve. Sans accord explicite, gardez la mort immédiate du livre.")}`],

  ["module", "Utiliser le module", `
<h1>Utiliser le module</h1>
<h2>Après l'import</h2>
<p>Tout est rangé dans un dossier <strong>Ce que la neige efface</strong> dans chaque onglet (acteurs, objets, journaux, scènes, macros). Les tokens des deux scènes pointent déjà vers les acteurs importés.</p>
<ul>
<li>Donnez à chaque joueur la propriété (Propriétaire) de son prétiré.</li>
<li>Sur la scène de l'auberge, Hyōe porte le visage de Kōta : nom et image de Kōta, barres de vie invisibles pour les joueurs.</li>
<li>Trois Enneigés sont cachés dans la glacière pour le combat facultatif.</li>
<li>Les pastilles (A à I, et deux au col) ouvrent la description de chaque lieu.</li>
</ul>
<h2>Le tableau de bord</h2>
<p>@Neige[dashboard]{Ouvrir le tableau de bord} (aussi dans les macros et les réglages du module). Il suit :</p>
<ul>
<li>les <strong>quatre conclusions</strong> de l'enquête et les <strong>six préparatifs</strong> ;</li>
<li>le <strong>masque</strong> : un clic remplace le token de Kōta par Hyōe ;</li>
<li>l'<strong>aube</strong>, avancée automatiquement à chaque fin de round une fois le final démarré ; à 8, la scène s'éclaire ;</li>
<li>les <strong>foyers</strong> : allumer ou éteindre une lumière de la scène ; Hyōe se régénère seul en début de tour s'il est loin de tout foyer allumé ; les Enneigés fondent en fin de round près d'un feu ;</li>
<li>l'<strong>Appel de la neige</strong> : choisit l'ouverture, dépense 4 BDP, ouvre la porte et place deux Enneigés ; un Enneigé à 0 PV disparaît ;</li>
<li>les <strong>civils</strong> : à l'abri, agrippé, dehors (2 dégâts par fin de round), soin du Dr Ryōan ;</li>
<li>les alertes de Hyōe à 60 et 25 PV, et sa mort (tous les Enneigés fondent).</li>
</ul>
<h2>Montrer les pièces aux joueurs</h2>
<p>@Neige[handout]{Montrer une pièce} ou le journal <em>Pièces à remettre</em>, bouton « Montrer aux joueurs ».</p>
<p><small>Les illustrations de cette version sont des brouillons générés automatiquement : les chemins et dimensions resteront stables quand elles seront repeintes.</small></p>`],
];

const ZONES = [
  ["A", "A · Genkan", "Entrée dallée, étagère à chaussures, brasero. La grande porte de bois donne sur la cour.", "Onoda y veille toute la nuit. À l'intérieur de la porte, à hauteur d'homme, de vieilles griffures noircies : les marques de Hyōe, il y a vingt ans.", "Brasero (foyer). Porte principale : ouverture par laquelle les Enneigés peuvent entrer. C'est la porte que Hyōe veut voir fermée sur Fuyuko."],
  ["B", "B · Salle commune", "Tatamis, grand irori central, poutres noircies de suie. Le cœur chaud de l'auberge.", "Dîner de la scène 2. Kōta s'assoit toujours au coin le plus éloigné du feu, près du volet sud.", "Grand irori (foyer). Le meilleur refuge pour les civils. Volet de la salle : ouverture."],
  ["C", "C · Cuisine", "Sol de terre battue, fourneau, réserves, porte de service verrouillée vers la glacière.", "Yaeko et les plateaux intacts. Kuma refuse les restes touchés par Kōta. « Il n'entre jamais quand le fourneau est allumé. »", "Fourneau (foyer). Porte de service : ouverture, et chemin de fuite de Hyōe vers la glacière (clé de Yaeko)."],
  ["D", "D · Chambres", "Trois chambres à futons séparées par des fusuma.", "Tae veille sans dormir, Hina dessine à la lanterne. Le Dr Ryōan cache sa mallette sous son futon.", "Volet des chambres : ouverture. Une pièce froide : aucun foyer, Hyōe s'y régénère."],
  ["E", "E · Bureau de l'okami", "Bureau bas, coffre, autel des ancêtres, registres.", "La lettre de Kōta sur l'autel ; le registre de Meiji 29, relu cent fois.", "Aucun foyer. Passage entre les chambres et la cuisine."],
  ["F", "F · Bains intérieurs", "Grand baquet de cèdre, chaudière en fonte, vapeur.", "Porte du bain vers le bassin extérieur, celle qu'Ichirō a prise.", "Chaudière (foyer). Porte du bain : ouverture."],
  ["G", "G · Cour et sentier", "Neige jusqu'aux genoux, lanterne rouge au-dessus de la porte, sentier vers le col.", "Arrivée des PJ. Le froid rend la buée de chacun visible… sauf celle de Kōta.", "Neige profonde : déplacement doublé. Les civils jetés dehors y tombent. Au soleil à l'aube 8."],
  ["H", "H · Bain extérieur", "Bassin de source chaude entouré de rochers, à vingt pas de la porte du bain.", "Sandales et serviette d'Ichirō. Une seule ligne de pas vers le bassin. Survie ou Nature DD 12 : traîne vers la glacière.", "Dehors. La vapeur du bassin cache les silhouettes (attaques à distance au-delà de 6 m : −2)."],
  ["I", "I · Glacière", "Remise de planches à demi enterrée, blocs de glace sous la paille.", "Affaires des disparus, sac et billet de Kōta, plaque de guide de Hyōe, corps d'Ichirō. Trois Enneigés cachés (combat facultatif).", "Refuge de Hyōe à l'aube : sans fenêtre, il y échappe au soleil jusqu'à ce qu'on arrache le toit."],
  ["J", "Abri du jizō", "Petit abri de pierre au bord du sentier, une statue de jizō au bonnet rouge.", "Offrande récente : « Pardon. Nous aurions dû ouvrir. — F. » Sous la neige, la stèle de la famille Odagiri, morte ici en Meiji 29.", "Le Dr Ryōan s'y est réfugié quand Kozō a attaqué."],
  ["T", "Traîneau renversé", "Le traîneau du Dr Ryōan, couché dans la neige, ballots éparpillés.", "Le porteur a été tué par Kozō : griffures nettes, beaucoup de sang. Rien de commun avec les disparitions du col, qui ne laissent aucune trace.", "Couvert léger pour le combat d'apprentissage."],
];

const HANDOUTS = [
  ["mission", "Ordre de mission", "À montrer au début de la partie. Fubuki le crie au groupe."],
  ["lettre", "Lettre de Kōta", "Bureau de l'okami (E). Comparer la date au jour d'arrivée du « Kōta » de l'auberge."],
  ["registre", "Page du registre", "Bureau de l'okami (E), ou quand Fuyuko avoue."],
  ["dessin", "Dessin de Hina", "Chambres (D), à qui le lui demande gentiment."],
  ["carnet", "Carnet d'Onoda", "Genkan (A), quand Onoda accepte de parler."],
  ["billet", "Billet de train", "Glacière (I), dans le sac de Kōta."],
];
export const HANDOUT_TEXT = {
  mission: "Kaa ! Ordre du Corps ! Col de Shirakami, préfecture de Nagano. Trois voyageurs disparus en dix jours. Un Kakushi a trouvé un traîneau vide et rien d'autre, pas même du sang. Rejoindre l'auberge Yukimi-ya avant la tempête. Protéger les vivants. Trouver le démon. Kaa !",
  lettre: "Mère, j'ai enfin obtenu mon congé. Je prendrai le train du soir pour Matsumoto le 14 et je monterai au col le 15 au matin. Gardez-moi du riz aux châtaignes. Votre fils, Kōta.",
  registre: "Meiji 29, 12e mois, 3e jour. Tempête. Vers minuit, on a frappé longtemps. Une voix d'homme disait qu'une famille attendait au jizō. Mon mari a dit que c'était la ruse des brigands et a barré la porte. Les coups ont cessé avant l'aube. Au matin, des griffures dans le bois, et personne. F. H.",
  dessin: "Dessin d'enfant au crayon : tout le monde assis autour du feu, chacun avec un petit nuage devant la bouche. Sauf Kōta-niisan. Kuma aboie dans un coin. Signé « Hina, 7 ans ».",
  carnet: "Nuit du 13 au 14. 22 h 00 : M. Kanzaki sort vers le bain. 22 h 40 : pas revenu. 2 h 10 : le fils Hamura sort par la porte du bain, sans manteau ni lanterne. Moins quinze degrés. 2 h 40 : rentre. Je vérifie : neige fraîche, aucune trace hors des miennes. À éclaircir. M. O.",
  billet: "Chemins de fer de l'État. Troisième classe. Shinjuku → Matsumoto. Poinçonné le 11.",
};

const PREGEN_TEXT = {
  akane: ["Tu tends les mains vers chaque feu que tu croises, même en été.", "Approche-toi du feu. Personne ne reste dehors.",
    "Fille d'un forgeron de Seki. L'hiver de tes quinze ans, un démon a attaqué le village : ton père a tenu la forge allumée toute la nuit et les voisins se sont serrés autour d'elle. Le démon n'a pas osé entrer dans la lumière. Ton père est mort de ses blessures au lever du soleil. Tu crois aux feux qu'on entretient pour les autres.",
    "Que personne n'ait froid tant que tu tiens debout.", "Quand tu as peur pour quelqu'un, tu décides à sa place. Demande-lui plutôt ce dont il a besoin.",
    "La troisième nuit de la Sélection, tu as porté Shion sur ton dos jusqu'au feu : elle fait comme si elle l'avait oublié. Haru t'a appris à faire un feu qui tient sous la neige.",
    "Tiens les foyers : près d'un feu allumé, le démon de cette histoire pourrait être affaibli. Feu Inconscient (2 E) est ton coup fiable ; une forme de la Flamme lancée près d'un foyer éteint pourra le rallumer. Garde tes RP pour tirer les civils à l'abri."],
  tetsuya: ["Tu goûtes tout ce qu'on te sert, et tu regardes qui ne goûte pas.", "Mangez d'abord. On réfléchira mieux.",
    "Commis dans une auberge d'Osaka, tu as servi pendant une semaine un client qui ne touchait jamais à son plateau. Tu l'avais remarqué ; tu n'as rien dit. Une nuit, il a dévoré le cuisinier. Tu as survécu caché dans la réserve à riz. Depuis, tu dis ce que tu vois, même quand c'est gênant.",
    "Remarquer à temps, et le dire.", "Tu veux que tout le monde soit d'accord avant d'agir. Parfois, il faut agir d'abord.",
    "Masaomi t'a appris à noter des faits plutôt que des impressions. Shion se moque de ta cuisine mais finit toujours ton plat.",
    "Ton nez et ton expérience de cuisine sont des outils d'enquête : qui mange, qui ne mange pas, qui ne sent rien ? En combat, la réaction du Souffle de l'Eau peut dévier un projectile. Surface de l'eau coupée (3 E) est économique."],
  shion: ["Tu t'assois toujours dos au mur, près d'une fenêtre.", "Je passe par le toit. Ne m'attendez pas.",
    "Acrobate de rue à Asakusa. Un soir, un démon a dévoré le patron de ta troupe sous tes yeux ; tu t'es enfuie par les toits et tu n'as jamais cessé de courir. La Sélection finale t'a appris une chose : seule, tu serais morte la troisième nuit. Akane t'a portée.",
    "Être là où personne ne regarde, pour voir ce que les autres ratent.", "Tu pars seule sans prévenir. Dis au moins où tu vas.",
    "Tu dois la vie à Akane et tu ne le lui as jamais dit. Les chansons de Haru t'ennuient ; tu les connais toutes par cœur.",
    "Éclaireuse : visite les lieux que les autres n'atteignent pas. Ta CA est la meilleure du groupe et tu as 12 RP : utilise-les pour Porter secours (2 RP). La Brume te permet de te cacher dans son voile."],
  masaomi: ["Tu sors ton carnet avant de dire bonjour.", "À quelle heure, exactement ?",
    "Agent de police à Sendai, tu assistais le médecin légiste. Ton supérieur a classé « mort de froid » un corps couvert de morsures. Tu as démissionné le lendemain et le Corps t'a trouvé. Tu connais la loi Haitōrei : tu sais que tes camarades sont hors-la-loi, et comment parler à un gendarme.",
    "Que la vérité soit écrite quelque part.", "Tu interroges les gens comme des suspects, même les victimes. Pense à demander comment ils vont.",
    "Tetsuya note maintenant les faits comme toi : tu en es fier. Haru raconte, tu écris : vous faites de bons rapports.",
    "Ta Médecine est la plus haute du groupe : soigne et examine les corps. Ta CA est faible (10) : reste derrière Akane. Face à un gendarme, parle procédure et preuves."],
  haru: ["Tu chantes à voix basse quand le vent forcit.", "Dans la montagne, on ouvre toujours à qui frappe.",
    "Guide de montagne à Hokkaidō, comme ton père. Le code des guides tient en une phrase : on ouvre toujours la porte à qui frappe dans la tempête. Ton frère aîné est mort dans un blizzard en cherchant des voyageurs perdus ; son corps n'a été retrouvé qu'au printemps. Les démons t'ont trouvé plus tard. Tu connais les chansons des guides de tout le pays.",
    "Que la montagne rende ceux qu'elle a pris.", "Tu racontes une histoire au lieu de répondre. Parfois, il faut juste dire oui ou non.",
    "Tu as appris à Akane à faire un feu sous la neige. Masaomi écrit tes histoires dans ses rapports, en les raccourcissant.",
    "Tu lis la neige mieux que personne (traces, profondeur, temps) et tu te déplaces sans peine dans la neige profonde. Ton Souffle de la Neige réduit la CA de ta cible : frappe avant tes camarades. Social 5 : parle aux témoins, et peut-être au démon."],
};

function pregenPage(p) {
  const [gesture, quote, story, want, flaw, links, advice] = PREGEN_TEXT[p.key];
  return wrap(`<div class="neige-pregen"><img src="${ART}/portraits/${p.key}.webp" alt="${p.name}">
<div><h1>${p.name}</h1><p class="neige-lead">${p.age} · ${p.role} · ${p.breathName}</p>
<p>${gesture} <em>« ${quote} »</em></p></div></div>
<p>${story}</p>
<p><strong>Tu veux :</strong> ${want}<br><strong>Ton travers :</strong> ${flaw}</p>
<h2>Liens</h2><p>${links}</p>
<h2>Conseil de jeu</h2><p>${advice}</p>
<p><small>Formation : ${p.trainer} Corbeau : ${p.crow}.</small></p>`);
}

const PLAYER_PAGES = [
  ["mission", "Mission et tour de jeu", `
<img class="neige-banner" src="${ART}/art/banner.webp" alt="">
<h1>Aide des pourfendeurs</h1>
<p>Vous êtes <strong>les cinq de la Sélection</strong> : sur le mont Fujikasane, au printemps dernier, vous avez survécu sept nuits en partageant un seul feu. Vous vous êtes juré une chose : <em>personne ne reste dehors</em>. Le Corps vous envoie ensemble, rang Mizunoto, au col de Shirakami : trois voyageurs y ont disparu en dix jours.</p>
<h2>Annoncer une action</h2>
<p>Dites ce que vous cherchez à obtenir, puis comment : « Je sors avec lui chercher du bois et je regarde son souffle » plutôt que « Je fais Perception ». Une action évidente et sans risque ne demande pas de jet. Le MJ annonce la difficulté et la conséquence avant un jet risqué.</p>
${table(["Situation", "Que faire ?"], [
  ["Votre tour", "Déplacement 9 m + 1 action. Parler brièvement est libre ; soigner, rallumer un feu ou récupérer prend l'action."],
  ["Attaque de base", "Depuis la fiche : d20 + bonus contre CA ; égal ou supérieur, les dégâts sont lancés."],
  ["Forme de Souffle", "Depuis la fiche : payer l'E indiquée, pas de jet d'attaque, la cible peut esquiver sauf mention contraire."],
  ["Esquive", "1 RP par attaque esquivable, avant les dégâts. Sans RP : évitement d20 + Finesse, strictement supérieur au jet."],
  ["Porter secours", "2 RP : tirer vers vous une personne à 1,5 m, hors d'une attaque."],
  ["Récupérer", "Hors Concentration, 1 action = +1d8 E. Aucun PV."],
  ["Soigner", "1 action au contact et un consommable de la fiche."],
])}
<h2>Trois réserves différentes</h2>
<p><strong>PV</strong> : les blessures ; à 0, mort selon le livre sauf variante annoncée. <strong>E</strong> : l'effort ; à 0, pas d'attaque et récupération obligatoire. <strong>RP</strong> : les défenses immédiates ; elles reviennent après huit heures de repos, pas après un combat.</p>
<p><small>Une frappe Nichirin annoncée à la tête décapite si elle ramène le démon à 0 PV. Seuls le soleil et la décapitation tuent un démon.</small></p>`],
  ["team", "L'auberge et vos rôles", `
<h1>L'auberge Yukimi-ya</h1>
<img src="${ART}/maps/auberge-plan.webp" alt="Plan de l'auberge Yukimi-ya">
<p>A · Genkan (entrée) — B · Salle commune — C · Cuisine — D · Chambres — E · Bureau de l'okami — F · Bains intérieurs — G · Cour — H · Bain extérieur — I · Glacière.</p>
${table(["Personnage", "Demandez-lui de…"], [
  ["Akane · Flamme", "tenir une pièce, protéger les civils, entretenir les feux."],
  ["Tetsuya · Eau", "remarquer les détails de la vie quotidienne, coordonner, dévier un tir."],
  ["Shion · Brume", "aller voir ailleurs, discrètement, et revenir vite."],
  ["Masaomi · Serpent", "examiner, soigner, parler au gendarme."],
  ["Haru · Neige", "lire la neige et les traces, parler aux gens, chanter."],
])}
<p>Il fait moins quinze degrés dehors. Dans le froid, le souffle de chaque être vivant fait de la buée. Regardez les gens. Écoutez les chiens. Demandez qui a faim.</p>
<p>Vous n'êtes pas obligés de tout résoudre seuls : les habitants connaissent leur maison. Si une description devient inconfortable, demandez une pause ou une version moins détaillée.</p>`],
];

const OBSERVER = { default: 2 };
const text = (journal, key, name, html, sort) => ({ _id: P(journal, key), name, type: "text", sort, title: { show: false, level: 1 }, text: { format: 1, content: wrap(html) }, flags: { [MID]: { key } } });

export function buildJournals() {
  const sorted = (list, fn) => list.map((entry, i) => fn(entry, (i + 1) * 100000));
  return [
    { _id: JOURNAL_IDS.guide, name: "Ce que la neige efface — Guide du MJ", sort: 100000,
      pages: sorted(GUIDE, ([key, name, html], sort) => text("guide", key, name, html, sort)), flags: { [MID]: { key: "guide" } } },
    { _id: JOURNAL_IDS.zones, name: "Auberge Yukimi-ya — lieux", sort: 200000,
      pages: sorted(ZONES, ([key, name, what, investigation, finale], sort) => text("zones", key, name,
        `<h1>${name}</h1><p class="neige-lead">${what}</p><h2>Pendant l'enquête</h2><p>${investigation}</p><h2>Pendant le final</h2><p>${finale}</p>`, sort)),
      flags: { [MID]: { key: "zones" } } },
    { _id: JOURNAL_IDS.handouts, name: "Pièces à remettre", sort: 300000,
      pages: sorted(HANDOUTS, ([key, name, gm], sort) => ({
        _id: P("handouts", key), name, type: "image", sort, src: `${ART}/handouts/${key}.webp`,
        image: { caption: HANDOUT_TEXT[key] }, title: { show: true, level: 1 }, flags: { [MID]: { key, gmNote: gm } },
      })), flags: { [MID]: { key: "handouts" } } },
    { _id: JOURNAL_IDS.players, name: "Aide des joueurs", sort: 400000, ownership: OBSERVER,
      pages: sorted(PLAYER_PAGES, ([key, name, html], sort) => text("players", key, name, html, sort)), flags: { [MID]: { key: "players" } } },
    { _id: JOURNAL_IDS.pregens, name: "Prétirés — qui êtes-vous ?", sort: 500000, ownership: OBSERVER,
      pages: sorted(PREGENS, (p, sort) => ({ _id: P("pregens", p.key), name: p.name, type: "text", sort, title: { show: false, level: 1 },
        text: { format: 1, content: pregenPage(p) }, flags: { [MID]: { key: p.key } } })), flags: { [MID]: { key: "pregens" } } },
  ];
}

export const ZONE_PAGE = key => ({ entryId: JOURNAL_IDS.zones, pageId: P("zones", key) });
export const HANDOUT_KEYS = HANDOUTS.map(h => h[0]);
