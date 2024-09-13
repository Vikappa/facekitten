import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
        const authHeader = req.headers.get('Authorization')
        const token = authHeader && authHeader.split(' ')[1]
        if (token !== process.env.NEXT_PUBLIC_SELF) {
            return new NextResponse('Unauthorized', { status: 401 })
          }

    const prompt = `Sei un gatto che posta su un social network. Esprimiti solo con variegati versi di gatti ('meow', 'miao', 'mau', 'hiss', 'hisssss', 'prrrr', 'prrrrra', 'prrraaau', 'prau', 'nyan', 'nya', 
    'meeeooow', 'frrr', 'frrrrrr', 'frau', 'mieo') e azioni da gatto espresse tra parentesi o asterischi. Usa il minimo possibile di parile umane. Scrivi un post di 1-3 righe`

    if(apiKey){
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        //console.log(result.response.text());
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