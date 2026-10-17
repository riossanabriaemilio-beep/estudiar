# Resumen — Web demo SIGMA

## Qué hice
Una web de una sola página para reemplazar el Linktree de @sigmafood.ar, pensada para el celular. Arranca con la foto del alfajor mordido, que flota, se inclina con el dedo o el mouse y muestra lo que tiene adentro al hacer scroll. Después: sabores, tabla con estética de envase, cuándo comerlo, las 3 tiendas con su link, formulario de mayoristas que arma el mail, comunidad, preguntas frecuentes y pie con tu firma. Todo el contenido se edita en `js/config.js`. No está publicada.

Lo probé con Playwright en 375, 768 y 1440 px: sin errores en consola, sin scroll horizontal, links correctos, el formulario arma bien el mail, el scroll no se traba sobre el alfajor en celular, el foco con teclado es visible y axe-core no encontró problemas de accesibilidad (WCAG A/AA). Capturas en `capturas/`.

## Versión 7 (actual)
- **Aviso de cookies** abajo, con "Aceptar" y "Solo necesarias". La elección se guarda en el navegador y no vuelve a aparecer. Hoy la web no usa cookies de medición; si se agrega Google Analytics u otra, hay que cargarla solo si `window.SIGMA_COOKIES === "aceptadas"`. Falta el link a la política de privacidad (`cookies.politica` en config.js).
- **Botón flotante abajo a la derecha** con el paquete del alfajor solo (sin círculo), en las dos páginas. Mientras `marca.whatsapp` sea `null` se ve pero no es link; cuando se cargue el número, abre WhatsApp con un mensaje armado. Sube solo para no tapar el aviso de cookies.

## Versión 6
- **El inicio muestra los paquetes** de chocolate y blanco, que se van alternando solos cada ~4 segundos con un fundido y un giro suave. Siguen flotando y se inclinan con el mouse o el dedo. El botón Chocolate/Blanco elige uno a mano (y frena el cambio automático unos segundos). El cambio se pausa con el mouse o el foco encima, y con "reducir movimiento" no alterna solo.
- Paquete blanco: la foto venía chica (326 px) y con un sticker "Nuevo sabor" encima. La agrandé con IA y rehice la esquina tapada copiando la del otro lado. La letra chica no se puede recuperar: conviene pedir la foto original a la marca.
- La sección Sabores sigue con las fotos del alfajor mordido.

## Versión 5
- **Snack con la foto de estudio nueva**: recorté el paquete y los 8 trocitos por separado sobre el amarillo de la foto de estudio. Los trocitos flotan en loop, cada uno con su ritmo, y el paquete se mece suave. Con "reducir movimiento" quedan quietos. Del envase sale el peso: **50 g**.
- **Fotos mejoradas con IA**: caja, máquina, balanza, gimnasio y Farmacity pasaron por Real-ESRGAN (x4, gratis, corre en la compu) y quedaron en 1200 px de ancho. Bordes y texturas mucho más nítidos; las letras muy chicas (sellos) no se pueden recuperar.
- Scripts en `tools/` (`mejorar-fotos.py`, `recortar-snack.py`).

## Versión 4
- **El inicio usa las fotos reales del alfajor mordido** (chocolate y blanco) que mandó Emilio. Les saqué el fondo celeste y quedaron sobre el azul de SIGMA con su sombra. El alfajor flota, se inclina en perspectiva con el mouse o el dedo, se acerca con el scroll y aparecen las etiquetas. El botón Chocolate/Blanco cambia la foto.
- Las mismas fotos se usan en Sabores, en Collabs y en la imagen para compartir el link.
- **Se sacó el 3D hecho con código** (Three.js): la página carga más rápido. Las versiones 3D quedaron en el historial de git.

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

## 3D (historial)
Hasta la versión 3 se usó la **Opción A**: alfajor hecho con código en Three.js (0 KB de modelo). No hice la Opción B porque no había una foto limpia del alfajor solo: todas muestran el envase, y generar un 3D desde ahí pondría el logo en un objeto inventado. En celulares lentos o con "reducir movimiento" se muestra una imagen fija del alfajor abierto con las etiquetas.

## Imágenes
- 5 fotos de la marca (las que mandaste), en WebP. A la de Farmacity le recorté la flecha del carrusel de Instagram.
- **Fotos del alfajor mordido** (chocolate y blanco) que mandó Emilio, recortadas sin fondo: `img/alfajor-*.webp`. Originales en `assets-sigma/`.
- **Higgsfield: no lo usé. 0 créditos.**

## Pendiente
- **Confirmar que @doiverpichhh es el chico del video** y conseguir videos o usuarios de otros creadores (hoy hay uno solo).
- **Foto del paquete blanco en buena resolución** (la actual es una captura chica, agrandada con IA).
- **Snack**: dónde se vende (el botón hoy abre un DM de Instagram).
- **Tabla nutricional**: solo figura "Proteínas 15 g". Faltan calorías, carbohidratos, grasas (totales, saturadas, trans), fibra y sodio, sacados del envase.
- **WhatsApp de la marca** y **tu número de WhatsApp** (los botones aparecen solos cuando los cargues).
- **Fotos originales**: las mejoré con IA, pero los archivos originales de la marca siempre van a verse mejor.
- **Fotos de eventos y collabs** para Comunidad (hoy usa fotos de producto).
- **Logo oficial en SVG** (hoy el wordmark es texto en Archivo 900).
- **Qué tienda vende el sabor Blanco**, para que el botón de ese sabor vaya directo.
- **URL completa en `og:image` y `og:url`** después de subirla a Netlify.
- **Confirmar la foto de la balanza**: muestra productos con una "P" que puede ser otra marca.
- **Revisar las referencias**: no pude abrir esas webs desde mi entorno; están anotadas de memoria (ver `referencias.md`).
- **Revisar Instagram y Linktree de la marca**: no tuve acceso, así que el tono y la estética salen del BLOQUE A y de las fotos.
