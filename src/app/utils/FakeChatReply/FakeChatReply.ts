import { Chat, UserDetails } from "../StorageDataTypes";

const formatDate = (timestamp: string | number | Date) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`; // Formato HH:mm
};

export const fakeChatReplyText = (chat: Chat, userDetails: UserDetails) => {
    const propArgumentString = chat.messages.map((message) => {
        const senderName = message.sender.userName === userDetails.userName 
            ? 'Utente Umano' 
            : `Gatto ${chat.chatWith.userName}`
        const time = formatDate(message.timestamp)
        return `${senderName}: ${message.message} (ore ${time})`
    }).join('\n');

    console.log(propArgumentString);
}
