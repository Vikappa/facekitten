import { NextRequest, NextResponse } from "next/server";
const jwtSecret = process.env.NEXT_PUBLIC_SELF
import { GoogleGenerativeAI } from "@google/generative-ai"
import { UserDetails } from "@/app/utils/StorageDataTypes";
const GAK = process.env.GOOGLE_GEMINI_API_KEY
import fs from "fs"
import path from "path"

function fileToGenerativePart(filePath: string, mimeType: string) {
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

    const {testoDelPost, imageUrl, authorname} = await req.json()
    console.log(testoDelPost, imageUrl, authorname)
    try {
        const filePart1 = fileToGenerativePart(imageUrl, "image/jpeg")
        // Initialize the Google Generative AI instance
        const genAI = new GoogleGenerativeAI(GAK);
        const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
      })
        const generatedContent = await model.generateContent([prompt(authorname, testoDelPost), filePart1])
        return NextResponse.json({
            text: generatedContent.response.text()
        })
    } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}