import { useCallback, useEffect, useState } from "react";
import { TABS } from "../config.js";
import * as db from "../lib/db.js";
import StudyTab from "./StudyTab.jsx";
import MaterialsTab from "./MaterialsTab.jsx";
import NotesTab from "./NotesTab.jsx";
import OldExamsTab from "./OldExamsTab.jsx";
import ExamsTab from "./ExamsTab.jsx";

function ProgressRail({ temas }) {
  const total = temas.length;
  const counts = {
    dominado: temas.filter((t) => t.estado === "dominado").length,
    repasar: temas.filter((t) => t.estado === "repasar").length,
    sin_ver: temas.filter((t) => t.estado === "sin_ver").length,
  };
  const pct = total ? Math.round((counts.dominado / total) * 100) : 0;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink">Progreso general</span>
        <span className="font-display font-semibold text-tinta">{pct}%</span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-paper">
        {total > 0 ? (
          <div className="flex h-full w-full">
            <div
              className="h-full bg-ok transition-all"
              style={{ width: `${(counts.dominado / total) * 100}%` }}
            />
            <div
              className="h-full bg-repasar transition-all"
              style={{ width: `${(counts.repasar / total) * 100}%` }}
            />
            <div
              className="h-full bg-sinver transition-all"
              style={{ width: `${(counts.sin_ver / total) * 100}%` }}
            />
          </div>
        ) : null}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ok" /> Dominados: {counts.dominado}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-repasar" /> A repasar: {counts.repasar}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sinver" /> Sin ver: {counts.sin_ver}
        </span>
        <span>Total de temas: {total}</span>
      </div>
    </div>
  );
}

export default function SubjectView({ subject }) {
  const [tab, setTab] = useState("estudiar");
  const [temas, setTemas] = useState([]);

  const reloadTemas = useCallback(async () => {
    const list = await db.temas.list(subject.id);
    setTemas(list);
  }, [subject.id]);

  useEffect(() => {
    setTab("estudiar");
    reloadTemas();
  }, [subject.id, reloadTemas]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <div className="flex items-center gap-3">
          <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: subject.color }} />
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{subject.name}</h1>
        </div>
        <ProgressRail temas={temas} />
      </header>

      <div className="scrollbar-thin mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tinta focus-visible:ring-offset-1 ${
              tab === t.key
                ? "border-tinta text-tinta"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="py-6">
        {tab === "estudiar" ? (
          <StudyTab subjectId={subject.id} temas={temas} reloadTemas={reloadTemas} />
        ) : null}
        {tab === "materiales" ? <MaterialsTab subjectId={subject.id} /> : null}
        {tab === "apuntes" ? <NotesTab subjectId={subject.id} /> : null}
        {tab === "parciales" ? <OldExamsTab subjectId={subject.id} /> : null}
        {tab === "examenes" ? <ExamsTab subjectId={subject.id} /> : null}
      </div>
    </div>
  );
}
