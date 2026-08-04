import { useCallback, useEffect, useState } from "react";
import { NotebookPen, Trash2 } from "lucide-react";
import * as db from "../lib/db.js";
import { Button, Card, ConfirmDialog, EmptyState, Field, IconButton, Input, Textarea } from "./ui.jsx";

function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function NotesTab({ subjectId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayISO());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const reload = useCallback(async () => {
    const list = await db.notes.list(subjectId);
    setNotes(list.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt)));
    setLoading(false);
  }, [subjectId]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    await db.notes.add({ subjectId, date, title: title.trim(), content: content.trim() });
    setTitle("");
    setContent("");
    setDate(todayISO());
    setSaving(false);
    reload();
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="mb-3 font-display font-semibold text-ink">Nuevo apunte</h3>
        <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
          <Field label="Fecha">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Título (opcional)">
            <Input
              placeholder="Ej: Clase de repaso"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Contenido">
            <Textarea
              rows={5}
              placeholder="Escribí tu apunte acá..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={handleSave} disabled={!content.trim() || saving}>
            Guardar apunte
          </Button>
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-muted">Cargando apuntes...</p>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="Todavía no cargaste apuntes"
          description="Anotá lo que vas viendo día a día en cada clase."
        />
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n.id}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-oro">
                      {formatDate(n.date)}
                    </p>
                    {n.title ? (
                      <p className="mt-0.5 font-display font-medium text-ink">{n.title}</p>
                    ) : null}
                  </div>
                  <IconButton
                    icon={Trash2}
                    label="Borrar apunte"
                    className="hover:!bg-sinverSoft hover:!text-sinver"
                    onClick={() => setToDelete(n)}
                  />
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink/90">{n.content}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          await db.notes.remove(toDelete.id);
          reload();
        }}
        title="Borrar apunte"
        description="Esta acción no se puede deshacer."
        confirmLabel="Borrar"
      />
    </div>
  );
}
