import { esc } from "../util.js";
import { inserirFoto } from "../imagens.js";
import { carrossel } from "../carrossel.js";

// Galeria do espaço (mosaico) + destaques + foto ampliada ao tocar.
export function montarEspaco(elGaleria, elDestaques, dados) {
  const fotos = dados?.fotos || [];
  if (!fotos.length) { elGaleria.hidden = true; }

  elGaleria.innerHTML = fotos.map((f, i) => `
    <button type="button" class="galeria__item ${f.grande ? "galeria__item--grande" : ""}" data-indice="${i}"
            aria-label="Ampliar foto: ${esc(f.legenda)}" data-revelar style="transition-delay:${i * 80}ms">
      <span class="galeria__foto"></span>
      <span class="galeria__legenda">${esc(f.legenda)}</span>
    </button>`).join("");
  elGaleria.querySelectorAll(".galeria__foto").forEach((alvo, i) => {
    inserirFoto(alvo, fotos[i].foto, fotos[i].alt, { sizes: fotos[i].grande ? "(max-width: 760px) 92vw, 540px" : "(max-width: 760px) 46vw, 270px" });
  });

  elDestaques.innerHTML = (dados?.destaques || []).map((d, i) => `
    <article class="destaque" data-revelar style="transition-delay:${i * 90}ms">
      <span class="destaque__num">${String(i + 1).padStart(2, "0")}</span>
      <h3>${esc(d.titulo)}</h3>
      <p>${esc(d.texto)}</p>
    </article>`).join("");
  carrossel(elDestaques, { rotulo: "Destaque" });

  // ----- Foto ampliada (<dialog>: fecha com Esc, com o × ou tocando fora) -----
  const caixa = document.getElementById("lightbox");
  if (!caixa?.showModal) return;
  const area = caixa.querySelector(".lightbox__foto");
  const legenda = caixa.querySelector(".lightbox__legenda");

  elGaleria.addEventListener("click", (e) => {
    const item = e.target.closest("[data-indice]");
    if (!item) return;
    const f = fotos[Number(item.dataset.indice)];
    area.className = "lightbox__foto";
    inserirFoto(area, f.foto, f.alt, { sizes: "90vw", prioridade: true });
    legenda.textContent = f.legenda;
    caixa.showModal();
  });
  caixa.addEventListener("click", (e) => {
    if (e.target === caixa || e.target.closest(".lightbox__fechar")) caixa.close();
  });
}
