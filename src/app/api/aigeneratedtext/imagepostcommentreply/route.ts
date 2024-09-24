import { NextRequest, NextResponse } from "next/server";
const jwtSecret = process.env.NEXT_PUBLIC_SELF
import { GoogleGenerativeAI } from "@google/generative-ai"
import { UserDetails } from "@/app/utils/StorageDataTypes";
import { fileToGenerativePart } from "../../marketplacepost/initialcluster/route";
const GAK = process.env.GOOGLE_GEMINI_API_KEY

const prompt = ( commentAuthor:UserDetails, postText:string) => `
Devi interpretare un gatto che pubblica un post in un social network chiamato FaceKitten.
L'utente ha commentato un post con immagine.
Devi interpretare ${commentAuthor.userName}.
Il post è questo ${postText}.
Sii divertente e cerca di mandare avanti la conversazione.
`


export async function POST(req:NextRequest) {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token || !GAK) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const {testo, immagine, commentAuthor} = await req.json()

    try {
        const filePart1 = fileToGenerativePart(immagine, "image/jpeg")
        // Initialize the Google Generative AI instance
        const genAI = new GoogleGenerativeAI(GAK);
        const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
      })
        const generatedContent = await model.generateContent([prompt(commentAuthor, testo), filePart1])
        return NextResponse.json({
            text: generatedContent.response.text()
        })
    } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}