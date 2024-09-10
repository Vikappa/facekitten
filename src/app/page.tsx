'use client'
import React, { useEffect, useState } from 'react';
import HomePage from './organisms/HomePage';
import LoginPage from './organisms/LoginPage';
import NavBar from "./components/NavBar"
import './style.css';
import { useAppSelector } from './lib/hooks';
import ModaleNotificationMobileModale from './modali/ModaleNotificationMobileModale';
import ChatsRenderer from './components/ChatsRenderer';

export default function Home() {
  const userCredentials = useAppSelector(state => state.userCredentials); 



  if (userCredentials.userName === '') {
    return (
      <main className={'container py-5 bg-grayBg'} style={{maxWidth:'100vw'}}>
        <LoginPage />
      </main>
    )
  } else {
    return (
      <>
      <NavBar/>
      <ModaleNotificationMobileModale/>
      <HomePage  />
      <ChatsRenderer/>
      </>
    );
  }
}
