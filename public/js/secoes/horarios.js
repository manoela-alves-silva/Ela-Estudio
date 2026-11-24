import { esc } from "../util.js";
import { DIAS, CHAVE_DO_DIA, minutos } from "../agenda.js";


const falarDuracao = (min) => {
  if (min < 60) return `em ${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return `em ${h}h${m ? String(m).padStart(2, "0") : ""}`;
};

/**
 * Agenda da semana com abas por dia, filtro por modalidade e destaque da próxima aula.
 * Outras seções podem filtrar a agenda disparando:
 *   document.dispatchEvent(new CustomEvent("horarios:filtrar", { detail: "jump" }))
 */
export function montarHorarios(els, agenda, modalidades = []) {
  // Nome e duração de cada modalidade vêm do modalidades.json
  const info = Object.fromEntries(modalidades.map((m) => [m.id, m]));
  const nome = (id) => info[id]?.nome || id;
  const usadas = [...new Set(Object.values(agenda).flatMap((d) => Array.isArray(d) ? d.map((a) => a.modalidade) : []))];

  const agora = new Date();
  const hoje = CHAVE_DO_DIA[agora.getDay()];
  let dia = agenda[hoje]?.length ? hoje : DIAS.find(([c]) => agenda[c]?.length)?.[0] || "seg";
  let filtro = "todas";

  // ----- Filtro por modalidade (só aparece se houver mais de uma) -----
  if (usadas.length > 1) {
    els.filtros.innerHTML = [["todas", "Todas"], ...usadas.map((id) => [id, nome(id)])]
      .map(([id, rotulo]) => `<button type="button" data-filtro="${esc(id)}" aria-pressed="${id === filtro}">${esc(rotulo)}</button>`).join("");
    els.filtros.addEventListener("click", (e) => {
      const b = e.target.closest("[data-filtro]");
      if (b) filtrar(b.dataset.filtro);
    });
  }
  function filtrar(id) {
    if (id !== "todas" && !usadas.includes(id)) id = "todas"; // modalidade sem turma: mostra todas
    filtro = id;
    els.filtros.querySelectorAll("[data-filtro]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.filtro === id));
    desenharAulas();
  }
  document.addEventListener("horarios:filtrar", (e) => filtrar(e.detail));

  // ----- Abas dos dias (desenhadas uma vez, para o foco do teclado não se perder) -----
  els.dias.innerHTML = DIAS.map(([chave, rotulo, extenso]) => `
    <button class="dia ${chave === hoje ? "dia--hoje" : ""}" type="button" role="tab" id="dia-${chave}"
            data-dia="${chave}" aria-controls="aulas" aria-label="${extenso}${chave === hoje ? " (hoje)" : ""}">
      ${rotulo}${chave === hoje ? "<small>hoje</small>" : ""}
    </button>`).join("");
  const abas = [...els.dias.querySelectorAll(".dia")];

  function selecionarDia(chave, focar = false) {
    dia = chave;
    abas.forEach((b) => {
      const ativo = b.dataset.dia === chave;
      b.setAttribute("aria-selected", ativo);
      b.tabIndex = ativo ? 0 : -1;
      if (ativo && focar) b.focus();
    });
    els.aulas.setAttribute("aria-labelledby", `dia-${chave}`);
    desenharAulas();
  }

  els.dias.addEventListener("click", (e) => {
    const b = e.target.closest(".dia");
    if (b) selecionarDia(b.dataset.dia);
  });
  // Setas, Home e End navegam entre os dias (padrão de abas acessíveis)
  els.dias.addEventListener("keydown", (e) => {
    const i = abas.findIndex((b) => b.dataset.dia === dia);
    const destino = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: abas.length - 1 }[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    selecionarDia(abas[(destino + abas.length) % abas.length].dataset.dia, true);
  });

  // ----- Lista de aulas do dia -----
  function situacao(aula) {
    if (dia !== hoje) return null;
    const inicio = minutos(aula.hora);
    const fim = inicio + (info[aula.modalidade]?.duracao || 60);
    const atual = agora.getHours() * 60 + agora.getMinutes();
    if (atual >= fim) return "passou";
    if (atual >= inicio) return "agora";
    return { faltam: inicio - atual };
  }

  function desenharAulas() {
    const extenso = DIAS.find(([c]) => c === dia)[2];
    const aulas = (agenda[dia] || []).filter((a) => filtro === "todas" || a.modalidade === filtro);
    let proximaMarcada = false;

    if (!aulas.length) {
      els.aulas.innerHTML = `<p class="aulas__vazio">${filtro === "todas"
        ? "Sem aulas fixas neste dia. Fique de olho no Instagram para os treinos especiais."
        : `Sem ${esc(nome(filtro))} neste dia. Veja os outros dias ou todas as modalidades.`}</p>`;
      return;
    }

    els.aulas.innerHTML = aulas.map((a, i) => {
      const s = situacao(a);
      let selo = "";
      let classe = "";
      if (s === "agora") { selo = "Acontecendo agora"; classe = "aula--agora"; }
      else if (s === "passou") classe = "aula--passou";
      else if (s && !proximaMarcada) { selo = `Próxima · ${falarDuracao(s.faltam)}`; classe = "aula--proxima"; proximaMarcada = true; }

      const mensagem = `Oi! Quero fazer uma aula experimental de ${nome(a.modalidade)} na ${extenso} às ${a.hora}. Tem vaga?`;
      return `
        <a class="aula ${classe}" href="#contato" data-whatsapp="${esc(mensagem)}" style="animation-delay:${i * 50}ms">
          <time>${esc(a.hora)}</time>
          <span class="aula__info">
            <b>${esc(nome(a.modalidade))}</b>
            <small>${esc(a.turma)}${info[a.modalidade]?.duracao ? ` · ${info[a.modalidade].duracao} min` : ""}</small>
            ${selo ? `<em class="aula__selo">${selo}</em>` : ""}
          </span>
          <span class="aula__tipo aula__tipo--${esc(a.modalidade)}">Agendar</span>
        </a>`;
    }).join("");
  }

  selecionarDia(dia);
}
