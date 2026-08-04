// Contexto global: lista de materias, materia seleccionada y su CRUD.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as db from "../lib/db.js";

const StoreContext = createContext(null);

const SELECTED_KEY = "estudia:selectedSubjectId";

export function StoreProvider({ children }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedId, setSelectedId] = useState(() => localStorage.getItem(SELECTED_KEY) || null);
  const [loading, setLoading] = useState(true);

  const refreshSubjects = useCallback(async () => {
    const list = await db.getSubjects();
    setSubjects(list);
    return list;
  }, []);

  useEffect(() => {
    (async () => {
      const list = await refreshSubjects();
      setSelectedId((current) => {
        if (current && list.some((s) => s.id === current)) return current;
        return list[0]?.id ?? null;
      });
      setLoading(false);
    })();
  }, [refreshSubjects]);

  useEffect(() => {
    if (selectedId) localStorage.setItem(SELECTED_KEY, selectedId);
    else localStorage.removeItem(SELECTED_KEY);
  }, [selectedId]);

  const createSubject = useCallback(
    async (data) => {
      const subject = await db.addSubject(data);
      await refreshSubjects();
      setSelectedId(subject.id);
      return subject;
    },
    [refreshSubjects]
  );

  const removeSubject = useCallback(
    async (id) => {
      await db.deleteSubject(id);
      const list = await refreshSubjects();
      setSelectedId((current) => (current === id ? list[0]?.id ?? null : current));
    },
    [refreshSubjects]
  );

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === selectedId) || null,
    [subjects, selectedId]
  );

  const value = useMemo(
    () => ({
      subjects,
      loading,
      selectedId,
      selectedSubject,
      selectSubject: setSelectedId,
      createSubject,
      removeSubject,
      refreshSubjects,
    }),
    [subjects, loading, selectedId, selectedSubject, createSubject, removeSubject, refreshSubjects]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useEstudia() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useEstudia debe usarse dentro de <StoreProvider>");
  return ctx;
}
