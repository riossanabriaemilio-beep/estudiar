import { useState } from "react";
import { Menu, GraduationCap } from "lucide-react";
import { useEstudia } from "./state/store.jsx";
import Sidebar from "./components/Sidebar.jsx";
import SubjectView from "./components/SubjectView.jsx";
import { EmptyState } from "./components/ui.jsx";

export default function App() {
  const { loading, selectedSubject, subjects } = useEstudia();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* Sidebar desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-line bg-white md:block">
        <Sidebar />
      </aside>

      {/* Sidebar mobile (drawer) */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full w-72 bg-white shadow-soft">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-line bg-white px-4 py-3 md:hidden">
          <button
            aria-label="Abrir menú"
            className="rounded-lg p-2 text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tinta"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-tinta text-white">
              <GraduationCap size={15} />
            </div>
            <span className="font-display text-base font-semibold text-ink">EstudIA</span>
          </div>
        </header>

        <main className="scrollbar-thin flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              Cargando...
            </div>
          ) : selectedSubject ? (
            <SubjectView subject={selectedSubject} />
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <EmptyState
                icon={GraduationCap}
                title={subjects.length === 0 ? "Creá tu primera materia" : "Elegí una materia"}
                description={
                  subjects.length === 0
                    ? 'Usá el botón "+" de la barra lateral para arrancar.'
                    : "Elegí una materia de la lista para ver sus materiales, apuntes y temas."
                }
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
