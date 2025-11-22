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
): Promise<GenerateContentResponse> {

  const config: { responseMimeType: string; responseSchema?: T } = {
    responseMimeType: "application/json",
  };

  if (schema) {
    config.responseSchema = schema;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: config,
  });

  console.log(`[${new Date().toISOString()}] DoPromptRequest response text:`, response.text);

  return response;
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





