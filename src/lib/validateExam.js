// Validación del JSON pegado al importar un examen. Sin IA: chequeos explícitos.

export function validateExamJson(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    return { ok: false, error: `El texto pegado no es un JSON válido: ${err.message}` };
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { ok: false, error: 'El JSON debe ser un objeto con "titulo" y "questions".' };
  }
  if (typeof data.titulo !== "string" || !data.titulo.trim()) {
    return { ok: false, error: 'Falta el campo "titulo" (debe ser un texto no vacío).' };
  }
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    return { ok: false, error: 'Falta "questions" o está vacío (debe ser una lista de preguntas).' };
  }

  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i];
    const n = i + 1;
    if (!q || typeof q !== "object") {
      return { ok: false, error: `La pregunta ${n} no es un objeto válido.` };
    }
    if (q.type !== "multiple" && q.type !== "abierta") {
      return {
        ok: false,
        error: `La pregunta ${n} tiene "type" inválido: debe ser "multiple" o "abierta".`,
      };
    }
    if (typeof q.pregunta !== "string" || !q.pregunta.trim()) {
      return { ok: false, error: `La pregunta ${n} no tiene "pregunta" (texto no vacío).` };
    }
    if (q.type === "multiple") {
      if (!Array.isArray(q.opciones) || q.opciones.length < 2) {
        return {
          ok: false,
          error: `La pregunta ${n} (multiple) necesita "opciones": una lista de al menos 2 textos.`,
        };
      }
      if (q.opciones.some((op) => typeof op !== "string" || !op.trim())) {
        return { ok: false, error: `La pregunta ${n} tiene alguna opción vacía o inválida.` };
      }
      if (!Number.isInteger(q.correcta) || q.correcta < 0 || q.correcta >= q.opciones.length) {
        return {
          ok: false,
          error: `La pregunta ${n} tiene "correcta" inválida: debe ser el índice (número entero) de la opción correcta.`,
        };
      }
    } else {
      if (typeof q.respuesta_modelo !== "string" || !q.respuesta_modelo.trim()) {
        return {
          ok: false,
          error: `La pregunta ${n} (abierta) necesita "respuesta_modelo" (texto no vacío).`,
        };
      }
    }
  }

  return { ok: true, data };
}

export const EXAM_JSON_EXAMPLE = `{
  "titulo": "Parcial 1 - Modelo",
  "questions": [
    {
      "type": "multiple",
      "pregunta": "¿Cuál es la capital de Francia?",
      "opciones": ["Madrid", "París", "Roma", "Berlín"],
      "correcta": 1,
      "explicacion": "París es la capital de Francia."
    },
    {
      "type": "abierta",
      "pregunta": "Explicá la ley de conservación de la energía.",
      "respuesta_modelo": "La energía no se crea ni se destruye, solo se transforma."
    }
  ]
}`;
