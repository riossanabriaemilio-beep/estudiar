// Extracción de texto 100% local: PDF (pdfjs-dist), Word (mammoth), texto plano.
// Nada de IA ni servicios externos: si no se puede extraer texto, se marca noText.
// pdfjs-dist y mammoth se cargan con import() dinámico para no inflar el bundle
// inicial con librerías que solo hacen falta cuando subís ese tipo de archivo.

const TEXT_EXTENSIONS = ["txt", "md", "csv"];

function getExt(filename) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

export function detectType(file) {
  const ext = getExt(file.name);
  if (ext === "pdf" || file.type === "application/pdf") return "pdf";
  if (
    ext === "docx" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "docx";
  if (ext === "doc" || file.type === "application/msword") return "doc";
  if (TEXT_EXTENSIONS.includes(ext) || file.type.startsWith("text/")) return ext || "txt";
  if (file.type.startsWith("image/")) return "imagen";
  return ext || "archivo";
}

async function extractPdf(file) {
  try {
    const [pdfjsLib, { default: pdfjsWorker }] = await Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.mjs?url"),
    ]);
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      text += pageText + "\n\n";
    }
    text = text.trim();
    return { text, noText: text.length === 0 };
  } catch (err) {
    return { text: "", noText: true };
  }
}

async function extractDocx(file) {
  try {
    const mammoth = await import("mammoth");
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    const text = (result.value || "").trim();
    return { text, noText: text.length === 0 };
  } catch (err) {
    return { text: "", noText: true };
  }
}

async function extractPlain(file) {
  try {
    const text = (await file.text()).trim();
    return { text, noText: text.length === 0 };
  } catch (err) {
    return { text: "", noText: true };
  }
}

// Devuelve { type, text, noText }. Si no se puede extraer nada (PDF escaneado,
// imagen, .doc viejo), noText queda en true y el texto se puede completar a mano.
export async function extractText(file) {
  const type = detectType(file);
  if (type === "pdf") return { type, ...(await extractPdf(file)) };
  if (type === "docx") return { type, ...(await extractDocx(file)) };
  if (TEXT_EXTENSIONS.includes(type)) return { type, ...(await extractPlain(file)) };
  return { type, text: "", noText: true };
}
