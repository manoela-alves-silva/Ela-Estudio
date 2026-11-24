// Grava os GIFs do README com um Chrome sem janela (headless).
// Uso: com o site rodando (npm run dev), rode `npm run gifs`.
// Precisa do Google Chrome e do ffmpeg instalados.
// Saída: docs/gifs/<nome>.gif

import puppeteer from "puppeteer-core";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const SITE = process.env.SITE || "http://localhost:3000";
const CHROME = process.env.CHROME || "/usr/bin/google-chrome";
const SAIDA = "docs/gifs";
const so = process.argv.slice(2); // ex.: npm run gifs -- quiz celular

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function gravar(nome, { largura, altura, escala = 1, larguraGif, fps = 10 }, roteiro) {
  if (so.length && !so.includes(nome)) return;
  const pasta = await mkdtemp(join(tmpdir(), `gif-${nome}-`));
  const navegador = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars"] });
  const pagina = await navegador.newPage();
  await pagina.setViewport({ width: largura, height: altura, deviceScaleFactor: escala });
  await pagina.goto(SITE, { waitUntil: "networkidle0" });
  await espera(1200);
  // Mostra de uma vez o que entraria com animação ao rolar (os quadros não são em tempo real)
  await pagina.evaluate(() => document.querySelectorAll("[data-revelar]").forEach((el) => el.classList.add("visivel")));
  // Congela a flutuação dos objetos 3D: no GIF ela faria cada quadro mudar inteiro (arquivo enorme)
  await pagina.addStyleTag({ content: ".obj3d { animation: none !important; }" });

  let n = 0;
  const quadro = async (repetir = 1) => {
    const png = await pagina.screenshot({ type: "png" });
    for (let i = 0; i < repetir; i++) await writeFile(join(pasta, `${String(n++).padStart(4, "0")}.png`), png);
  };
  const segurar = (segundos) => quadro(Math.round(segundos * fps));
  const rolarAte = async (alvoY, passo = 60) => {
    let y = await pagina.evaluate(() => scrollY);
    const dir = Math.sign(alvoY - y);
    while (Math.abs(alvoY - y) > passo) {
      y += dir * passo;
      await pagina.evaluate((v) => scrollTo(0, v), y);
      await espera(40);
      await quadro();
    }
    await pagina.evaluate((v) => scrollTo(0, v), alvoY);
    await espera(150);
    await quadro();
  };
  const topoDe = (seletor, folga = 90) => pagina.$eval(seletor, (el, f) => el.getBoundingClientRect().top + scrollY - f, folga);
  const irPara = async (seletor, folga = 70) => { const y = await topoDe(seletor, folga); await pagina.evaluate((v) => scrollTo(0, v), y); await espera(400); };
  const clicar = async (seletor, segundos = 0.9) => { await pagina.click(seletor); await espera(450); await segurar(segundos); };

  await roteiro({ pagina, quadro, segurar, rolarAte, topoDe, clicar, espera, irPara });
  await navegador.close();

  await mkdir(SAIDA, { recursive: true });
  const destino = join(SAIDA, `${nome}.gif`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", join(pasta, "%04d.png"),
    "-vf", `scale=${larguraGif}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`,
    "-loop", "0", destino]);
  await rm(pasta, { recursive: true, force: true });
  console.log(`✔ ${destino}`);
}

const DESKTOP = { largura: 1280, altura: 760, larguraGif: 800 };

await gravar("visao-geral", DESKTOP, async ({ pagina, segurar, rolarAte, espera }) => {
  await segurar(1.2);
  await pagina.hover(".hero__acoes .btn--primario"); await espera(400); await segurar(1); // neon no hover
  await pagina.mouse.move(5, 5);
  const fim = await pagina.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  await rolarAte(fim, 170);
  await segurar(1);
});

await gravar("horarios", DESKTOP, async ({ pagina, segurar, rolarAte, topoDe, clicar, irPara }) => {
  await irPara("#horarios");
  await segurar(1);
  await clicar('.dia[data-dia="qua"]');
  await clicar('#filtros [data-filtro="mobilidade"]');
  await clicar('.dia[data-dia="sab"]');
  await clicar('#filtros [data-filtro="todas"]');
  await clicar('.dia[data-dia="seg"]', 1.2);
});

await gravar("quiz", DESKTOP, async ({ pagina, segurar, rolarAte, topoDe, clicar, espera, irPara }) => {
  await irPara("#quiz");
  await segurar(1);
  for (const i of [1, 0, 0]) {
    const opcoes = await pagina.$$("#quiz-caixa [data-opcao]");
    await opcoes[i].hover(); await espera(250); await segurar(0.5);
    await opcoes[i].click(); await espera(450); await segurar(0.6);
  }
  await segurar(1.2);
  await clicar("#quiz-caixa [data-whatsapp]", 2.5);
  await clicar("#demo-whats form .btn", 0.6);
});

await gravar("planos", DESKTOP, async ({ pagina, segurar, rolarAte, topoDe, clicar, irPara }) => {
  await irPara("#planos");
  await segurar(1);
  await clicar('#periodos [data-periodo="trimestral"]', 1.2);
  await clicar('#periodos [data-periodo="semestral"]', 1.2);
  await rolarAte((await topoDe(".planos", 140)), 40);
  await clicar(".plano--destaque [data-link]", 2.5);
  await clicar("#demo-whats form .btn", 0.6);
});

await gravar("celular", { largura: 390, altura: 780, escala: 2, larguraGif: 360 }, async ({ pagina, segurar, rolarAte, topoDe, clicar, espera, quadro }) => {
  await segurar(1.2);
  await clicar(".menu-botao", 1.2);
  await clicar(".menu-botao", 0.4);
  await rolarAte(await topoDe("#modalidades", 60), 140);
  // arrasta o carrossel das modalidades para o lado
  for (let i = 0; i < 2; i++) {
    await pagina.$eval("#lista-modalidades", (el) => el.scrollBy({ left: el.clientWidth * 0.84, behavior: "smooth" }));
    for (let k = 0; k < 6; k++) { await espera(80); await quadro(); }
    await segurar(0.6);
  }
  await rolarAte(await topoDe("#horarios", 60), 140);
  await segurar(1);
  await rolarAte(await topoDe("#planos", 60), 140);
  await segurar(1.2);
});
