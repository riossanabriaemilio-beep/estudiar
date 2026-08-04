import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db } from "../lib/db.js";
import { SUBJECT_COLORS } from "../config.js";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [subjects, setSubjects] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    db.getSubjects().then((s) => {
      setSubjects(s);
      setCurrentId(s[0]?.id || null);
      setReady(true);
    });
  }, []);

  const persist = useCallback(async (list) => {
    setSubjects(list);
    await db.saveSubjects(list);
  }, []);

  const addSubject = useCallback(
    async (name) => {
      const color = SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length];
      const s = { id: db.uid(), name: name.trim(), color, createdAt: Date.now() };
      const list = [...subjects, s];
      await persist(list);
      setCurrentId(s.id);
      return s;
    },
    [subjects, persist]
  );

  const renameSubject = useCallback(
    async (id, name) => persist(subjects.map((s) => (s.id === id ? { ...s, name } : s))),
    [subjects, persist]
  );

  const deleteSubject = useCallback(
    async (id) => {
      await db.deleteSubjectData(id);
      const list = subjects.filter((s) => s.id !== id);
      await persist(list);
      if (currentId === id) setCurrentId(list[0]?.id || null);
    },
    [subjects, currentId, persist]
  );

  const current = subjects.find((s) => s.id === currentId) || null;

  return (
    <Ctx.Provider
      value={{ subjects, current, currentId, setCurrentId, ready, addSubject, renameSubject, deleteSubject }}
    >
      {children}
    </Ctx.Provider>
  );
}
