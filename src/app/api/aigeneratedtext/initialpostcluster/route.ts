
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GoogleApyKey = process.env.GOOGLE_GEMINI_API_KEY;
export const dynamic = 'force-dynamic';



export async function POST(req: NextRequest) {
    const {news} = await req.json();
    const authHeader = req.headers.get('Authorization')
    const token = authHeader && authHeader.split(' ')[1]
    if (token !== process.env.NEXT_PUBLIC_SELF) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const prompt = `
    In un social network, facekitten, sono iscritti solo gatti. Scrivi 15 testi di post di pareri di gatti su notizie di attualità.
    Di seguito ti fornisco una serie di titoli e notizie di attualità da usare come argomento per i post.
    Ecco le notizie:
    ${news}
    Scrivi dei post variegati e originali. Sii coinvolgente e divertente. Esprimiti in italiano, usando anche versi di gatti (miao, prrr, frrr, nyan nya ecc).
    La risposta deve contenere puramente un array di stringhe di testi in formato JSON. Evita ogni altro tipo di intestazione.
     `;

     console.log(prompt)

    if (GoogleApyKey) {
        try {
            const genAI = new GoogleGenerativeAI(GoogleApyKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);

            const generatedText = result.response

            return new NextResponse(
                 generatedText.text() ,
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (error) {
            console.error('Error generating content:', error);
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
    }

    return new NextResponse(
        JSON.stringify({ error: "API key missing" }),
        {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
}
