// Configuración centralizada: paleta, colores de materias y estados del semáforo.

export const SUBJECT_COLORS = [
  { name: "Violeta", value: "#3A2F7A" },
  { name: "Oro", value: "#B9862B" },
  { name: "Verde", value: "#2E7D5B" },
  { name: "Rojo", value: "#C0453A" },
  { name: "Celeste", value: "#1F6F8B" },
  { name: "Magenta", value: "#8C4B9E" },
  { name: "Naranja", value: "#C9622A" },
  { name: "Verde azulado", value: "#4E6E58" },
];

// Estados posibles de un tema en la pestaña "Estudiar".
export const ESTADOS = {
  dominado: {
    key: "dominado",
    label: "Ya lo estudié",
    text: "text-ok",
    bg: "bg-ok",
    soft: "bg-okSoft",
  },
  repasar: {
    key: "repasar",
    label: "Más o menos, repasar",
    text: "text-repasar",
    bg: "bg-repasar",
    soft: "bg-repasarSoft",
  },
  sin_ver: {
    key: "sin_ver",
    label: "No sé nada",
    text: "text-sinver",
    bg: "bg-sinver",
    soft: "bg-sinverSoft",
  },
};

export const ESTADO_DEFAULT = "sin_ver";

export const TABS = [
  { key: "estudiar", label: "Estudiar" },
  { key: "materiales", label: "Materiales" },
  { key: "apuntes", label: "Apuntes" },
  { key: "parciales", label: "Parciales viejos" },
  { key: "examenes", label: "Exámenes para resolver" },
];

export const MAX_FILE_SIZE_MB = 25;
