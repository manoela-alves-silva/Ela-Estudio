// Fotos responsivas e leves.
// O script `npm run imagens` gera, para cada foto original, versões em AVIF e WebP
// em até 3 larguras (ex.: img/jump-480.avif, img/jump-960.webp...).
// Fotos pequenas não são ampliadas: o script grava em img/fotos.json
// quais larguras existem de cada foto.
// Aqui montamos um <picture> e o navegador baixa só o formato e o tamanho que precisa.

import { esc } from "./util.js";

const PROPORCAO = 5 / 4; // altura / largura (retrato 4:5)

// { "jump": [480, 960], ... }. Enquanto uma foto não estiver na lista,
// aparece um espaço reservado com o nome dela, em vez de imagem quebrada.
let disponiveis = {};

export async function carregarListaDeFotos() {
  try {
    const r = await fetch("img/fotos.json");
    if (!r.ok) return;
    const lista = await r.json();
    // Formato antigo (só nomes) continua funcionando
    disponiveis = Array.isArray(lista) ? Object.fromEntries(lista.map((n) => [n, [480, 960, 1440]])) : lista;
  } catch { /* sem lista: todas viram espaço reservado */ }
}

const srcset = (nome, larguras, formato) =>
  larguras.map((w) => `img/${nome}-${w}.${formato} ${w}w`).join(", ");

/**
 * Preenche um elemento com a foto.
 * @param {HTMLElement} el      contêiner que recebe a foto
 * @param {string} nome         nome base da foto (ex.: "jump")
 * @param {string} alt          descrição para leitores de tela
 * @param {object} opcoes
 *   sizes      quanto da tela a foto ocupa (ajuda o navegador a escolher o tamanho)
 *   prioridade true só para a foto da primeira tela; as outras carregam sob demanda
 */
export function inserirFoto(el, nome, alt, { sizes = "(max-width: 820px) 100vw, 50vw", prioridade = false } = {}) {
  el.classList.add("foto");
  const larguras = nome && disponiveis[nome];

  if (!larguras?.length) {
    el.classList.add("foto--vazia");
    el.innerHTML = `<span>Foto · ${esc(alt)}</span>`;
    return;
  }

  const padrao = larguras.filter((w) => w <= 960).at(-1) ?? larguras[0];
  el.innerHTML = `
    <picture>
      <source type="image/avif" srcset="${srcset(nome, larguras, "avif")}" sizes="${sizes}">
      <source type="image/webp" srcset="${srcset(nome, larguras, "webp")}" sizes="${sizes}">
      <img src="img/${nome}-${padrao}.webp" alt="${esc(alt)}" width="${padrao}" height="${Math.round(padrao * PROPORCAO)}"
           ${prioridade ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
    </picture>`;

  // Surge suavemente quando termina de baixar (a foto do topo aparece direto)
  const img = el.querySelector("img");
  if (prioridade || img.complete) return el.classList.add("foto--pronta");
  img.addEventListener("load", () => el.classList.add("foto--pronta"), { once: true });
  img.addEventListener("error", () => el.classList.add("foto--pronta"), { once: true });
}

// Preenche todos os elementos do HTML com data-foto="nome".
export function inserirFotosDoHtml() {
  document.querySelectorAll("[data-foto]").forEach((el) => {
    inserirFoto(el, el.dataset.foto, el.dataset.alt || "", {
      prioridade: el.hasAttribute("data-prioridade"),
      sizes: el.dataset.sizes,
    });
  });
}
