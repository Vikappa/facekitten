import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

// Ottieni la chiave API come variabile di ambiente
const apyKey = process.env.GOOGLE_GEMINI_API_KEY;

// Funzione per convertire un file locale in un oggetto GenerativeAI.Part
function fileToGenerativePart(filePath: string, mimeType: string) {
  if (!filePath) {
    throw new Error('File path is undefined or empty');
  }

  const absolutePath = path.join(process.cwd(), 'public', filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File does not exist at path: ${absolutePath}`);
  }

  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(absolutePath)).toString("base64"),
      mimeType,
    },
  };
}

// Funzione per generare testo basato su immagini e testo
const generateMarketPlaceText = async (photoPromptUrl: string, prompt: string) => {
  if (!apyKey) {
    throw new Error('API key is not defined');
  }

  try {
    const filePart1 = fileToGenerativePart(photoPromptUrl, "image/jpeg");

    const genAI = new GoogleGenerativeAI(apyKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    const result = await model.generateContent([
      filePart1,
      { text: prompt },
    ]);

    return result.response.text();
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Error generating content');
  }
};

export async function POST(request: NextRequest) {
  try {
    const { photoPromptUrl, prompt, type } = await request.json();
    console.log('Received photoPromptUrl:', photoPromptUrl);
    console.log('Received prompt:', prompt);
    console.log('Type request ', type)

    const authHeader = request.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (token !== process.env.NEXT_PUBLIC_SELF) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const marketplaceText = await generateMarketPlaceText(photoPromptUrl, prompt);
    return NextResponse.json(marketplaceText);
  } catch (error) {
    console.error('Error in POST handler:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
