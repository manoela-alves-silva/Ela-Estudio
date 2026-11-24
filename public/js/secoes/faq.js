import { esc } from "../util.js";

// Perguntas frequentes com <details>: abre e fecha sem JS.
// O atributo name faz abrir uma de cada vez (navegadores atuais).
export function montarFaq(el, perguntas) {
  const lista = perguntas?.perguntas || perguntas || [];
  if (!lista.length) {
    el.closest("section").hidden = true;
    return;
  }
  el.innerHTML = lista.map((p, i) => `
    <details name="faq" ${i === 0 ? "open" : ""}>
      <summary>${esc(p.pergunta)}</summary>
      <p>${esc(p.resposta)}</p>
    </details>`).join("");
}
