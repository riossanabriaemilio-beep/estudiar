# Decisiones — Web demo SIGMA

Registro de lo que decidí y por qué. Si algo no te cierra, casi todo se cambia en `js/config.js` o en las variables de arriba de `css/styles.css`.

## Contexto y límites de este trabajo

- **Carpeta**: el prompt pedía `Descargas/paginas web/sigma-demo`. Trabajé en un entorno en la nube, así que la carpeta quedó en `sigma-demo/` dentro del repo. Copiala a tu Descargas tal cual.
- **Sin acceso a internet para investigar**: desde este entorno no pude abrir Instagram, Linktree, Farmacity, Mercado Libre, The Food Market ni las webs de referencia (el proxy bloquea esos dominios). Trabajé con el BLOQUE A y con las 5 fotos que mandaste. No inventé nada que no estuviera ahí.
- **No publiqué nada.** No usé Higgsfield (no hizo falta: había fotos reales), así que **0 créditos gastados**.

## Identidad de la marca

### Paleta medida en las fotos
Saqué los colores dominantes de las fotos de `assets-sigma/`:

| Origen | Colores dominantes |
|---|---|
| Caja exhibidora | `#0292C1`, `#007DAC`, `#3BA6CE`, `#04A6D5`, chocolate `#6E3943` |
| Máquina de peluches | `#018CD4`, `#0199DD`, `#0584CB` (fondo de estudio, más saturado que la marca) |
| Envase frente a Farmacity | azul `#3EA8D9`, crema de las letras `#F1EAD4` / `#ECE6D9`, chocolate `#813F38` |
| Gimnasio | negros `#100E0E`, azul `#21598A` |

**Conclusión**: el azul del envase anda entre `#0292C1` y `#3EA8D9` según la luz; el `#2994BE` del logo cae justo en el medio. Lo usé como color de marca sin tocarlo. Las letras "SIGMA" del envase no son blanco puro sino un **crema** (`#F1EAD4`), que tomé como segundo neutro.

### Paleta final

| Rol | Nombre | Hex | Uso |
|---|---|---|---|
| Marca | Azul Sigma | `#2994BE` | Fondos del inicio, Qué tiene, Comunidad, header |
| Neutro | Blanco | `#FFFFFF` | Fondos claros, títulos grandes sobre azul |
| Oscuro | Azul noche | `#0A1E33` | Texto, botones, Dónde comprar, pie |
| Producto | Chocolate | `#4B2A20` | Panel del sabor Chocolate |
| Producto | Manteca de maní | `#C98B4E` | Relleno del 3D (tono de referencia) |
| Neutro cálido | Crema | `#F4EDDC` | Panel Blanco, Mayoristas, textos sobre oscuro |
| Apoyo | Azul oscuro | `#136A8F` | Subtítulos chicos sobre blanco |

No usé el rojo del sello "15 g" del envase: con el azul, el chocolate y el crema ya alcanza, y sumar rojo lo volvía ruidoso.

### Contraste (WCAG AA)
| Combinación | Contraste | Resultado |
|---|---|---|
| Azul noche sobre azul Sigma | 4.87:1 | AA texto normal ✔ |
| Blanco sobre azul Sigma | 3.46:1 | **Solo texto grande** (títulos ≥ 24 px). Nunca lo uso para texto chico |
| Azul Sigma sobre azul noche | 4.87:1 | AA ✔ (títulos de Dónde comprar y del pie) |
| Azul noche sobre blanco | 16.85:1 | ✔ |
| Crema sobre chocolate | 10.9:1 | ✔ |
| Azul oscuro `#136A8F` sobre blanco | 6.0:1 | ✔ |

Además corrí **axe-core** (reglas WCAG 2 A y AA) en 375 px y 1440 px: **0 violaciones**.

### Tipografía
- **Títulos: Archivo** (Google Fonts, variable), peso 900, ancho condensado (`font-stretch` 70–75 %). El wordmark "SIGMA" del envase es una grotesca muy negra, mayúscula, apenas condensada; Archivo Black/Archivo 900 es lo más parecido que encontré en Google Fonts, y como es variable en ancho me permite usar la misma familia para el wordmark (ancho normal) y para los títulos (condensada), sin cargar dos fuentes.
- **Texto: Inter** 400–700. Muy legible en celular.
- El **wordmark** del header y el pie es texto con Archivo 900 + ®, no el logo oficial. Cuando la marca pase el logo en SVG, conviene reemplazarlo.

### Tono
Voseo, frases cortas, sin exageraciones ni promesas. Ejemplos: "Terminás la rutina y tenés 15 g de proteína a mano. Sin licuadora, sin shaker." / "Vendelo en tu negocio".

## Alfajor 3D

- **Quedó la Opción A** (modelo hecho con código en Three.js 0.160.0).
- **No hice la Opción B** (Higgsfield `generate_3d`): el prompt la condiciona a tener una foto limpia del alfajor solo, y las 5 fotos muestran el envase o el alfajor dentro del paquete. Generar un 3D desde el envase hubiera puesto el logo en un objeto inventado, que el BLOQUE E prohíbe.
- **Cómo está hecho**: dos tapas por torno (LatheGeometry) con canto redondeado y la superficie levemente abombada; el baño tiene ruido en los bordes y relieve fino para que no se vea "de plástico". Relleno de manteca de maní con borde grumoso, vetas en espiral arriba y ~40 trocitos de maní. Luz de estudio (principal cálida + contraluz fría + entorno) y sombra suave en el piso.
- **Sombras dinámicas desactivadas**: las probé y dejaban un artefacto rectangular sobre el relleno al abrir. La sombra de contacto (textura radial) se ve bien, es más liviana y no falla.
- **Peso**: 0 KB de modelo. Lo único que se descarga es Three.js desde jsDelivr.
- **Interacción**: gira solo; con mouse se gira y se inclina; en celular solo el arrastre horizontal gira (el canvas tiene `touch-action: pan-y`, así que el scroll vertical nunca se traba — verificado). Solo renderiza cuando el inicio está en pantalla.
- **Scroll**: el inicio está fijo (sticky) durante 2,3 pantallas en escritorio y 2 en celular. Entre 12 % y 42 % del recorrido la tapa se levanta y aparecen las 4 etiquetas; entre 68 % y 92 % se cierra.
- **Modo estático** (imagen fija del alfajor abierto con las etiquetas visibles) si: `prefers-reduced-motion`, ahorro de datos o conexión 2G/3G, ≤ 2 GB de memoria, ≤ 2 núcleos, o sin WebGL. Para probarlo: `index.html?estatico=1`.
- **La página se ve antes que el 3D**: mientras carga Three.js se muestra un render fijo del alfajor cerrado en la misma posición; cuando el 3D está listo, aparece con un fundido.

## Imágenes

| Archivo | Origen |
|---|---|
| `img/caja.webp`, `maquina.webp`, `balanza.webp`, `gimnasio.webp` | Fotos que mandaste (de la marca), convertidas a WebP |
| `img/farmacity.webp` | Foto que mandaste; **le recorté el borde derecho** porque tenía la flecha del carrusel de Instagram |
| `img/hero-*.webp`, `img/render-*.webp` | Renders del alfajor 3D de esta misma web (no muestran envase ni logo) |
| `img/og-sigma.jpg` | Composición propia: render 3D + frase de la marca (1200×630) |
| `img/favicon.svg` | Hecho a mano: "S" blanca sobre azul Sigma |

**Ojo con la resolución**: las fotos que llegaron miden ~450–590 px de ancho (parecen capturas de Instagram). Se ven bien en celular, pero en escritorio se nota. Pedile a la marca los originales.

La foto de la balanza muestra un pote "WHEY" y una "PASTA DE MANÍ" con una "P" en el envase. Es una foto de la propia marca, pero si esa "P" es otra empresa conviene confirmar que se puede usar.

## Decisiones de contenido

- **Botones de compra de cada sabor** → llevan a "Dónde comprar", no a una tienda puntual: no sé qué tienda vende el sabor Blanco (el link de Mercado Libre dice "chocolate"). Si la marca confirma, se cambia en `config.js` (`sabores[].boton.href`).
- **Tabla nutricional**: solo muestra "Proteínas 15 g" porque es el único dato confirmado. Las filas de calorías, carbohidratos, grasas, fibra y sodio están en `config.js` con `valor: null` y no aparecen hasta que se completen.
- **Detalle de los ingredientes** ("El relleno.", "Proteína de suero de leche.", "En la mezcla.", "El baño, negro o blanco."): son descripciones obvias de los 4 ingredientes del BLOQUE A, no datos nuevos. "Whey" = proteína de suero de leche es la definición del término.
- **Cuándo comerlo**: "post-entreno" sale de la descripción de Farmacity. Merienda y mochila/oficina son las ideas que pediste. Saqué una frase que había escrito ("no necesita heladera") porque no lo sé.
- **Tiendas**: "Caja de 12 unidades, sabor chocolate" sale del título del link de Mercado Libre. Para Farmacity y The Food Market puse descripciones genéricas.
- **Comunidad**: no tengo fotos de eventos ni collabs, así que la grilla usa 4 fotos de producto. Hay que reemplazarlas por fotos reales de eventos (se cambian en `config.js`, hasta 6).
- **WhatsApp** (de la marca y el tuyo): están en `null`. Mientras sea así, los botones de WhatsApp no aparecen. Cuando cargues el número, aparecen solos en Mayoristas, en el pie y en tu firma.
- **Formulario de mayoristas**: valida los campos obligatorios y abre la app de mail con asunto ("Pedido mayorista — Alfajor Sigma — [negocio]") y cuerpo armados. No manda nada a ningún servidor.
- **Header**: el botón "Comprar" está siempre visible (header fijo), también en celular. En celular los links van en un menú desplegable.
- **Motion**: solo el alfajor y la entrada del texto del inicio (GSAP 3.12.5). El resto no se anima.
- **Datos estructurados**: `ProductGroup` con dos variantes (Chocolate, Blanco), marca, peso, proteína y las 3 tiendas como `Offer` con URL y vendedor. Sin precio ni reseñas.
- **No indexa**: `<meta name="robots" content="noindex, nofollow">`, `robots.txt` con `Disallow: /` y un archivo `_headers` para que Netlify mande `X-Robots-Tag: noindex`.
