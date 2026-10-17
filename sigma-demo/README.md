# SIGMA — web demo

Propuesta de web para SIGMA (alfajor proteico). HTML + CSS + JavaScript, sin build. **No está publicada** y no se indexa en Google.

## Abrirla en tu compu

Conviene abrirla con un servidor local (con doble clic algunos navegadores bloquean partes). Desde la carpeta:

```bash
cd sigma-demo
python3 -m http.server 8080
```

y entrá a **http://localhost:8080**

Si no tenés Python pero sí Node: `npx serve .` (y abrí la dirección que te muestra).

Necesitás internet: GSAP y las fuentes se cargan desde CDN.

Para ver la versión quieta (la que ve quien tiene "reducir movimiento" activado): **http://localhost:8080/?estatico=1**

## Subirla a Netlify

1. Entrá a https://app.netlify.com/drop
2. Arrastrá la carpeta `sigma-demo` entera.
3. Listo: te da una URL tipo `algo.netlify.app`.

Después de publicar:
- En `index.html`, cambiá `og:image` por la URL completa (ej. `https://algo.netlify.app/img/og-sigma.jpg`) y completá `og:url`. WhatsApp necesita la URL completa para mostrar la imagen al compartir.
- Cuando la marca apruebe y quieran que aparezca en Google: borrá la línea `<meta name="robots" content="noindex, nofollow">`, el archivo `_headers` y cambiá `robots.txt` a `Allow: /`.

Las carpetas `assets-sigma/` (fotos originales) y `capturas/` no las usa la web; podés sacarlas antes de subir.

## Páginas

- `index.html` — página principal
- `collabs.html` — página para creadores (link "Collabs" en el menú)

## Cambiar textos, sabores y links

Todo está en **`js/config.js`**. Editás, guardás y recargás.

- **Textos del inicio** → `inicio`
- **Sabores** → `sabores` (nombre, bajada, imagen, botón). Para que el botón de un sabor vaya directo a una tienda, cambiá `boton.href` por el link.
- **Tabla nutricional** → `nutricion.filas`. Cada fila con `valor: null` no se muestra. Completá con lo que dice el envase, por ejemplo `{ nombre: "Valor energético", valor: "250 kcal" }`.
- **Tiendas** → `tiendas` (nombre, texto, link y texto del botón). Podés agregar o sacar.
- **WhatsApp de la marca** → `marca.whatsapp`, número sin "+" ni espacios (ej. `"5491112345678"`). Al completarlo aparece el botón de WhatsApp en Mayoristas y en el pie.
- **Botón flotante y cookies** → `botonFlotante` y `cookies` (texto, botones y link a la política de privacidad).
- **Tu firma** → `firma.texto` y `firma.whatsapp`.
- **Fotos de Comunidad** → `comunidad.fotos` (de 3 a 6). Poné las fotos en `img/` en formato WebP.
- **Preguntas frecuentes** → `faq`.
- **Snack** → `snack` (sabor, datos, peso, foto, botón).
- **Collabs** → `collabs` (textos, link de DM y lista de creadores con su video).

Colores y tipografías: variables al principio de `css/styles.css`.
El alfajor del inicio: `js/hero.js` (inclinación, flotación y scroll). Las fotos recortadas están en `img/alfajor-chocolate.webp` y `img/alfajor-blanco.webp`.

## Estructura

```
sigma-demo/
├── index.html
├── collabs.html
├── video/            ← video del collab (MP4 + WebM)
├── css/styles.css
├── js/config.js      ← textos, links, sabores, nutrición, contacto
├── js/app.js         ← arma la página desde config.js
├── js/hero.js        ← alfajor del inicio (fotos que se inclinan y flotan)
├── img/              ← fotos WebP, renders, imagen para compartir
├── models/           ← vacía (ya no se usa modelo 3D)
├── capturas/         ← capturas de prueba en 375, 768 y 1440 px
├── assets-sigma/     ← fotos originales que pasó la marca
├── robots.txt, _headers
├── referencias.md, DECISIONES.md, RESUMEN.md
└── README.md
```
