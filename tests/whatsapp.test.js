import { test } from "node:test";
import assert from "node:assert/strict";
import { configurar, mensagemDe } from "../public/js/whatsapp.js";

test("usa a mensagem do botão quando existe", () => {
  configurar({ mensagemPadrao: "Oi! Vim pelo site." });
  assert.equal(mensagemDe("Quero o plano 3x na semana (trimestral)."), "Quero o plano 3x na semana (trimestral).");
});

test("cai na mensagem padrão quando o atributo está vazio", () => {
  configurar({ mensagemPadrao: "Oi! Vim pelo site." });
  assert.equal(mensagemDe(""), "Oi! Vim pelo site.");
  assert.equal(mensagemDe(undefined), "Oi! Vim pelo site.");
});

test("não monta nenhum link wa.me", async () => {
  const mod = await import("../public/js/whatsapp.js");
  assert.equal(mod.linkWhatsApp, undefined);
});
