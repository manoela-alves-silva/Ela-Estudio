// Objetos 3D flutuando pela página (kettlebell, trampolim, colchonete...).
// São imagens 3D com fundo transparente em img/3d/<nome>.webp, listadas em img/3d/objetos.json.
// Enquanto uma imagem não existe, o objeto vira um desenho em CSS (classe obj3d--css)
// em vez de imagem quebrada. São decorativos: ficam escondidos dos leitores de tela.

let disponiveis = null;

async function lista() {
  if (disponiveis) return disponiveis;
  try {
    const r = await fetch("img/3d/objetos.json");
    disponiveis = r.ok ? new Set(await r.json()) : new Set();
  } catch {
    disponiveis = new Set();
  }
  return disponiveis;
}

export async function montarObjetos3d(raiz = document) {
  const existentes = await lista();
  raiz.querySelectorAll(".obj3d[data-obj]").forEach((el) => {
    el.setAttribute("aria-hidden", "true");
    const nome = el.dataset.obj;
    if (existentes.has(nome)) {
      el.classList.remove("obj3d--css");
      el.innerHTML = `<img src="img/3d/${nome}.webp" alt="" loading="lazy" decoding="async">`;
    } else {
      el.classList.add("obj3d--css");
      el.innerHTML = "";
    }
  });
}
