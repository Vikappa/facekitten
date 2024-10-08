import { Chat, UserDetails } from "../StorageDataTypes"
import { FakePostCommentTextFactory } from "../FakePostFactory/FakePostFactory";

const jwtSecret = process.env.NEXT_PUBLIC_SELF

const formatDate = (timestamp: string | number | Date) => {
    const date = new Date(timestamp)
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
};

export const fakeChatReplyText = async (chat: Chat, setStaScrivendo:(staScrivendo:boolean)=>void , userDetails: UserDetails): Promise<string> => {
    setStaScrivendo(true)
    const propArgumentString = chat.messages.map((message) => {
        const senderName = message.sender.userName === userDetails.userName 
            ? 'Utente Umano' 
            : `Gatto ${chat.chatWith.userName}`
        const time = formatDate(message.timestamp)
        return `${senderName}: ${message.message} (ore ${time})`
    }).join('\n')

    try {
        const response = await fetch('/api/aigeneratedtext/chatreplytext', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtSecret}`
            },
            body: JSON.stringify({ comment: propArgumentString, catName: chat.chatWith.userName }),
        });
        const data = await response.json();
        setStaScrivendo(false)
        return data.message;
    } catch (error) {
        console.error('Error:', error);
        setStaScrivendo(false)
        return FakePostCommentTextFactory();
    }
}