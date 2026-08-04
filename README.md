# EstudIA — tu sistema de estudio

Tu sistema personal para organizar el estudio de cada materia de la facu.
**100% offline, gratis y sin ninguna cuenta**: no usa APIs, no manda nada a
internet, no tiene API keys. Todo lo que cargás queda guardado en tu propio
navegador (IndexedDB) y listo.

## Qué hace

- **Materias.** Creás las que quieras, cada una con su nombre y color. Se
  pueden borrar (con confirmación), y al borrarlas se borra todo lo que
  tenían adentro.
- **Materiales.** Subís PDFs, Word (.docx), TXT, Markdown, CSV o imágenes.
  El texto se extrae en tu navegador (PDF con pdfjs, Word con mammoth). Si
  un PDF es escaneado o subís una imagen y no se puede sacar texto, el
  archivo igual se guarda: queda marcado como "sin texto extraíble" y podés
  pegar el texto a mano vos mismo.
- **Apuntes por día.** Cargás apuntes con fecha, título opcional y
  contenido. Se listan del más nuevo al más viejo.
- **Estudiar (el corazón de la app).** Cargás los temas de cada materia,
  agrupados por parcial ("Parcial 1", "Parcial 2", etc.). Cada tema tiene un
  **semáforo manual** de tres luces que tocás vos:
  - 🔴 rojo = no sé nada (estado por defecto de un tema nuevo)
  - 🟡 amarillo = más o menos, hay que repasar
  - 🟢 verde = ya lo estudié
  
  La cabecera de la materia muestra un riel de progreso con el % de temas en
  verde y los contadores de cada color.
- **Parciales viejos.** Archivo puro: subís exámenes viejos o modelos
  (PDF/Word/imagen/texto), los podés ver o borrar. No se analiza ni se
  genera nada con ellos, solo se guardan.
- **Exámenes para resolver.** Importás un examen pegando un JSON (ver
  formato más abajo) y lo resolvés adentro de la página:
  - Las preguntas de **opción múltiple** se corrigen solas al elegir una
    respuesta, y ahí mismo se muestra la explicación.
  - Las preguntas **abiertas** te dejan escribir tu respuesta, después
    mostrás la "respuesta modelo" y vos mismo te marcás si estuvo bien o
    mal (autocorrección).
  - Al terminar el examen te muestra el puntaje (aciertos y %) y lo guarda
    en un historial por materia.

## Cómo correrlo

Necesitás Node 18 o superior instalado.

```bash
npm install
npm run dev
```

Abrí el link que te tira la terminal (normalmente http://localhost:5173).

Para armar la versión de producción:

```bash
npm run build
npm run preview
```

El build queda en la carpeta `dist/`. Incluye un `netlify.toml` listo para
publicarlo como sitio estático en Netlify (build `npm run build`, publish
`dist`, con el redirect de SPA configurado).

## Cómo importar un examen

En la pestaña **"Exámenes para resolver"** de una materia, tocá **"Importar
examen"** y pegá un JSON con este formato exacto:

```json
{
  "titulo": "Parcial 1 - Modelo",
  "questions": [
    {
      "type": "multiple",
      "pregunta": "¿Cuál es la capital de Francia?",
      "opciones": ["Madrid", "París", "Roma", "Berlín"],
      "correcta": 1,
      "explicacion": "París es la capital de Francia."
    },
    {
      "type": "abierta",
      "pregunta": "Explicá la ley de conservación de la energía.",
      "respuesta_modelo": "La energía no se crea ni se destruye, solo se transforma."
    }
  ]
}
```

- `type` tiene que ser `"multiple"` o `"abierta"`.
- En las de `"multiple"`, `correcta` es el **índice** (empezando en 0) de la
  opción correcta dentro de `opciones`.
- En las de `"abierta"`, `respuesta_modelo` es el texto que vas a usar para
  autocorregirte.

Si el JSON tiene algún error, EstudIA te avisa exactamente qué está mal
antes de importarlo.

## Dónde está guardado todo

- **IndexedDB** (vía `idb-keyval`): materias, materiales, apuntes, temas,
  parciales viejos, exámenes importados e historial de resultados.
- **localStorage**: solo la última materia que tenías seleccionada.

Nada sale de tu navegador. Si borrás los datos del sitio en el navegador, se
pierde todo lo cargado (no hay backup en la nube, a propósito).

## Stack

Vite + React + Tailwind CSS. Lectura de archivos con `pdfjs-dist` (PDF) y
`mammoth` (Word). Íconos con `lucide-react`, animaciones sutiles con
`framer-motion`. Sin backend, sin API, sin API keys.

## Estructura del código

- `src/config.js` — paleta de colores, colores de materias, estados del
  semáforo.
- `src/lib/db.js` — capa de persistencia (idb-keyval): CRUD de materias,
  materiales, apuntes, temas, parciales viejos, exámenes importados e
  historial.
- `src/lib/ingest.js` — extracción de texto de archivos en el navegador.
- `src/lib/validateExam.js` — validación del JSON al importar un examen.
- `src/state/store.jsx` — contexto de React con la lista de materias.
- `src/components/` — `Sidebar`, `SubjectView` y un componente por pestaña
  (`MaterialsTab`, `NotesTab`, `StudyTab`, `OldExamsTab`, `ExamsTab`), más
  `QuizRunner` para resolver los exámenes.
