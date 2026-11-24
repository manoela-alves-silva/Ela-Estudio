import { esc, reais } from "../util.js";
import { carrossel } from "../carrossel.js";

export function montarPlanos(elPeriodos, elPlanos, { periodos, planos }) {
  let periodo = periodos[0];

  // Botões de período desenhados uma vez (o foco do teclado não se perde ao trocar)
  elPeriodos.innerHTML = periodos.map((p) => `
    <button type="button" data-periodo="${esc(p.id)}" aria-pressed="${p === periodo}">
      ${esc(p.nome)}${p.desconto ? ` <small>-${Math.round(p.desconto * 100)}%</small>` : ""}
    </button>`).join("");

  // Cartões também desenhados uma vez; trocar o período só atualiza preço, texto e mensagem.
  elPlanos.innerHTML = planos.map((pl) => `
    <article class="plano ${pl.destaque ? "plano--destaque" : ""}">
      ${pl.destaque ? `<span class="plano__selo">Mais escolhido</span>` : ""}
      <h3>${esc(pl.nome)}</h3>
      <div class="plano__preco"><small>R$</small><strong data-valor>0</strong><em>/mês</em></div>
      <p class="plano__total" data-total></p>
      <ul>${pl.inclui.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      <a class="btn btn--primario" data-link href="#contato">Quero este plano</a>
    </article>`).join("");
  const cartoes = [...elPlanos.children];

  function atualizar(animar) {
    elPeriodos.querySelectorAll("[data-periodo]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.periodo === periodo.id));
    planos.forEach((pl, i) => {
      const c = cartoes[i];
      const valor = Math.round(pl.precoMensal * (1 - periodo.desconto));
      const meses = periodo.meses || 1;
      const economia = (pl.precoMensal - valor) * meses;
      c.querySelector("[data-valor]").textContent = reais(valor);
      c.querySelector("[data-total]").textContent = meses > 1
        ? `R$ ${reais(valor * meses)} no ${periodo.nome.toLowerCase()} · economia de R$ ${reais(economia)}`
        : "Sem fidelidade";
      c.querySelector("[data-link]").dataset.whatsapp =
        `Oi! Vi o site da Elã e tenho interesse no plano ${pl.nome} (${periodo.nome.toLowerCase()}).`;
      if (animar) {
        const preco = c.querySelector(".plano__preco");
        preco.classList.remove("plano__preco--mudou");
        void preco.offsetWidth; // reinicia a animação
        preco.classList.add("plano__preco--mudou");
      }
    });
  }

  elPeriodos.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-periodo]");
    if (!botao) return;
    periodo = periodos.find((p) => p.id === botao.dataset.periodo);
    atualizar(true);
  });

  atualizar(false);
  // No celular o carrossel já abre no plano em destaque
  carrossel(elPlanos, { inicio: Math.max(0, planos.findIndex((p) => p.destaque)), rotulo: "Plano" });
}
