import { NotificationType, PostCommentNotificationType } from "../utils/StorageDataTypes"

const NotificationLi = (
    {notification}:
    {notification:NotificationType}
) => {
    if(notification.type===1){
        //PostCommentNotificationType
        const notifBody: PostCommentNotificationType = notification.body as PostCommentNotificationType;
        return(
            <li>{notifBody.commentAuthor.userName} ha commentato il tuo post</li>
        )
    }

    if(notification.type===2){
        //PostCommentNotificationType
        const notifBody: PostCommentNotificationType = notification.body as PostCommentNotificationType;
        return(
            <li>{notifBody.commentAuthor.userName} ha commentato il tuo post</li>
        )
    }
    return null
}

export default NotificationLi