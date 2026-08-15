import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const roots = ["client/src", "server", "shared"];
const extensions = new Set([".ts", ".tsx"]);
const unsafeDirectPush = /\b(?:npm\s+run\s+)?db:push\b/i;

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return extensions.has(path.extname(entry.name)) ? [target] : [];
  }));
  return nested.flat();
}

const files = (await Promise.all(roots.map(sourceFiles))).flat();
const violations: string[] = [];

for (const file of files) {
  const lines = (await readFile(file, "utf8")).split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (unsafeDirectPush.test(line)) violations.push(`${file}:${index + 1}`);
  }
}

if (violations.length > 0) {
  console.error("Unsafe direct schema-push guidance found in application source:");
  for (const violation of violations) console.error(`  ${violation}`);
  console.error("Use the protected schema audit and an approved versioned migration instead.");
  process.exit(1);
}

console.log(`Operational safety copy is clean across ${files.length} application files.`);
