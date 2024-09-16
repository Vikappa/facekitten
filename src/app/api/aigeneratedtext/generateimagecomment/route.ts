import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const apyKey = process.env.GOOGLE_GEMINI_API_KEY;

const generateMarketPlaceText = async (photoPromptUrl:string) => {
    if(apyKey){
        const fileManager = new GoogleAIFileManager(apyKey)

        if(apyKey){
            const genAI = new GoogleGenerativeAI(apyKey)
        // Upload the file and specify a display name.
        const uploadResponse = await fileManager.uploadFile(photoPromptUrl, {
            mimeType: "image/jpeg",
            displayName: "MarketPlaceAnnounceFoto" + Date.now(),
          });
          
          // View the response.
          console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`)
    
          const getResponse = await fileManager.getFile(uploadResponse.file.name);
    
            // View the response.
            console.log(`Retrieved file ${getResponse.displayName} as ${getResponse.uri}`);
        }
    }
}