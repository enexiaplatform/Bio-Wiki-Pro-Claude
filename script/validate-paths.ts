import { readdir, readFile } from "fs/promises";
import path from "path";

// Guards the invariant that every Academy lesson belongs to exactly one
// learning path (client/src/data/learningPaths.ts). Catches drift when lessons
// are added but not assigned to a path, or assigned to two. CI-friendly.

const academyDir = path.resolve(process.cwd(), "content", "academy");
const pathsFile = path.resolve(process.cwd(), "client", "src", "data", "learningPaths.ts");

async function main() {
  const errors: string[] = [];

  const files = (await readdir(academyDir))
    .filter((f) => f.endsWith(".en.mdx"))
    .map((f) => f.replace(/\.en\.mdx$/, ""));
  const fileSet = new Set(files);

  const src = await readFile(pathsFile, "utf-8");
  // Every quoted token that matches an academy filename is a lesson reference.
  const refs = [...src.matchAll(/"([a-z0-9-]+)"/g)]
    .map((m) => m[1])
    .filter((s) => fileSet.has(s));

  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const r of refs) {
    if (seen.has(r)) dupes.add(r);
    seen.add(r);
  }
  const missing = files.filter((f) => !seen.has(f));

  if (dupes.size) errors.push(`Lessons assigned to more than one path: ${[...dupes].join(", ")}`);
  if (missing.length) errors.push(`Lessons not in any learning path: ${missing.join(", ")}`);

  console.log(`Academy lessons: ${files.length} · referenced in paths: ${seen.size}`);
  if (errors.length) {
    console.error("\n✗ Learning-path coverage invalid:");
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }
  console.log("✓ Every lesson is in exactly one learning path.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
