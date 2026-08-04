import { CONFIG } from "../config.js";
import { callClaude } from "./claude.js";

// ── PDF (pdfjs) ────────────────────────────────────────────────
async function pdfToText(file) {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line = content.items.map((it) => it.str).join(" ");
    out += line + "\n";
  }
  return out.trim();
}

// ── base64 helper ──────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = () => reject(new Error("No se pudo leer el archivo."));
    r.readAsDataURL(file);
  });
}

// ── Claude lee PDF/imagen directo (sirve para escaneados) ──────
async function claudeExtract(file, mediaType, blockType) {
  const data = await fileToBase64(file);
  const source =
    blockType === "document"
      ? { type: "base64", media_type: mediaType, data }
      : { type: "base64", media_type: mediaType, data };
  return callClaude({
    system:
      "Sos un transcriptor. Extraé TODO el texto del documento/imagen tal cual, respetando títulos, listas y orden. No resumas ni interpretes. Si hay tablas, pasalas a texto legible.",
    content: [
      { type: blockType, source },
      { type: "text", text: "Transcribí todo el contenido a texto plano." },
    ],
    maxTokens: CONFIG.maxTokens.extract,
  });
}

async function docxToText(file) {
  const mammoth = (await import("mammoth/mammoth.browser.js")).default;
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return (value || "").trim();
}

const IMG_TYPES = {
  "image/png": "image/png",
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/webp": "image/webp",
  "image/gif": "image/gif",
};

/**
 * Devuelve { text, method } a partir de un File.
 * method describe cómo se extrajo (útil para avisar al usuario).
 */
export async function ingestFile(file) {
  const name = file.name.toLowerCase();
  const type = file.type;

  // Texto plano
  if (type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".csv")) {
    const text = (await file.text()).trim();
    return { text, method: "texto" };
  }

  // Imagen → visión de Claude
  if (IMG_TYPES[type] || /\.(png|jpe?g|webp|gif)$/.test(name)) {
    const media = IMG_TYPES[type] || "image/png";
    const text = await claudeExtract(file, media, "image");
    return { text, method: "imagen (transcrita por IA)" };
  }

  // Word
  if (name.endsWith(".docx") || type.includes("wordprocessingml")) {
    const text = await docxToText(file);
    return { text, method: "word" };
  }

  // PDF: probamos texto local; si viene vacío/escaneado, lo lee Claude
  if (name.endsWith(".pdf") || type === "application/pdf") {
    let text = "";
    try {
      text = await pdfToText(file);
    } catch {
      text = "";
    }
    if (text.replace(/\s/g, "").length > 40) {
      return { text, method: "pdf (texto)" };
    }
    const t = await claudeExtract(file, "application/pdf", "document");
    return { text: t, method: "pdf escaneado (transcrito por IA)" };
  }

  throw new Error(`Formato no soportado: ${file.name}. Probá PDF, Word, imagen o texto.`);
}
