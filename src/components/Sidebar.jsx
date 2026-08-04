import { useState } from "react";
import { Plus, Settings as Cog, GraduationCap, Trash2 } from "lucide-react";
import { useApp } from "../state/store.jsx";
import { Btn } from "./ui.jsx";

export default function Sidebar({ onOpenSettings }) {
  const { subjects, currentId, setCurrentId, addSubject, deleteSubject } = useApp();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  async function submit() {
    if (!name.trim()) return;
    await addSubject(name);
    setName("");
    setAdding(false);
  }

  return (
    <aside className="w-72 shrink-0 h-full bg-panel border-r border-line flex flex-col">
      <div className="px-5 py-5 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-tinta text-white flex items-center justify-center">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-none">EstudIA</div>
            <div className="text-xs text-muted mt-0.5">tu sistema de estudio</div>
          </div>
        </div>
      </div>

      <div className="px-3 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted px-2">Materias</span>
        <Btn variant="ghost" size="sm" onClick={() => setAdding((v) => !v)}><Plus size={16} /></Btn>
      </div>

      {adding && (
        <div className="px-3 pb-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ej: Microeconomía"
            className="w-full border border-line rounded-xl px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-tinta/40"
          />
          <div className="flex gap-2 mt-2">
            <Btn size="sm" onClick={submit} className="flex-1">Crear</Btn>
            <Btn size="sm" variant="outline" onClick={() => setAdding(false)}>Cancelar</Btn>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {subjects.length === 0 && !adding && (
          <p className="text-sm text-muted px-2 py-4">Todavía no tenés materias. Tocá <b>+</b> para crear la primera.</p>
        )}
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => setCurrentId(s.id)}
            className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
              currentId === s.id ? "bg-tintaSoft" : "hover:bg-line/50"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className={`flex-1 text-sm truncate ${currentId === s.id ? "font-semibold text-tinta" : "text-ink"}`}>{s.name}</span>
            <Trash2
              size={14}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-flojo transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`¿Borrar "${s.name}" y todo su contenido?`)) deleteSubject(s.id);
              }}
            />
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-line">
        <Btn variant="outline" onClick={onOpenSettings} className="w-full"><Cog size={16} /> Ajustes</Btn>
      </div>
    </aside>
  );
}
