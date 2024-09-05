'use client'
import Image from "next/image"
import { useAppSelector } from "../lib/hooks"
import { Form } from "react-bootstrap"

const CreateFormPost = () =>{

    const userDetails = useAppSelector(state => state.userCredentials)

    return(
        <div className="d-flex flex-column w-100 bg-white rounded-4 p-3 w-100">


        <div className="d-flex justify-content-start align-items-center w-100 gap-2">
            <Image src={userDetails.profilepictureUrl} alt={userDetails.userName} width={34} height={34} className="rounded-circle" />
            <Form className="d-flex flex-column w-100">
                <Form.Group className="d-flex flex-column w-100">
                    <Form.Control type="text" placeholder={`A cosa stai pensando, ${userDetails.userName}?`} className="bg-grayBg border-0 rounded-4 p-3 py-2 w-100" />
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