'use client'
import React, { useEffect, useState } from 'react';
import HomePage from './organisms/HomePage';
import LoginPage from './organisms/LoginPage';
import NavBar from "./components/NavBar"
import './style.css';
import { useAppSelector } from './lib/hooks';

export default function Home() {
  const userCredentials = useAppSelector(state => state.userCredentials); 
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false)



  if (userCredentials.userName === '') {
    return (
      <main className={'container py-5 bg-grayBg'}>
        <LoginPage />
      </main>
    )
  } else {
    return (
      <>
      <NavBar showMobileSearch={showMobileSearch} setShowMobileSearch={setShowMobileSearch}/>
      <HomePage />
      </>
    );
  }
}
