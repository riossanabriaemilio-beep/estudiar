import { useEffect, useState } from "react";
import { BookOpen, FileStack, CalendarDays, Target } from "lucide-react";
import { db } from "../lib/db.js";
import MaterialsTab from "./MaterialsTab.jsx";
import NotesTab from "./NotesTab.jsx";
import StudyTab from "./StudyTab.jsx";
import ExamsTab from "./ExamsTab.jsx";

const TABS = [
  { id: "study", label: "Estudiar", icon: BookOpen },
  { id: "materials", label: "Materiales", icon: FileStack },
  { id: "notes", label: "Apuntes", icon: CalendarDays },
  { id: "exams", label: "Parciales viejos", icon: Target },
];

export default function SubjectView({ subject }) {
  const [tab, setTab] = useState("study");
  const [topics, setTopics] = useState([]);

  useEffect(() => { setTab("study"); }, [subject.id]);
  useEffect(() => {
    // refrescar riel cada vez que se entra a estudiar o cambia materia
    db.getTopics(subject.id).then(setTopics);
  }, [subject.id, tab]);

  const total = topics.length;
  const dominados = topics.filter((t) => t.status === "dominado").length;
  const repasar = topics.filter((t) => t.status === "repasar").length;
  const pct = total ? Math.round((dominados / total) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Cabecera */}
      <header className="px-8 pt-6 pb-4 border-b border-line bg-panel/60">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full" style={{ background: subject.color }} />
          <h1 className="font-display text-2xl font-bold">{subject.name}</h1>
        </div>

        {/* Signature: riel de dominio por parcial */}
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-40 h-2 rounded-full bg-line overflow-hidden">
              <div className="h-full bg-ok transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="font-mono text-sm font-semibold text-ok">{pct}%</span>
            <span className="text-xs text-muted">dominado</span>
          </div>
          {total > 0 && (
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1"><Dot c="#2E7D5B" /> {dominados} dominados</span>
              <span className="flex items-center gap-1"><Dot c="#B9862B" /> {repasar} a repasar</span>
              <span className="flex items-center gap-1"><Dot c="#C9C6BE" /> {total - dominados - repasar} pendientes</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <nav className="mt-5 flex gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id ? "bg-tinta text-white" : "text-muted hover:bg-line/50 hover:text-ink"
                }`}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl">
          {tab === "study" && <StudyTab subjectId={subject.id} subjectName={subject.name} />}
          {tab === "materials" && <MaterialsTab subjectId={subject.id} />}
          {tab === "notes" && <NotesTab subjectId={subject.id} />}
          {tab === "exams" && <ExamsTab subjectId={subject.id} subjectName={subject.name} />}
        </div>
      </div>
    </div>
  );
}

const Dot = ({ c }) => <span className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />;
