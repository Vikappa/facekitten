'use client'
import Image from "next/image"
import { useAppDispatch, useAppSelector } from "../lib/hooks"
import { useEffect, useState } from "react"
import { addPost, randomCommentToUserPost } from "../lib/slices/userPostsSlice"
import { Form } from "react-bootstrap"
import { UserDetails } from "../utils/StorageDataTypes"
import { createNotification } from "../lib/slices/notificationSlice"

const CreateFormPost = () =>{

    const dispatch = useAppDispatch()
    const userDetails = useAppSelector(state => state.userCredentials)
    const [postText, setPostText] = useState<string>("")
    const postnumber = useAppSelector(state => state.posts.userPosts.length)
    const accountsFromRedux = useAppSelector(state => state.sessionGeneratedAccounts.acc);
    const [triggerRandomComment, setTriggerRandomComment] = useState<boolean>(false)

    const inviaPost = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    
        if(postText.length > 0) {
                dispatch(addPost({
                id: postnumber,
                author: {
                    userName: userDetails.userName,
                    profilepicture: userDetails.profilepictureUrl
                },
                body: postText,
                image: '',
                comments: [],
                created_at: new Date().toISOString(),
                likes: 0
            }));
    
            setPostText('');
            setTriggerRandomComment(true)
    
            setTimeout(() => {
                const randomAuthor = accountsFromRedux[Math.floor(Math.random() * accountsFromRedux.length)];
                dispatch(randomCommentToUserPost({
                    postNumber: postnumber, 
                    commentAuthorDetails: {
                        userName: randomAuthor.name,
                        profilepicture: randomAuthor.profilePic
                    }
                }))
                dispatch(createNotification({
                    notificationTypeNumber: 1,
                    notificationBody: {
                        postId: postnumber,
                        commentAuthor: {
                            userName: randomAuthor.name,
                            profilepicture: randomAuthor.profilePic
                        },
                        postAuthor: {
                            userName: userDetails.userName,
                            profilepicture: userDetails.profilepictureUrl
                        }
                    }
                }))
            }, Math.round(Math.random() * 11900+100))        }
    };
    

    

    return(
        
        <div className="d-flex flex-column w-100 bg-white rounded-4 p-3 w-100 shadow-sm">


        <div className="d-flex justify-content-start align-items-center w-100 gap-2">
            <Image src={userDetails.profilepictureUrl} alt={userDetails.userName} width={34} height={34} className="rounded-circle" />
            <Form className="d-flex flex-column w-100" onSubmit={inviaPost}>
                <Form.Group className="d-flex flex-column w-100">
                    <Form.Control type="text" placeholder={`A cosa stai pensando, ${userDetails.userName}?`} value={postText} onChange={(e) => {setPostText(e.target.value)}} className="bg-grayBg border-0 rounded-4 p-3 py-2 w-100" />
                </Form.Group>
            </Form>
        </div>

            <hr/>
            <div className="d-flex justify-content-evenly align-items-center w-100">
            <button className="border-0 bg-transparent" >Live Video</button>
            <button className="border-0 bg-transparent" >Photo/Video</button>
            <button className="d-none d-sm-block border-0 bg-transparent" >Feeling/Activity</button>
            </div>
        </div>

    )
}

export default CreateFormPost