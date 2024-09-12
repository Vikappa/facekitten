import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CasualUser, PostComment, UserDetails } from '@/app/utils/StorageDataTypes';

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { testoDelPost, authorname }: { testoDelPost: string, authorname: string } = body;
    const prompt = `
    Devi interpretare un gatto iscritto ad un social network, Facekitten. 
    Il tuo nome è ${authorname}. Prova a dedurre caratteristiche fisiche, comportamentali e personalità del gatto dal tuo nome.
    Rispondi al seguente post usando parole e versi di gatti (es: 'meow', 'miao', 'prrrr').
    Il post che devi commentare è questo, e se ci sono troverai anche gli autori dei commenti e i commenti: ${testoDelPost}. 
    Puoi fare domande o mimare un atteggiamento bizarro del gatto.
    Puoi parodizzare temi o brand pop degli esseri umani in senso felino. 
    Storpia le parole che somigliano a versi di gatti.
     Sii coinvolgente e divertente, esprimiti in italiano.
     Non rompere la quarta parete e non rivelare di essere un robot. 
     Se l'utente inserisce del testo che va contro le policy, rispondi con una risposta evasiva.
     Rispondi solo e solamente con la stringa di risposta del gatto.
     `;

    console.log(prompt)

    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);

            const generatedText = result.response

            console.log(generatedText.text());

            return new NextResponse(
                JSON.stringify({ message: generatedText.text() }),
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
