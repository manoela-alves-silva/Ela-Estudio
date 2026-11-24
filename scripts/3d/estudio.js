// Modela e renderiza os objetos 3D da Elã com acabamento fosco (estilo "clay"),
// nas cores da paleta, com fundo transparente.
import * as THREE from "three";

const TAMANHO = 900;
const COR = {
  salvia: 0xA3B59B, salviaEscura: 0x6F8268,
  argila: 0xDDB9AC, argilaEscura: 0xB98F82,
  areia: 0xE6DCCB, tinta: 0x55635B,
};

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setSize(TAMANHO, TAMANHO);
renderer.setPixelRatio(1);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const material = (cor, rugosidade = 0.82) =>
  new THREE.MeshStandardMaterial({ color: cor, roughness: rugosidade, metalness: 0 });

function cena() {
  const s = new THREE.Scene();
  s.add(new THREE.HemisphereLight(0xFFF8F0, 0xB9AA98, 1.7));
  const chave = new THREE.DirectionalLight(0xFFF4E8, 2.4); chave.position.set(-3, 5, 4); s.add(chave);
  const preench = new THREE.DirectionalLight(0xEAF0E6, 0.7); preench.position.set(4, 1, 3); s.add(preench);
  const contra = new THREE.DirectionalLight(0xFFFFFF, 0.9); contra.position.set(0, 3, -5); s.add(contra);
  return s;
}

// ---------- Modelos ----------
function kettlebell() {
  const g = new THREE.Group();
  const m = material(COR.salvia);
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), m);
  corpo.scale.set(1, 0.92, 1);
  g.add(corpo);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 96), m);
  base.position.y = -0.88; g.add(base);
  const alca = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.14, 48, 128, Math.PI), m);
  alca.position.y = 1.12; g.add(alca);
  for (const x of [-0.56, 0.56]) {
    const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.45, 48), m);
    perna.position.set(x, 0.92, 0); g.add(perna);
  }
  g.rotation.set(0.12, -0.45, 0.05);
  return g;
}

function trampolim() {
  const g = new THREE.Group();
  const aro = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.1, 48, 160), material(COR.argila));
  aro.rotation.x = Math.PI / 2; g.add(aro);
  const lona = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 0.04, 128), material(COR.tinta, 0.9));
  g.add(lona);
  const borda = new THREE.Mesh(new THREE.TorusGeometry(1.11, 0.05, 24, 160), material(COR.salvia));
  borda.rotation.x = Math.PI / 2; borda.position.y = 0.02; g.add(borda);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.55, 24), material(COR.argilaEscura));
    perna.position.set(Math.cos(a) * 1.12, -0.3, Math.sin(a) * 1.12);
    perna.rotation.z = Math.cos(a) * 0.18; perna.rotation.x = -Math.sin(a) * 0.18;
    g.add(perna);
    const pe = new THREE.Mesh(new THREE.SphereGeometry(0.08, 24, 16), material(COR.argilaEscura));
    pe.position.set(Math.cos(a) * 1.2, -0.58, Math.sin(a) * 1.2); g.add(pe);
  }
  g.rotation.set(0.55, 0.3, -0.12);
  return g;
}

function colchonete() {
  const g = new THREE.Group();
  const rolo = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.1, 96, 1, false), material(COR.argila));
  g.add(rolo);
  // espiral visível nas pontas (anéis em tons alternados)
  for (const y of [-1.051, 1.051]) {
    [0.42, 0.29, 0.16].forEach((r, i) => {
      const anel = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 16, 96), material(i % 2 ? COR.argila : COR.argilaEscura));
      anel.rotation.x = Math.PI / 2; anel.position.y = y; g.add(anel);
    });
  }
  for (const y of [-0.55, 0.55]) {
    const alca = new THREE.Mesh(new THREE.TorusGeometry(0.575, 0.045, 24, 96), material(COR.salviaEscura));
    alca.rotation.x = Math.PI / 2; alca.position.y = y; g.add(alca);
  }
  g.rotation.set(0.35, 0.2, Math.PI / 2 - 0.35);
  return g;
}

function elastico() {
  const g = new THREE.Group();
  const a = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.11, 48, 160), material(COR.salvia));
  a.scale.set(1.25, 0.8, 1); a.rotation.set(0.9, 0.2, 0.3); g.add(a);
  const b = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.1, 48, 160), material(COR.argila));
  b.scale.set(1.2, 0.85, 1); b.position.set(0.35, -0.25, 0.2); b.rotation.set(1.2, -0.4, -0.5); g.add(b);
  return g;
}

function esfera() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), material(COR.argila, 0.75)));
  return g;
}

const MODELOS = { kettlebell, trampolim, colchonete, elastico, esfera };

// ---------- Render ----------
function renderizar(modelo) {
  const s = cena();
  s.add(modelo);
  // enquadra o objeto com uma folga
  const caixa = new THREE.Box3().setFromObject(modelo);
  const centro = caixa.getCenter(new THREE.Vector3());
  const raio = caixa.getBoundingSphere(new THREE.Sphere()).radius;
  modelo.position.sub(centro);
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const distancia = (raio * 1.12) / Math.sin(THREE.MathUtils.degToRad(14));
  camera.position.set(0, 0, distancia);
  camera.lookAt(0, 0, 0);
  renderer.render(s, camera);
  return renderer.domElement.toDataURL("image/png");
}

const imagens = {};
const grade = document.getElementById("grade");
for (const [nome, criar] of Object.entries(MODELOS)) {
  imagens[nome] = renderizar(criar());
  grade.insertAdjacentHTML("beforeend", `<figure><img src="${imagens[nome]}" alt=""><figcaption>${nome}</figcaption></figure>`);
}
window.__pronto = true;

document.getElementById("salvar").addEventListener("click", async () => {
  const status = document.getElementById("status");
  for (const [nome, dados] of Object.entries(imagens)) {
    await fetch(`/salvar?nome=${nome}`, { method: "POST", body: dados });
  }
  status.textContent = "Salvo!";
  window.__salvo = true;
});
