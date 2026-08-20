# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this is

**EstudIA** is a personal study-organizer web app for university students. It is
a **100% offline, client-side-only single-page app**: no backend, no API, no API
keys, no network calls, no accounts. Everything the user loads is stored in their
own browser (IndexedDB + a bit of localStorage). This is a deliberate product
constraint, not a limitation to "fix" — see [Hard constraints](#hard-constraints).

The app is organized around **materias** (subjects). Each subject has five tabs:
- **Estudiar** — the core feature: a list of study topics (`temas`) grouped by
  `parcial` (exam block), each with a manual three-state traffic-light
  (`sin_ver` → `repasar` → `dominado`) and a progress rail.
- **Materiales** — upload files (PDF/docx/txt/md/csv/images); text is extracted
  locally. Includes a local extractive summarizer.
- **Apuntes** — dated notes.
- **Parciales viejos** — archive-only file storage for past exams.
- **Exámenes para resolver** — import a quiz as JSON and solve it in-page, with
  scoring saved to a per-subject history.

## Stack & tooling

- **Vite 5** + **React 18** (SPA, `StrictMode`) + **Tailwind CSS 3**.
- File parsing: `pdfjs-dist` (PDF), `mammoth` (docx) — both **dynamically
  imported** so they stay out of the initial bundle.
- `idb-keyval` for persistence, `lucide-react` icons, `framer-motion` for subtle
  animation.
- No test framework, no linter/formatter config, no TypeScript. JS + JSX only.

### Commands
```bash
npm install
npm run dev      # Vite dev server, usually http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the built dist/
```
Requires Node 18+. There is no test or lint script — validate changes by running
`npm run dev`/`npm run build` and checking behavior in the browser. Deploys as a
static site (see `netlify.toml`: build `npm run build`, publish `dist/`, SPA
redirect to `/index.html`).

## Architecture & data flow

```
main.jsx → <StoreProvider> → App.jsx → Sidebar + SubjectView → per-tab components
                    │                                              │
              state/store.jsx  ───────────────────────────────►  lib/db.js  ──► IndexedDB
```

- **`src/lib/db.js`** — the entire persistence layer. Wraps `idb-keyval` get/set
  over seven keys (`estudia:subjects`, `:materials`, `:notes`, `:temas`,
  `:oldExams`, `:importedExams`, `:history`). Each key holds a **plain array**;
  every mutation reads the whole list, edits it, writes it back. A
  `makeCollection(key)` factory gives `list/add/remove/update` for every
  subject-scoped collection; items carry `id` (via `uid()`), `createdAt`, and a
  `subjectId`. `deleteSubject` **cascades** — it strips every collection of items
  matching that `subjectId`. All functions are `async`.
- **`src/state/store.jsx`** — the only React context (`StoreProvider` /
  `useEstudia`). Holds the subject list, the selected subject, and subject CRUD.
  The selected subject id is mirrored to `localStorage` (`estudia:selectedSubjectId`).
  Per-tab data (temas, materials, etc.) is **not** global — each tab component
  loads its own via `db.*` in a `useEffect` and keeps it in local state.
- **`src/config.js`** — central constants: `SUBJECT_COLORS`, the traffic-light
  `ESTADOS` map, `ESTADO_DEFAULT` (`"sin_ver"`), the `TABS` list, `MAX_FILE_SIZE_MB`.
- **`src/lib/ingest.js`** — local text extraction (`detectType`, `extractText`).
  If nothing can be extracted (scanned PDF, image, old `.doc`), it returns
  `noText: true` and the file is still saved so the user can paste text manually.
- **`src/lib/validateExam.js`** — explicit, non-AI validation of pasted exam JSON
  (`validateExamJson` returns `{ ok, data }` or `{ ok:false, error }`), plus
  `EXAM_JSON_EXAMPLE`. Keep this in sync with the format below.
- **`src/lib/summarize.js`** — local extractive summarizer (Luhn-style word
  frequency, Spanish stopwords). Used by `MaterialsTab`. No AI.
- **`src/lib/date.js`** — `todayISO()` timezone-safe date helper.
- **`src/components/`** — `ui.jsx` (shared primitives: `Button`, `IconButton`,
  modal, confirm, inputs, badges), `Sidebar`, `SubjectView` (header/progress rail
  + tab switcher), one component per tab (`StudyTab`, `MaterialsTab`, `NotesTab`,
  `OldExamsTab`, `ExamsTab`), and `QuizRunner` for solving exams.

### Exam JSON format
```json
{
  "titulo": "Parcial 1 - Modelo",
  "questions": [
    { "type": "multiple", "pregunta": "…", "opciones": ["a","b"], "correcta": 1, "explicacion": "…" },
    { "type": "abierta", "pregunta": "…", "respuesta_modelo": "…" }
  ]
}
```
`type` is `"multiple"` or `"abierta"`; `correcta` is a **0-based index** into
`opciones`; `abierta` questions use `respuesta_modelo` for self-grading.

## Hard constraints — do not break these

- **No network / no backend / no AI services.** Never add `fetch`, external APIs,
  API keys, analytics, or cloud storage. All "smart" features (summaries, exam
  validation) are deliberately local, deterministic, non-AI code.
- **Persistence stays in `db.js`.** Don't call `idb-keyval` or `localStorage`
  directly from components — go through `db.js` (and `store.jsx` for subjects).
- **Keep the data model flat.** Collections are arrays of `{ id, subjectId,
  createdAt, ... }`; new subject-scoped collections should use `makeCollection`
  and be added to the `deleteSubject` cascade so nothing is orphaned.

## Conventions

- **UI language is Spanish.** All user-facing strings, and the existing code
  comments, are in Spanish (`materias`, `temas`, `parcial`, `apuntes`,
  `dominado`/`repasar`/`sin_ver`). Match this — do not translate UI text or
  rename domain terms to English.
- **Styling is Tailwind utility classes** using the custom theme in
  `tailwind.config.js` (`paper`, `panel`, `ink`, `muted`, `line`, `tinta`, `oro`,
  `ok`/`repasar`/`sinver` + their `*Soft` variants; `font-display` = Space
  Grotesk, `font-sans` = Inter). Prefer these tokens over raw hex/colors. Reuse
  primitives from `ui.jsx` instead of hand-rolling buttons/modals; keep the
  `focus-visible` ring pattern for accessibility.
- **New tabs**: add an entry to `TABS` in `config.js`, render it in
  `SubjectView`, and give it a component in `src/components/`.
- Files use ES modules (`"type": "module"`); `.jsx` for React, `.js` for logic.

## Git / workflow

- Work happens on the branch specified by the current task; keep changes on that
  branch and don't open PRs unless asked.
- The user's README (`README.md`, in Spanish) is the product-facing doc; keep it
  and this file consistent when behavior changes.
