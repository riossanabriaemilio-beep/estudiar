/*
  SIGMA — alfajor del inicio (fotos reales, sin 3D).
  - Flota suave y se inclina en perspectiva siguiendo el mouse o el dedo
    (en celular solo el arrastre horizontal: el scroll vertical sigue libre).
  - Con el scroll, el alfajor se acerca y aparecen las 4 etiquetas; al seguir bajando, se van.
  - El botón Chocolate / Blanco cambia la foto con un fundido.
  - Con "reducir movimiento" queda quieto y las etiquetas se ven siempre.
*/
(function () {
  "use strict";
  var raiz = document.documentElement;
  var stage = document.getElementById("alfajor-stage");
  var tilt = document.getElementById("alfajor-tilt");
  var hero = document.getElementById("inicio");
  var etiquetas = document.getElementById("etiquetas");
  if (!stage || !tilt) return;

  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* Sabor */
  var fotos = tilt.querySelectorAll(".alfajor__foto");
  document.querySelectorAll(".sabor-toggle button").forEach(function (b) {
    b.addEventListener("click", function () {
      var sabor = b.getAttribute("data-sabor");
      document.querySelectorAll(".sabor-toggle button").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      fotos.forEach(function (f) {
        var activa = f.getAttribute("data-sabor") === sabor;
        f.classList.toggle("activa", activa);
        if (activa) f.removeAttribute("aria-hidden"); else f.setAttribute("aria-hidden", "true");
      });
    });
  });

  if (!raiz.classList.contains("modo-anim")) return; // quieto

  /* Inclinación con mouse o dedo */
  var objX = 0, objY = 0, rx = 0, ry = 0;
  var arrastre = null;
  stage.addEventListener("pointermove", function (e) {
    var r = stage.getBoundingClientRect();
    var nx = (e.clientX - r.left) / r.width - 0.5;
    var ny = (e.clientY - r.top) / r.height - 0.5;
    if (e.pointerType === "mouse") { objY = nx * 26; objX = -ny * 18; }
    else if (arrastre !== null) { objY = clamp((e.clientX - arrastre) / r.width * 60, -24, 24); }
  });
  stage.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") arrastre = e.clientX; });
  var soltar = function () { arrastre = null; objX = 0; objY = 0; };
  stage.addEventListener("pointerup", soltar);
  stage.addEventListener("pointercancel", soltar);
  stage.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") soltar(); });

  /* Progreso del scroll dentro del inicio */
  var abierto = 0, objAbierto = 0;
  function medirScroll() {
    var r = hero.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    var p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    objAbierto = smooth(0.1, 0.4, p) * (1 - smooth(0.7, 0.95, p));
  }
  window.addEventListener("scroll", medirScroll, { passive: true });
  window.addEventListener("resize", medirScroll);
  medirScroll();

  /* Solo animamos cuando el inicio está en pantalla */
  var visible = true, corriendo = false, t0 = performance.now(), inicio = t0;
  new IntersectionObserver(function (ents) { visible = ents[0].isIntersecting; if (visible) arrancar(); }, { rootMargin: "100px" }).observe(stage);

  function arrancar() { if (!corriendo) { corriendo = true; requestAnimationFrame(cuadro); } }
  function cuadro(t) {
    var dt = Math.min(0.05, (t - t0) / 1000); t0 = t;
    var k = 1 - Math.pow(0.002, dt);
    rx += (objX - rx) * k;
    ry += (objY - ry) * k;
    abierto += (objAbierto - abierto) * (1 - Math.pow(0.001, dt));
    var seg = (t - inicio) / 1000;
    var flota = Math.sin(seg * 1.3) * 8;                 // px
    var balanceo = Math.sin(seg * 0.6) * 4 * (1 - abierto); // grados
    var escala = 1 + 0.1 * abierto;
    var giroZ = -5 * (1 - abierto) + 2 * abierto;
    tilt.style.transform =
      "translateY(" + (flota - 10 * abierto).toFixed(2) + "px) " +
      "rotateX(" + (rx + 6).toFixed(2) + "deg) rotateY(" + (ry + balanceo).toFixed(2) + "deg) " +
      "rotateZ(" + giroZ.toFixed(2) + "deg) scale(" + escala.toFixed(3) + ")";
    stage.style.setProperty("--flota", (flota / 8).toFixed(3));
    etiquetas.style.setProperty("--abierto", smooth(0.5, 0.95, abierto).toFixed(3));
    if (visible) requestAnimationFrame(cuadro); else corriendo = false;
  }
  stage.classList.add("listo");
  arrancar();
})();
