import { get, set, del } from "idb-keyval";

// Claves:
//   "subjects"                     -> [{id, name, color, createdAt}]
//   "subject:{id}:materials"       -> [{id, name, type, text, chars, createdAt}]
//   "subject:{id}:notes"           -> [{id, date, title, content}]
//   "subject:{id}:topics"          -> [{id, name, parcial, status}]   status: pendiente|repasar|dominado
//   "subject:{id}:exams"           -> [{id, name, text, createdAt}]   (parciales viejos)
//   "subject:{id}:history"         -> [{id, topicId, topicName, date, score, total}]

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

async function load(key, fallback) {
  try {
    const v = await get(key);
    return v === undefined ? fallback : v;
  } catch {
    return fallback;
  }
}

export const db = {
  uid,

  // Materias
  getSubjects: () => load("subjects", []),
  saveSubjects: (list) => set("subjects", list),

  // Colecciones por materia
  getMaterials: (sid) => load(`subject:${sid}:materials`, []),
  saveMaterials: (sid, list) => set(`subject:${sid}:materials`, list),

  getNotes: (sid) => load(`subject:${sid}:notes`, []),
  saveNotes: (sid, list) => set(`subject:${sid}:notes`, list),

  getTopics: (sid) => load(`subject:${sid}:topics`, []),
  saveTopics: (sid, list) => set(`subject:${sid}:topics`, list),

  getExams: (sid) => load(`subject:${sid}:exams`, []),
  saveExams: (sid, list) => set(`subject:${sid}:exams`, list),

  getHistory: (sid) => load(`subject:${sid}:history`, []),
  saveHistory: (sid, list) => set(`subject:${sid}:history`, list),

  async deleteSubjectData(sid) {
    await Promise.all([
      del(`subject:${sid}:materials`),
      del(`subject:${sid}:notes`),
      del(`subject:${sid}:topics`),
      del(`subject:${sid}:exams`),
      del(`subject:${sid}:history`),
    ]);
  },
};

// API key: local, del usuario. En una app que corrés solo en tu PC está ok.
export const apiKeyStore = {
  get: () => localStorage.getItem("anthropic_api_key") || "",
  set: (k) => localStorage.setItem("anthropic_api_key", k.trim()),
  clear: () => localStorage.removeItem("anthropic_api_key"),
};

export const modelStore = {
  get: () => localStorage.getItem("anthropic_model") || "",
  set: (m) => localStorage.setItem("anthropic_model", m),
};
