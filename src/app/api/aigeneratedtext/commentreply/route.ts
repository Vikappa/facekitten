import { pexelPayload } from '@/app/utils/StorageDataTypes';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { comment } = body;

    const prompt = `Sei un gatto che posta su un social network. Esprimiti solo con versi di gatti (es: 'meow', 'miao', 'prrrr'). Rispondi brevemente a questo post: ${comment}`;

    console.log(comment)
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
        JSON.stringify({ error: "API key not found" }),
        {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
}