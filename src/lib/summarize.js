// Resumen extractivo 100% local: sin IA, sin conexión a internet.
// Puntúa cada oración según qué tan repetidas son sus palabras dentro del
// texto (similar al algoritmo clásico de Luhn) y devuelve las oraciones
// mejor puntuadas, en su orden original. No "entiende" el contenido, solo
// recorta lo que estadísticamente parece más relevante.

const STOPWORDS = new Set(
  `a al algo algunas algunos ante antes como con contra cual cuando de del
  desde donde dos el la los las un una unos unas y o u e ni no sí si tan tanto
  te ti tu tus su sus se es era eran fue fueron ser estar está están esta
  estas esto estos ese esos esa esas eso mi mis me nos vos vosotros nosotros
  ellas ellos él ella lo le les más pero por para poco muy mucho muchos
  muchas nada nunca otra otro otros otras pues que quien quienes qué cómo
  cuál cuáles porque puede pueden ya también sin sobre entre durante hasta
  hay ha han he has hemos han sido son soy eres somos aquí allí ahí ese esta
  esté fue ir va van vamos hace hacer hizo hacia mientras cada cada uno todo
  toda todos todas asi así bien mal cada quizás tal tales cuyo cuya cuyos
  cuyas`
    .split(/\s+/)
    .filter(Boolean)
);

function normalize(word) {
  return word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function splitSentences(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const parts = clean.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ0-9¿¡"“])/);
  return parts.map((s) => s.trim()).filter((s) => s.length > 0);
}

function tokenize(sentence) {
  return (sentence.match(/[a-záéíóúñA-ZÁÉÍÓÚÑ0-9]+/g) || []).map(normalize);
}

const LENGTHS = {
  corto: 0.15,
  medio: 0.28,
  largo: 0.45,
};

// Devuelve { summary, sentenceCount, totalSentences } o null si el texto es
// demasiado corto como para tener sentido resumirlo.
export function summarizeText(text, { length = "medio", minSentences = 3, maxSentences = 14 } = {}) {
  const sentences = splitSentences(text || "");
  if (sentences.length < minSentences + 1) return null;

  const freq = {};
  for (const sentence of sentences) {
    for (const word of tokenize(sentence)) {
      if (word.length < 3 || STOPWORDS.has(word)) continue;
      freq[word] = (freq[word] || 0) + 1;
    }
  }
  const maxFreq = Math.max(1, ...Object.values(freq));
  for (const word of Object.keys(freq)) freq[word] /= maxFreq;

  const scored = sentences.map((sentence, index) => {
    const words = tokenize(sentence).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
    const base = words.length
      ? words.reduce((sum, w) => sum + (freq[w] || 0), 0) / words.length
      : 0;
    const positionBonus = index === 0 ? 0.15 : index === 1 ? 0.07 : 0;
    return { index, sentence, score: base + positionBonus };
  });

  const ratio = LENGTHS[length] ?? LENGTHS.medio;
  let count = Math.round(sentences.length * ratio);
  count = Math.max(minSentences, Math.min(maxSentences, count, sentences.length));

  const chosen = scored
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .sort((a, b) => a.index - b.index);

  return {
    summary: chosen.map((s) => s.sentence).join(" "),
    sentenceCount: chosen.length,
    totalSentences: sentences.length,
  };
}
