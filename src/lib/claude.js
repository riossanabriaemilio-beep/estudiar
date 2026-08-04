import { CONFIG } from "../config.js";
import { apiKeyStore, modelStore } from "./db.js";

function currentModel() {
  return modelStore.get() || CONFIG.model;
}

/**
 * Llamada base a la API de Anthropic desde el navegador.
 * content: string  ó  array de bloques ({type:'text'|'image'|'document', ...})
 */
export async function callClaude({ system, content, maxTokens = 2000 }) {
  const key = apiKeyStore.get();
  if (!key) throw new Error("Falta la API key de Anthropic. Cargala en Ajustes.");

  const messages = [
    { role: "user", content: typeof content === "string" ? content : content },
  ];

  const res = await fetch(CONFIG.anthropic.endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": CONFIG.anthropic.version,
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: currentModel(),
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages,
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const err = await res.json();
      detail = err?.error?.message || JSON.stringify(err);
    } catch {
      detail = await res.text();
    }
    if (res.status === 401) throw new Error("API key inválida o sin permisos (401).");
    if (res.status === 429) throw new Error("Te pasaste del límite de uso por ahora (429). Esperá un toque.");
    throw new Error(`Error de la API (${res.status}): ${detail}`);
  }

  const data = await res.json();
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/** Igual que callClaude pero fuerza y parsea JSON de la respuesta. */
export async function callClaudeJSON({ system, content, maxTokens = 2000 }) {
  const raw = await callClaude({
    system: (system || "") + "\n\nIMPORTANTE: respondé SOLO con JSON válido, sin ```, sin texto antes ni después.",
    content,
    maxTokens,
  });
  return parseJSONLoose(raw);
}

export function parseJSONLoose(raw) {
  let s = (raw || "").trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(s);
  } catch {
    // rescatar el primer bloque {...} o [...]
    const first = s.search(/[[{]/);
    const lastObj = s.lastIndexOf("}");
    const lastArr = s.lastIndexOf("]");
    const last = Math.max(lastObj, lastArr);
    if (first !== -1 && last !== -1 && last > first) {
      try {
        return JSON.parse(s.slice(first, last + 1));
      } catch {
        /* cae abajo */
      }
    }
    throw new Error("La IA no devolvió un JSON válido. Probá de nuevo.");
  }
}
