// Ponto de entrada: carrega os dados e monta cada seção.
// Cada seção mora no seu próprio arquivo em js/secoes/.
// Se um JSON tiver erro, só a seção dele fica de fora: o resto da página funciona.

import { carregar } from "./api.js";
import { configurar, ativarDemonstracao } from "./whatsapp.js";
import { carregarListaDeFotos, inserirFotosDoHtml } from "./imagens.js";
import { iniciarInterface, revelarAoRolar, compartilhar } from "./interface.js";
import { iniciarEfeitos, contadores, cascata } from "./efeitos.js";
import { proximaAula } from "./agenda.js";
import { montarObjetos3d } from "./objetos3d.js";
import { montarEspaco } from "./secoes/espaco.js";
import { montarModalidades } from "./secoes/modalidades.js";
import { montarHorarios } from "./secoes/horarios.js";
import { montarPlanos } from "./secoes/planos.js";
import { montarDepoimentos } from "./secoes/depoimentos.js";
import { montarQuiz } from "./secoes/quiz.js";
import { montarFaq } from "./secoes/faq.js";

const $ = (id) => document.getElementById(id);

// Menu, barra fixa e animações não dependem dos dados: ligam na hora.
iniciarInterface();
iniciarEfeitos();
revelarAoRolar();
ativarDemonstracao(); // botões de WhatsApp abrem o aviso de demonstração (projeto fictício)
montarObjetos3d();

const ARQUIVOS = ["contato", "espaco", "modalidades", "horarios", "planos", "depoimentos", "quiz", "faq"];

async function iniciar() {
  const resultados = await Promise.allSettled([...ARQUIVOS.map(carregar), carregarListaDeFotos()]);
  const dados = {};
  ARQUIVOS.forEach((nome, i) => {
    const r = resultados[i];
    if (r.status === "fulfilled") dados[nome] = r.value;
    else console.error(r.reason); // normalmente vírgula sobrando no JSON
  });

  // Contato primeiro: a mensagem padrão vale para os botões sem mensagem própria.
  const contato = dados.contato || {};
  configurar(contato);
  document.querySelectorAll("[data-campo]").forEach((el) => {
    el.textContent = contato[el.dataset.campo] ?? "";
  });
  document.querySelectorAll("[data-compartilhar]").forEach((b) => {
    b.addEventListener("click", compartilhar);
  });

  inserirFotosDoHtml();

  // Cada seção é montada isolada: se uma quebrar, as outras continuam.
  const secoes = [
    ["galeria", () => montarEspaco($("galeria"), $("destaques"), dados.espaco)],
    ["quiz-caixa", () => montarQuiz($("quiz-caixa"), dados.quiz, dados.horarios)],
    ["lista-modalidades", () => montarModalidades($("lista-modalidades"), dados.modalidades)],
    ["aulas", () => montarHorarios({ filtros: $("filtros"), dias: $("dias"), aulas: $("aulas") }, dados.horarios, dados.modalidades)],
    ["depoimentos", () => montarDepoimentos($("depoimentos"), dados.depoimentos)],
    ["planos-lista", () => montarPlanos($("periodos"), $("planos-lista"), dados.planos)],
    ["faq", () => montarFaq($("faq"), dados.faq)],
  ];
  for (const [id, montar] of secoes) {
    const el = $(id);
    try {
      montar();
    } catch (erro) {
      console.error(`Seção #${id}:`, erro);
      el.innerHTML = `<p class="erro">Não foi possível carregar esta parte.</p>`;
    }
    el.classList.remove("carregando");
  }

  try {
    // Números do topo calculados a partir dos dados (não ficam desatualizados)
    const agenda = dados.horarios || {};
    const numeros = {
      aulasSemana: Object.values(agenda).reduce((t, dia) => t + (Array.isArray(dia) ? dia.length : 0), 0),
      modalidades: (dados.modalidades || []).filter((m) => m.temHorario !== false).length,
    };
    document.querySelectorAll("[data-numero]").forEach((el) => {
      const n = numeros[el.dataset.numero];
      if (n) el.dataset.alvo = n; else el.closest("li").hidden = true;
    });
  } catch (erro) { console.error("Números do topo:", erro); }
  try { mostrarProximaAula(dados.horarios, dados.modalidades); } catch (erro) { console.error("Próxima aula:", erro); }
  contadores();
  cascata();
  revelarAoRolar(); // pega os cartões que acabaram de ser montados
}

// Cartão de vidro do topo: "Hoje 18:30 · Funcional · próxima turma"
function mostrarProximaAula(agenda, modalidades = []) {
  const cartao = document.getElementById("proxima-aula");
  const p = agenda && proximaAula(agenda, new Date());
  if (!cartao || !p) return; // sem horários: o cartão continua escondido
  const nome = modalidades.find((m) => m.id === p.modalidade)?.nome || p.modalidade;
  cartao.querySelector("[data-proxima-quando]").textContent = `${p.rotulo} ${p.hora}`;
  cartao.querySelector("[data-proxima-qual]").textContent = `${nome} · próxima turma`;
  cartao.hidden = false;
}

iniciar().catch((erro) => {
  // Normalmente o site foi aberto com duplo clique (file://) em vez de um servidor.
  // Veja a seção "Rodar no computador" do README.
  console.error(erro);
});
