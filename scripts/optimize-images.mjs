import fs from "fs";
import path from "path";
import sharp from "sharp";

const srcDir = String.raw`C:\Users\40034\.cursor\projects\e-MyProjects-estate-manager\assets`;
const outs = ["public/img/generated", "src/img/generated"];
for (const dir of outs) fs.mkdirSync(dir, { recursive: true });

const files = fs.readdirSync(srcDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
const jobs = files.map((file) => ({ file, name: path.parse(file).name }));
const cellar = files.find((f) => f.startsWith("onboard-4"));
if (cellar) jobs.push({ file: cellar, name: "room-cellar" });

for (const job of jobs) {
  const input = path.join(srcDir, job.file);
  const avatar = job.name.startsWith("avatar-") || job.name.startsWith("empty-");
  const widths = avatar ? [480, 960, 1440] : [1280, 1920, 2400];
  const suffixes = ["", "@2x", "@3x"];
  const image = sharp(input);
  const meta = await image.metadata();
  for (let i = 0; i < widths.length; i++) {
    const width = Math.min(widths[i], meta.width ?? widths[i]);
    const buf = await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 76 }).toBuffer();
    for (const dir of outs) {
      fs.writeFileSync(path.join(dir, `${job.name}${suffixes[i]}.webp`), buf);
    }
  }
  console.log(job.name, meta.width, meta.height);
}
