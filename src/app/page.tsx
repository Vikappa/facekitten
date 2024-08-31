'use client'

import React, { useEffect, useState } from 'react';
import HomePage from './organisms/HomePage';
import LoginPage from './organisms/LoginPage';
import { storageData } from './utils/CustomTypes';
import './style.css';

export default function Home() {
  const [localStorageData, setLocalStorageData] = useState<storageData | undefined>(undefined);

  useEffect(() => {
    try {
      const data = localStorage.getItem('facekittenData');
      if (data) {
        const parsedData: storageData = JSON.parse(data);
        setLocalStorageData(parsedData);
      }
    } catch (error) {
      console.log("LocalStorage non trovato, presento LoginPage");
    }
    
  }, []);

  if (!localStorageData) {
    return (
      <main className={'container py-5 bg-grayBg'}>
        <LoginPage />
      </main>
    );
  } else {
    return (
      <HomePage data={localStorageData} />
    );
  }
}
