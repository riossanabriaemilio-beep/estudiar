import { useMemo, useState } from "react";
import { Check, ChevronLeft, ThumbsDown, ThumbsUp, X } from "lucide-react";
import * as db from "../lib/db.js";
import { Badge, Button, Card, Textarea } from "./ui.jsx";

function MultipleQuestion({ q, index, answer, onAnswer }) {
  const answered = answer.selected !== null;
  return (
    <Card className="p-4">
      <p className="mb-3 text-sm font-medium text-ink">
        <span className="text-muted">Pregunta {index + 1}.</span> {q.pregunta}
      </p>
      <div className="space-y-2">
        {q.opciones.map((op, i) => {
          const isCorrect = i === q.correcta;
          const isSelected = answer.selected === i;
          let style = "border-line bg-white hover:border-tinta/40";
          if (answered) {
            if (isCorrect) style = "border-ok bg-okSoft";
            else if (isSelected) style = "border-sinver bg-sinverSoft";
            else style = "border-line bg-white opacity-60";
          } else if (isSelected) {
            style = "border-tinta bg-tintaSoft";
          }
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => onAnswer({ selected: i })}
              className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tinta disabled:cursor-default ${style}`}
            >
              <span>{op}</span>
              {answered && isCorrect ? <Check size={16} className="shrink-0 text-ok" /> : null}
              {answered && isSelected && !isCorrect ? (
                <X size={16} className="shrink-0 text-sinver" />
              ) : null}
            </button>
          );
        })}
      </div>
      {answered && q.explicacion ? (
        <p className="mt-3 rounded-lg bg-paper px-3 py-2.5 text-xs text-muted">
          <span className="font-semibold text-ink">Explicación: </span>
          {q.explicacion}
        </p>
      ) : null}
    </Card>
  );
}

function AbiertaQuestion({ q, index, answer, onAnswer }) {
  return (
    <Card className="p-4">
      <p className="mb-3 text-sm font-medium text-ink">
        <span className="text-muted">Pregunta {index + 1}.</span> {q.pregunta}
      </p>
      <Textarea
        rows={4}
        placeholder="Escribí tu respuesta..."
        value={answer.userAnswer}
        disabled={answer.marked !== null}
        onChange={(e) => onAnswer({ ...answer, userAnswer: e.target.value })}
      />
      {!answer.revealed ? (
        <div className="mt-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAnswer({ ...answer, revealed: true })}
          >
            Mostrar respuesta modelo
          </Button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="rounded-lg bg-oroSoft px-3 py-2.5 text-sm text-ink">
            <span className="font-semibold text-oro">Respuesta modelo: </span>
            {q.respuesta_modelo}
          </p>
          {answer.marked === null ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">¿Cómo te fue?</span>
              <Button
                size="sm"
                variant="secondary"
                icon={ThumbsUp}
                className="!border-ok !text-ok hover:!bg-okSoft"
                onClick={() => onAnswer({ ...answer, marked: "correcta" })}
              >
                Estuvo bien
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={ThumbsDown}
                className="!border-sinver !text-sinver hover:!bg-sinverSoft"
                onClick={() => onAnswer({ ...answer, marked: "incorrecta" })}
              >
                Estuvo mal
              </Button>
            </div>
          ) : (
            <Badge tone={answer.marked === "correcta" ? "ok" : "sinver"}>
              {answer.marked === "correcta" ? "Marcada como correcta" : "Marcada como incorrecta"}
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
}

export default function QuizRunner({ subjectId, exam, onExit }) {
  const [answers, setAnswers] = useState(() =>
    exam.questions.map((q) =>
      q.type === "multiple"
        ? { selected: null }
        : { userAnswer: "", revealed: false, marked: null }
    )
  );
  const [result, setResult] = useState(null);

  const allAnswered = useMemo(
    () =>
      answers.every((a, i) =>
        exam.questions[i].type === "multiple" ? a.selected !== null : a.marked !== null
      ),
    [answers, exam.questions]
  );

  const answeredCount = answers.filter((a, i) =>
    exam.questions[i].type === "multiple" ? a.selected !== null : a.marked !== null
  ).length;

  function updateAnswer(index, patch) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? patch : a)));
  }

  async function finish() {
    const total = exam.questions.length;
    const correct = answers.filter((a, i) =>
      exam.questions[i].type === "multiple"
        ? a.selected === exam.questions[i].correcta
        : a.marked === "correcta"
    ).length;
    const percent = total ? Math.round((correct / total) * 100) : 0;
    const summary = { correct, total, percent };
    await db.history.add({
      subjectId,
      examId: exam.id,
      examTitulo: exam.titulo,
      ...summary,
    });
    setResult(summary);
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onExit}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-tinta focus-visible:outline-none"
      >
        <ChevronLeft size={16} /> Volver a los exámenes
      </button>

      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">{exam.titulo}</h3>
        <span className="text-sm text-muted">
          {answeredCount}/{exam.questions.length} respondidas
        </span>
      </div>

      {result ? (
        <Card className="border-tinta/30 bg-tintaSoft p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-tinta">Resultado</p>
          <p className="mt-1 font-display text-3xl font-bold text-tinta">{result.percent}%</p>
          <p className="mt-1 text-sm text-ink">
            {result.correct} de {result.total} correctas
          </p>
          <p className="mt-2 text-xs text-muted">Guardado en el historial de esta materia.</p>
          <div className="mt-4">
            <Button onClick={onExit}>Volver a los exámenes</Button>
          </div>
        </Card>
      ) : null}

      <div className="space-y-3">
        {exam.questions.map((q, i) =>
          q.type === "multiple" ? (
            <MultipleQuestion
              key={i}
              q={q}
              index={i}
              answer={answers[i]}
              onAnswer={(a) => updateAnswer(i, a)}
            />
          ) : (
            <AbiertaQuestion
              key={i}
              q={q}
              index={i}
              answer={answers[i]}
              onAnswer={(a) => updateAnswer(i, a)}
            />
          )
        )}
      </div>

      {!result ? (
        <div className="flex justify-end">
          <Button onClick={finish} disabled={!allAnswered}>
            Finalizar y ver puntaje
          </Button>
        </div>
      ) : null}
    </div>
  );
}
