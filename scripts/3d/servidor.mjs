// Estúdio de render dos objetos 3D da Elã.
// Uso: npm run render:3d  → abra http://localhost:3020 no navegador.
// A página monta cada objeto com Three.js, renderiza com fundo transparente
// e envia o PNG para cá, que salva em fotos-originais/3d/<nome>.png.
// Depois rode `npm run imagens:3d` para gerar os WebP leves do site.
// O Three.js só é usado aqui, para fabricar as imagens: o site final não carrega 3D em tempo real.

import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SAIDA = join(RAIZ, "fotos-originais", "3d");
const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript" };
const ARQUIVOS = {
  "/": join(RAIZ, "scripts/3d/estudio.html"),
  "/estudio.js": join(RAIZ, "scripts/3d/estudio.js"),
  "/three.module.js": join(RAIZ, "node_modules/three/build/three.module.js"),
  "/three.core.js": join(RAIZ, "node_modules/three/build/three.core.js"),
};

await mkdir(SAIDA, { recursive: true });

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "POST" && url.pathname === "/salvar") {
    const nome = (url.searchParams.get("nome") || "").replace(/[^a-z0-9-]/g, "");
    if (!nome) return res.writeHead(400).end("nome inválido");
    const partes = [];
    for await (const p of req) partes.push(p);
    const base64 = Buffer.concat(partes).toString().replace(/^data:image\/png;base64,/, "");
    await writeFile(join(SAIDA, `${nome}.png`), Buffer.from(base64, "base64"));
    console.log(`✔ fotos-originais/3d/${nome}.png`);
    return res.writeHead(200).end("ok");
  }

  const arquivo = ARQUIVOS[url.pathname];
  if (!arquivo) return res.writeHead(404).end();
  res.writeHead(200, { "Content-Type": TIPOS[extname(arquivo)] || "text/html; charset=utf-8", "Cache-Control": "no-store" });
  res.end(await readFile(arquivo));
}).listen(3020, "127.0.0.1", () => console.log("Estúdio 3D em http://localhost:3020"));
