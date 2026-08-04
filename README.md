# EstudIA — tu sistema de estudio

App propia para estudiar cada materia de la facu con ayuda de IA (Claude).
Corre en tu compu, con tu propia API key de Anthropic. Todo se guarda local en tu navegador.

## Qué hace

- **Una sección por materia.** Creás las materias que quieras.
- **Materiales.** Subís PDFs, Word, fotos de apuntes o texto. Los PDFs escaneados y las fotos los transcribe la IA sola.
- **Apuntes por día.** Anotás lo que se vio en cada clase.
- **Estudiar por tema (y por parcial).** Cargás los temas de cada parcial y los vas dando de a uno:
  - **Autoevaluación** con preguntas generadas de tu material (opción múltiple + abiertas corregidas por IA).
  - **Mapa mental** del tema.
  - **Preguntar**: chat que te responde usando tu material.
  - Cada tema se marca solo como *dominado* o *para repasar* según cómo te fue.
- **Parciales viejos (lo estratégico).** Subís exámenes viejos o de prueba y la IA te dice:
  - qué temas caen más, qué tipos de pregunta, qué preguntas se repiten,
  - un **plan para aprobar** paso a paso y las trampas típicas.
  - Además te arma un **parcial de prueba** completo para simular el examen.

## Cómo arrancar

Necesitás Node 18+ instalado.

```bash
npm install
npm run dev
```

Abrí el link que te tira (normalmente http://localhost:5173).

La primera vez te va a pedir tu **API key de Anthropic**:
1. Andá a https://console.anthropic.com → API Keys → creá una.
2. Pegala en Ajustes (⚙) dentro de la app.

Se guarda solo en tu navegador. Como la app corre en tu PC, está ok. **No subas esta app a un hosting público con la key adentro**, porque quedaría expuesta.

## Costo

Cada quiz, mapa, análisis o transcripción es una llamada a la API de Anthropic y se paga por uso (según tu cuenta). Transcribir PDFs escaneados o fotos consume más que el texto normal.
Para gastar menos podés cambiar el modelo a **Haiku** desde Ajustes.

## Dónde tocar cosas

- `src/config.js` → modelo por defecto, topes de tokens, cuánto material se manda de contexto.
- `src/lib/ai.js` → los prompts de cada función (quiz, parcial, mapa, análisis, chat).
- `src/lib/ingest.js` → cómo se leen los archivos.

## Build para usar sin servidor de dev

```bash
npm run build
npm run preview
```

## Stack

Vite + React + Tailwind. Persistencia con IndexedDB (idb-keyval). PDFs con pdfjs, Word con mammoth, escaneados/imágenes vía visión de Claude.

---

Hecho para ir sumándole cosas. Próximos candidatos: juegos de repaso (flashcards, contrarreloj), calendario de estudio, y exportar el análisis a PDF.
