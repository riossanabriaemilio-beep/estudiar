import { useState } from "react";
import { X, KeyRound, Cpu } from "lucide-react";
import { apiKeyStore, modelStore } from "../lib/db.js";
import { CONFIG } from "../config.js";
import { Btn, Card } from "./ui.jsx";

const MODELS = [
  { id: "claude-sonnet-5", label: "Sonnet 5 — equilibrado (recomendado)" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5 — barato y rápido" },
  { id: "claude-opus-4-8", label: "Opus 4.8 — el más capaz (más caro)" },
];

export default function Settings({ onClose, onSaved }) {
  const [key, setKey] = useState(apiKeyStore.get());
  const [model, setModel] = useState(modelStore.get() || CONFIG.model);

  function save() {
    apiKeyStore.set(key);
    modelStore.set(model);
    onSaved?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold">Ajustes</h2>
          <Btn variant="ghost" size="sm" onClick={onClose}><X size={18} /></Btn>
        </div>

        <label className="block mb-1 text-sm font-medium flex items-center gap-2"><KeyRound size={15} /> Tu API key de Anthropic</label>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          type="password"
          placeholder="sk-ant-…"
          className="w-full border border-line rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-tinta/40"
        />
        <p className="text-xs text-muted mt-1.5">
          Se guarda solo en este navegador (localStorage). La app corre en tu PC, así que está ok. La sacás de{" "}
          <span className="font-medium">console.anthropic.com → API Keys</span>.
        </p>

        <label className="block mt-5 mb-1 text-sm font-medium flex items-center gap-2"><Cpu size={15} /> Modelo</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full border border-line rounded-xl px-3 py-2.5 text-sm bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-tinta/40"
        >
          {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>

        <div className="flex justify-end gap-2 mt-6">
          <Btn variant="outline" onClick={onClose}>Cancelar</Btn>
          <Btn onClick={save} disabled={!key.trim()}>Guardar</Btn>
        </div>
      </Card>
    </div>
  );
}
