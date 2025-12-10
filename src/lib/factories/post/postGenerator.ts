import { DoPromptRequest } from "@/lib/services/Gemini API/GeminiAPInterrogation";
import { newResume } from "../randomnews/randomNews";
import { FaceKittenDB, IPost, IProfile } from "@/lib/db";

interface IPostRequestResponse {
    content: string
}

function CreatePromptStringAboutThisNew(topic: string, authorName: string, bio: string) {
    return `Se un gatto di nome ${authorName} iscritto ad un social per gatti. La tua bio riporta: ${bio}. Scrivi il testo per un post su questo argomento: ${topic}`
}

export async function CreateSinglePost(author: IProfile) {
    const topics = await newResume();
    const topic = topics[Math.floor(Math.random() * topics.length)];

    const prompt = CreatePromptStringAboutThisNew(topic, author.username, author.bio);

    const generatedText = await DoPromptRequest<IPostRequestResponse>(prompt);

    const post : IPost = {
        id: null,
        authorId: author.id,
        content: generatedText.content,
        createdAt: Date.now.toString(),
        type: "text",
        reactionIds: [],
        commentsIds: [],
        authorAvatarUrl: author.avatarUrl
    }

    return post;
}
