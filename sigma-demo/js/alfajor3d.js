/*
  SIGMA — alfajor 3D hecho con código (Three.js, sin archivos de modelo).
  - Alfajor bañado entero (chocolate o blanco), con galletitas de cacao con trocitos de maní y relleno.
  - Gira solo; se puede girar arrastrando (en celular, solo el arrastre horizontal: el scroll vertical sigue libre).
  - Con el scroll, se separa una porción y se ve el corte (galletita, relleno, galletita) con las etiquetas; al seguir bajando, se vuelve a cerrar.
  - Si el dispositivo es lento o pide menos movimiento, no se carga: queda la imagen fija.
*/
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/* ---------- utilidades ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

// Ruido determinístico (para que el baño sea irregular pero siempre igual)
function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, oct = 4) {
  let s = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += amp * vnoise(x * f, y * f); f *= 2; amp *= 0.5; }
  return s;
}

// Textura de ruido para relieve (bump) y variación de brillo
function texturaRuido(size, escala, oct, contraste = 1) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm((x / size) * escala * 2 + 10, (y / size) * escala * 2 + 3, oct);
      const v = clamp(0.5 + (n - 0.5) * contraste) * 255;
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Textura plana (cara superior del relleno y de la galletita)
function texturaPlana(size, base, vetas, fn) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const v = fn(x / size, y / size);
    const i = (y * size + x) * 4;
    img.data[i] = clamp(base[0] + (v - 0.5) * vetas, 0, 255);
    img.data[i + 1] = clamp(base[1] + (v - 0.5) * vetas * 0.8, 0, 255);
    img.data[i + 2] = clamp(base[2] + (v - 0.5) * vetas * 0.6, 0, 255);
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Sombra suave en el piso
function texturaSombra() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(6,24,40,0.6)");
  g.addColorStop(0.5, "rgba(6,24,40,0.32)");
  g.addColorStop(0.85, "rgba(6,24,40,0.04)");
  g.addColorStop(1, "rgba(6,24,40,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/* ---------- geometría ----------
   Un solo cuerpo bañado (como el alfajor real), con perfil "superelipse":
   lados redondeados, base más plana que la tapa. Un plano vertical lo corta
   en dos: el cuerpo y la porción. Al abrir, la porción se separa y se ve
   el corte: galletita de cacao con trocitos de maní, relleno, galletita. */
const R = 1;          // radio
const HH = 0.4;       // medio alto total
const T = 0.045;      // espesor del baño
const P_TOP = 3.0;    // redondez de la tapa (más chico = más redondo)
const P_BOT = 5.5;    // la base apoya plana
const CORTE = 0.42;   // z del plano de corte (hacia la cámara)
const F_REL = 0.135;  // medio alto del relleno

const radioEn = (y, r0, h) => {
  const p = y < 0 ? P_BOT : P_TOP;
  const t = Math.min(1, Math.abs(y) / h);
  return r0 * Math.pow(1 - Math.pow(t, p), 1 / p);
};
const rOut = (y) => radioEn(y, R, HH);
const rIn = (y) => radioEn(y, R - T, HH - T);

function perfil(r0, h) {
  const pts = [];
  const N = 260;
  for (let i = 0; i <= N; i++) {
    const th = -Math.PI / 2 + (i / N) * Math.PI;
    const c = Math.cos(th), s = Math.sin(th);
    const p = s < 0 ? P_BOT : P_TOP;
    const r = r0 * Math.pow(Math.abs(c), 2 / p);
    const y = h * Math.sign(s) * Math.pow(Math.abs(s), 2 / p);
    pts.push(new THREE.Vector2(Math.max(r, 0.0001), y));
  }
  return pts;
}

function geometriaCuerpo() {
  const g = new THREE.LatheGeometry(perfil(R, HH), 240);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z);
    if (r < 0.02) continue;
    const ang = Math.atan2(v.z, v.x);
    // baño irregular: el borde no es un torno perfecto
    const n = fbm(Math.cos(ang) * 2.4 + 4.1, Math.sin(ang) * 2.4 + v.y * 2.5, 3) - 0.5;
    const k = 1 + n * 0.03 * smooth(0.5, 0.95, r);
    v.x *= k; v.z *= k;
    // ondas suaves del chocolate arriba
    if (v.y > 0) v.y += (fbm(v.x * 2.2, v.z * 2.2 + 7, 3) - 0.5) * 0.02 * smooth(0.25, 0.4, v.y);
    // líneas onduladas en relieve sobre la tapa, como en la foto del envase
    if (v.y > 0.1) {
      const fase = (v.z + 0.07 * Math.sin(v.x * 3.1 + 0.6) + 0.03 * Math.sin(v.x * 7.3)) / 0.27;
      const banda = Math.pow(Math.max(0, Math.cos(fase * Math.PI * 2)), 2.2);
      v.y += 0.02 * banda * smooth(0.12, 0.36, v.y);
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  // UV planas (sin remolino en el centro de la tapa)
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / 2.2 + 0.5, pos.getZ(i) / 2.2 + 0.5);
  g.computeVertexNormals();
  return g;
}

// Silueta del corte: ancho a cada altura en el plano z = CORTE
const ancho = (rFn, y) => { const r = rFn(y); return r > CORTE ? Math.sqrt(r * r - CORTE * CORTE) : 0; };
function rangoY(rFn, h) {
  let a = null, b = null;
  for (let i = 0; i <= 2000; i++) {
    const y = -h + (2 * h * i) / 2000;
    if (ancho(rFn, y) > 0) { if (a === null) a = y; b = y; }
  }
  return [a, b];
}
function franja(rFn, y0, y1, n = 60) {
  // polígono cerrado de la sección entre y0 e y1
  const der = [], izq = [];
  for (let i = 0; i <= n; i++) {
    const y = y0 + ((y1 - y0) * i) / n;
    const w = ancho(rFn, y);
    der.push(new THREE.Vector2(w, y));
    izq.unshift(new THREE.Vector2(-w, y));
  }
  return der.concat(izq);
}

/* ---------- materiales ---------- */
const SABORES = {
  chocolate: { color: 0x5a2710, rough: 0.26, sheen: 0x9a5530 },
  blanco: { color: 0xe9dcc2, rough: 0.42, sheen: 0xfff3dc },
};

export function crearAlfajor() {
  const grupo = new THREE.Group();

  // ondas del baño (relieve)
  const ondas = texturaPlana(512, [128, 128, 128], 200, (x, y) => {
    const n = fbm(x * 4, y * 4, 3);
    return 0.35 * n + 0.65 * fbm(x * 22, y * 22, 3);
  });
  ondas.colorSpace = THREE.NoColorSpace;

  const planoCuerpo = new THREE.Plane(new THREE.Vector3(0, 0, -1), CORTE);
  const planoPorcion = new THREE.Plane(new THREE.Vector3(0, 0, 1), -CORTE);
  const baseCuerpo = planoCuerpo.clone(), basePorcion = planoPorcion.clone();

  const opcBaño = {
    color: SABORES.chocolate.color,
    roughness: SABORES.chocolate.rough,
    bumpMap: ondas,
    bumpScale: 0.35,
    clearcoat: 0.6,
    clearcoatRoughness: 0.18,
    sheen: 0.35,
    sheenColor: new THREE.Color(SABORES.chocolate.sheen),
    side: THREE.DoubleSide,
  };
  const matCuerpo = new THREE.MeshPhysicalMaterial({ ...opcBaño, clippingPlanes: [planoCuerpo] });
  const matPorcion = new THREE.MeshPhysicalMaterial({ ...opcBaño, clippingPlanes: [planoPorcion] });
  const matBañoCorte = new THREE.MeshStandardMaterial({ color: SABORES.chocolate.color, roughness: 0.55, side: THREE.DoubleSide });

  // texturas sacadas de la foto del envase (ver tools/texturas.py en DECISIONES.md)
  const cargador = new THREE.TextureLoader();
  const cargar = (url, srgb, tam) => {
    const t = cargador.load(url);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / tam, 1 / tam);   // tam = cuántas unidades cubre una repetición
    t.anisotropy = 4;
    return t;
  };
  const galletaMap = cargar("img/tex/galleta.webp", true, 1.7);
  const galletaBump = cargar("img/tex/galleta-alto.webp", false, 1.7);
  const matGalleta = new THREE.MeshStandardMaterial({ color: 0xc4b6ae, map: galletaMap, bumpMap: galletaBump, bumpScale: 3, roughness: 0.9, side: THREE.DoubleSide });
  const rellenoMap = cargar("img/tex/relleno.webp", true, 2.2);
  const rellenoBump = cargar("img/tex/relleno-alto.webp", false, 2.2);
  const matRelleno = new THREE.MeshPhysicalMaterial({ color: 0xd9c2b4, map: rellenoMap, bumpMap: rellenoBump, bumpScale: 0.8, roughness: 0.32, clearcoat: 0.5, clearcoatRoughness: 0.25, side: THREE.DoubleSide });

  // La cara del corte: baño (anillo), galletita, relleno, galletita
  function crearSeccion() {
    const sec = new THREE.Group();
    const [oa, ob] = rangoY(rOut, HH);
    const [ia, ib] = rangoY(rIn, HH - T);
    const forma = new THREE.Shape(franja(rOut, oa, ob, 120));
    forma.holes.push(new THREE.Path(franja(rIn, ia, ib, 120)));
    sec.add(new THREE.Mesh(new THREE.ShapeGeometry(forma, 1), matBañoCorte));
    // galletita: toda la zona interior
    sec.add(new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(franja(rIn, ia, ib, 120)), 1), matGalleta));
    // relleno adelante, con bordes ondulados como en la foto
    const borde = (x, lado) => lado * F_REL + 0.016 * Math.sin(x * 5.3 + (lado > 0 ? 1.2 : 4)) + 0.008 * Math.sin(x * 13.7 + lado);
    const wB = ancho(rIn, -F_REL) * 0.995, wT = ancho(rIn, F_REL) * 0.995;
    const pts = [];
    for (let i = 0; i <= 80; i++) { const x = -wB + (2 * wB * i) / 80; pts.push(new THREE.Vector2(x, borde(x, -1))); }
    for (let i = 1; i < 20; i++) { const y = borde(wB, -1) + ((borde(wT, 1) - borde(wB, -1)) * i) / 20; pts.push(new THREE.Vector2(ancho(rIn, y) * 0.995, y)); }
    for (let i = 0; i <= 80; i++) { const x = wT - (2 * wT * i) / 80; pts.push(new THREE.Vector2(x, borde(x, 1))); }
    for (let i = 1; i < 20; i++) { const y = borde(-wT, 1) - ((borde(-wT, 1) - borde(-wB, -1)) * i) / 20; pts.push(new THREE.Vector2(-ancho(rIn, y) * 0.995, y)); }
    const rel = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(pts), 1), matRelleno);
    rel.position.z = 0.0015;
    sec.add(rel);
    return sec;
  }

  const geo = geometriaCuerpo();

  const cuerpo = new THREE.Group();
  cuerpo.add(new THREE.Mesh(geo, matCuerpo));
  const secCuerpo = crearSeccion();
  secCuerpo.position.z = CORTE;            // mira hacia +z (la cámara)
  cuerpo.add(secCuerpo);
  grupo.add(cuerpo);

  const porcion = new THREE.Group();
  porcion.add(new THREE.Mesh(geo, matPorcion));
  const secPorcion = crearSeccion();
  secPorcion.position.z = CORTE;
  secPorcion.rotation.y = Math.PI;         // mira hacia el cuerpo
  porcion.add(secPorcion);
  grupo.add(porcion);

  const colorObjetivo = new THREE.Color(SABORES.chocolate.color);
  const sheenObjetivo = new THREE.Color(SABORES.chocolate.sheen);
  let roughObjetivo = SABORES.chocolate.rough;
  const baños = [matCuerpo, matPorcion];

  return {
    grupo,
    piso: -HH,
    setSabor(id, inmediato) {
      const s = SABORES[id] || SABORES.chocolate;
      colorObjetivo.set(s.color);
      sheenObjetivo.set(s.sheen);
      roughObjetivo = s.rough;
      if (inmediato) {
        baños.forEach((m) => { m.color.copy(colorObjetivo); m.sheenColor.copy(sheenObjetivo); m.roughness = roughObjetivo; });
        matBañoCorte.color.copy(colorObjetivo);
      }
    },
    // abierto: 0 = entero, 1 = porción separada
    actualizar(abierto, dt) {
      const k = 1 - Math.pow(0.001, dt);
      baños.forEach((m) => {
        m.color.lerp(colorObjetivo, k);
        m.sheenColor.lerp(sheenObjetivo, k);
        m.roughness += (roughObjetivo - m.roughness) * k;
      });
      matBañoCorte.color.lerp(colorObjetivo, k);
      const a = abierto;
      // la porción gira y se apoya al costado mostrando su propio corte
      porcion.position.set(0.85 * a, 0.25 * Math.sin(a * Math.PI), 0.55 * a);
      porcion.rotation.set(0, (Math.PI + 0.55) * a, 0);
      cuerpo.position.set(-0.5 * a, 0, -0.1 * a);
      // abierto ocupa más ancho: achicamos un poco para que entre en cuadro
      grupo.scale.setScalar(1 - 0.2 * a);
      const entero = a < 0.002;
      // cerrado: sin corte (así no se ve la línea de unión)
      porcion.visible = secCuerpo.visible = !entero;
      grupo.updateWorldMatrix(true, true);
      if (entero) planoCuerpo.set(baseCuerpo.normal, 100);
      else planoCuerpo.copy(baseCuerpo).applyMatrix4(cuerpo.matrixWorld);
      planoPorcion.copy(basePorcion).applyMatrix4(porcion.matrixWorld);
    },
  };
}


/* ---------- escena ---------- */
export function crearEscena(contenedor, opciones = {}) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: !!opciones.preserve,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opciones.dprMax || 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.localClippingEnabled = true;
  contenedor.appendChild(renderer.domElement);

  const escena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  escena.environmentIntensity = 0.45;

  const camara = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camara.position.set(0, 2.2, 5.6);
  camara.lookAt(0, 0.22, 0);

  // luz de estudio: principal cálida, relleno frío desde atrás
  escena.add(new THREE.HemisphereLight(0xffffff, 0x1d5f82, 0.7));
  const key = new THREE.DirectionalLight(0xfff3e6, 2.4);
  key.position.set(-1.4, 6, 2.2);
  escena.add(key);
  const rim = new THREE.DirectionalLight(0xcfe9ff, 1.6);
  rim.position.set(3, 2, -3.5);
  escena.add(rim);

  const alfajor = crearAlfajor();
  const pivote = new THREE.Group();   // giro del usuario + giro automático
  pivote.add(alfajor.grupo);
  escena.add(pivote);

  // piso: sombra suave (sin shadow maps: más liviano y sin artefactos)
  const yPiso = alfajor.piso - 0.005;
  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(2.7, 2.7),
    new THREE.MeshBasicMaterial({ map: texturaSombra(), transparent: true, depthWrite: false })
  );
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = yPiso;
  escena.add(sombra);

  // inclinación base para ver la cara superior
  alfajor.grupo.rotation.x = 0.06;

  function medir() {
    const w = contenedor.clientWidth || 1, h = contenedor.clientHeight || 1;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    camara.aspect = w / h;
    // en pantallas angostas, alejamos la cámara para que entre entero
    const base = w < 600 ? 6.3 : 5.1;
    const z = w / h < 0.95 ? base / Math.max(w / h, 0.55) * 0.88 : base;
    camara.position.set(0, 2.2 * z / 5.6, z);
    camara.lookAt(0, 0.22, 0);
    camara.updateProjectionMatrix();
  }
  medir();

  return { renderer, escena, camara, alfajor, pivote, sombra, medir };
}

/* ---------- héroe de la página ---------- */
function iniciarHero() {
  const raiz = document.documentElement;
  const stage = document.getElementById("alfajor-stage");
  const cont = document.getElementById("alfajor-canvas");
  const img = document.getElementById("alfajor-img");
  const hero = document.getElementById("inicio");
  const etiquetas = document.getElementById("etiquetas");
  const botones = document.querySelectorAll(".sabor-toggle button");
  if (!stage || !cont) return;

  let sabor = "chocolate";
  let escenaRef = null;
  const imagenes = { chocolate: "img/hero-chocolate.webp", blanco: "img/hero-blanco.webp" };
  botones.forEach((b) => b.addEventListener("click", () => {
    sabor = b.dataset.sabor;
    botones.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    const cerrada = document.getElementById("alfajor-img-cerrado");
    if (cerrada) cerrada.src = "img/hero-cerrado-" + sabor + ".webp";
    if (img) {
      img.src = imagenes[sabor];
      img.alt = sabor === "blanco"
        ? "Alfajor proteico con baño blanco y relleno de manteca de maní, cortado al medio"
        : "Alfajor proteico con baño de chocolate y relleno de manteca de maní, cortado al medio";
    }
    if (escenaRef) escenaRef.alfajor.setSabor(sabor);
  }));

  if (!raiz.classList.contains("modo-3d")) return; // modo estático: queda la imagen

  try {
    escenaRef = crearEscena(cont);
  } catch (e) {
    raiz.classList.replace("modo-3d", "modo-estatico");
    return;
  }
  const { renderer, escena, camara, alfajor, pivote, sombra, medir } = escenaRef;
  alfajor.setSabor(sabor, true);

  /* giro con mouse o dedo (solo horizontal en táctil, para no trabar el scroll) */
  let arrastrando = false, ultX = 0, ultY = 0, velY = 0, inclX = 0, giro = 0.6;
  const AUTO = 0.32; // rad/seg
  const VISTA_CORTE = 0.3; // ángulo en el que el corte mira a la cámara
  cont.addEventListener("pointerdown", (e) => {
    arrastrando = true; ultX = e.clientX; ultY = e.clientY;
    cont.setPointerCapture(e.pointerId);
    stage.classList.add("arrastrando");
  });
  cont.addEventListener("pointermove", (e) => {
    if (!arrastrando) return;
    const dx = e.clientX - ultX, dy = e.clientY - ultY;
    ultX = e.clientX; ultY = e.clientY;
    giro += dx * 0.012;
    velY = dx * 0.012 * 60;
    if (e.pointerType === "mouse") inclX = clamp(inclX + dy * 0.006, -0.35, 0.5);
  });
  const soltar = () => { arrastrando = false; stage.classList.remove("arrastrando"); };
  cont.addEventListener("pointerup", soltar);
  cont.addEventListener("pointercancel", soltar);

  /* progreso del scroll dentro del héroe */
  let objetivo = 0, abierto = 0;
  function calcProgreso(p) {
    // 0 → cerrado · 0.15-0.42 se abre · se mantiene · 0.68-0.92 se cierra
    objetivo = smooth(0.12, 0.42, p) * (1 - smooth(0.68, 0.92, p));
  }
  const enganchar = () => {
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.ScrollTrigger.create({
        trigger: hero, start: "top top", end: "bottom bottom",
        onUpdate: (st) => calcProgreso(st.progress),
      });
    } else {
      const f = () => {
        const r = hero.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        calcProgreso(total > 0 ? clamp(-r.top / total) : 0);
      };
      window.addEventListener("scroll", f, { passive: true });
      f();
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enganchar);
  else enganchar();

  /* solo renderizamos cuando el héroe está en pantalla */
  let visible = true;
  new IntersectionObserver((ents) => { visible = ents[0].isIntersecting; if (visible) loop(); }, { rootMargin: "100px" }).observe(stage);

  let ro = new ResizeObserver(() => medir());
  ro.observe(cont);

  let t0 = performance.now(), corriendo = false, primero = true;
  function loop() {
    if (corriendo) return;
    corriendo = true;
    requestAnimationFrame(frame);
  }
  function frame(t) {
    const dt = Math.min(0.05, (t - t0) / 1000); t0 = t;
    if (!arrastrando) {
      velY *= Math.pow(0.04, dt);
      giro += (AUTO * (1 - smooth(0, 0.3, objetivo)) + velY) * dt;
      // al abrir, gira solo hasta mostrar el corte de frente
      if (objetivo > 0.01) {
        const tgt = VISTA_CORTE + Math.PI * 2 * Math.round((giro - VISTA_CORTE) / (Math.PI * 2));
        giro += (tgt - giro) * (1 - Math.pow(0.05, dt)) * smooth(0, 0.4, objetivo);
      }
      inclX *= Math.pow(0.2, dt);
    }
    abierto += (objetivo - abierto) * (1 - Math.pow(0.0005, dt));
    pivote.rotation.y = giro;
    pivote.rotation.x = inclX;
    alfajor.actualizar(abierto, dt);
    sombra.material.opacity = 1 - abierto * 0.15;
    etiquetas.style.setProperty("--abierto", smooth(0.55, 0.95, abierto).toFixed(3));
    renderer.render(escena, camara);
    if (primero) { primero = false; stage.classList.add("listo"); }
    if (visible) requestAnimationFrame(frame); else corriendo = false;
  }
  loop();
}

if (!window.SIGMA_SIN_HERO) iniciarHero();
