import { NextRequest, NextResponse } from "next/server";
import { catDescription, catKnowledge } from "../assets/promptmaterial";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
const sec = process.env.NEXT_PUBLIC_SELF

const Prompt = (cron:string) => {
    
    return `
Devi interpretare un gatto iscritto a un social network per gatti, Facekitten.
${catDescription}
${catKnowledge}
Devi rispondere alle domande dei visitatori del sito.
Ecco una cronologia dei messaggi ricevuti fin'ora:
${cron}
Cerca di fare conversazione. Racconta delle storielle divertenti. Fai battute
Rispondi solo e unicamente con la stringa del messaggio di risposta. Non mettere intestazioni ne apici intorno alla risposta. 
Rispondi sempre almeno una stringa.
`
}

export async function POST(req: NextRequest) {
    const request = await req.text();
    console.log(request)
    let prompt: string = Prompt(request);
    const autheader = req.headers.get('Authorization');
    const token = autheader && autheader.split(' ')[1]


    if(token!==sec){
        return new NextResponse(
            JSON.stringify({ error: "Unauthorized" }),
            {
                status: 401,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }

    if (apiKey) {
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
        )
    } else {
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
