import { Form } from "react-bootstrap"

const MessengerSearchBar = () => {

    return (
        <Form className="d-none d-md-block">
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Control
          style={{
            color: '-bs-secondary',
            backgroundColor: '-bs-secondary',
          }}
          type="text" placeholder="Cerca su Meowsgenger" />
        </Form.Group>
        </Form>
    )
}

export default MessengerSearchBar