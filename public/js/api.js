// Camada de dados.
// Hoje os dados vêm de arquivos JSON na pasta /data.
// Se um dia existir um back-end (painel para o estúdio editar), só este arquivo muda:
// troque a URL abaixo pela da API e o resto do site continua igual.

const BASE = "data";

export async function carregar(nome) {
  const resposta = await fetch(`${BASE}/${nome}.json`);
  if (!resposta.ok) throw new Error(`Não foi possível carregar ${nome}.json (${resposta.status})`);
  return resposta.json();
}
