import { useState } from "react";
import { Check, X, ArrowRight, RotateCcw } from "lucide-react";
import { gradeOpen } from "../lib/ai.js";
import { Btn, Card, Badge, Spinner } from "./ui.jsx";

export default function QuizRunner({ questions, context, title, onFinish }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({}); // idx -> {correct, feedback}
  const [selected, setSelected] = useState(null);
  const [openText, setOpenText] = useState("");
  const [grading, setGrading] = useState(false);
  const [done, setDone] = useState(false);

  const q = questions[i];
  const already = answers[i];

  async function check() {
    if (q.type === "multiple") {
      if (selected == null) return;
      const correct = selected === q.correcta;
      setAnswers({ ...answers, [i]: { correct, feedback: q.explicacion, chosen: selected } });
    } else {
      if (!openText.trim()) return;
      setGrading(true);
      try {
        const r = await gradeOpen({ pregunta: q.pregunta, respuesta: openText, context });
        setAnswers({ ...answers, [i]: { correct: r.puntaje >= 60, feedback: r.feedback, puntaje: r.puntaje, text: openText } });
      } catch (e) {
        setAnswers({ ...answers, [i]: { correct: null, feedback: "No se pudo corregir: " + e.message, text: openText } });
      }
      setGrading(false);
    }
  }

  function next() {
    setSelected(null);
    setOpenText("");
    if (i + 1 < questions.length) setI(i + 1);
    else finish();
  }

  function finish() {
    const total = questions.length;
    const score = Object.values(answers).filter((a) => a.correct).length;
    setDone(true);
    onFinish?.({ score, total });
  }

  if (done) {
    const total = questions.length;
    const score = Object.values(answers).filter((a) => a.correct).length;
    const pct = Math.round((score / total) * 100);
    const tone = pct >= 70 ? "ok" : pct >= 50 ? "oro" : "flojo";
    return (
      <Card className="p-6 text-center">
        <div className={`font-mono text-4xl font-bold ${pct >= 70 ? "text-ok" : pct >= 50 ? "text-oro" : "text-flojo"}`}>
          {pct}%
        </div>
        <p className="text-muted mt-1">{score} de {total} bien</p>
        <p className="mt-3 text-sm">
          {pct >= 70 ? "Vas piola con este tema. 💪" : pct >= 50 ? "Ahí va, pero repasá lo que fallaste." : "Este tema todavía no lo tenés. A darle de nuevo."}
        </p>
        <div className="mt-4"><Badge tone={tone}>{pct >= 70 ? "dominado" : "para repasar"}</Badge></div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        {title && <span className="font-display font-semibold text-sm">{title}</span>}
        <Badge tone="tinta">Pregunta {i + 1} / {questions.length}</Badge>
      </div>

      <p className="font-medium text-ink mb-4">{q.pregunta}</p>

      {q.type === "multiple" ? (
        <div className="space-y-2">
          {q.opciones.map((op, idx) => {
            const isChosen = (already ? already.chosen : selected) === idx;
            const showCorrect = already && idx === q.correcta;
            const showWrong = already && already.chosen === idx && idx !== q.correcta;
            return (
              <button
                key={idx}
                disabled={!!already}
                onClick={() => setSelected(idx)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors flex items-center gap-3
                  ${showCorrect ? "border-ok bg-okSoft" : showWrong ? "border-flojo bg-flojoSoft" : isChosen ? "border-tinta bg-tintaSoft" : "border-line hover:bg-line/40"}`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs shrink-0">
                  {showCorrect ? <Check size={12} /> : showWrong ? <X size={12} /> : String.fromCharCode(97 + idx)}
                </span>
                {op}
              </button>
            );
          })}
        </div>
      ) : (
        <textarea
          rows={4}
          disabled={!!already}
          value={already ? already.text : openText}
          onChange={(e) => setOpenText(e.target.value)}
          placeholder="Escribí tu respuesta…"
          className="w-full border border-line rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-tinta/40"
        />
      )}

      {already && (
        <div className={`mt-4 p-3 rounded-xl text-sm ${already.correct ? "bg-okSoft text-ok" : already.correct === false ? "bg-flojoSoft text-flojo" : "bg-line/50 text-ink/70"}`}>
          {already.puntaje != null && <div className="font-mono font-semibold mb-1">{already.puntaje}/100</div>}
          {already.feedback}
        </div>
      )}

      <div className="flex justify-end gap-2 mt-5">
        {grading ? (
          <Spinner label="Corrigiendo…" />
        ) : !already ? (
          <Btn onClick={check}>Corregir</Btn>
        ) : (
          <Btn variant="oro" onClick={next}>
            {i + 1 < questions.length ? "Siguiente" : "Terminar"} <ArrowRight size={15} />
          </Btn>
        )}
      </div>
    </Card>
  );
}
