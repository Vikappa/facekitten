'use client'
import Image from "next/image";
import Link from "next/link";
import { SetStateAction, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";

interface LoginPageProps {
  }
  
const LoginPage: React.FC<LoginPageProps> = () => {
    const [email, setEmail] = useState('');
const [password, setPassword] = useState(''); 
const [maskedPassword, setMaskedPassword] = useState(''); 

const handleEmailChange = (e: { target: { value: SetStateAction<string>; }; }) => {
  setEmail(e.target.value); 
};

const handlePasswordChange = (e: { target: { value: any; }; }) => {
  const inputValue = e.target.value;

  if (inputValue.length > maskedPassword.length) {
    setPassword(password + inputValue.slice(-1)); 
    setMaskedPassword(maskedPassword + '😺');
  } 
  else if (inputValue.length < maskedPassword.length) {
    setPassword(password.slice(0, -1));
    setMaskedPassword(maskedPassword.slice(0, -2)); 
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
      <div className="row py-5 justify-content-evenly">
        <div className="col-12 col-sm-5 d-flex align-items-between">
          <Image
            className="img-fluid d-sm-none m-5 mx-auto" 
            alt="logo"
            width={80}
            height={80}
            src={'/img/facekittenlogo.png'}
          />
          <div className="d-none d-sm-block">
            <h1 className="text-primary">facekitten</h1>
            <p className="pb-5">Facekitten prrrr meow meow maow maooooow frrr mew mieeeeo mew mmiao meeeow mow</p>
          </div>
        </div>

        <Form className="col-12 col-sm-4 bg-sm-white p-3 rounded sm-shadow-3" onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
               
              type="text" 
              placeholder="Email o numero di telefono" 
              value={email} 
              onChange={handleEmailChange} 
              style={{fontSize:'0.7rem'}} 
            />
          </Form.Group>

          <Form.Group className="mb-3 col-12" controlId="formBasicPassword">
            <Form.Control
               
              type="text" 
              placeholder="Pawsword" 
              value={maskedPassword}
              onChange={handlePasswordChange} 
              autoComplete="off"
              style={{fontSize:'0.7rem'}} 
            />
          </Form.Group>

          <Button style={{fontSize:'0.7rem'}} variant="primary" type="submit" className="w-100 fw-bold d-sm-hidden rounded-pill rounded-sm-2">
            Accedi
          </Button>
          <div className="d-flex justify-content-center p-2">
          <Link href={'/'} style={{fontSize:'0.7rem'}} className="text-decoration-none m-0 p-0">Password dimenticata?</Link>
          </div>
        <hr className="mt-1"/>
        <div className="d-flex">
        <Button style={{fontSize:'0.7rem'}} variant="success" className="text-white px-2 mx-auto fw-bold">Crea nuovo account</Button>
        </div>
        </Form>
      </div> 
  );
};

export default LoginPage;
