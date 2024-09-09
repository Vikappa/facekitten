import Image from "next/image";
import { CommentReplyNotificationType, NotificationType, PostCommentNotificationType } from "../utils/StorageDataTypes"

const NotificationLi = (
    {notification}:
    {notification:NotificationType}
) => {
    if(notification.type===1){
        console.log(notification)
        //PostCommentNotificationType
        const notifBody: PostCommentNotificationType = notification.body as PostCommentNotificationType;
        return(
            <li className="d-flex p-0 py-2 m-0 gap-2 w-100 liNotificationElement"
            >
                <Image src={notification.body.commentAuthor.profilepicture} alt={notifBody.commentAuthor.userName} className="rounded-circle" width={20} height={20} />{
                notifBody.commentAuthor.userName} ha commentato il tuo post
            </li>
        )
    }

    if(notification.type===2){
        //PostCommentNotificationType
        const notifBody: CommentReplyNotificationType = notification.body as CommentReplyNotificationType;
        return(
            <li className="d-flex p-0 py-2 m-0 gap-2 w-100 liNotificationElement"
            >
                <Image src={notification.body.commentAuthor.profilepicture} alt={notifBody.commentAuthor.userName} className="rounded-circle" width={20} height={20} />
                {notifBody.commentAuthor.userName} ha rispost al tuo commento {
                (notifBody.commentAuthor?.userName === notifBody.postAuthor?.userName && notifBody?.commentAuthor.profilepicture === notifBody?.postAuthor.profilepicture ) ?
                `sul suo post`
                :
                `al post di ${notifBody.postAuthor?.userName}`
                }
            </li>
        )
    }
    return null
}

export default NotificationLi