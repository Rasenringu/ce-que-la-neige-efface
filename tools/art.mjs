// Renders every draft image of the module into assets/ (no network, no API key).
// The drafts keep final paths and sizes so repainted art can replace them 1:1.
import { renderPeople } from "./art/people.mjs";
import { renderPaper } from "./art/paper.mjs";
import { renderMaps } from "./art/maps.mjs";

const only = process.argv[2];
const steps = { people: renderPeople, paper: renderPaper, maps: renderMaps };
let total = 0;
for (const [name, step] of Object.entries(steps)) {
  if (only && only !== name) continue;
  const started = Date.now();
  const files = await step();
  total += files.length;
  console.log(`${name} : ${files.length} images (${((Date.now() - started) / 1000).toFixed(1)} s)`);
}
console.log(`${total} images générées dans assets/`);
