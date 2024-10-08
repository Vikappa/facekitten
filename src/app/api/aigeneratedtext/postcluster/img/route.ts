import fs from "fs"
import path from "path"
import { generateRandomInterval } from "@/app/utils/FakeAccountFactory/FakeAccountFactory";
import { FakePostCommentTextFactory, fetchRandomPostFoto } from "@/app/utils/FakePostFactory/FakePostFactory";
import { CasualUser, ImagePostBody, Post } from "@/app/utils/StorageDataTypes";
import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server";
import { postImgIndexes } from "../../../../../../public/storedcatphotos/imgs/postImgIndexes";

const GAK = process.env.GOOGLE_GEMINI_API_KEY
const  jwtSecret = process.env.NEXT_PUBLIC_SELF

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

const generate3ImagePosts = async (inputAuthors: CasualUser[]):Promise<Post[]> => {
  let postsNumber: number = inputAuthors
  .flatMap(author => author.posts) 
  .length; 
  const prompt = `
    Su un social network, facekitten, sono iscritti solo gatti. Devi generare 3 testi dei post per le tre immagini fornite.
    I testi devono essere brevi e divertenti. Non ripeterti.
    Non mettere intestazioni. 
    Rispondi solo e unicamente con il testo dei post in questo formato:
    testo1#testo2#testo3
    `
    const returnArray: Post[] = []
    const minIntervalInHours = 1000 * 60 * 60 * 3;  // 3 ore
    const maxIntervalInDays = 86400000 * 2;   // 2 giorni
    let lastPostTime = new Date().getTime();
    lastPostTime -= generateRandomInterval(minIntervalInHours, maxIntervalInDays);
    const images: string[] = []
    const texts: string[] = []
    images.push(postImgIndexes[Math.floor(Math.random() * postImgIndexes.length)])
    images.push(postImgIndexes[Math.floor(Math.random() * postImgIndexes.length)])
    images.push(postImgIndexes[Math.floor(Math.random() * postImgIndexes.length)])
    try {
      if(GAK){
        const filePart1 = fileToGenerativePart(images[0], "image/jpeg")
        const filePart2 = fileToGenerativePart(images[1], "image/jpeg")
        const filePart3 = fileToGenerativePart(images[2], "image/jpeg")
              // Initialize the Google Generative AI instance
              const genAI = new GoogleGenerativeAI(GAK);
              const model = genAI.getGenerativeModel({
                model: "gemini-1.5-pro",
              })
        
              // Combine prompt and images
              const imageParts = [filePart1, filePart2, filePart3];
              const generatedContent = await model.generateContent([prompt, ...imageParts])
              let textExtended = [...generatedContent.response.text().split('#')]
              for (let index = 0; index < textExtended.length; index++) {
                texts.push(textExtended[index])                
              }
      } else {
        console.log("No GAK")
        texts.push(FakePostCommentTextFactory())
        texts.push(FakePostCommentTextFactory())
        texts.push(FakePostCommentTextFactory())
      }
    } catch (error) {
      texts.push(FakePostCommentTextFactory())
      texts.push(FakePostCommentTextFactory())
      texts.push(FakePostCommentTextFactory())
    }
  
    for (let index = 0; index < 3; index++) {
      const newBody: ImagePostBody = {
        imageUrl: images[index],
        generativeContext: "",
        imagePostText: texts[index]
      }
      const newPost:Post = {
        id: postsNumber,
        author: {
          userName: inputAuthors[index].name,
          profilepicture: inputAuthors[index].profilePic,
          coverPhotoUrl: inputAuthors[index].coverPhotoUrl,
        },
        body: newBody,
        comments: [],
        created_at: new Date(lastPostTime).toISOString(),
        likes: 0,
        userliked: false,
        likeProfiles: []
      }
      returnArray.push(newPost)
      lastPostTime -= generateRandomInterval(minIntervalInHours, maxIntervalInDays)
      postsNumber++
    }
  
    return returnArray
}

export async function POST(request:NextRequest){

    let auth = request.headers.get("Authorization")
    const token = auth?.split(' ')[1];  

    
    const {authors} = await request.json()

    if(!token || token !== jwtSecret){
        return new Response("Unauthorized", {status: 401})
    }

    const returnArray: Post[] = await generate3ImagePosts(authors)

    return new NextResponse(
        JSON.stringify(returnArray),
        {status: 200}
    )
}