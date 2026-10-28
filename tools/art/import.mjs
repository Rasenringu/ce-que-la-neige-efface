import { importSource } from "./final.mjs";
const [id, input] = process.argv.slice(2);
if (!id || !input) throw new Error("Usage: node tools/art/import.mjs <source-id> <generated-image-path>");
const files = await importSource(id, input);
console.log(`${id}: ${files.join(", ")}`);
