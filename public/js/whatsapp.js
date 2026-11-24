// Contato pelo WhatsApp em MODO DEMONSTRAÇÃO.
//
// A Elã é um estúdio fictício (projeto de portfólio), então nenhum botão abre
// o WhatsApp de verdade: um número inventado poderia ser de alguém real.
// Cada botão continua montando a mensagem sob medida (plano, aula, resultado do quiz),
// e o clique abre um aviso mostrando a mensagem que seria enviada.
//
// No HTML: qualquer elemento com data-whatsapp="mensagem" vira botão de contato.
// data-whatsapp vazio usa a mensagem padrão do contato.json.
// Num site real, bastaria trocar o showModal() por:
//   location.href = `https://wa.me/<número>?text=${encodeURIComponent(mensagem)}`

let mensagemPadrao = "";

export function configurar(contato = {}) {
  mensagemPadrao = contato.mensagemPadrao || "";
}

export function mensagemDe(valorAtributo) {
  return valorAtributo || mensagemPadrao;
}

// Um único ouvinte para a página inteira: funciona também para botões criados depois
// (planos, horários, quiz). Chamar uma vez só.
export function ativarDemonstracao(raiz = document) {
  const caixa = document.getElementById("demo-whats");
  if (!caixa?.showModal) return; // sem suporte a <dialog>: o link #contato segue normal
  const texto = caixa.querySelector(".demo-whats__mensagem");
  let origem = null;

  raiz.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-whatsapp]");
    if (!botao) return;
    e.preventDefault();
    origem = botao;
    texto.textContent = mensagemDe(botao.dataset.whatsapp);
    caixa.showModal();
  });

  // Tocar fora da caixa também fecha
  caixa.addEventListener("click", (e) => { if (e.target === caixa) caixa.close(); });
  // Ao fechar (botão, Esc ou fora), o foco volta para quem abriu
  caixa.addEventListener("close", () => origem?.focus({ preventScroll: true }));
}
