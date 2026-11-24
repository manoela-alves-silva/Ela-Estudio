// Carrossel leve: no celular a lista vira uma faixa de arrastar para o lado
// (CSS scroll-snap). Este arquivo só adiciona as bolinhas de posição.
// No computador a lista volta a ser grade e as bolinhas somem (via CSS).

export function carrossel(trilho, { inicio = 0, rotulo = "Item" } = {}) {
  const itens = [...trilho.children];
  if (itens.length < 2) return;

  const pontos = document.createElement("div");
  pontos.className = "carrossel__pontos";
  pontos.innerHTML = itens.map((_, i) =>
    `<button type="button" aria-label="${rotulo} ${i + 1} de ${itens.length}"></button>`).join("");
  trilho.after(pontos);
  const botoes = [...pontos.children];

  const irPara = (i, suave = true) => {
    const alvo = itens[i];
    // scrollLeft (e não scrollIntoView) para não puxar a página inteira
    // (o trilho tem position: relative, então offsetLeft é medido a partir dele)
    trilho.scrollTo({ left: alvo.offsetLeft - (parseFloat(getComputedStyle(trilho).scrollPaddingLeft) || 0), behavior: suave ? "smooth" : "instant" });
  };

  const marcar = (i) => botoes.forEach((b, j) => b.setAttribute("aria-current", i === j));

  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting) marcar(itens.indexOf(e.target)); });
  }, { root: trilho, threshold: 0.6 });
  itens.forEach((el) => obs.observe(el));

  pontos.addEventListener("click", (e) => {
    const i = botoes.indexOf(e.target.closest("button"));
    if (i >= 0) irPara(i);
  });

  marcar(inicio);
  if (inicio) requestAnimationFrame(() => irPara(inicio, false));
}
