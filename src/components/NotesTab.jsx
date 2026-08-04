import { useEffect, useState } from "react";
import { Plus, CalendarDays, Trash2 } from "lucide-react";
import { db } from "../lib/db.js";
import { Btn, Card, Empty } from "./ui.jsx";

export default function NotesTab({ subjectId }) {
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ date: today(), title: "", content: "" });

  useEffect(() => {
    db.getNotes(subjectId).then((n) => setNotes(sortByDate(n)));
  }, [subjectId]);

  async function save(list) {
    const sorted = sortByDate(list);
    setNotes(sorted);
    await db.saveNotes(subjectId, sorted);
  }

  function add() {
    if (!draft.content.trim()) return;
    save([...notes, { id: db.uid(), ...draft }]);
    setDraft({ date: today(), title: "", content: "" });
    setOpen(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Apuntes por día</h2>
          <p className="text-sm text-muted">Anotá lo que se vio en cada clase. Después la IA lo usa como material.</p>
        </div>
        <Btn onClick={() => setOpen((v) => !v)}><Plus size={16} /> Apunte</Btn>
      </div>

      {open && (
        <Card className="p-4 mb-4">
          <div className="flex gap-3 mb-3">
            <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="border border-line rounded-xl px-3 py-2 text-sm" />
            <input placeholder="Título (opcional)" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="flex-1 border border-line rounded-xl px-3 py-2 text-sm" />
          </div>
          <textarea rows={5} placeholder="¿Qué se vio hoy?" value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            className="w-full border border-line rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-tinta/40" />
          <div className="flex justify-end gap-2 mt-2">
            <Btn variant="outline" onClick={() => setOpen(false)}>Cancelar</Btn>
            <Btn onClick={add}>Guardar</Btn>
          </div>
        </Card>
      )}

      {notes.length === 0 && !open ? (
        <Empty icon={CalendarDays} title="Sin apuntes" hint="Cargá lo que se dictó por día. Suma un montón para las pruebas." />
      ) : (
        <div className="grid gap-2">
          {notes.map((n) => (
            <Card key={n.id} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-oro font-medium">{fmt(n.date)}</span>
                  {n.title && <span className="font-semibold">· {n.title}</span>}
                </div>
                <Trash2 size={15} className="text-flojo cursor-pointer opacity-60 hover:opacity-100"
                  onClick={() => save(notes.filter((x) => x.id !== n.id))} />
              </div>
              <p className="text-sm text-ink/80 whitespace-pre-wrap">{n.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function today() { return new Date().toISOString().slice(0, 10); }
function sortByDate(list) { return [...list].sort((a, b) => (a.date < b.date ? 1 : -1)); }
function fmt(d) {
  try { return new Date(d + "T00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
}
