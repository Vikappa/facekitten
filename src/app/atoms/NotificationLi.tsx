import Image from "next/image";
import { GoDotFill } from "react-icons/go";
import { CommentReplyNotificationType, NotificationType, PostCommentNotificationType } from "../utils/StorageDataTypes"
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { useRouter } from "next/navigation";
import { setShowDropDownNotification } from "../lib/slices/appStateSlice";

const NotificationLi = (
    {notification}:
    {notification:NotificationType}
) => {
    const userName = useAppSelector(state => state.userCredentials.userName)
    const navigator = useRouter()
    const dispatch = useAppDispatch()
    if(notification.type===1){
        //PostCommentNotificationType
        const notifBody: PostCommentNotificationType = notification.body as PostCommentNotificationType
        let linkUrl = `/userpost/${notification.body.postId}`
        return(
                <li className="d-flex p-0 py-2 m-0 gap-2 w-100 liNotificationElement  align-items-center"
                onClick={
                    () => {
                        dispatch(setShowDropDownNotification(false))
                        navigator.push(linkUrl)
                    }
                }>
                    {notification.seen === false ? <GoDotFill className="text-danger" /> : ''}
                    <Image src={notification.body.commentAuthor.profilepicture} alt={notifBody.commentAuthor.userName} className="rounded-circle" width={20} height={20} />{
                        notifBody.commentAuthor.userName} ha commentato il tuo post
                </li>
        )
    }

    if(notification.type===2){
        //PostCommentNotificationType
        const notifBody: CommentReplyNotificationType = notification.body as CommentReplyNotificationType

        let linkUrl = `/`

        if(notifBody.commentAuthor?.userName === notifBody.postAuthor?.userName && 
            notifBody?.commentAuthor.profilepicture === notifBody?.postAuthor.profilepicture 
            && notifBody?.postAuthor.userName === userName
        ){
            linkUrl = `/userpost/${notification.body.postId}`
        }

        if(notifBody.commentAuthor?.userName === notifBody.postAuthor?.userName && 
            notifBody?.commentAuthor.profilepicture === notifBody?.postAuthor.profilepicture){
                linkUrl = `/userprofile/${notification.body.postAuthor.userName}/${notification.body.postId}`
            } 
        
            if(notifBody.commentAuthor?.userName !== notifBody.postAuthor?.userName){
                if(notifBody.postAuthor?.userName === userName){
                    linkUrl = `/userpost/${notification.body.postId}`
                } else {
                    linkUrl = `/userprofile/${notification.body.postAuthor.userName}/${notification.body.postId}`
                }
            }

        return(
            <li className="d-flex p-0 py-2 m-0 gap-2 w-100 liNotificationElement  align-items-center"
            onClick={
                () => {
                    dispatch(setShowDropDownNotification(false))
                    navigator.push(linkUrl)
                }
            }
            >
                {notification.seen === false ? <GoDotFill className="text-danger" /> : ''}
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