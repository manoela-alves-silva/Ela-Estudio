import { esc } from "../util.js";
import { inserirFoto } from "../imagens.js";
import { carrossel } from "../carrossel.js";

export function montarModalidades(el, modalidades) {
  el.innerHTML = modalidades.map((m) => `
    <article class="modalidade">
      <div data-modalidade-foto></div>
      <div class="modalidade__corpo">
        <h3>${esc(m.nome)}</h3>
        <p>${esc(m.descricao)}</p>
        <div class="etiquetas">${m.etiquetas.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        ${m.temHorario !== false ? `<a class="link-seta" href="#horarios" data-ver-horarios="${esc(m.id)}">Ver horários</a>` : ""}
      </div>
    </article>`).join("");

  el.querySelectorAll("[data-modalidade-foto]").forEach((alvo, i) => {
    inserirFoto(alvo, modalidades[i].foto, modalidades[i].alt, { sizes: "(max-width: 760px) 82vw, 340px" });
  });

  el.addEventListener("click", (e) => {
    const ver = e.target.closest("[data-ver-horarios]");
    if (ver) document.dispatchEvent(new CustomEvent("horarios:filtrar", { detail: ver.dataset.verHorarios }));
  });

  carrossel(el, { rotulo: "Modalidade" });
}
