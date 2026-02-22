import { GenerateContentResponse, GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

// Nota: l’SDK pesca la API key da env (a seconda della tua configurazione / runtime).
const ai = new GoogleGenAI({});

/**
 * Schema runtime (es. JSON Schema o schema supportato da @google/genai per responseSchema).
 * Non è il tipo TS: serve a guidare il modello e vive a runtime.
 */
export type GeminiResponseSchema = Record<string, unknown>;

type GeminiJsonConfig = {
  responseMimeType: "application/json";
  responseSchema?: GeminiResponseSchema;
};

/**
 * Estrae il testo dal GenerateContentResponse in modo robusto.
 */
function extractFirstText(response: GenerateContentResponse): string {
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string" || text.trim().length === 0) {
    // fallback: alcune versioni SDK espongono response.text
    const alt: any = response as any;
    const altText = typeof alt?.text === "string" ? alt.text : "";
    if (altText.trim().length > 0) return altText;

    throw new Error("Nessun testo nella risposta del modello");
  }
  return text;
}

/**
 * Parse JSON con errori chiari (evita di impazzire quando il modello “bara”).
 */
function safeJsonParse<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    const preview = raw.slice(0, 300);
    throw new Error(`Risposta non è JSON valido. Preview: ${preview}`);
  }
}

/**
 * Richiesta testuale: obbliga Gemini a restituire JSON (responseMimeType).
 * @param prompt Prompt testuale
 * @param responseSchema (opzionale) Schema runtime per guidare la forma del JSON
 */
export async function doPromptJson<T>(
  prompt: string,
  responseSchema?: GeminiResponseSchema
): Promise<T> {
  const config: GeminiJsonConfig = {
    responseMimeType: "application/json",
    ...(responseSchema ? { responseSchema } : {}),
  };

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config,
  });

  const raw = extractFirstText(response);
  return safeJsonParse<T>(raw);
}

/**
 * Richiesta vision: immagine base64 + prompt. Ritorna JSON tipizzato.
 * @param base64Image Base64 puro (senza "data:image/...;base64,")
 * @param prompt Prompt testuale
 * @param responseSchema (opzionale) Schema runtime per guidare la forma del JSON
 * @param mimeType default "image/jpeg"
 */
export async function doVisionJson<T>(
  base64Image: string,
  prompt: string,
  responseSchema?: GeminiResponseSchema,
  mimeType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
): Promise<T> {
  const contents = [
    {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    },
    { text: prompt },
  ];

  const config: GeminiJsonConfig = {
    responseMimeType: "application/json",
    ...(responseSchema ? { responseSchema } : {}),
  };

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config,
  });

  const raw = extractFirstText(response);
  return safeJsonParse<T>(raw);
}

/**
 * Se ti serve il response grezzo per debug (token usage, candidates, ecc.)
 * ma vuoi comunque avere anche il JSON parsato.
 */
export async function doPromptJsonWithRaw<T>(
  prompt: string,
  responseSchema?: GeminiResponseSchema
): Promise<{ data: T; rawText: string; rawResponse: GenerateContentResponse }> {
  const config: GeminiJsonConfig = {
    responseMimeType: "application/json",
    ...(responseSchema ? { responseSchema } : {}),
  };

  const rawResponse = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config,
  });

  const rawText = extractFirstText(rawResponse);
  const data = safeJsonParse<T>(rawText);

  return { data, rawText, rawResponse };
}