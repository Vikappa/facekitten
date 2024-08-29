'use client'
import Image from "next/image";
import Link from "next/link";
import { SetStateAction, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { IoLogoOctocat } from "react-icons/io";
import CreaNuovoAccountModale from "../modali/CreaNuovoAccountModale";

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

const [showModaleCreaAccount, setShowModaleCreaAccount] = useState(false);

  return (
    <>
    <CreaNuovoAccountModale show={showModaleCreaAccount} setShow={setShowModaleCreaAccount} />
      <div className="row py-sm-5 my-sm-5 justify-content-evenly position-relative">
        <div className="col-12 col-sm-5 d-flex align-items-between my-sm-5 pt-sm-5">
          <Image
            className="img-fluid d-sm-none m-5 mx-auto" 
            alt="logo"
            width={80}
            height={80}
            src={'/img/facekittenlogo.png'}
          />
          <div className="d-none d-sm-block">
            <h1 style={{fontSize:'3.5rem'}} className="text-primary">facekitten</h1>
            <p className="pb-5 fs-4">Facekitten prrrr meow meow maow maooooow frrr mew mieeeeo mew mmiao meeeow mow</p>
          </div>
        </div>

        <Form className="col-12 col-sm-4 bg-sm-white p-3 rounded sm-shadow-3 my-sm-5" onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              className="p-3"
              type="text" 
              placeholder="Email o numero di telefono" 
              value={email} 
              onChange={handleEmailChange} 
              style={{fontSize:'1rem'}} 
            />
          </Form.Group>

          <Form.Group className="mb-3 col-12" controlId="formBasicPassword">
            <Form.Control
              className="p-3"
              type="text" 
              placeholder="Pawsword" 
              value={maskedPassword}
              onChange={handlePasswordChange} 
              autoComplete="off"
              style={{fontSize:'1rem'}} 
            />
          </Form.Group>

          <Button style={{fontSize:'1rem'}} variant="primary" type="submit" className="w-100 fw-bold d-sm-hidden rounded-pill rounded-sm-2">
            Accedi
          </Button>
          <div className="d-flex justify-content-center p-2">
          <Link href={'/'} style={{fontSize:'1rem'}} className="text-decoration-none m-2 p-0">Password dimenticata?</Link>
          </div>
        <hr className="mt-1 d-none d-sm-block" />
        <div className="d-flex">
        <Button 
        style={{fontSize:'1rem'}} 
        variant="success" 
        className="d-none d-sm-block text-white p-2 mx-auto fw-bold m-3"
        onClick={() => setShowModaleCreaAccount(true)}
        >Crea nuovo account</Button>
        </div>
        </Form>

        <div className="d-sm-none mt-5 text-center position-relative bottom-0 w-100 d-flex flex-column">
        <button onClick={() => setShowModaleCreaAccount(true)} type="button" className="btn btn-outline-primary rounded-pill w-100">Crea nuovo account</button>
        <p className="d-flex text-center align-items-center justify-content-center m-2 text-tertiary"><IoLogoOctocat className="fs-4 m-1" />
        Mewta</p>
        </div>
      </div> 
      

    </>
  );
};

export default LoginPage;
