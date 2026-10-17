/* SIGMA — arma la página a partir de config.js (sirve para index.html y collabs.html) */
(function () {
  "use strict";
  var C = window.SIGMA_CONFIG;
  if (!C) return;

  var $ = function (id) { return document.getElementById(id); };
  var si = function (id, fn) { var n = $(id); if (n) fn(n); };
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
  var waLink = function (num, texto) {
    return "https://wa.me/" + String(num).replace(/\D/g, "") + (texto ? "?text=" + encodeURIComponent(texto) : "");
  };
  var ext = function (url) { return /^https?:/.test(url) ? ' target="_blank" rel="noopener"' : ""; };
  var pagina = document.body.getAttribute("data-pagina") || "inicio";
  // en collabs.html, los links "#seccion" van a la página principal
  var link = function (href) { return pagina !== "inicio" && href.charAt(0) === "#" ? "index.html" + href : href; };

  /* 0. Aviso */
  si("aviso", function (n) { n.textContent = C.aviso; });

  /* 1. Navegación */
  si("nav-lista", function (navLista) {
    C.nav.forEach(function (item) {
      var actual = pagina === "collabs" && item.href === "collabs.html";
      var li = el("li");
      li.appendChild(el("a", { href: link(item.href), "aria-current": actual ? "page" : null }, esc(item.texto)));
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
  });
  document.querySelectorAll("[data-link]").forEach(function (a) { a.href = link(a.getAttribute("data-link")); });

  /* 2. Inicio */
  var I = C.inicio;
  si("hero-titulo", function (n) {
    n.innerHTML = I.titulo.map(function (l) { return '<span class="linea">' + esc(l) + "</span>"; }).join(" ");
  });
  si("hero-sub", function (n) { n.textContent = I.subtitulo; });
  si("hero-botones", function (hb) {
    hb.appendChild(el("a", { class: "btn btn--noche", href: I.botonPrincipal.href }, esc(I.botonPrincipal.texto)));
    hb.appendChild(el("a", { class: "btn btn--borde", href: I.botonSecundario.href }, esc(I.botonSecundario.texto)));
  });
  si("etiquetas", function (et) {
    I.etiquetas3d.forEach(function (t, i) {
      et.appendChild(el("li", { class: "etiqueta etiqueta--" + (i + 1) }, "<span>" + esc(t) + "</span>"));
    });
  });

  /* 3. Productos: alfajor (sabores) + snack */
  si("sabores-grid", function (sg) {
    C.sabores.forEach(function (s) {
      var art = el("article", { class: "sabor sabor--" + s.id, "aria-labelledby": "sabor-" + s.id });
      art.innerHTML =
        '<div class="sabor__texto">' +
          '<p class="sabor__tipo">Alfajor proteico</p>' +
          '<h3 class="sabor__nombre" id="sabor-' + s.id + '">' + esc(s.nombre) + "</h3>" +
          '<p class="sabor__bajada">' + esc(s.bajada) + "</p>" +
          '<p class="sabor__dato"><strong>15 g</strong> de proteína · 63 g</p>' +
          '<a class="btn ' + (s.id === "blanco" ? "btn--noche" : "btn--crema") + '" href="' + esc(s.boton.href) + '">' + esc(s.boton.texto) + "</a>" +
        "</div>" +
        '<img class="sabor__img sabor__img--alfajor" src="' + esc(s.imagen) + '" alt="' + esc(s.alt) + '" loading="lazy" width="640" height="483">';
      sg.appendChild(art);
    });
    var K = C.snack;
    if (K) {
      var art = el("article", { class: "sabor sabor--snack", "aria-labelledby": "sabor-snack" });
      art.innerHTML =
        '<div class="sabor__texto">' +
          '<p class="sabor__tipo">' + esc(K.nombre) + "</p>" +
          '<h3 class="sabor__nombre" id="sabor-snack">' + esc(K.sabor) + "</h3>" +
          '<p class="sabor__bajada">' + esc(K.bajada) + "</p>" +
          '<ul class="sabor__lista">' + K.datos.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") +
            (K.peso ? "<li>" + esc(K.peso) + "</li>" : "") + "</ul>" +
          '<a class="btn btn--amarillo" href="' + esc(K.boton.href) + '"' + ext(K.boton.href) + ">" + esc(K.boton.texto) + "</a>" +
        "</div>" +
        '<div class="snack-escena" role="img" aria-label="' + esc(K.alt) + '" style="aspect-ratio:' + K.escena.ancho + "/" + K.escena.alto + '">' +
          K.escena.piezas.map(function (p) {
            var st = "left:" + p.x + "%;top:" + p.y + "%;width:" + p.w + "%;";
            if (!p.paquete) st += "--dx:" + p.dx + "px;--dy:" + p.dy + "px;--rot:" + p.rot + "deg;--dur:" + p.dur + "s;--delay:" + p.delay + "s;";
            return '<img class="' + (p.paquete ? "snack-escena__paquete" : "snack-escena__trozo") + '" src="' + esc(p.src) + '" alt="" loading="lazy" style="' + st + '">';
          }).join("") +
        "</div>";
      sg.appendChild(art);
    }
  });

  /* 4. Tabla nutricional (las filas sin valor no se muestran) */
  si("tabla-nutricional", function (n) {
    var N = C.nutricion;
    var filas = N.filas.filter(function (f) { return f.valor; });
    n.innerHTML = '<p class="tabla__titulo">Información nutricional</p>' +
      '<p class="tabla__porcion">Alfajor · ' + esc(N.porcion) + "</p>" +
      '<div class="tabla__barra" aria-hidden="true"></div>' +
      '<table><caption class="visually-hidden">Información nutricional del alfajor ' + esc(N.porcion) + "</caption>" +
      '<thead><tr><th scope="col">Cantidad por porción</th><th scope="col">' + esc(N.porcion.replace(/^Por unidad /, "").replace(/[()]/g, "")) + "</th></tr></thead><tbody>" +
      filas.map(function (f) {
        return '<tr class="' + (f.destacado ? "destacado " : "") + (f.sangria ? "sangria" : "") + '"><th scope="row">' + esc(f.nombre) + "</th><td>" + esc(f.valor) + "</td></tr>";
      }).join("") +
      "</tbody></table>" +
      '<div class="tabla__barra tabla__barra--fina" aria-hidden="true"></div>' +
      '<p class="tabla__sub">Ingredientes destacados</p>' +
      '<ul class="tabla__ingredientes">' +
      N.ingredientes.map(function (g) { return "<li><strong>" + esc(g.nombre) + "</strong><span>" + esc(g.detalle) + "</span></li>"; }).join("") +
      "</ul>" +
      '<p class="tabla__nota">' + esc(N.nota) + "</p>";
  });

  /* 5. Cuándo comerlo */
  var M = C.momentos;
  si("momentos-titulo", function (n) { n.textContent = M.titulo; });
  si("momentos-img", function (n) { n.src = M.imagen; n.alt = M.alt; });
  si("momentos-lista", function (n) {
    n.innerHTML = M.items.map(function (m) { return '<div class="momento"><h3>' + esc(m.titulo) + "</h3><p>" + esc(m.texto) + "</p></div>"; }).join("");
  });

  /* 6. Dónde comprar */
  si("tiendas-img", function (n) { n.src = C.tiendasImagen.src; n.alt = C.tiendasImagen.alt; });
  si("tiendas", function (ti) {
    C.tiendas.forEach(function (t) {
      var li = el("li", { class: "tienda" });
      li.innerHTML = '<div><h3 class="tienda__nombre">' + esc(t.nombre) + '</h3><p class="tienda__detalle">' + esc(t.detalle) + "</p></div>" +
        '<a class="btn btn--azul btn--ancho" href="' + esc(t.url) + '" target="_blank" rel="noopener" aria-label="' + esc(t.boton) + ' (se abre en otra pestaña)">' + esc(t.boton) + "</a>";
      ti.appendChild(li);
    });
  });

  /* 7. Mayoristas */
  var MY = C.mayoristas;
  si("mayoristas-titulo", function (n) { n.textContent = MY.titulo; });
  si("mayoristas-bajada", function (n) { n.textContent = MY.texto; });
  si("mayoristas-img", function (n) { n.src = MY.imagen; n.alt = MY.alt; });
  si("form-mail", function (n) { n.textContent = C.marca.email; });
  si("form-mayoristas", function (form) {
    var sel = $("f-tipo"), err = $("form-error");
    sel.appendChild(el("option", { value: "" }, "Elegí una opción"));
    MY.tiposNegocio.forEach(function (t) { sel.appendChild(el("option", { value: t }, esc(t))); });
    function datosForm() {
      var f = new FormData(form), d = {};
      ["nombre", "negocio", "tipo", "ciudad", "cantidad", "mensaje"].forEach(function (k) { d[k] = String(f.get(k) || "").trim(); });
      return d;
    }
    function textoPedido(d) {
      return [
        "Hola, Sigma. Quiero vender sus productos en mi negocio.",
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
      var wa = el("a", { class: "btn btn--borde-oscuro", href: "#", target: "_blank", rel: "noopener" }, "Escribir por WhatsApp");
      wa.addEventListener("click", function () {
        var d = datosForm();
        wa.href = waLink(C.marca.whatsapp, d.nombre ? textoPedido(d) : "Hola, Sigma. Quiero vender sus productos en mi negocio.");
      });
      $("form-acciones").appendChild(wa);
    }
  });

  /* 8. Comunidad */
  var CO = C.comunidad;
  si("comunidad-titulo", function (n) { n.textContent = CO.titulo; });
  si("comunidad-bajada", function (n) { n.textContent = CO.texto; });
  si("comunidad-bloques", function (n) {
    n.innerHTML = CO.bloques.map(function (b) { return '<div class="bloque"><h3>' + esc(b.titulo) + "</h3><p>" + esc(b.texto) + "</p></div>"; }).join("");
  });
  si("galeria", function (n) {
    n.innerHTML = CO.fotos.slice(0, 6).map(function (f) {
      return '<li><img src="' + esc(f.src) + '" alt="' + esc(f.alt) + '" loading="lazy" width="600" height="750"></li>';
    }).join("");
  });
  si("comunidad-ig", function (ig) {
    ig.href = C.marca.instagram;
    ig.textContent = "Seguinos en Instagram " + C.marca.instagramUsuario;
    ig.setAttribute("aria-label", "Seguinos en Instagram " + C.marca.instagramUsuario + " (se abre en otra pestaña)");
  });

  /* 9. Preguntas frecuentes */
  si("faq-lista", function (n) {
    n.innerHTML = C.faq.map(function (f) {
      return '<details class="pregunta"><summary>' + esc(f.p) + '<span class="pregunta__icono" aria-hidden="true"></span></summary><p>' + esc(f.r) + "</p></details>";
    }).join("");
  });

  /* Página de collabs */
  var CL = C.collabs;
  if (CL) {
    si("collabs-titulo", function (n) { n.textContent = CL.titulo; });
    si("collabs-puntos", function (n) {
      n.innerHTML = CL.puntos.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
    });
    document.querySelectorAll("[data-dm]").forEach(function (a) { a.href = CL.dm; });
    si("creadores", function (n) {
      n.innerHTML = CL.creadores.map(function (c) {
        return '<li class="creador">' +
          '<video class="creador__video" controls playsinline preload="none" poster="' + esc(c.poster) + '" width="540" height="960" aria-label="Video de ' + esc(c.usuario) + ' probando el alfajor Sigma">' +
            (c.videoWebm ? '<source src="' + esc(c.videoWebm) + '" type="video/webm">' : "") +
            '<source src="' + esc(c.video) + '" type="video/mp4"></video>' +
          '<div class="creador__texto"><a class="creador__usuario" href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.usuario) + "</a>" +
          "<p>" + esc(c.texto) + "</p></div></li>";
      }).join("") +
        '<li class="creador creador--vacio"><div class="creador__hueco">' +
          '<p class="creador__vacio-titulo">Tu perfil acá</p>' +
          "<p>Si hacés contenido de fitness, nutrición o vida activa, escribinos.</p>" +
          '<a class="btn btn--noche" href="' + esc(CL.dm) + '" target="_blank" rel="noopener">Mandar DM</a>' +
        "</div></li>";
    });
  }

  /* 10. Pie */
  si("pie-frase", function (n) { n.textContent = C.marca.frase; });
  si("pie-contacto", function (pc) {
    pc.innerHTML =
      '<li><a href="' + esc(C.marca.instagram) + '" target="_blank" rel="noopener">Instagram ' + esc(C.marca.instagramUsuario) + "</a></li>" +
      '<li><a href="mailto:' + esc(C.marca.email) + '">' + esc(C.marca.email) + "</a></li>" +
      '<li><a href="collabs.html">Collabs</a></li>' +
      (C.marca.whatsapp ? '<li><a href="' + waLink(C.marca.whatsapp) + '" target="_blank" rel="noopener">WhatsApp</a></li>' : "");
  });
  si("pie-tiendas", function (n) {
    n.innerHTML = C.tiendas.map(function (t) {
      return '<li><a href="' + esc(t.url) + '" target="_blank" rel="noopener">' + esc(t.nombre) + "</a></li>";
    }).join("");
  });
  si("pie-firma", function (n) {
    var F = C.firma;
    n.innerHTML = "<span>" + esc(F.texto) + "</span>" +
      (F.whatsapp ? ' · <a href="' + waLink(F.whatsapp, "Hola Emilio, vi la propuesta de Sigma.") + '" target="_blank" rel="noopener">WhatsApp</a>' : "");
  });

  /* Entrada del texto del inicio (solo si GSAP cargó y no hay reduced-motion) */
  document.addEventListener("DOMContentLoaded", function () {
    if (!window.gsap || document.documentElement.classList.contains("sin-movimiento")) return;
    var objetivos = document.querySelectorAll(".hero__titulo .linea, .hero__sub, .hero__botones, .sabor-toggle, .cl-hero__anim");
    if (!objetivos.length) return;
    window.gsap.from(objetivos, {
      y: 28, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.09, clearProps: "transform,opacity",
    });
  });
})();
