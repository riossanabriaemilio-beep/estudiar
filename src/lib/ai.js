import { CONFIG } from "../config.js";
import { callClaude, callClaudeJSON } from "./claude.js";

const RIO =
  "Escribí en español rioplatense (voseo), claro y directo, sin vocabulario innecesariamente académico.";

// Arma un bloque de contexto a partir de textos, respetando el presupuesto de chars.
export function buildContext(chunks, budget = CONFIG.contextCharBudget) {
  let acc = "";
  for (const c of chunks) {
    if (!c) continue;
    if (acc.length + c.length > budget) {
      acc += c.slice(0, Math.max(0, budget - acc.length));
      break;
    }
    acc += c + "\n\n---\n\n";
  }
  return acc.trim() || "(sin material cargado)";
}

// ── Quiz de un tema ────────────────────────────────────────────
export async function generateQuiz({ topicName, context, n = 6 }) {
  const data = await callClaudeJSON({
    system: `Sos un profesor exigente pero justo. ${RIO} Generás preguntas SOLO a partir del material dado; no inventes contenido que no esté.`,
    content: `Material del tema "${topicName}":\n\n${context}\n\n
Generá ${n} preguntas para autoevaluación sobre este tema. Mezclá tipos.
Devolvé un JSON con esta forma exacta:
{
  "questions": [
    {
      "type": "multiple",            // "multiple" | "abierta"
      "pregunta": "…",
      "opciones": ["a","b","c","d"], // solo si type=multiple
      "correcta": 0,                  // índice de la correcta, solo si multiple
      "explicacion": "por qué",
      "tema_puntual": "subtema"
    }
  ]
}`,
    maxTokens: CONFIG.maxTokens.quiz,
  });
  return data.questions || [];
}

// ── Corrige una respuesta abierta ──────────────────────────────
export async function gradeOpen({ pregunta, respuesta, context }) {
  return callClaudeJSON({
    system: `Sos un corrector justo y honesto. ${RIO}`,
    content: `Contexto:\n${context}\n\nPregunta: ${pregunta}\nRespuesta del alumno: "${respuesta}"\n
Corregí. Devolvé JSON:
{ "correcto": true|false, "puntaje": 0-100, "feedback": "qué estuvo bien y qué falta, concreto" }`,
    maxTokens: 1500,
  });
}

// ── Parcial de prueba de toda la materia / parcial ─────────────
export async function generateMockExam({ subjectName, scope, context, n = 10 }) {
  const data = await callClaudeJSON({
    system: `Sos el profesor de "${subjectName}" armando un parcial realista. ${RIO} Basate SOLO en el material.`,
    content: `Material (${scope}):\n\n${context}\n\n
Armá un parcial de prueba de ${n} preguntas que se parezca a lo que tomaría en el examen real, priorizando lo más importante y lo que más suele entrar.
Devolvé JSON:
{
  "titulo": "…",
  "questions": [
    { "type":"multiple"|"abierta", "pregunta":"…", "opciones":["…"], "correcta":0, "explicacion":"…", "peso": 1 }
  ]
}`,
    maxTokens: CONFIG.maxTokens.mockExam,
  });
  return data;
}

// ── Mapa mental (estructura de nodos) ──────────────────────────
export async function generateMindMap({ topicName, context }) {
  return callClaudeJSON({
    system: `Ordenás información en mapas mentales claros. ${RIO}`,
    content: `Material del tema "${topicName}":\n\n${context}\n\n
Armá un mapa mental jerárquico. Devolvé JSON:
{
  "centro": "concepto central",
  "ramas": [
    { "titulo": "rama", "puntos": ["idea 1","idea 2"], "ramas": [ { "titulo":"sub", "puntos":["…"] } ] }
  ]
}
Máximo 6 ramas principales, 2 niveles de profundidad.`,
    maxTokens: CONFIG.maxTokens.mindMap,
  });
}

// ── Análisis estratégico de parciales viejos ───────────────────
export async function analyzeOldExams({ subjectName, examsText, topicsList }) {
  return callClaudeJSON({
    system: `Sos un estratega de estudio. Analizás exámenes viejos para detectar patrones y decir dónde conviene poner la energía. ${RIO} Sé honesto: si hay pocos exámenes, aclaralo.`,
    content: `Materia: ${subjectName}
Temas de la materia (si los cargó): ${topicsList?.join(", ") || "no especificados"}

Exámenes viejos / de prueba cargados:
${examsText}

Analizá y devolvé JSON:
{
  "resumen": "1-2 frases honestas sobre qué tan confiable es este análisis según cuántos exámenes hay",
  "temas_frecuentes": [ { "tema": "…", "veces": 3, "peso": "alto|medio|bajo" } ],
  "tipos_de_pregunta": [ { "tipo": "definición|desarrollo|cálculo|caso|verdadero-falso", "frecuencia": "alta|media|baja" } ],
  "preguntas_repetidas": [ "pregunta o consigna que aparece más de una vez" ],
  "plan_estrategico": [ "paso 1 concreto de qué estudiar primero", "paso 2", "paso 3" ],
  "trampas": [ "errores típicos o cosas que el profe suele buscar" ]
}`,
    maxTokens: CONFIG.maxTokens.analysis,
  });
}

// ── Chat libre sobre el material ───────────────────────────────
export async function chatAboutMaterial({ question, context, history = [] }) {
  const hist = history.map((h) => `${h.role === "user" ? "Alumno" : "Profe"}: ${h.text}`).join("\n");
  return callClaude({
    system: `Sos un profesor particular paciente. ${RIO} Respondé usando el material dado; si algo no está en el material, decilo en vez de inventar.`,
    content: `Material:\n${context}\n\n${hist ? "Conversación previa:\n" + hist + "\n\n" : ""}Pregunta del alumno: ${question}`,
    maxTokens: CONFIG.maxTokens.chat,
  });
}
