import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { qualityLabIllustrativeSamplePdf } from "../server/quality-lab-blueprint-pdf.js";

const outputDirectory = path.resolve("output/pdf");
const outputPath = path.join(outputDirectory, "atlas-quality-lab-blueprint-illustrative-sample.pdf");

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, await qualityLabIllustrativeSamplePdf());
process.stdout.write(`${outputPath}\n`);
