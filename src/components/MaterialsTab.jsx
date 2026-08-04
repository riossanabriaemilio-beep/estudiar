import { useEffect, useRef, useState } from "react";
import { Upload, FileText, Trash2, Eye } from "lucide-react";
import { db } from "../lib/db.js";
import { ingestFile } from "../lib/ingest.js";
import { Btn, Card, Badge, Empty, Spinner } from "./ui.jsx";

export default function MaterialsTab({ subjectId }) {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    db.getMaterials(subjectId).then(setItems);
  }, [subjectId]);

  async function save(list) {
    setItems(list);
    await db.saveMaterials(subjectId, list);
  }

  async function onFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    setError("");
    let list = [...items];
    for (const f of files) {
      setBusy(`Procesando ${f.name}…`);
      try {
        const { text, method } = await ingestFile(f);
        if (!text) throw new Error("No se pudo extraer texto.");
        list = [
          ...list,
          { id: db.uid(), name: f.name, type: method, text, chars: text.length, createdAt: Date.now() },
        ];
        await save(list);
      } catch (err) {
        setError(`${f.name}: ${err.message}`);
      }
    }
    setBusy("");
  }

  function remove(id) {
    save(items.filter((m) => m.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Materiales</h2>
          <p className="text-sm text-muted">Subí PDFs, Word, fotos de apuntes o texto. Los escaneados los transcribe la IA.</p>
        </div>
        <Btn onClick={() => fileRef.current?.click()} disabled={!!busy}><Upload size={16} /> Subir</Btn>
        <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt,.md,.csv,image/*" hidden onChange={onFiles} />
      </div>

      {busy && <Card className="p-4 mb-3"><Spinner label={busy} /></Card>}
      {error && <Card className="p-3 mb-3 border-flojo/30 bg-flojoSoft text-flojo text-sm">{error}</Card>}

      {items.length === 0 && !busy ? (
        <Empty icon={FileText} title="Sin materiales todavía" hint="Cargá acá todo lo que te dan para estudiar: teóricos, prácticos, apuntes, lo que sea." />
      ) : (
        <div className="grid gap-2">
          {items.map((m) => (
            <Card key={m.id} className="p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-tintaSoft text-tinta flex items-center justify-center shrink-0"><FileText size={17} /></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{m.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge tone="tinta">{m.type}</Badge>
                  <span className="text-xs text-muted">{m.chars.toLocaleString("es-AR")} caracteres</span>
                </div>
              </div>
              <Btn variant="ghost" size="sm" onClick={() => setPreview(m)}><Eye size={16} /></Btn>
              <Btn variant="ghost" size="sm" onClick={() => remove(m.id)}><Trash2 size={16} className="text-flojo" /></Btn>
            </Card>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-semibold mb-3">{preview.name}</h3>
            <pre className="text-sm text-ink/80 whitespace-pre-wrap overflow-y-auto flex-1 font-sans">{preview.text}</pre>
            <div className="pt-3"><Btn variant="outline" onClick={() => setPreview(null)}>Cerrar</Btn></div>
          </Card>
        </div>
      )}
    </div>
  );
}
