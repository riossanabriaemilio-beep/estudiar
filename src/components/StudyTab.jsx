import { useEffect, useState } from "react";
import { Plus, Brain, Network, MessageCircle, Sparkles, ChevronLeft, Send } from "lucide-react";
import { db } from "../lib/db.js";
import { buildContext, generateQuiz, generateMindMap, chatAboutMaterial } from "../lib/ai.js";
import { Btn, Card, Badge, Empty, Spinner } from "./ui.jsx";
import QuizRunner from "./QuizRunner.jsx";
import MindMap from "./MindMap.jsx";

const STATUS = {
  pendiente: { tone: "muted", label: "pendiente" },
  repasar: { tone: "oro", label: "para repasar" },
  dominado: { tone: "ok", label: "dominado" },
};

export default function StudyTab({ subjectId, subjectName }) {
  const [topics, setTopics] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [notes, setNotes] = useState([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", parcial: 1 });
  const [active, setActive] = useState(null); // topic
  const [mode, setMode] = useState("menu");   // menu|quiz|map
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    db.getTopics(subjectId).then(setTopics);
    db.getMaterials(subjectId).then(setMaterials);
    db.getNotes(subjectId).then(setNotes);
    setActive(null); setMode("menu"); setQuiz(null); setMap(null);
  }, [subjectId]);

  const hasMaterial = materials.length > 0 || notes.length > 0;

  function ctxFor(topic) {
    const chunks = [
      topic ? `TEMA A ESTUDIAR: ${topic.name}` : "",
      ...materials.map((m) => m.text),
      ...notes.map((n) => `Apunte ${n.date}${n.title ? " · " + n.title : ""}:\n${n.content}`),
    ];
    return buildContext(chunks);
  }

  async function saveTopics(list) { setTopics(list); await db.saveTopics(subjectId, list); }

  function addTopic() {
    if (!draft.name.trim()) return;
    saveTopics([...topics, { id: db.uid(), name: draft.name.trim(), parcial: Number(draft.parcial) || 1, status: "pendiente" }]);
    setDraft({ name: "", parcial: draft.parcial });
    setAdding(false);
  }

  function setStatus(topicId, status) {
    saveTopics(topics.map((t) => (t.id === topicId ? { ...t, status } : t)));
  }

  async function startQuiz(topic) {
    setError(""); setLoading("Armando tu autoevaluación…");
    try {
      const qs = await generateQuiz({ topicName: topic.name, context: ctxFor(topic), n: 6 });
      if (!qs.length) throw new Error("No se generaron preguntas. ¿Cargaste material del tema?");
      setQuiz(qs); setActive(topic); setMode("quiz");
    } catch (e) { setError(e.message); }
    setLoading("");
  }

  async function startMap(topic) {
    setError(""); setLoading("Dibujando el mapa mental…");
    try {
      const m = await generateMindMap({ topicName: topic.name, context: ctxFor(topic) });
      setMap(m); setActive(topic); setMode("map");
    } catch (e) { setError(e.message); }
    setLoading("");
  }

  async function onQuizFinish({ score, total }) {
    const pct = Math.round((score / total) * 100);
    setStatus(active.id, pct >= 70 ? "dominado" : "repasar");
    const hist = await db.getHistory(subjectId);
    await db.saveHistory(subjectId, [
      { id: db.uid(), topicId: active.id, topicName: active.name, date: Date.now(), score, total },
      ...hist,
    ]);
  }

  // ── Vistas de actividad ──────────────────────────────────────
  if (mode === "quiz" && quiz) {
    return (
      <Activity title={`Autoevaluación · ${active.name}`} onBack={() => setMode("menu")}>
        <QuizRunner questions={quiz} context={ctxFor(active)} onFinish={onQuizFinish} />
      </Activity>
    );
  }
  if (mode === "map" && map) {
    return (
      <Activity title={`Mapa mental · ${active.name}`} onBack={() => setMode("menu")}>
        <MindMap data={map} />
      </Activity>
    );
  }
  if (mode === "chat" && active) {
    return (
      <Activity title={`Preguntar · ${active.name}`} onBack={() => setMode("menu")}>
        <ChatPanel context={ctxFor(active)} />
      </Activity>
    );
  }

  // ── Menú principal de temas ──────────────────────────────────
  const byParcial = groupBy(topics, (t) => t.parcial);
  const parciales = Object.keys(byParcial).map(Number).sort((a, b) => a - b);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Estudiar</h2>
          <p className="text-sm text-muted">Creá los temas de cada parcial y estudialos uno por uno.</p>
        </div>
        <Btn onClick={() => setAdding((v) => !v)}><Plus size={16} /> Tema</Btn>
      </div>

      {!hasMaterial && (
        <Card className="p-3 mb-3 bg-oroSoft border-oro/30 text-sm text-ink/80">
          Ojo: todavía no cargaste material ni apuntes. La IA arma mejor los quizzes y mapas si primero subís algo en <b>Materiales</b> o <b>Apuntes</b>.
        </Card>
      )}

      {adding && (
        <Card className="p-4 mb-4 flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted">Nombre del tema</label>
            <input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && addTopic()}
              placeholder="Ej: Elasticidad de la demanda"
              className="w-full border border-line rounded-xl px-3 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted">Parcial</label>
            <input type="number" min={1} value={draft.parcial} onChange={(e) => setDraft({ ...draft, parcial: e.target.value })}
              className="w-20 border border-line rounded-xl px-3 py-2 text-sm mt-1" />
          </div>
          <Btn onClick={addTopic}>Agregar</Btn>
        </Card>
      )}

      {loading && <Card className="p-4 mb-3"><Spinner label={loading} /></Card>}
      {error && <Card className="p-3 mb-3 bg-flojoSoft border-flojo/30 text-flojo text-sm">{error}</Card>}

      {topics.length === 0 && !adding ? (
        <Empty icon={Brain} title="Sin temas todavía" hint="Cargá los temas que entran en cada parcial. Después los vas estudiando de a uno." />
      ) : (
        <div className="space-y-6">
          {parciales.map((p) => (
            <div key={p}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-display font-semibold text-oro">Parcial {p}</span>
                <span className="h-px flex-1 bg-line" />
                <span className="text-xs text-muted">{byParcial[p].length} temas</span>
              </div>
              <div className="grid gap-2">
                {byParcial[p].map((t) => (
                  <Card key={t.id} className="p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t.name}</span>
                        <Badge tone={STATUS[t.status].tone}>{STATUS[t.status].label}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Btn size="sm" onClick={() => startQuiz(t)} disabled={!!loading}><Sparkles size={14} /> Autoevaluación</Btn>
                        <Btn size="sm" variant="outline" onClick={() => startMap(t)} disabled={!!loading}><Network size={14} /> Mapa</Btn>
                        <Btn size="sm" variant="outline" onClick={() => { setActive(t); setMode("chat"); }}><MessageCircle size={14} /> Preguntar</Btn>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Activity({ title, onBack, children }) {
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted hover:text-ink mb-4">
        <ChevronLeft size={16} /> Volver a temas
      </button>
      <h2 className="font-display text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function ChatPanel({ context }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!input.trim() || busy) return;
    const question = input.trim();
    const history = msgs;
    setMsgs([...msgs, { role: "user", text: question }]);
    setInput(""); setBusy(true);
    try {
      const ans = await chatAboutMaterial({ question, context, history });
      setMsgs((m) => [...m, { role: "assistant", text: ans }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", text: "Error: " + e.message }]);
    }
    setBusy(false);
  }

  return (
    <Card className="p-4 flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {msgs.length === 0 && <p className="text-sm text-muted">Preguntale lo que quieras sobre este tema. Responde con tu material.</p>}
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-tinta text-white ml-auto rounded-br-sm" : "bg-line/50 text-ink rounded-bl-sm"}`}>
            {m.text}
          </div>
        ))}
        {busy && <Spinner label="Pensando…" />}
      </div>
      <div className="flex gap-2 pt-3 mt-2 border-t border-line">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Escribí tu pregunta…" className="flex-1 border border-line rounded-xl px-3 py-2 text-sm" />
        <Btn onClick={send} disabled={busy}><Send size={15} /></Btn>
      </div>
    </Card>
  );
}

function groupBy(arr, fn) {
  return arr.reduce((acc, x) => { const k = fn(x); (acc[k] ||= []).push(x); return acc; }, {});
}
