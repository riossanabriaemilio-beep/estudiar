import { useCallback, useEffect, useRef, useState } from "react";
import { Archive, Eye, FileText, Trash2, UploadCloud } from "lucide-react";
import * as db from "../lib/db.js";
import { detectType } from "../lib/ingest.js";
import { MAX_FILE_SIZE_MB } from "../config.js";
import { Badge, ConfirmDialog, EmptyState, IconButton } from "./ui.jsx";

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

export default function OldExamsTab({ subjectId }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const reload = useCallback(async () => {
    const list = await db.oldExams.list(subjectId);
    setExams(list.slice().reverse());
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
      await db.oldExams.add({
        subjectId,
        name: file.name,
        type: detectType(file),
        size: file.size,
        blob: file,
      });
    }
    setUploading(false);
    reload();
  }

  function openFile(exam) {
    const url = URL.createObjectURL(exam.blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        Guardá acá tus parciales viejos o modelos de examen, tal cual, para tenerlos a mano. Esta
        sección no analiza ni corrige nada, solo archiva.
      </p>

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
        <p className="text-xs text-muted">PDF, Word, imágenes o texto</p>
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
        {uploading ? <p className="text-xs font-medium text-tinta">Subiendo archivos...</p> : null}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Cargando parciales viejos...</p>
      ) : exams.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="Todavía no subiste parciales viejos"
          description="Archivá modelos de examen para consultarlos cuando quieras."
        />
      ) : (
        <ul className="space-y-2">
          {exams.map((e) => (
            <li key={e.id}>
              <div className="flex items-center gap-3 rounded-xl2 border border-line bg-white px-4 py-3 shadow-soft">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-oroSoft text-oro">
                  <FileText size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{e.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <Badge>{e.type}</Badge>
                    {e.size ? <span>{formatBytes(e.size)}</span> : null}
                  </div>
                </div>
                <IconButton icon={Eye} label="Ver archivo" onClick={() => openFile(e)} />
                <IconButton
                  icon={Trash2}
                  label="Borrar"
                  className="hover:!bg-sinverSoft hover:!text-sinver"
                  onClick={() => setToDelete(e)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          await db.oldExams.remove(toDelete.id);
          reload();
        }}
        title="Borrar archivo"
        description={`Se va a borrar "${toDelete?.name ?? ""}" para siempre.`}
        confirmLabel="Borrar"
      />
    </div>
  );
}
