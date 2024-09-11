'use client'

import { Form } from "react-bootstrap"

const ChatForm = () => {


    return(
        <Form>
        <Form.Control
          type="text"
          id="inputChatText"
        />
        </Form>
       )
}

export default ChatForm