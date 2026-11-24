// Otimiza os objetos 3D (PNG com fundo transparente) para o site.
// Entrada: fotos-originais/3d/*.png (gerados por `npm run render:3d`)
// Saída:   public/img/3d/<nome>.webp + public/img/3d/objetos.json (lista de nomes)
//
// Uso: npm run imagens:3d
// Corta a margem transparente, limita a 600 px e mantém a transparência.

import { readdir, mkdir, writeFile, rm } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const ENTRADA = "fotos-originais/3d";
const SAIDA = "public/img/3d";

await rm(SAIDA, { recursive: true, force: true });
await mkdir(SAIDA, { recursive: true });

const arquivos = (await readdir(ENTRADA)).filter((f) => /\.png$/i.test(f));
const nomes = [];

for (const arquivo of arquivos) {
  const nome = parse(arquivo).name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const info = await sharp(join(ENTRADA, arquivo))
    .trim({ threshold: 1 }) // tira a margem transparente
    .resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(join(SAIDA, `${nome}.webp`));
  nomes.push(nome);
  console.log(`✔ ${nome}.webp · ${info.width}×${info.height} · ${Math.round(info.size / 1024)} KB`);
}

await writeFile(join(SAIDA, "objetos.json"), JSON.stringify(nomes.sort()) + "\n");
console.log(`\n${nomes.length} objeto(s) 3D prontos em ${SAIDA}/`);
