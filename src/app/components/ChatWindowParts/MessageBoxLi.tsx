'use client'

import { useAppSelector } from "@/app/lib/hooks"
import { Message } from "@/app/utils/StorageDataTypes"

const MessageBoxLi = (
    {message}:
    {message:Message}
) => {
    const userName = useAppSelector(state => state.userCredentials.userName)
    if(message.sender.userName === userName){
        return(
            <div
            style={{
            }}
            className="d-flex justify-content-end gap-2 py-1"
            >
                
                <p className="m-0 p-0 bg-primary px-2 mx-2"
                style={{
                    borderTopLeftRadius:'8px',
                    borderTopRightRadius:'8px',
                    borderBottomLeftRadius:'8px',
                    borderBottomRightRadius:'0px',
                    color:'white'
                }}
                >{message.message}</p>
            </div>
        )
    } else {
        return(
            <div
            style={{
            }}
            className="d-flex justify-content-start gap-2 py-1"
            >
                
                <p className="m-0 p-0 bg-white px-2 mx-2"
                style={{
                    borderTopLeftRadius:'8px',
                    borderTopRightRadius:'8px',
                    borderBottomLeftRadius:'0px',
                    borderBottomRightRadius:'8px',
                    color:'black'
                }}
                >{message.message}</p>
            </div>
        )
    }


}

export default MessageBoxLi