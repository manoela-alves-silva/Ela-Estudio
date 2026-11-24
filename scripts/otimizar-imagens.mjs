// Otimiza as fotos para o site.
// Entrada: fotos-originais/ (fotos grandes do celular, jpg/png/webp)
// Saída:   public/img/<nome>-<largura>.avif e .webp + public/img/fotos.json
//
// Uso: npm run imagens
//
// O nome do arquivo vira o nome da foto: "jump.jpg" -> data-foto="jump".
// Os metadados (incluindo localização GPS) são removidos automaticamente.
// Fotos pequenas (ex.: tiradas do Instagram, 640px) NÃO são ampliadas:
// ampliar só deixa o arquivo maior sem ganhar nitidez. O script gera só as
// larguras que a foto aguenta e grava a lista em public/img/fotos.json.
// Fotos que saíram de fotos-originais/ têm os arquivos antigos apagados.

import { readdir, mkdir, writeFile, unlink } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const ENTRADA = "fotos-originais";
const SAIDA = "public/img";
const LARGURAS = [480, 960, 1440];
const PROPORCAO = 4 / 5; // corta tudo em retrato 4:5, igual ao feed do Instagram

await mkdir(SAIDA, { recursive: true });

const arquivos = (await readdir(ENTRADA)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const fotos = {};
let total = 0;

for (const arquivo of arquivos) {
  const nome = parse(arquivo).name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const origem = join(ENTRADA, arquivo);

  // Maior largura possível mantendo 4:5 sem ampliar
  const meta = await sharp(origem).rotate().metadata();
  const [w, h] = (meta.orientation ?? 1) >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
  const maxima = Math.floor(Math.min(w, h * PROPORCAO));
  let larguras = LARGURAS.filter((l) => l <= maxima);
  // Foto menor que 1440: aproveita também a largura máxima dela (ex.: 640 do Instagram)
  if (maxima < LARGURAS.at(-1) && !larguras.includes(maxima)) larguras.push(maxima);

  for (const largura of larguras) {
    const base = sharp(origem)
      .rotate() // corrige foto deitada do celular
      .resize({ width: largura, height: Math.round(largura / PROPORCAO), fit: "cover", position: "attention" });

    const avif = await base.clone().avif({ quality: 50 }).toFile(join(SAIDA, `${nome}-${largura}.avif`));
    const webp = await base.clone().webp({ quality: 75 }).toFile(join(SAIDA, `${nome}-${largura}.webp`));
    total += avif.size + webp.size;
    console.log(`  ${nome}-${largura}: avif ${kb(avif.size)} · webp ${kb(webp.size)}`);
  }

  fotos[nome] = larguras;
  console.log(`✔ ${arquivo} -> ${nome} (${larguras.join(", ")} px)`);
}

// Remove arquivos de fotos que não existem mais
for (const f of await readdir(SAIDA)) {
  const m = f.match(/^(.+)-\d+\.(avif|webp)$/);
  if (m && !fotos[m[1]]) await unlink(join(SAIDA, f));
}

await writeFile(join(SAIDA, "fotos.json"), JSON.stringify(fotos, null, 2));
console.log(`\n${Object.keys(fotos).length} foto(s) prontas em ${SAIDA}/`);

function kb(bytes) { return `${Math.round(bytes / 1024)} KB`; }
