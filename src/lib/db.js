// Capa de persistencia local con idb-keyval (IndexedDB). Sin backend, sin red.
import { get, set } from "idb-keyval";

const KEYS = {
  subjects: "estudia:subjects",
  materials: "estudia:materials",
  notes: "estudia:notes",
  temas: "estudia:temas",
  oldExams: "estudia:oldExams",
  importedExams: "estudia:importedExams",
  history: "estudia:history",
};

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function getList(key) {
  const list = await get(key);
  return Array.isArray(list) ? list : [];
}

async function setList(key, list) {
  await set(key, list);
}

// ---- Materias ----
export async function getSubjects() {
  const list = await getList(KEYS.subjects);
  return list.slice().sort((a, b) => a.createdAt - b.createdAt);
}

export async function addSubject({ name, color }) {
  const subjects = await getList(KEYS.subjects);
  const subject = { id: uid(), name: name.trim(), color, createdAt: Date.now() };
  subjects.push(subject);
  await setList(KEYS.subjects, subjects);
  return subject;
}

export async function updateSubject(id, patch) {
  const subjects = await getList(KEYS.subjects);
  const idx = subjects.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  subjects[idx] = { ...subjects[idx], ...patch };
  await setList(KEYS.subjects, subjects);
  return subjects[idx];
}

export async function deleteSubject(id) {
  const subjects = (await getList(KEYS.subjects)).filter((s) => s.id !== id);
  await setList(KEYS.subjects, subjects);
  // Cascada: borra todos los datos asociados a la materia
  for (const key of [
    KEYS.materials,
    KEYS.notes,
    KEYS.temas,
    KEYS.oldExams,
    KEYS.importedExams,
    KEYS.history,
  ]) {
    const list = (await getList(key)).filter((item) => item.subjectId !== id);
    await setList(key, list);
  }
}

// Fábrica genérica para colecciones asociadas a una materia
function makeCollection(key) {
  return {
    async list(subjectId) {
      const all = await getList(key);
      return all
        .filter((i) => i.subjectId === subjectId)
        .sort((a, b) => a.createdAt - b.createdAt);
    },
    async add(item) {
      const all = await getList(key);
      const full = { id: uid(), createdAt: Date.now(), ...item };
      all.push(full);
      await setList(key, all);
      return full;
    },
    async update(id, patch) {
      const all = await getList(key);
      const idx = all.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...patch };
      await setList(key, all);
      return all[idx];
    },
    async remove(id) {
      const all = (await getList(key)).filter((i) => i.id !== id);
      await setList(key, all);
    },
  };
}

export const materials = makeCollection(KEYS.materials);
export const notes = makeCollection(KEYS.notes);
export const temas = makeCollection(KEYS.temas);
export const oldExams = makeCollection(KEYS.oldExams);
export const importedExams = makeCollection(KEYS.importedExams);
export const history = makeCollection(KEYS.history);
