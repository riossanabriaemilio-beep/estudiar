// ─────────────────────────────────────────────────────────────
//  CONFIG CENTRAL  →  tocás solo acá para cambiar el comportamiento
// ─────────────────────────────────────────────────────────────

export const CONFIG = {
  // Modelo por defecto. Podés cambiarlo desde Ajustes (⚙) o acá.
  //  - claude-sonnet-5           → buena relación calidad/precio (recomendado)
  //  - claude-haiku-4-5-20251001 → más barato y rápido, algo menos fino
  //  - claude-opus-4-8           → el más capaz, más caro
  model: "claude-sonnet-5",

  // Tope de tokens por respuesta según la tarea (podés subirlos si querés más largo)
  maxTokens: {
    extract: 4000, // transcribir PDFs escaneados / imágenes / word
    quiz: 3000,
    mockExam: 4000,
    mindMap: 3000,
    analysis: 4000,
    chat: 2000,
  },

  // Cuánto texto de tus materiales le mandamos como contexto (en caracteres).
  // Más = más preciso pero más caro. ~12000 chars ≈ 3000 tokens aprox.
  contextCharBudget: 16000,

  anthropic: {
    endpoint: "https://api.anthropic.com/v1/messages",
    version: "2023-06-01",
  },
};

// Paleta de colores para las materias (elegís al crearlas)
export const SUBJECT_COLORS = [
  "#3A2F7A", "#B9862B", "#2E7D5B", "#C0453A",
  "#1F6F8B", "#7A3F9A", "#C77D2E", "#4A5568",
];
