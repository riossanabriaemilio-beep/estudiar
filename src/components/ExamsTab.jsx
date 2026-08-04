import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ClipboardList, FileQuestion, History, Play, Trash2 } from "lucide-react";
import * as db from "../lib/db.js";
import { EXAM_JSON_EXAMPLE, validateExamJson } from "../lib/validateExam.js";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Modal, Textarea } from "./ui.jsx";
import QuizRunner from "./QuizRunner.jsx";

function formatDateTime(ts) {
  return new Date(ts).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ImportModal({ open, onClose, subjectId, onImported }) {
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  const [showExample, setShowExample] = useState(false);

  function reset() {
    setRaw("");
    setError("");
    setShowExample(false);
  }

  async function handleImport() {
    const result = validateExamJson(raw);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    await db.importedExams.add({
      subjectId,
      titulo: result.data.titulo.trim(),
      questions: result.data.questions,
    });
    reset();
    onImported();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Importar examen"
      width="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!raw.trim()}>
            Importar
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-muted">
          Pegá acá abajo el JSON del examen, con el formato exacto que espera EstudIA.{" "}
          <button
            className="font-medium text-tinta underline underline-offset-2"
            onClick={() => setShowExample((v) => !v)}
          >
            {showExample ? "Ocultar ejemplo" : "Ver ejemplo"}
          </button>
        </p>
        {showExample ? (
          <pre className="scrollbar-thin max-h-48 overflow-auto rounded-lg bg-ink px-3 py-2.5 text-xs text-white">
            {EXAM_JSON_EXAMPLE}
          </pre>
        ) : null}
        <Textarea
          rows={12}
          placeholder='{"titulo": "...", "questions": [...]}'
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="font-mono text-[13px]"
        />
        {error ? (
          <div className="flex items-start gap-2 rounded-lg bg-sinverSoft px-3 py-2.5 text-sm text-sinver">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

export default function ExamsTab({ subjectId }) {
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [activeExam, setActiveExam] = useState(null);

  const reload = useCallback(async () => {
    const [examList, historyList] = await Promise.all([
      db.importedExams.list(subjectId),
      db.history.list(subjectId),
    ]);
    setExams(examList.slice().reverse());
    setHistory(historyList.slice().reverse());
    setLoading(false);
  }, [subjectId]);

  useEffect(() => {
    setLoading(true);
    setActiveExam(null);
    reload();
  }, [reload]);

  if (activeExam) {
    return (
      <QuizRunner
        subjectId={subjectId}
        exam={activeExam}
        onExit={() => {
          setActiveExam(null);
          reload();
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Importá exámenes en formato JSON y resolvelos acá adentro, sin conexión.
        </p>
        <Button icon={ClipboardList} onClick={() => setImportOpen(true)} className="shrink-0">
          Importar examen
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Cargando exámenes...</p>
      ) : exams.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="Todavía no importaste exámenes"
          description='Usá "Importar examen" y pegá el JSON con las preguntas.'
        />
      ) : (
        <ul className="space-y-2">
          {exams.map((ex) => (
            <li key={ex.id}>
              <div className="flex items-center gap-3 rounded-xl2 border border-line bg-white px-4 py-3 shadow-soft">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tintaSoft text-tinta">
                  <FileQuestion size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{ex.titulo}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <Badge>{ex.questions.length} preguntas</Badge>
                    <span>{formatDateTime(ex.createdAt)}</span>
                  </div>
                </div>
                <Button size="sm" icon={Play} onClick={() => setActiveExam(ex)}>
                  Resolver
                </Button>
                <button
                  aria-label="Borrar examen"
                  title="Borrar examen"
                  className="rounded-lg p-2 text-muted hover:bg-sinverSoft hover:text-sinver focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tinta"
                  onClick={() => setToDelete(ex)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div>
        <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-muted">
          <History size={15} /> Historial de resultados
        </h3>
        {history.length === 0 ? (
          <p className="text-sm text-muted">Todavía no resolviste ningún examen.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id}>
                <Card className="flex items-center justify-between gap-3 p-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{h.examTitulo}</p>
                    <p className="text-xs text-muted">{formatDateTime(h.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-sm text-muted">
                      {h.correct}/{h.total}
                    </span>
                    <Badge tone={h.percent >= 60 ? "ok" : h.percent >= 40 ? "repasar" : "sinver"}>
                      {h.percent}%
                    </Badge>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        subjectId={subjectId}
        onImported={reload}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          await db.importedExams.remove(toDelete.id);
          reload();
        }}
        title="Borrar examen"
        description={`Se va a borrar "${toDelete?.titulo ?? ""}". El historial de resultados ya guardado no se borra.`}
        confirmLabel="Borrar"
      />
    </div>
  );
}
