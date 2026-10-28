// Validate release metadata locally and in Actions. No publication happens here.
import fs from "node:fs";
import assert from "node:assert/strict";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const manifest = read("module.json");
const pkg = read("package.json");
const lock = read("package-lock.json");
const tag = `v${manifest.version}`;
assert.match(manifest.version, /^\d+\.\d+\.\d+$/, "Version stable X.Y.Z requise");
assert.equal(pkg.version, manifest.version, "Versions package/module différentes");
assert.equal(lock.version, manifest.version, "Version du lock différente");
assert.equal(lock.packages[""].version, manifest.version, "Version racine du lock différente");
if (process.env.GITHUB_REF_TYPE === "tag") assert.equal(process.env.GITHUB_REF_NAME, tag, "Tag différent de la version");
const repository = process.env.GITHUB_REPOSITORY || "Rasenringu/ce-que-la-neige-efface";
assert.equal(manifest.download, `https://github.com/${repository}/releases/download/${tag}/${manifest.id}.zip`);
assert.equal(manifest.manifest, `https://github.com/${repository}/releases/latest/download/module.json`);
const section = fs.readFileSync("CHANGELOG.md", "utf8").split(/^## /m).find(s => s.split(/\r?\n/, 1)[0].trim() === manifest.version);
assert.ok(section, `Notes de version manquantes pour ${tag}`);
fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/NOTES.md", section.replace(/^.*\r?\n/, "").trim() + "\n");
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `tag=${tag}\n`);
console.log(`${tag} : versions, URLs et notes vérifiées`);
