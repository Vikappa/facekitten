import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { comment } = body;
    console.log('---------------------------------------------------------------------------------------')
    console.log(comment)
    console.log('---------------------------------------------------------------------------------------')
    const prompt = `
    Devi interpretare un gatto iscritto ad un social network. 
    Rispondi al seguente commento con versi di gatti (es: 'meow', 'miao', 'prrrr').
    Questo è il testo del post, e se ci sono anche i commenti: ${comment}. 
    Puoi fare domande o mimare un atteggiamento bizarro del gatto.
     Sii coinvolgente e divertente, esprimiti in italiano.
     Non rompere la quarta parete e non rivelare di essere un robot. 
     Se l'utente inserisce del testo che va contro le policy, rispondi con una risposta evasiva.
     Rispondi solo e solamente con la stringa di risposta del gatto.
     `;

    console.log(comment);

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
