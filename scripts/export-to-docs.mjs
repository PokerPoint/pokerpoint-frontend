import { cp, rm, mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const out = join(root, "out");
const docs = join(root, "docs");
const domain = "www.pokerpoint.co.uk";

async function run() {
	if (!existsSync(out)) {
		throw new Error("out directory not found, run next build first");
	}

	let cname = domain;
	const existingCname = join(docs, "CNAME");
	if (existsSync(existingCname)) {
		cname = (await readFile(existingCname, "utf8")).trim() || domain;
	}

	await rm(docs, { recursive: true, force: true });
	await mkdir(docs, { recursive: true });
	await cp(out, docs, { recursive: true });
	await writeFile(join(docs, ".nojekyll"), "");
	await writeFile(join(docs, "CNAME"), `${cname}\n`);

	console.log(`Exported to docs/ with CNAME ${cname}`);
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
