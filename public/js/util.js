// Pequenas funções usadas por várias seções.

// Escapa texto vindo dos JSONs antes de colocar no HTML.
export function esc(texto = "") {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const reais = (valor) =>
  valor.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
