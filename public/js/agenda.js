// Regras da agenda semanal, sem DOM (testadas em tests/agenda.test.js).
// Usadas pela seção de horários e pelo cartão "próxima aula" do topo.

export const DIAS = [
  ["seg", "Seg", "segunda"], ["ter", "Ter", "terça"], ["qua", "Qua", "quarta"],
  ["qui", "Qui", "quinta"], ["sex", "Sex", "sexta"], ["sab", "Sáb", "sábado"],
];
export const CHAVE_DO_DIA = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

export const minutos = (hora) => { const [h, m] = hora.split(":").map(Number); return h * 60 + m; };

// Primeira aula que ainda não começou, a partir de agora, dando a volta na semana.
export function proximaAula(agenda, agora) {
  const atual = agora.getHours() * 60 + agora.getMinutes();
  for (let passo = 0; passo <= 7; passo++) {
    const chave = CHAVE_DO_DIA[(agora.getDay() + passo) % 7];
    const aulas = Array.isArray(agenda[chave]) ? agenda[chave].filter((a) => /^\d{1,2}:\d{2}$/.test(a?.hora || "")) : [];
    aulas.sort((a, b) => minutos(a.hora) - minutos(b.hora));
    const aula = aulas.find((a) => passo > 0 || minutos(a.hora) > atual);
    if (!aula) continue;
    const hoje = passo === 0;
    return {
      chave,
      rotulo: hoje ? "Hoje" : DIAS.find(([c]) => c === chave)[1],
      hora: aula.hora,
      modalidade: aula.modalidade,
      hoje,
    };
  }
  return null;
}
