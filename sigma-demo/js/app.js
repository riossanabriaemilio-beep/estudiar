/* SIGMA — arma la página a partir de config.js */
(function () {
  "use strict";
  var C = window.SIGMA_CONFIG;
  if (!C) return;

  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] === null || attrs[k] === undefined) continue;
      if (k === "class") n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    }
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var externo = function (a) { a.target = "_blank"; a.rel = "noopener"; return a; };
  var waLink = function (num, texto) {
    return "https://wa.me/" + String(num).replace(/\D/g, "") + (texto ? "?text=" + encodeURIComponent(texto) : "");
  };

  /* 0. Aviso */
  $("aviso").textContent = C.aviso;

  /* 1. Navegación */
  var navLista = $("nav-lista");
  C.nav.forEach(function (item) {
    var li = el("li");
    li.appendChild(el("a", { href: item.href }, esc(item.texto)));
    navLista.appendChild(li);
  });
  var menuBtn = $("menu-btn"), nav = $("nav");
  function cerrarMenu() {
    nav.classList.remove("abierto");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Abrir menú");
  }
  menuBtn.addEventListener("click", function () {
    var abierto = nav.classList.toggle("abierto");
    menuBtn.setAttribute("aria-expanded", String(abierto));
    menuBtn.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });
  navLista.addEventListener("click", function (e) { if (e.target.closest("a")) cerrarMenu(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrarMenu(); });

  /* 2. Inicio */
  var I = C.inicio;
  $("hero-titulo").innerHTML = I.titulo.map(function (l) {
    return '<span class="linea">' + esc(l) + "</span>";
  }).join(" ");
  $("hero-sub").textContent = I.subtitulo;
  var hb = $("hero-botones");
  hb.appendChild(el("a", { class: "btn btn--noche", href: I.botonPrincipal.href }, esc(I.botonPrincipal.texto)));
  hb.appendChild(el("a", { class: "btn btn--borde", href: I.botonSecundario.href }, esc(I.botonSecundario.texto)));
  var et = $("etiquetas");
  I.etiquetas3d.forEach(function (t, i) {
    et.appendChild(el("li", { class: "etiqueta etiqueta--" + (i + 1) }, "<span>" + esc(t) + "</span>"));
  });

  /* 3. Sabores */
  var sg = $("sabores-grid");
  C.sabores.forEach(function (s) {
    var art = el("article", { class: "sabor sabor--" + s.id, "aria-labelledby": "sabor-" + s.id });
    art.innerHTML =
      '<div class="sabor__texto">' +
        '<h3 class="sabor__nombre" id="sabor-' + s.id + '">' + esc(s.nombre) + "</h3>" +
        '<p class="sabor__bajada">' + esc(s.bajada) + "</p>" +
        '<p class="sabor__dato"><strong>15 g</strong> de proteína · 63 g</p>' +
        '<a class="btn ' + (s.id === "blanco" ? "btn--noche" : "btn--crema") + '" href="' + esc(s.boton.href) + '">' + esc(s.boton.texto) + "</a>" +
      "</div>" +
      '<img class="sabor__img" src="' + esc(s.imagen) + '" alt="' + esc(s.alt) + '" loading="lazy" width="800" height="800">';
    sg.appendChild(art);
  });

  /* 4. Tabla nutricional (las filas sin valor no se muestran) */
  var N = C.nutricion;
  var filas = N.filas.filter(function (f) { return f.valor; });
  var tabla = '<p class="tabla__titulo">Información nutricional</p>' +
    '<p class="tabla__porcion">' + esc(N.porcion) + "</p>" +
    '<div class="tabla__barra" aria-hidden="true"></div>' +
    '<table><caption class="visually-hidden">Información nutricional ' + esc(N.porcion) + "</caption>" +
    '<thead><tr><th scope="col">Cantidad por porción</th><th scope="col">' + esc(N.porcion.replace(/^Por unidad /, "").replace(/[()]/g, "")) + "</th></tr></thead><tbody>" +
    filas.map(function (f) {
      return '<tr class="' + (f.destacado ? "destacado " : "") + (f.sangria ? "sangria" : "") + '"><th scope="row">' + esc(f.nombre) + "</th><td>" + esc(f.valor) + "</td></tr>";
    }).join("") +
    "</tbody></table>" +
    '<div class="tabla__barra tabla__barra--fina" aria-hidden="true"></div>' +
    '<p class="tabla__sub">Ingredientes destacados</p>' +
    '<ul class="tabla__ingredientes">' +
    N.ingredientes.map(function (g) {
      return "<li><strong>" + esc(g.nombre) + "</strong><span>" + esc(g.detalle) + "</span></li>";
    }).join("") +
    "</ul>" +
    '<p class="tabla__nota">' + esc(N.nota) + "</p>";
  $("tabla-nutricional").innerHTML = tabla;

  /* 5. Cuándo comerlo */
  var M = C.momentos;
  $("momentos-titulo").textContent = M.titulo;
  $("momentos-img").src = M.imagen;
  $("momentos-img").alt = M.alt;
  $("momentos-lista").innerHTML = M.items.map(function (m) {
    return '<div class="momento"><h3>' + esc(m.titulo) + "</h3><p>" + esc(m.texto) + "</p></div>";
  }).join("");

  /* 6. Dónde comprar */
  $("tiendas-img").src = C.tiendasImagen.src;
  $("tiendas-img").alt = C.tiendasImagen.alt;
  var ti = $("tiendas");
  C.tiendas.forEach(function (t) {
    var li = el("li", { class: "tienda" });
    li.innerHTML = '<div><h3 class="tienda__nombre">' + esc(t.nombre) + '</h3><p class="tienda__detalle">' + esc(t.detalle) + "</p></div>";
    var a = externo(el("a", { class: "btn btn--azul btn--ancho", href: t.url }, esc(t.boton)));
    a.setAttribute("aria-label", t.boton + " (se abre en otra pestaña)");
    li.appendChild(a);
    ti.appendChild(li);
  });

  /* 7. Mayoristas */
  var MY = C.mayoristas;
  $("mayoristas-titulo").textContent = MY.titulo;
  $("mayoristas-bajada").textContent = MY.texto;
  $("mayoristas-img").src = MY.imagen;
  $("mayoristas-img").alt = MY.alt;
  $("form-mail").textContent = C.marca.email;
  var sel = $("f-tipo");
  sel.appendChild(el("option", { value: "" }, "Elegí una opción"));
  MY.tiposNegocio.forEach(function (t) { sel.appendChild(el("option", { value: t }, esc(t))); });

  var form = $("form-mayoristas"), err = $("form-error");
  function datosForm() {
    var f = new FormData(form), d = {};
    ["nombre", "negocio", "tipo", "ciudad", "cantidad", "mensaje"].forEach(function (k) { d[k] = String(f.get(k) || "").trim(); });
    return d;
  }
  function textoPedido(d) {
    return [
      "Hola, Sigma. Quiero vender el alfajor proteico en mi negocio.",
      "",
      "Nombre: " + d.nombre,
      "Negocio: " + d.negocio,
      "Tipo de negocio: " + d.tipo,
      "Ciudad: " + d.ciudad,
      "Cantidad estimada: " + (d.cantidad || "A definir"),
      "",
      "Mensaje: " + (d.mensaje || "-"),
    ].join("\n");
  }
  function validar() {
    var faltan = [];
    form.querySelectorAll("[required]").forEach(function (c) {
      var ok = c.value.trim() !== "";
      c.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok) faltan.push(form.querySelector('label[for="' + c.id + '"]').textContent);
    });
    if (faltan.length) {
      err.textContent = "Completá: " + faltan.join(", ") + ".";
      err.hidden = false;
      form.querySelector('[aria-invalid="true"]').focus();
      return false;
    }
    err.hidden = true;
    return true;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validar()) return;
    var d = datosForm();
    var href = "mailto:" + C.marca.email +
      "?subject=" + encodeURIComponent(MY.asuntoMail + " — " + d.negocio) +
      "&body=" + encodeURIComponent(textoPedido(d));
    window.SIGMA_ULTIMO_MAILTO = href; // para pruebas
    window.location.href = href;
  });
  if (C.marca.whatsapp) {
    var wa = externo(el("a", { class: "btn btn--borde-oscuro", href: "#" }, "Escribir por WhatsApp"));
    wa.addEventListener("click", function (e) {
      var d = datosForm();
      wa.href = waLink(C.marca.whatsapp, d.nombre ? textoPedido(d) : "Hola, Sigma. Quiero vender el alfajor proteico en mi negocio.");
    });
    $("form-acciones").appendChild(wa);
  }

  /* 8. Comunidad */
  var CO = C.comunidad;
  $("comunidad-titulo").textContent = CO.titulo;
  $("comunidad-bajada").textContent = CO.texto;
  $("comunidad-bloques").innerHTML = CO.bloques.map(function (b) {
    return '<div class="bloque"><h3>' + esc(b.titulo) + "</h3><p>" + esc(b.texto) + "</p></div>";
  }).join("");
  $("galeria").innerHTML = CO.fotos.slice(0, 6).map(function (f) {
    return '<li><img src="' + esc(f.src) + '" alt="' + esc(f.alt) + '" loading="lazy" width="600" height="750"></li>';
  }).join("");
  var ig = $("comunidad-ig");
  ig.href = C.marca.instagram;
  ig.textContent = "Seguinos en Instagram " + C.marca.instagramUsuario;
  ig.setAttribute("aria-label", "Seguinos en Instagram " + C.marca.instagramUsuario + " (se abre en otra pestaña)");

  /* 9. Preguntas frecuentes */
  $("faq-lista").innerHTML = C.faq.map(function (f) {
    return '<details class="pregunta"><summary>' + esc(f.p) + '<span class="pregunta__icono" aria-hidden="true"></span></summary><p>' + esc(f.r) + "</p></details>";
  }).join("");

  /* 10. Pie */
  $("pie-frase").textContent = C.marca.frase;
  var pc = $("pie-contacto");
  pc.innerHTML =
    '<li><a href="' + esc(C.marca.instagram) + '" target="_blank" rel="noopener">Instagram ' + esc(C.marca.instagramUsuario) + "</a></li>" +
    '<li><a href="mailto:' + esc(C.marca.email) + '">' + esc(C.marca.email) + "</a></li>" +
    (C.marca.whatsapp ? '<li><a href="' + waLink(C.marca.whatsapp) + '" target="_blank" rel="noopener">WhatsApp</a></li>' : "");
  $("pie-tiendas").innerHTML = C.tiendas.map(function (t) {
    return '<li><a href="' + esc(t.url) + '" target="_blank" rel="noopener">' + esc(t.nombre) + "</a></li>";
  }).join("");
  var F = C.firma;
  $("pie-firma").innerHTML = "<span>" + esc(F.texto) + "</span>" +
    (F.whatsapp ? ' · <a href="' + waLink(F.whatsapp, "Hola Emilio, vi la propuesta de Sigma.") + '" target="_blank" rel="noopener">WhatsApp</a>' : "");

  /* Entrada del texto del inicio (solo si GSAP cargó y no hay reduced-motion) */
  document.addEventListener("DOMContentLoaded", function () {
    if (!window.gsap || document.documentElement.classList.contains("sin-movimiento")) return;
    window.gsap.from(".hero__titulo .linea, .hero__sub, .hero__botones, .sabor-toggle", {
      y: 28, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.09, clearProps: "transform,opacity",
    });
  });
})();
