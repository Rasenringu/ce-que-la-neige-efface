// Stages the installable module in dist/ce-que-la-neige-efface/ and zips it.
// The zip name is fixed so the manifest's download URL only changes with the tag.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import archiver from "archiver";

const manifest = JSON.parse(fs.readFileSync("module.json", "utf8"));
const id = manifest.id;
const stage = path.join("dist", id);
const INCLUDE = ["module.json", "README.md", "CHANGELOG.md", "LICENSE", "scripts", "styles", "assets", "packs"];
const SKIP = /(^|[\\/])(LOCK|LOG|LOG\.old)$|\.svg$/;

fs.rmSync(stage, { recursive: true, force: true });
for (const entry of INCLUDE) {
  if (!fs.existsSync(entry)) throw new Error(`Fichier manquant pour la release : ${entry}`);
  fs.cpSync(entry, path.join(stage, entry), { recursive: true, filter: src => !SKIP.test(src) });
}

const zipFile = path.join("dist", `${id}.zip`);
const archive = archiver("zip", { zlib: { level: 9 } });
const stream = fs.createWriteStream(zipFile);
archive.pipe(stream);
archive.directory(stage, id);
await archive.finalize();
await new Promise((resolve, reject) => { stream.on("close", resolve); stream.on("error", reject); });

fs.copyFileSync("module.json", path.join("dist", "module.json"));
const hash = crypto.createHash("sha256").update(fs.readFileSync(zipFile)).digest("hex");
fs.writeFileSync(path.join("dist", "SHA256SUMS"), `${hash}  ${path.basename(zipFile)}\n`);
console.log(`${zipFile} · ${(fs.statSync(zipFile).size / 1048576).toFixed(1)} Mo · SHA-256 ${hash}`);
