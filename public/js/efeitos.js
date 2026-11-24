// Efeitos de movimento da página.
// Todos respeitam "reduzir movimento" do aparelho: nesse caso a página fica parada
// e os números já aparecem no valor final.
// Nenhuma biblioteca: só CSS, IntersectionObserver e requestAnimationFrame.

const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function iniciarEfeitos() {
  barraDeProgresso();
}

// ---------- Barra fina no topo mostrando quanto da página já foi lida ----------
function barraDeProgresso() {
  const barra = document.querySelector(".progresso");
  if (!barra) return;
  let pendente = false;
  const atualizar = () => {
    const total = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${total > 0 ? scrollY / total : 0})`;
    pendente = false;
  };
  addEventListener("scroll", () => { if (!pendente) { pendente = true; requestAnimationFrame(atualizar); } }, { passive: true });
  atualizar();
}

// ---------- Números que contam até o valor quando aparecem na tela ----------
// <strong data-contar="12">  ou  data-contar sem valor + el.dataset.alvo definido depois
export function contadores(raiz = document) {
  const itens = [...raiz.querySelectorAll("[data-contar]")];
  const formatar = (el, n) => `${el.dataset.prefixo || ""}${Math.round(n).toLocaleString("pt-BR")}`;
  const alvo = (el) => Number(el.dataset.contar || el.dataset.alvo || 0);

  if (reduzir || !("IntersectionObserver" in window)) {
    itens.forEach((el) => (el.textContent = formatar(el, alvo(el))));
    return;
  }
  const obs = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    obs.unobserve(e.target);
    const el = e.target, fim = alvo(el), duracao = 1400, t0 = performance.now();
    const passo = (t) => {
      const p = Math.min(1, (t - t0) / duracao);
      el.textContent = formatar(el, fim * (1 - Math.pow(1 - p, 3))); // desacelera no final
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }), { threshold: 0.6 });
  itens.forEach((el) => obs.observe(el));
}

// ---------- Listas que entram em cascata (um cartão depois do outro) ----------
export function cascata(raiz = document) {
  raiz.querySelectorAll("[data-cascata]").forEach((lista) => {
    [...lista.children].forEach((filho, i) => {
      filho.setAttribute("data-revelar", "");
      filho.style.transitionDelay = `${Math.min(i, 6) * 90}ms`;
    });
  });
}
