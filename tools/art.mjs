// Reproduce the selected generated artwork without overwriting it with drafts.
import { renderFinals } from "./art/final.mjs";
const files = await renderFinals(process.argv[2]);
console.log(`${files.length} illustrations finales préparées dans assets/`);
