import { useEffect, useState } from "react";
import { GraduationCap, KeyRound } from "lucide-react";
import { AppProvider, useApp } from "./state/store.jsx";
import { apiKeyStore } from "./lib/db.js";
import Sidebar from "./components/Sidebar.jsx";
import SubjectView from "./components/SubjectView.jsx";
import Settings from "./components/Settings.jsx";
import { Btn, Card, Empty } from "./components/ui.jsx";

function Shell() {
  const { current, ready } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [hasKey, setHasKey] = useState(!!apiKeyStore.get());

  useEffect(() => {
    if (!apiKeyStore.get()) setShowSettings(true);
  }, []);

  if (!ready) return <div className="h-full grid place-items-center text-muted">Cargando…</div>;

  return (
    <div className="h-full flex">
      <Sidebar onOpenSettings={() => setShowSettings(true)} />

      <main className="flex-1 h-full overflow-hidden">
        {!hasKey ? (
          <div className="h-full grid place-items-center p-8">
            <Card className="max-w-md w-full p-8 text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-tintaSoft text-tinta grid place-items-center"><KeyRound size={22} /></div>
              <h2 className="font-display text-lg font-semibold">Cargá tu API key para empezar</h2>
              <p className="text-sm text-muted mt-2">EstudIA usa tu propia clave de Anthropic para armar quizzes, mapas y análisis. Es tuya y queda en tu compu.</p>
              <Btn className="mt-5" onClick={() => setShowSettings(true)}>Cargar API key</Btn>
            </Card>
          </div>
        ) : current ? (
          <SubjectView subject={current} key={current.id} />
        ) : (
          <div className="h-full grid place-items-center">
            <Empty icon={GraduationCap} title="Elegí o creá una materia"
              hint="En la izquierda tocá + para crear tu primera materia y arrancá a cargar todo." />
          </div>
        )}
      </main>

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} onSaved={() => setHasKey(!!apiKeyStore.get())} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
