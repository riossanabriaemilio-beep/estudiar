import { useEffect, useRef, useState } from "react";
import { Upload, Target, Trash2, FileText, Sparkles, ChevronLeft, TrendingUp, AlertTriangle } from "lucide-react";
import { db } from "../lib/db.js";
import { ingestFile } from "../lib/ingest.js";
import { buildContext, analyzeOldExams, generateMockExam } from "../lib/ai.js";
import { Btn, Card, Badge, Empty, Spinner } from "./ui.jsx";
import QuizRunner from "./QuizRunner.jsx";

export default function ExamsTab({ subjectId, subjectName }) {
  const [exams, setExams] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [notes, setNotes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [mock, setMock] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    db.getExams(subjectId).then(setExams);
    db.getMaterials(subjectId).then(setMaterials);
    db.getNotes(subjectId).then(setNotes);
    db.getTopics(subjectId).then(setTopics);
    setAnalysis(null); setMock(null); setError("");
  }, [subjectId]);

  async function saveExams(list) { setExams(list); await db.saveExams(subjectId, list); }

  async function onFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; setError("");
    let list = [...exams];
    for (const f of files) {
      setBusy(`Procesando ${f.name}…`);
      try {
        const { text } = await ingestFile(f);
        if (!text) throw new Error("Sin texto");
        list = [...list, { id: db.uid(), name: f.name, text, createdAt: Date.now() }];
        await saveExams(list);
      } catch (err) { setError(`${f.name}: ${err.message}`); }
    }
    setBusy("");
  }

  function studyContext() {
    return buildContext([
      ...materials.map((m) => m.text),
      ...notes.map((n) => `${n.date} ${n.title || ""}:\n${n.content}`),
    ]);
  }

  async function runAnalysis() {
    if (exams.length === 0) return;
    setError(""); setBusy("Analizando patrones de los exámenes…");
    try {
      const examsText = buildContext(exams.map((x) => `=== ${x.name} ===\n${x.text}`), 20000);
      const a = await analyzeOldExams({ subjectName, examsText, topicsList: topics.map((t) => t.name) });
      setAnalysis(a);
    } catch (e) { setError(e.message); }
    setBusy("");
  }

  async function runMock() {
    setError(""); setBusy("Armando tu parcial de prueba…");
    try {
      const ctx = buildContext([
        ...materials.map((m) => m.text),
        ...notes.map((n) => n.content),
        ...exams.map((x) => `Examen previo:\n${x.text}`),
      ]);
      const exam = await generateMockExam({ subjectName, scope: "toda la materia", context: ctx, n: 10 });
      if (!exam?.questions?.length) throw new Error("No se pudo generar el parcial. Cargá más material.");
      setMock(exam);
    } catch (e) { setError(e.message); }
    setBusy("");
  }

  if (mock) {
    return (
      <div>
        <button onClick={() => setMock(null)} className="flex items-center gap-1 text-sm text-muted hover:text-ink mb-4"><ChevronLeft size={16} /> Volver</button>
        <h2 className="font-display text-lg font-semibold mb-1">{mock.titulo || "Parcial de prueba"}</h2>
        <p className="text-sm text-muted mb-4">Simulacro basado en tu material y tus exámenes viejos.</p>
        <QuizRunner questions={mock.questions} context={studyContext()} title="Parcial de prueba" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-xl font-semibold">Parciales viejos <span className="text-muted font-sans text-sm font-normal">(opcional pero clave)</span></h2>
          <p className="text-sm text-muted">Subí exámenes viejos o de prueba. La IA detecta qué se repite y arma tu estrategia.</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" onClick={() => fileRef.current?.click()} disabled={!!busy}><Upload size={16} /> Subir examen</Btn>
          <Btn variant="oro" onClick={runMock} disabled={!!busy}><Sparkles size={16} /> Parcial de prueba</Btn>
        </div>
        <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt,.md,image/*" hidden onChange={onFiles} />
      </div>

      {busy && <Card className="p-4 mb-3"><Spinner label={busy} /></Card>}
      {error && <Card className="p-3 mb-3 bg-flojoSoft border-flojo/30 text-flojo text-sm">{error}</Card>}

      {exams.length > 0 && (
        <div className="grid gap-2 mb-4">
          {exams.map((x) => (
            <Card key={x.id} className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-oroSoft text-oro flex items-center justify-center shrink-0"><FileText size={16} /></div>
              <span className="flex-1 text-sm truncate">{x.name}</span>
              <Trash2 size={15} className="text-flojo cursor-pointer opacity-60 hover:opacity-100" onClick={() => saveExams(exams.filter((e) => e.id !== x.id))} />
            </Card>
          ))}
          <Btn onClick={runAnalysis} disabled={!!busy} className="w-fit"><Target size={16} /> Analizar exámenes</Btn>
        </div>
      )}

      {exams.length === 0 && !busy && (
        <Empty icon={Target} title="Sin exámenes cargados"
          hint="Subí parciales viejos, guías o modelos de examen. Con eso te digo qué temas caen más y cómo priorizar."
        />
      )}

      {analysis && <AnalysisView a={analysis} />}
    </div>
  );
}

function AnalysisView({ a }) {
  return (
    <div className="space-y-4 mt-4">
      <Card className="p-4 bg-tintaSoft border-tinta/20">
        <p className="text-sm text-ink/85">{a.resumen}</p>
      </Card>

      {a.temas_frecuentes?.length > 0 && (
        <Card className="p-4">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><TrendingUp size={17} className="text-tinta" /> Temas que más caen</h3>
          <div className="space-y-2">
            {a.temas_frecuentes.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex-1 text-sm">{t.tema}</span>
                {t.veces != null && <span className="font-mono text-xs text-muted">×{t.veces}</span>}
                <Badge tone={t.peso === "alto" ? "flojo" : t.peso === "medio" ? "oro" : "muted"}>{t.peso}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {a.tipos_de_pregunta?.length > 0 && (
          <Card className="p-4">
            <h3 className="font-display font-semibold mb-3">Tipos de pregunta</h3>
            <div className="space-y-1.5">
              {a.tipos_de_pregunta.map((t, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="capitalize">{t.tipo}</span>
                  <Badge tone={t.frecuencia === "alta" ? "flojo" : t.frecuencia === "media" ? "oro" : "muted"}>{t.frecuencia}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
        {a.preguntas_repetidas?.length > 0 && (
          <Card className="p-4">
            <h3 className="font-display font-semibold mb-3">Preguntas que se repiten</h3>
            <ul className="space-y-1.5 text-sm text-ink/80 list-disc pl-4">
              {a.preguntas_repetidas.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </Card>
        )}
      </div>

      {a.plan_estrategico?.length > 0 && (
        <Card className="p-4 bg-oroSoft border-oro/30">
          <h3 className="font-display font-semibold mb-3 text-oro flex items-center gap-2"><Target size={17} /> Tu plan para aprobar</h3>
          <ol className="space-y-2">
            {a.plan_estrategico.map((p, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="font-mono font-bold text-oro shrink-0">{i + 1}.</span> {p}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {a.trampas?.length > 0 && (
        <Card className="p-4">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><AlertTriangle size={17} className="text-flojo" /> Ojo con esto</h3>
          <ul className="space-y-1.5 text-sm text-ink/80 list-disc pl-4">
            {a.trampas.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </Card>
      )}
    </div>
  );
}
