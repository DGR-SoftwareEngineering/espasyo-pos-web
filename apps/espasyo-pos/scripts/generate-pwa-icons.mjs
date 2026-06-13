import sharp from "sharp";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, "../public/new-espasyo.png");
const outDir = join(__dirname, "../public/icons");

mkdirSync(outDir, { recursive: true });

await sharp(src).resize(192, 192).toFile(join(outDir, "icon-192x192.png"));
await sharp(src).resize(512, 512).toFile(join(outDir, "icon-512x512.png"));

console.log("PWA icons generated in public/icons/");
