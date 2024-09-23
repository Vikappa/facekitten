'use client'
import Image from "next/image"
import { Form } from "react-bootstrap"
import { useAppDispatch, useAppSelector } from "../lib/hooks"
import { useState } from "react"
import { FiSend } from "react-icons/fi";
import { Post, PostComment, PostCommentNotificationType } from "../utils/StorageDataTypes"
import { addCommentToPost } from "../lib/slices/sessionGeneratedAccountsSlice"
import { addCommentToUserPost } from "../lib/slices/userPostsSlice"
import { GenerateCommentText } from "../utils/FakePostFactory/FakePostFactory"
import { createNotification } from "../lib/slices/notificationSlice"

const PostCommentForm = ({post}: {post: Post}) => {
    const [commentValue, setCommentValue] = useState<string>('') 
    const userDetails = useAppSelector((state) => state.userCredentials)
    const dispatch = useAppDispatch()
    const accountsFromRedux = useAppSelector(state => state.sessionGeneratedAccounts.acc);

    const sendComment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if(post && commentValue){
            const postIndex = post.id
            if(post.author.userName === userDetails.userName) {
                dispatch(addCommentToUserPost({
                    postNumber: postIndex,
                    commentValue: commentValue,
                    commentAuthorDetails: {
                        userName: userDetails.userName,
                        profilepicture: userDetails.profilepictureUrl,
                        coverPhotoUrl: userDetails.coverPhotoUrl
                    }
                }))

                setTimeout( async () => {
                    const randomAuthor = accountsFromRedux[Math.floor(Math.random() * accountsFromRedux.length)]
                    const newPostComment:PostComment = {
                        id: 0,
                        author: {
                            userName: randomAuthor.name,
                            profilepicture: randomAuthor.profilePic,
                            coverPhotoUrl: randomAuthor.coverPhotoUrl
                        },
                        body: commentValue,
                        commented_at: new Date().toISOString()
                    }
                    const updatedPost:Post = {
                        id: post.id,
                        author: post.author,
                        body: post.body,
                        comments: [...post.comments, newPostComment],
                        created_at: post.created_at,
                        likes: 0,
                        userliked: false,
                        likeProfiles: []
                    }
                    const newComment = await GenerateCommentText(updatedPost, randomAuthor.name)
                    dispatch(addCommentToUserPost({
                        postNumber: postIndex,
                        commentAuthorDetails: {
                            userName: randomAuthor.name,
                            profilepicture: randomAuthor.profilePic,
                            coverPhotoUrl: randomAuthor.coverPhotoUrl
                        },
                        commentValue: newComment
                    }))
                    dispatch(createNotification({
                        notificationTypeNumber: 2,
                        notificationBody: {
                            postId: post.id,
                            commentAuthor: {
                                userName: randomAuthor.name,
                                profilepicture: randomAuthor.profilePic,
                                coverPhotoUrl: randomAuthor.coverPhotoUrl
                            },
                            postAuthor: {
                                userName: post.author.userName,
                                profilepicture: post.author.profilepicture,
                                coverPhotoUrl: post.author.coverPhotoUrl
                            }
                        }
                    }))
                }, Math.round(Math.random() * 11900+100))
            } else  {
                dispatch(addCommentToPost({
                    post,
                    commentValue,
                    author: {
                        userName: userDetails.userName,
                        profilepicture: userDetails.profilepictureUrl,
                        coverPhotoUrl: userDetails.coverPhotoUrl
                    }
                }))

                setTimeout(async () => {
                    const randomChance = Math.floor(Math.random() * 100);
                    let randomAuthor;
                    if (randomChance > 80) {
                        randomAuthor = accountsFromRedux[Math.floor(Math.random() * accountsFromRedux.length)];
                    } else {
                        randomAuthor = accountsFromRedux.find(account => account.name === post.author.userName);
                    }

                    if (randomAuthor) {
                        const newPostComment:PostComment = {
                            id: 0,
                            author: {
                                userName: userDetails.userName,
                                profilepicture: userDetails.profilepictureUrl,
                                coverPhotoUrl: userDetails.coverPhotoUrl
                            },
                            body: commentValue,
                            commented_at: new Date().toISOString()
                        }
                        const updatedPost:Post = {
                            id: post.id,
                            author: post.author,
                            body: post.body,
                            comments: [...post.comments, newPostComment],
                            created_at: post.created_at,
                            likes: 0,
                            userliked: false,
                            likeProfiles: []
                        }
                        const generatedComment = await GenerateCommentText(updatedPost, randomAuthor.name)
                        dispatch(addCommentToPost({
                            post: post,
                            commentValue: generatedComment,
                            author: {
                                userName: randomAuthor.name,
                                profilepicture: randomAuthor.profilePic,
                                coverPhotoUrl: randomAuthor.coverPhotoUrl
                            }
                        }))
                        const notifBody:PostCommentNotificationType= {
                            postId: post.id,
                            commentAuthor: {
                                userName: randomAuthor.name,
                                profilepicture: randomAuthor.profilePic,
                                coverPhotoUrl: randomAuthor.coverPhotoUrl
                            },
                            postAuthor: {
                                userName: post.author.userName,
                                profilepicture: post.author.profilepicture,
                                coverPhotoUrl: post.author.coverPhotoUrl
                            }
                        }
                        dispatch(createNotification({
                            notificationTypeNumber: 2,
                            notificationBody: notifBody
                        }))
                    }
                }, Math.round(Math.random() * 11900 + 100))
            }

            setCommentValue('')
        }
    }

        return(
        <Form className="d-flex align-items-center gap-2" onSubmit={sendComment}>
            <Image src={userDetails.profilepictureUrl} alt={userDetails.userName} height={35} width={35}
            className="rounded-circle"
            />
            <Form.Group className="w-100">
                <Form.Control 
                type="text" placeholder={`Commenta come ${userDetails.userName}`} 
                value={commentValue} onChange={(e)=> setCommentValue(e.target.value)}
                className="border-0 bg-grayBg
                p-2 px-3 rounded-pill
                "
                />
            </Form.Group>
            <button className="bg-transparent border-0">
            <FiSend />
            </button>
            
        </Form>)
    }
export default PostCommentForm