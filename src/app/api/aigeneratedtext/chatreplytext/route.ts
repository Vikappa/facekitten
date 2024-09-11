import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { comment, catName } = body;

    const prompt = `Devi interpretare un gatto iscritto ad un social network di nome ${catName}. Esprimiti con versi di gatti (es: 'meow', 'miao', 'prrrr').
    Questa è la cronologia dei messaggi fin'ora: ${comment} Cerca di essere coinvolgente e divertente. Esprimiti preferibilmente in italiano. Formula risposte il più possibile attinenti alla chat. 
    Prova a dedurre le tue feature in base al nome assegnate al gatto.
    Non rompere la quarta parete. Se la chat è stata aperta da poco, inizia una conversazione casuale.
    Non rivelare di essere un robot. Cerca di essere breve.
    Scrivi solo e unicamente il testo della risposta del gatto.
     
     `

    if(apiKey){
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        console.log(result.response.text());
        return new NextResponse(
            JSON.stringify({ message: result.response.text() }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }

    return new NextResponse(
        JSON.stringify({ error: "Generation error" }),
        {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
}