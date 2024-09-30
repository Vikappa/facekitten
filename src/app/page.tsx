'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react';
import HomePage from './organisms/HomePage';
import LoginPage from './organisms/LoginPage';
import NavBar from "./components/NavBar";
import './style.css';
import { useAppSelector } from './lib/hooks';
import ModaleNotificationMobileModale from './modali/ModaleNotificationMobileModale';
import ChatsRenderer from './components/ChatsRenderer';
import { useDispatch } from 'react-redux';
import { setNavbarPage } from './lib/slices/appStateSlice';

export default function Home() {
  const userCredentials = useAppSelector(state => state.userCredentials);
  const dispatch = useDispatch();
  const navbarPage = useAppSelector(state => state.status.shownpage);

  useEffect(() => {
    if (navbarPage !== 1) {
      dispatch(setNavbarPage(1));
    }
  }, [navbarPage, dispatch]);

  if (userCredentials.userName === '') {
    return (
      <main className={'container py-5 bg-grayBg'} style={{ maxWidth: '100vw' }}>
        <LoginPage />
      </main>
    );
  } else {
    return (
      <>
        <NavBar />
        <ModaleNotificationMobileModale />
        <HomePage />
        <ChatsRenderer />
      </>
    );
  }
}
