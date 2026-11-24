import { esc } from "../util.js";

export function montarQuiz(el, { perguntas, resultados }, horarios = {}) {
  // Só oferece "Ver horários" para modalidades que têm turma na agenda (o ao ar livre é mensal)
  const comTurma = new Set(Object.values(horarios).flatMap((d) => Array.isArray(d) ? d.map((a) => a.modalidade) : []));
  const comHorario = (id) => comTurma.has(id);
  let respostas = []; // índice da opção escolhida em cada pergunta

  function vencedor() {
    const votos = {};
    respostas.forEach((op, i) => {
      const id = perguntas[i].opcoes[op].aponta;
      votos[id] = (votos[id] || 0) + 1;
    });
    // Empate: vence quem apareceu primeiro em resultados
    return Object.keys(resultados).reduce((a, b) => ((votos[b] || 0) > (votos[a] || 0) ? b : a));
  }

  function desenhar(focar) {
    const passo = respostas.length;
    const progresso = `
      <div class="quiz__progresso" role="progressbar" aria-valuemin="0" aria-valuemax="${perguntas.length}" aria-valuenow="${passo}"
           aria-label="Progresso do teste">${perguntas.map((_, i) => `<i class="${i < passo ? "ativo" : ""}"></i>`).join("")}</div>`;

    if (passo < perguntas.length) {
      const p = perguntas[passo];
      el.innerHTML = `${progresso}
        <div class="quiz__passo">
          <p class="quiz__contador">Pergunta ${passo + 1} de ${perguntas.length}</p>
          <p class="quiz__pergunta" tabindex="-1">${esc(p.texto)}</p>
          <div class="quiz__opcoes">${p.opcoes.map((o, i) =>
            `<button class="quiz__opcao" type="button" data-opcao="${i}">${esc(o.texto)}</button>`).join("")}
          </div>
          ${passo ? `<button class="quiz__voltar" type="button" data-voltar>← Voltar</button>` : ""}
        </div>`;
      if (focar) el.querySelector(".quiz__pergunta").focus({ preventScroll: true });
      return;
    }

    const id = vencedor();
    const r = resultados[id];
    const mensagem = `Oi! Fiz o teste no site da Elã e deu ${r.nome}. Quero agendar uma aula experimental!`;
    el.innerHTML = `${progresso}
      <div class="quiz__resultado">
        <p class="rotulo">Seu treino é</p>
        <p class="quiz__resultado-nome" tabindex="-1">${esc(r.nome)}</p>
        <p>${esc(r.descricao)}</p>
        <div class="quiz__resultado-acoes">
          <a class="btn btn--primario" href="#contato" data-whatsapp="${esc(mensagem)}">Agendar aula de ${esc(r.nome)}</a>
          ${comHorario(id) ? `<a class="btn btn--contorno" href="#horarios" data-ver-horarios="${esc(id)}">Ver horários</a>` : `<a class="btn btn--contorno" href="#modalidades">Ver modalidades</a>`}
        </div>
        <button class="quiz__voltar" type="button" data-refazer>Refazer o teste</button>
      </div>`;
    if (focar) el.querySelector(".quiz__resultado-nome").focus({ preventScroll: true });
  }

  el.addEventListener("click", (e) => {
    const opcao = e.target.closest("[data-opcao]");
    if (opcao) { respostas.push(Number(opcao.dataset.opcao)); return desenhar(true); }
    if (e.target.closest("[data-voltar]")) { respostas.pop(); return desenhar(true); }
    if (e.target.closest("[data-refazer]")) { respostas = []; return desenhar(true); }
    const ver = e.target.closest("[data-ver-horarios]");
    // Leva para os horários já filtrados pela modalidade do resultado
    if (ver) document.dispatchEvent(new CustomEvent("horarios:filtrar", { detail: ver.dataset.verHorarios }));
  });

  desenhar(false);
}
