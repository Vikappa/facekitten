'use client'

import HomePage from './organisms/HomePage';
import LoginPage from './organisms/LoginPage';
import './style.css';

export default function Home() {

  let localStorageData = localStorage.getItem('facekittenData');

  try{
    localStorageData = localStorage.getItem('facekittenData');
  } catch(error){
    console.log("Localstorage non trovato, presento LoginPage")
  }

  if (!localStorageData){

    return (
      <main className={'container py-5 bg-grayBg'}>
      <LoginPage/>
    </main>
  );
} else {
  return (
    <HomePage data={localStorageData}/>
  )
} 
}
