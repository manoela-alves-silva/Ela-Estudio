import { test } from "node:test";
import assert from "node:assert/strict";
import { proximaAula } from "../public/js/agenda.js";

const agenda = {
  _aviso: "teste",
  seg: [
    { hora: "06:30", modalidade: "funcional", turma: "Manhã" },
    { hora: "18:30", modalidade: "jump", turma: "Noite" },
  ],
  qua: [{ hora: "07:00", modalidade: "hiit", turma: "Manhã" }],
};
// 2026-11-23 é uma segunda-feira; 2026-11-29 é domingo
const em = (dia, h, m = 0) => new Date(2026, 10, dia, h, m);

test("primeira aula do dia quando ainda é cedo", () => {
  assert.deepEqual(proximaAula(agenda, em(23, 5)),
    { chave: "seg", rotulo: "Hoje", hora: "06:30", modalidade: "funcional", hoje: true });
});

test("pula a aula que já começou", () => {
  const r = proximaAula(agenda, em(23, 7));
  assert.equal(r.hora, "18:30");
  assert.equal(r.modalidade, "jump");
  assert.equal(r.hoje, true);
});

test("depois da última aula, vai para o próximo dia com aula", () => {
  assert.deepEqual(proximaAula(agenda, em(23, 19)),
    { chave: "qua", rotulo: "Qua", hora: "07:00", modalidade: "hiit", hoje: false });
});

test("domingo dá a volta na semana", () => {
  const r = proximaAula(agenda, em(29, 10));
  assert.equal(r.chave, "seg");
  assert.equal(r.rotulo, "Seg");
});

test("agenda sem aulas devolve null", () => {
  assert.equal(proximaAula({ _aviso: "x" }, em(23, 10)), null);
});

test("só um dia com aula e já passou: é o mesmo dia da semana seguinte", () => {
  const soSegunda = { seg: [{ hora: "06:30", modalidade: "funcional", turma: "Manhã" }] };
  assert.deepEqual(proximaAula(soSegunda, em(23, 19)),
    { chave: "seg", rotulo: "Seg", hora: "06:30", modalidade: "funcional", hoje: false });
});

test("aula sem horário no JSON é ignorada, sem quebrar", () => {
  const torta = { seg: [{ modalidade: "jump", turma: "sem hora" }, { hora: "18:30", modalidade: "funcional", turma: "Noite" }] };
  assert.equal(proximaAula(torta, em(23, 10)).hora, "18:30");
});
