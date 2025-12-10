import { IResponseModelFormat } from "@/lib/interfaces/CommonInterfaces";
import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

const ai = new GoogleGenAI({});


/**
 * Esegue una richiesta di prompt e obbliga il modello a rispondere in JSON.
 * @param prompt La richiesta di testo.
 * @param schema Opzionale. Lo schema JSON per strutturare la risposta.
 * @returns La risposta.
 */
export async function DoPromptRequest<T>(
  prompt: string,
  schema?: T
): Promise<T> {
  const config: { responseMimeType: string; responseSchema?: T } = {
    responseMimeType: "application/json",
  };

  if (schema) {
    config.responseSchema = schema;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config,
  });

  const text =
    response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Nessun testo nella risposta del modello");
  }

  const data = JSON.parse(text) as T;
  return data;
}


export async function DoVisionRequest<T>(base64Image: string, prompt: string, schema?: T): Promise<GenerateContentResponse> {
  const contents = [
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    },
    { text: prompt },
  ];

  const config: { responseMimeType: string; responseSchema?: T } = {
    responseMimeType: "application/json",
  };

  if (schema) {
    config.responseSchema = schema;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: config,
  });

  console.log(`[${new Date().toISOString()}] DoVisionRequest response text:`, response.text);

  return response;
}





