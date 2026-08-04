import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Image as ImageIcon, Trash2, UploadCloud, Eye, AlertTriangle } from "lucide-react";
import * as db from "../lib/db.js";
import { extractText } from "../lib/ingest.js";
import { MAX_FILE_SIZE_MB } from "../config.js";
import { Badge, Button, ConfirmDialog, EmptyState, IconButton, Modal, Textarea } from "./ui.jsx";

function iconFor(type) {
  if (type === "imagen") return ImageIcon;
  return FileText;
}

function formatBytes(bytes) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function ViewMaterialModal({ material, onClose, onSaved }) {
  const [text, setText] = useState(material?.text || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(material?.text || "");
  }, [material]);

  if (!material) return null;

  async function handleSave() {
    setSaving(true);
    const trimmed = text.trim();
    const updated = await db.materials.update(material.id, {
      text: trimmed,
      charCount: trimmed.length,
      noText: trimmed.length === 0,
    });
    setSaving(false);
    onSaved(updated);
  }

  function openFile() {
    if (!material.blob) return;
    const url = URL.createObjectURL(material.blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <Modal
      open={!!material}
      onClose={onClose}
      title={material.name}
      width="max-w-2xl"
      footer={
        <>
          {material.blob ? (
            <Button variant="secondary" onClick={openFile}>
              Ver archivo original
            </Button>
          ) : null}
          <Button onClick={handleSave} disabled={saving}>
            Guardar texto
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {material.noText ? (
          <div className="flex items-start gap-2 rounded-lg bg-sinverSoft px-3 py-2.5 text-sm text-sinver">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>
              No se pudo extraer texto de este archivo (parece escaneado o es una imagen). Podés
              pegar el texto a mano acá abajo.
            </span>
          </div>
        ) : null}
        <Textarea
          rows={14}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Pegá o escribí el texto de este material acá..."
          className="font-mono text-[13px] leading-relaxed"
        />
        <p className="text-xs text-muted">{text.length.toLocaleString("es-AR")} caracteres</p>
      </div>
    </Modal>
  );
}

export default function MaterialsTab({ subjectId }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const reload = useCallback(async () => {
    const list = await db.materials.list(subjectId);
    setMaterials(list.slice().reverse());
    setLoading(false);
  }, [subjectId]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`"${file.name}" pesa más de ${MAX_FILE_SIZE_MB}MB, no se subió.`);
        continue;
      }
      const { type, text, noText } = await extractText(file);
      await db.materials.add({
        subjectId,
        name: file.name,
        type,
        size: file.size,
        text,
        charCount: text.length,
        noText,
        blob: file,
      });
    }
    setUploading(false);
    reload();
  }

  return (
    <div className="space-y-5">
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragOver ? "border-tinta bg-tintaSoft" : "border-line bg-white"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <UploadCloud size={26} className="text-tinta" strokeWidth={1.75} />
        <p className="text-sm text-ink">
          Arrastrá archivos acá o{" "}
          <button
            className="font-medium text-tinta underline underline-offset-2"
            onClick={() => inputRef.current?.click()}
          >
            elegilos manualmente
          </button>
        </p>
        <p className="text-xs text-muted">PDF, Word, TXT, Markdown, CSV o imágenes</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.md,.csv,image/*"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {uploading ? <p className="text-xs font-medium text-tinta">Procesando archivos...</p> : null}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Cargando materiales...</p>
      ) : materials.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Todavía no subiste materiales"
          description="Subí apuntes, guías o bibliografía para tener todo a mano."
        />
      ) : (
        <ul className="space-y-2">
          {materials.map((m) => {
            const Icon = iconFor(m.type);
            return (
              <li key={m.id}>
                <div className="flex items-center gap-3 rounded-xl2 border border-line bg-white px-4 py-3 shadow-soft">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tintaSoft text-tinta">
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{m.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <Badge>{m.type}</Badge>
                      {m.size ? <span>{formatBytes(m.size)}</span> : null}
                      <span>{m.charCount.toLocaleString("es-AR")} caracteres</span>
                      {m.noText ? <Badge tone="sinver">Sin texto extraíble</Badge> : null}
                    </div>
                  </div>
                  <IconButton icon={Eye} label="Ver / editar texto" onClick={() => setViewing(m)} />
                  <IconButton
                    icon={Trash2}
                    label="Borrar material"
                    className="hover:!bg-sinverSoft hover:!text-sinver"
                    onClick={() => setToDelete(m)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ViewMaterialModal
        material={viewing}
        onClose={() => setViewing(null)}
        onSaved={(updated) => {
          setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          setViewing(updated);
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          await db.materials.remove(toDelete.id);
          reload();
        }}
        title="Borrar material"
        description={`Se va a borrar "${toDelete?.name ?? ""}" para siempre.`}
        confirmLabel="Borrar"
      />
    </div>
  );
}
