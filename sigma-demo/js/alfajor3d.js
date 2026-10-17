/*
  SIGMA — alfajor 3D hecho con código (Three.js, sin archivos de modelo).
  - Dos tapas bañadas (chocolate negro o blanco), relleno de manteca de maní con trozos de maní.
  - Gira solo; se puede girar arrastrando (en celular, solo el arrastre horizontal: el scroll vertical sigue libre).
  - Con el scroll, la tapa se levanta y aparecen las etiquetas; al seguir bajando, se cierra.
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

/* ---------- geometría ---------- */
const R = 1;            // radio del alfajor
const H_TAPA = 0.25;    // alto de cada tapa bañada
const H_REL = 0.17;     // alto del relleno

// Perfil de una tapa (de abajo hacia arriba): base plana, borde redondeado, cara superior apenas abombada
function perfilTapa() {
  const p = [];
  const rc = 0.13;   // radio del canto superior
  const rb = 0.05;   // radio del canto inferior
  p.push(new THREE.Vector2(0, 0));
  p.push(new THREE.Vector2(R - rb - 0.02, 0));
  for (let i = 1; i <= 6; i++) {
    const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2);
    p.push(new THREE.Vector2(R - rb + Math.cos(a) * rb, rb + Math.sin(a) * rb));
  }
  // lado, con una leve "pollerita" de baño abajo
  p.push(new THREE.Vector2(R + 0.004, H_TAPA * 0.45));
  p.push(new THREE.Vector2(R, H_TAPA - rc));
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * (Math.PI / 2);
    p.push(new THREE.Vector2(R - rc + Math.cos(a) * rc, H_TAPA - rc + Math.sin(a) * rc));
  }
  for (let i = 1; i <= 10; i++) {
    const r = (R - rc) * (1 - i / 10);
    const dome = 0.035 * (1 - Math.pow(r / R, 2));
    p.push(new THREE.Vector2(Math.max(r, 0.0001), H_TAPA + dome));
  }
  return p;
}

function geometriaTapa(semilla) {
  const g = new THREE.LatheGeometry(perfilTapa(), 128);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z);
    if (r < 0.02) continue;
    const ang = Math.atan2(v.z, v.x);
    // irregularidad del baño: ondas suaves en el borde y en la superficie
    const n = fbm(Math.cos(ang) * 2.2 + semilla, Math.sin(ang) * 2.2 + v.y * 3, 3) - 0.5;
    const borde = smooth(0.55, 0.95, r);
    const k = 1 + n * 0.022 * borde;
    v.x *= k; v.z *= k;
    v.y += (fbm(v.x * 2.5 + semilla, v.z * 2.5, 3) - 0.5) * 0.02 * (v.y > 0.05 ? 1 : 0);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  // UV planas: evitan el "remolino" que deja el torno en el centro de la tapa
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / (2.2 * R) + 0.5, pos.getZ(i) / (2.2 * R) + 0.5);
  g.computeVertexNormals();
  return g;
}

function geometriaRelleno() {
  const p = [];
  const rr = R * 0.93;
  p.push(new THREE.Vector2(0, 0));
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const bulge = Math.sin(t * Math.PI) * 0.06;
    p.push(new THREE.Vector2(rr + bulge, t * H_REL));
  }
  p.push(new THREE.Vector2(0.0001, H_REL));
  const g = new THREE.LatheGeometry(p, 128);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z);
    if (r < 0.05) continue;
    const ang = Math.atan2(v.z, v.x);
    // manteca de maní: borde grumoso, con chorreadas
    const n = fbm(Math.cos(ang) * 4 + 3, Math.sin(ang) * 4 + v.y * 10, 4) - 0.5;
    const k = 1 + n * 0.08 * smooth(0.6, 0.95, r / R);
    v.x *= k; v.z *= k;
    if (v.y > H_REL * 0.9 && r < rr) v.y += (fbm(v.x * 4, v.z * 4, 3) - 0.5) * 0.03;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/* ---------- materiales ---------- */
const SABORES = {
  chocolate: { color: 0x2b150c, rough: 0.4, sheen: 0x5a3020 },
  blanco: { color: 0xe6d6b8, rough: 0.5, sheen: 0xf6ead2 },
};

export function crearAlfajor() {
  const grupo = new THREE.Group();

  const bump = texturaRuido(256, 3, 4, 1.4);

  const matBaño = new THREE.MeshPhysicalMaterial({
    color: SABORES.chocolate.color,
    roughness: SABORES.chocolate.rough,
    bumpMap: bump,
    bumpScale: 0.9,
    clearcoat: 0.2,
    clearcoatRoughness: 0.45,
    sheen: 0.3,
    sheenColor: new THREE.Color(SABORES.chocolate.sheen),
  });

  // manteca de maní: vetas en espiral, como cuando se esparce con cuchillo
  const remolino = (x, y) => {
    const cx = x - 0.5, cy = y - 0.5, r = Math.hypot(cx, cy), a = Math.atan2(cy, cx);
    const n = fbm(x * 7, y * 7, 4);
    return 0.55 * n + 0.45 * (0.5 + 0.5 * Math.sin(a * 2 + r * 26 + n * 5));
  };
  const texMani = texturaPlana(512, [140, 78, 30], 60, remolino);
  const bumpMani = texturaPlana(512, [128, 128, 128], 255, remolino);
  bumpMani.colorSpace = THREE.NoColorSpace;
  const matRelleno = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: texMani,
    roughness: 0.42,
    bumpMap: bumpMani,
    bumpScale: 1.4,
  });
  // en el borde del torno el mapa plano se estira: le damos un tono similar sin mapa
  const matReillenoBorde = new THREE.MeshStandardMaterial({
    color: 0x8f5222,
    roughness: 0.45,
    bumpMap: texturaRuido(256, 10, 4, 1.8),
    bumpScale: 1.6,
  });

  const matGalleta = new THREE.MeshStandardMaterial({
    map: texturaPlana(256, [92, 58, 38], 60, (x, y) => fbm(x * 30, y * 30, 3)),
    roughness: 0.9,
    bumpMap: texturaRuido(256, 20, 3, 2),
    bumpScale: 1.2,
  });

  const matMani = new THREE.MeshStandardMaterial({ color: 0xc89358, roughness: 0.6 });

  // Tapa de abajo: espejada
  const gInf = geometriaTapa(7.3);
  gInf.scale(1, -1, 1);
  // al espejar se invierten las caras: corregimos el orden de los índices
  const idx = gInf.index.array;
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
  gInf.computeVertexNormals();
  const tapaInf = new THREE.Mesh(gInf, matBaño);
  tapaInf.position.y = -H_REL / 2;
  grupo.add(tapaInf);

  // Relleno
  const gRel = geometriaRelleno();
  const relleno = new THREE.Mesh(gRel, matReillenoBorde);
  relleno.position.y = -H_REL / 2;
  grupo.add(relleno);
  // superficie visible del relleno cuando se levanta la tapa
  const sup = new THREE.Mesh(new THREE.CircleGeometry(R * 0.92, 96), matRelleno);
  sup.rotation.x = -Math.PI / 2;
  sup.position.y = H_REL / 2 + 0.004;
  grupo.add(sup);

  // Trozos de maní en el borde y arriba del relleno
  const piezas = new THREE.Group();
  const gm = new THREE.DodecahedronGeometry(1, 0);
  for (let i = 0; i < 40; i++) {
    const enBorde = i < 28;
    const a = hash(i, 1) * Math.PI * 2;
    const r = enBorde ? R * (0.95 + hash(i, 2) * 0.04) : Math.sqrt(hash(i, 3)) * R * 0.82;
    const m = new THREE.Mesh(gm, matMani);
    const s = 0.024 + hash(i, 4) * 0.026;
    m.scale.set(s * 1.4, s * 0.8, s);
    m.position.set(Math.cos(a) * r, enBorde ? (hash(i, 5) - 0.5) * H_REL * 0.7 : H_REL / 2 + 0.006, Math.sin(a) * r);
    m.rotation.set(hash(i, 6) * 6, hash(i, 7) * 6, hash(i, 8) * 6);
    piezas.add(m);
  }
  grupo.add(piezas);

  // Tapa de arriba (en su propio grupo para poder levantarla)
  const tapaSupGrupo = new THREE.Group();
  tapaSupGrupo.position.y = H_REL / 2;
  const tapaSup = new THREE.Mesh(geometriaTapa(2.1), matBaño);
  tapaSupGrupo.add(tapaSup);
  // cara interna: la galletita (se ve cuando se levanta)
  const galleta = new THREE.Mesh(new THREE.CircleGeometry(R * 0.95, 96), matGalleta);
  galleta.rotation.x = Math.PI / 2;
  galleta.position.y = -0.002;
  tapaSupGrupo.add(galleta);
  grupo.add(tapaSupGrupo);

  const colorObjetivo = new THREE.Color(SABORES.chocolate.color);
  const sheenObjetivo = new THREE.Color(SABORES.chocolate.sheen);
  let roughObjetivo = SABORES.chocolate.rough;

  return {
    grupo,
    tapa: tapaSupGrupo,
    setSabor(id, inmediato) {
      const s = SABORES[id] || SABORES.chocolate;
      colorObjetivo.set(s.color);
      sheenObjetivo.set(s.sheen);
      roughObjetivo = s.rough;
      if (inmediato) {
        matBaño.color.copy(colorObjetivo);
        matBaño.sheenColor.copy(sheenObjetivo);
        matBaño.roughness = roughObjetivo;
      }
    },
    // abierto: 0 = cerrado, 1 = tapa levantada
    actualizar(abierto, dt) {
      const k = 1 - Math.pow(0.001, dt);
      matBaño.color.lerp(colorObjetivo, k);
      matBaño.sheenColor.lerp(sheenObjetivo, k);
      matBaño.roughness += (roughObjetivo - matBaño.roughness) * k;
      tapaSupGrupo.position.y = H_REL / 2 + abierto * 0.62;
      tapaSupGrupo.position.x = -abierto * 0.12;
      tapaSupGrupo.rotation.z = abierto * 0.32;
      tapaSupGrupo.rotation.x = -abierto * 0.18;
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
  contenedor.appendChild(renderer.domElement);

  const escena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  escena.environmentIntensity = 0.55;

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
  const yPiso = -H_REL / 2 - H_TAPA - 0.01;
  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(2.7, 2.7),
    new THREE.MeshBasicMaterial({ map: texturaSombra(), transparent: true, depthWrite: false })
  );
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = yPiso;
  escena.add(sombra);

  // inclinación base para ver la cara superior
  alfajor.grupo.rotation.x = 0.12;

  function medir() {
    const w = contenedor.clientWidth || 1, h = contenedor.clientHeight || 1;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    camara.aspect = w / h;
    // en pantallas angostas, alejamos la cámara para que entre entero
    const base = w < 600 ? 6.2 : 5.0;
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
        ? "Alfajor proteico con baño blanco y relleno de manteca de maní, con la tapa levantada"
        : "Alfajor proteico con baño de chocolate y relleno de manteca de maní, con la tapa levantada";
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
      giro += (AUTO * (1 - abierto * 0.7) + velY) * dt;
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
