# Resumen — Web demo SIGMA

## Qué hice
Una web de una sola página para reemplazar el Linktree de @sigmafood.ar, pensada para el celular. Arranca con un alfajor 3D que gira y se abre al hacer scroll mostrando lo que tiene adentro. Después: sabores, tabla con estética de envase, cuándo comerlo, las 3 tiendas con su link, formulario de mayoristas que arma el mail, comunidad, preguntas frecuentes y pie con tu firma. Todo el contenido se edita en `js/config.js`. No está publicada.

Lo probé con Playwright en 375, 768 y 1440 px: sin errores en consola, sin scroll horizontal, links correctos, el formulario arma bien el mail, el scroll no se traba sobre el 3D en celular, el foco con teclado es visible y axe-core no encontró problemas de accesibilidad (WCAG A/AA). Capturas en `capturas/`.

## Versión 2
- **Alfajor 3D rehecho** copiando la foto del envase: bañado entero, alto y redondeado. Al hacer scroll se parte y muestra el corte (galletita de cacao con maní, relleno, galletita).
- **Snack proteico sabor queso parmesano** sumado a Productos (amarillo del envase).
- **Nueva página `collabs.html`** con los textos de la historia "Collabs", botón de DM y el video del creador (@doiverpichhh, a confirmar). Hay un lugar "Tu perfil acá" para sumar más creadores.

## Versión 3
- **Texturas sacadas de la foto del envase**: la galletita (miga con poros y trocitos de maní), el relleno caramelo brillante y las líneas onduladas del baño copian la foto de Farmacity. El script que las genera queda en `img/tex/generar-texturas.py`.
- **Higgsfield**: no se pudo generar el modelo 3D desde la foto porque la cuenta tiene 0,85 créditos (plan gratis). No se gastó nada.

## Paleta
| Color | Hex |
|---|---|
| Azul Sigma (marca) | `#2994BE` |
| Blanco | `#FFFFFF` |
| Azul noche (texto, oscuros) | `#0A1E33` |
| Chocolate | `#4B2A20` |
| Manteca de maní | `#C98B4E` |
| Crema (de las letras del envase) | `#F4EDDC` |
| Azul oscuro (texto chico sobre blanco) | `#136A8F` |
| Amarillo snack | `#F2C230` |

## Tipografías
- Títulos y wordmark: **Archivo** 900, condensada (Google Fonts)
- Texto: **Inter** 400–700 (Google Fonts)

## 3D
**Quedó la Opción A**: alfajor hecho con código en Three.js (0 KB de modelo). No hice la Opción B porque no había una foto limpia del alfajor solo: todas muestran el envase, y generar un 3D desde ahí pondría el logo en un objeto inventado. En celulares lentos o con "reducir movimiento" se muestra una imagen fija del alfajor abierto con las etiquetas.

## Imágenes
- 5 fotos de la marca (las que mandaste), en WebP. A la de Farmacity le recorté la flecha del carrusel de Instagram.
- Renders del alfajor 3D de la propia web (sin envase ni logo) para sabores, imagen fija e imagen para compartir.
- **Higgsfield: no lo usé. 0 créditos.**

## Pendiente
- **Confirmar que @doiverpichhh es el chico del video** y conseguir videos o usuarios de otros creadores (hoy hay uno solo).
- **Snack**: peso neto, dónde se vende y una foto en buena resolución.
- **Tabla nutricional**: solo figura "Proteínas 15 g". Faltan calorías, carbohidratos, grasas (totales, saturadas, trans), fibra y sodio, sacados del envase.
- **WhatsApp de la marca** y **tu número de WhatsApp** (los botones aparecen solos cuando los cargues).
- **Fotos en alta resolución**: las que llegaron miden ~450–590 px y en escritorio se nota.
- **Fotos de eventos y collabs** para Comunidad (hoy usa fotos de producto).
- **Logo oficial en SVG** (hoy el wordmark es texto en Archivo 900).
- **Qué tienda vende el sabor Blanco**, para que el botón de ese sabor vaya directo.
- **URL completa en `og:image` y `og:url`** después de subirla a Netlify.
- **Confirmar la foto de la balanza**: muestra productos con una "P" que puede ser otra marca.
- **Revisar las referencias**: no pude abrir esas webs desde mi entorno; están anotadas de memoria (ver `referencias.md`).
- **Revisar Instagram y Linktree de la marca**: no tuve acceso, así que el tono y la estética salen del BLOQUE A y de las fotos.
