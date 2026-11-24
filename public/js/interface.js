// Comportamentos gerais da página que não dependem dos dados:
// menu do celular, topo que muda ao rolar, link ativo, barra fixa de ação,
// animação de entrada e compartilhamento.

const reduzirMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function iniciarInterface() {
  menuCelular();
  topoAoRolar();
  linkAtivo();
  barraDeAcao();
}

// ---------- Menu do celular ----------
function menuCelular() {
  const botao = document.querySelector(".menu-botao");
  const menu = document.getElementById("menu");
  if (!botao || !menu) return;

  const alternar = (abrir) => {
    botao.setAttribute("aria-expanded", abrir);
    botao.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-aberto", abrir);
  };

  botao.addEventListener("click", () => alternar(botao.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) alternar(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("menu-aberto")) {
      alternar(false);
      botao.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".topo")) alternar(false);
  });
  // Se a tela crescer com o menu aberto (girar o celular), fecha.
  matchMedia("(min-width: 761px)").addEventListener("change", () => alternar(false));
}

// ---------- Topo ganha sombra depois que a página rola ----------
function topoAoRolar() {
  const topo = document.getElementById("topo");
  const sentinela = document.createElement("div");
  sentinela.style.cssText = "position:absolute;top:0;height:8px;width:1px";
  document.body.prepend(sentinela);
  new IntersectionObserver(([e]) => topo.classList.toggle("topo--rolado", !e.isIntersecting)).observe(sentinela);
}

// ---------- Link do menu acompanha a seção visível ----------
function linkAtivo() {
  const links = [...document.querySelectorAll('.menu a[href^="#"]:not(.menu__cta)')];
  const porId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.removeAttribute("aria-current"));
      porId.get(e.target.id)?.setAttribute("aria-current", "true");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  porId.forEach((_, id) => { const s = document.getElementById(id); if (s) obs.observe(s); });
}

// ---------- Barra fixa (celular) e botão redondo (computador) ----------
// Escondidos enquanto o botão do topo ou a seção de contato estão na tela,
// para não repetir a mesma ação duas vezes.
function barraDeAcao() {
  const alvos = [document.querySelector(".hero__acoes"), document.getElementById("contato")].filter(Boolean);
  const visiveis = new Set();
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => (e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target)));
    document.body.classList.toggle("mostrar-acao", visiveis.size === 0);
  });
  alvos.forEach((a) => obs.observe(a));
}

// ---------- Animação de entrada ao rolar ----------
export function revelarAoRolar(raiz = document) {
  const itens = raiz.querySelectorAll("[data-revelar]:not(.visivel)");
  if (reduzirMovimento || !("IntersectionObserver" in window)) {
    itens.forEach((el) => el.classList.add("visivel"));
    return;
  }
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visivel");
      obs.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  itens.forEach((el) => obs.observe(el));
}

// ---------- Aviso rápido no rodapé da tela ----------
let timer;
export function avisar(texto) {
  const el = document.getElementById("aviso");
  el.textContent = texto;
  el.classList.add("aviso--visivel");
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove("aviso--visivel"), 2600);
}

// ---------- Compartilhar o site ----------
// No celular abre a folha de compartilhar do sistema (WhatsApp, Instagram...).
// No computador, copia o link.
export async function compartilhar() {
  const dados = {
    title: document.title,
    text: "Olha esse estúdio de movimento! Bora fazer uma aula experimental comigo?",
    url: location.href.split("#")[0],
  };
  try {
    if (navigator.share) return await navigator.share(dados);
    await navigator.clipboard.writeText(dados.url);
    avisar("Link copiado. É só colar na conversa.");
  } catch (e) {
    if (e.name !== "AbortError") avisar("Não deu para compartilhar. Copie o endereço do navegador.");
  }
}
