import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("out");
fs.mkdirSync(outDir, { recursive: true });

const filesToCopy = ["manifest.json", "README.md", "LICENSE.TXT"];

for (const file of filesToCopy) {
	const src = path.resolve(file);
	if (fs.existsSync(src)) {
		fs.copyFileSync(src, path.join(outDir, path.basename(file)));
	}
}
