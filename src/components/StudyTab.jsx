import { useMemo, useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import * as db from "../lib/db.js";
import { ESTADO_DEFAULT, ESTADOS } from "../config.js";
import { Button, ConfirmDialog, EmptyState, Field, Input, Modal } from "./ui.jsx";

const LUCES = [
  { key: "sin_ver", tone: "sinver" },
  { key: "repasar", tone: "repasar" },
  { key: "dominado", tone: "ok" },
];

const DOT_COLOR = {
  sinver: "bg-sinver",
  repasar: "bg-repasar",
  ok: "bg-ok",
};

function Semaforo({ estado, onChange }) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Estado de estudio">
      {LUCES.map((luz) => {
        const active = estado === luz.key;
        const info = ESTADOS[luz.key];
        return (
          <button
            key={luz.key}
            type="button"
            title={info.label}
            aria-label={info.label}
            aria-pressed={active}
            onClick={() => onChange(luz.key)}
            className={`h-6 w-6 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tinta focus-visible:ring-offset-1 ${
              DOT_COLOR[luz.tone]
            } ${active ? "scale-110 ring-2 ring-offset-2 ring-ink/70" : "opacity-30 hover:opacity-60"}`}
          />
        );
      })}
    </div>
  );
}

function NewTemaModal({ open, onClose, subjectId, defaultParcial, onCreated }) {
  const [name, setName] = useState("");
  const [parcial, setParcial] = useState(defaultParcial);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await db.temas.add({
      subjectId,
      name: name.trim(),
      parcial: Number(parcial) || 1,
      estado: ESTADO_DEFAULT,
    });
    setSaving(false);
    setName("");
    onCreated();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo tema"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            Crear tema
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nombre del tema">
          <Input
            autoFocus
            placeholder="Ej: Límites y continuidad"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </Field>
        <Field label="Número de parcial">
          <Input
            type="number"
            min={1}
            value={parcial}
            onChange={(e) => setParcial(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}

export default function StudyTab({ subjectId, temas, reloadTemas }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const groups = useMemo(() => {
    const byParcial = new Map();
    for (const t of temas) {
      if (!byParcial.has(t.parcial)) byParcial.set(t.parcial, []);
      byParcial.get(t.parcial).push(t);
    }
    return Array.from(byParcial.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([parcial, items]) => [
        parcial,
        items.slice().sort((a, b) => a.createdAt - b.createdAt),
      ]);
  }, [temas]);

  const nextParcial = groups.length ? groups[groups.length - 1][0] : 1;

  async function setEstado(temaId, estado) {
    await db.temas.update(temaId, { estado });
    reloadTemas();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Tocá una luz para marcar cómo llevás cada tema: rojo (no sé nada), amarillo (repasar) o
          verde (ya lo estudié).
        </p>
        <Button icon={Plus} onClick={() => setModalOpen(true)} className="shrink-0">
          Nuevo tema
        </Button>
      </div>

      {temas.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Todavía no cargaste temas"
          description="Creá los temas de cada parcial para hacer el seguimiento con el semáforo."
        />
      ) : (
        <div className="space-y-6">
          {groups.map(([parcial, items]) => (
            <div key={parcial}>
              <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted">
                Parcial {parcial}
              </h3>
              <ul className="space-y-2">
                {items.map((t) => (
                  <li key={t.id}>
                    <div className="flex items-center gap-3 rounded-xl2 border border-line bg-white px-4 py-3 shadow-soft">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                        {t.name}
                      </span>
                      <Semaforo estado={t.estado} onChange={(estado) => setEstado(t.id, estado)} />
                      <button
                        aria-label={`Borrar ${t.name}`}
                        title="Borrar tema"
                        className="rounded-lg p-2 text-muted hover:bg-sinverSoft hover:text-sinver focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tinta"
                        onClick={() => setToDelete(t)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <NewTemaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        subjectId={subjectId}
        defaultParcial={nextParcial}
        onCreated={reloadTemas}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          await db.temas.remove(toDelete.id);
          reloadTemas();
        }}
        title="Borrar tema"
        description={`Se va a borrar "${toDelete?.name ?? ""}" del seguimiento.`}
        confirmLabel="Borrar"
      />
    </div>
  );
}
