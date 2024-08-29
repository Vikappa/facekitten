'use client'

import { Dispatch, SetStateAction } from "react"
import { Button, Modal } from "react-bootstrap"

const CreaNuovoAccountModale = ( {show, setShow}: {show: boolean, setShow:  Dispatch<SetStateAction<boolean>>}) => {

    const chiudiModale = () => {
        setShow(false)
    }

return(
    <>

      <Modal show={show} onHide={chiudiModale}>
        <Modal.Header closeButton>
          <Modal.Title>Meow</Modal.Title>
        </Modal.Header>
        <Modal.Body>Non hai veramente bisogno di registrarti! Inserisci dei dati a caso e meow!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={chiudiModale}>
            Meow
          </Button>
          <Button variant="primary" onClick={chiudiModale}>
            Meow
          </Button>
        </Modal.Footer>
      </Modal>
    </>
)
}

export default CreaNuovoAccountModale