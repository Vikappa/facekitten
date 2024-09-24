import { NextRequest, NextResponse } from "next/server"
import { json } from "stream/consumers"
import fs from "fs"
import path from "path"
import { GoogleGenerativeAI } from "@google/generative-ai"
const selfApiKey = process.env.NEXT_PUBLIC_SELF
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
const sslProtocol = process.env.NEXT_PUBLIC_SSL_PROTOCOL
const GAK = process.env.GOOGLE_GEMINI_API_KEY

const getImagesUrl = async (): Promise<string[]> => {
  if (selfApiKey) {
    const apiUrl = `${sslProtocol}${baseUrl}/api/storedcatmarketplacephoto`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + selfApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ qty: 0 })
    });

    if (response.ok) {
      return response.json();
    }
    return [];
  }
  return [];
};



// Funzione per convertire un file locale in un oggetto GenerativeAI.Part
export function fileToGenerativePart(filePath: string, mimeType: string) {
  if (!filePath) {
    throw new Error('File path is undefined or empty')
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


export async function GET(request: NextRequest) {
  const prompt = `
    Devi interpretare dei gatti che pubblicano post in un social network chiamato FaceKitten.
    Adesso ti trovi nella sezione marketplace. Le foto che ti fornisco nel prompt sono oggetti per post 
    del marketplace. 
    Interpretando dei gatti, scrivi titolo dell'annuncio testo dell'annuncio e prezzo di vendita indicato in crocchette per ogni immagine.
    Indica tre titoli, tre testi e tre prezzi.
    Non devi scrivere nulla di diverso dal titolo, testo e prezzo.
    Non usare intestazioni o footer.
    Usa questo formato:
    titolo1#titolo2#titolo3#testo1#testo2#testo3#prezzo1#prezzo2#prezzo3

  `;

  if (selfApiKey && GAK) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (token !== process.env.NEXT_PUBLIC_SELF) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const urls = await getImagesUrl();

    try {
      // Load image files and create parts
      const filePart1 = fileToGenerativePart(urls[0], "image/jpeg");
      const filePart2 = fileToGenerativePart(urls[1], "image/jpeg");
      const filePart3 = fileToGenerativePart(urls[2], "image/jpeg");

      // Initialize the Google Generative AI instance
      const genAI = new GoogleGenerativeAI(GAK);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
      })

      // Combine prompt and images
      const imageParts = [filePart1, filePart2, filePart3];
      const generatedContent = await model.generateContent([prompt, ...imageParts])

      return NextResponse.json({
         text: generatedContent.response.text(),
         images: [
           urls[0],
           urls[1],
           urls[2],
         ]
        })
    } catch (error) {
      console.error('Error generating content:', error);
      return new NextResponse('Internal Server Error', { status: 500 })
    }
  }

  return new NextResponse('Missing API key or GAK', { status: 400 })
}