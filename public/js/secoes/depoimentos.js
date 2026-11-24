import { esc } from "../util.js";
import { carrossel } from "../carrossel.js";

export function montarDepoimentos(el, depoimentos) {
  if (!depoimentos?.length) {
    el.closest("section").hidden = true; // sem depoimentos, a seção some
    return;
  }
  el.innerHTML = depoimentos.map((d) => `
    <figure class="depoimento">
      ${d.destaque ? `<p class="depoimento__destaque">${esc(d.destaque)}</p>` : ""}
      <blockquote>“${esc(d.texto)}”</blockquote>
      <figcaption>${esc(d.nome)} · ${esc(d.turma)}</figcaption>
    </figure>`).join("");
  carrossel(el, { rotulo: "Depoimento" });
}
