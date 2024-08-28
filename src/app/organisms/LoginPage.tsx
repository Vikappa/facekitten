'use client'
import Image from "next/image";
import { SetStateAction, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";

interface LoginPageProps {
    // Define your props here
  }
  
const LoginPage: React.FC<LoginPageProps> = () => {
    const [email, setEmail] = useState(''); // Stato per l'email
const [password, setPassword] = useState(''); // Stato per la password reale
const [maskedPassword, setMaskedPassword] = useState(''); // Stato per la password mascherata

const handleEmailChange = (e: { target: { value: SetStateAction<string>; }; }) => {
  setEmail(e.target.value); // Aggiorna lo stato dell'email
};

const handlePasswordChange = (e: { target: { value: any; }; }) => {
  const inputValue = e.target.value;

  // Se il nuovo input è più lungo, aggiungi un carattere (gatto)
  if (inputValue.length > maskedPassword.length) {
    setPassword(password + inputValue.slice(-1)); // Aggiungi l'ultimo carattere alla password reale
    setMaskedPassword(maskedPassword + '😺'); // Aggiungi un gatto alla password mascherata
  } 
  // Se il nuovo input è più corto, rimuovi l'ultimo carattere
  else if (inputValue.length < maskedPassword.length) {
    setPassword(password.slice(0, -1)); // Rimuovi l'ultimo carattere dalla password reale
    setMaskedPassword(maskedPassword.slice(0, -2)); // Rimuovi l'ultimo gatto dalla password mascherata
  }
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log("Email:", email);
  console.log("Password:", password);
};

useEffect(() => {
  console.log(password)
  console.log(maskedPassword)
}, [password]);

  return (
    <div>
      <div className="row py-5">
        <div className="col-12 col-sm-6 d-flex justify-content-center align-items-center">
          <Image
            className="img-fluid d-sm-none" 
            alt="logo"
            width={80}
            height={80}
            src={'/img/facekittenlogo.png'}
          />
          <div className="d-none d-sm-block">
            <h1 className="text-primary">facekitten</h1>
            <p>facekitten prrrr meow meow maow maooooow frrr mew mieeeeo mew mmiao meeeow mow</p>
          </div>
        </div>

        <Form className="col-12 col-sm-6 bg-white p-3 rounded shadow" onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control 
              type="text" 
              placeholder="Email o numero di telefono" 
              value={email} 
              onChange={handleEmailChange} // Gestore per l'email
            />
          </Form.Group>

          <Form.Group className="mb-3 col-12" controlId="formBasicPassword">
            <Form.Control 
              type="text" 
              placeholder="Pawsword" 
              value={maskedPassword}
              onChange={handlePasswordChange} // Gestore per la password
              autoComplete="off"
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 fw-bold">
            Accedi
          </Button>
        <hr/>
        <Button variant="success" className="text-white">Iscriviti</Button>
        </Form>
      </div>    </div>
  );
};

export default LoginPage;
