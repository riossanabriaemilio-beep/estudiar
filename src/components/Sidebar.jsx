import { useState } from "react";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { useEstudia } from "../state/store.jsx";
import { SUBJECT_COLORS } from "../config.js";
import { Button, ConfirmDialog, Field, IconButton, Input, Modal } from "./ui.jsx";

function AddSubjectModal({ open, onClose }) {
  const { createSubject } = useEstudia();
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0].value);
  const [saving, setSaving] = useState(false);

  function reset() {
    setName("");
    setColor(SUBJECT_COLORS[0].value);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await createSubject({ name: name.trim(), color });
    setSaving(false);
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Nueva materia"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            Crear materia
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nombre">
          <Input
            autoFocus
            placeholder="Ej: Análisis Matemático II"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </Field>
        <Field label="Color">
          <div className="flex flex-wrap gap-2">
            {SUBJECT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-label={c.name}
                title={c.name}
                onClick={() => setColor(c.value)}
                className={`h-8 w-8 rounded-full border-2 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tinta focus-visible:ring-offset-2 ${
                  color === c.value ? "scale-110 border-ink" : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

export default function Sidebar({ onNavigate }) {
  const { subjects, selectedId, selectSubject, removeSubject } = useEstudia();
  const [addOpen, setAddOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 pb-4 pt-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tinta text-white">
          <GraduationCap size={19} strokeWidth={2.25} />
        </div>
        <span className="font-display text-lg font-semibold tracking-tight text-ink">
          EstudIA
        </span>
      </div>

      <div className="flex items-center justify-between px-5 pb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Materias
        </span>
        <IconButton icon={Plus} label="Nueva materia" onClick={() => setAddOpen(true)} />
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4">
        {subjects.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted">
            Todavía no tenés materias. Creá una con el botón +.
          </p>
        ) : (
          <ul className="space-y-1">
            {subjects.map((s) => (
              <li key={s.id}>
                <div
                  className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors ${
                    selectedId === s.id ? "bg-tintaSoft" : "hover:bg-paper"
                  }`}
                >
                  <button
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus-visible:outline-none"
                    onClick={() => {
                      selectSubject(s.id);
                      onNavigate?.();
                    }}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span
                      className={`truncate text-sm ${
                        selectedId === s.id ? "font-medium text-tinta" : "text-ink"
                      }`}
                    >
                      {s.name}
                    </span>
                  </button>
                  <IconButton
                    icon={Trash2}
                    label={`Borrar ${s.name}`}
                    className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 hover:!bg-sinverSoft hover:!text-sinver"
                    onClick={() => setToDelete(s)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className="border-t border-line px-5 py-3 text-xs text-muted">
        100% offline · guardado en tu navegador
      </div>

      <AddSubjectModal open={addOpen} onClose={() => setAddOpen(false)} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && removeSubject(toDelete.id)}
        title={`Borrar "${toDelete?.name ?? ""}"`}
        description="Se va a borrar la materia y TODO lo que tiene guardado: materiales, apuntes, temas, parciales viejos y exámenes. Esta acción no se puede deshacer."
        confirmLabel="Borrar materia"
      />
    </div>
  );
}
