'use client'
import { useParams } from 'next/navigation'
import '../../style.css'
import Navbar from "../../components/NavBar"
import ModaleNotificationMobileModale from "../../modali/ModaleNotificationMobileModale"
import MobileOptionFullScreenModal from '../../modali/MobileOptionFullScreenModal'
import { useAppDispatch, useAppSelector } from '@/app/lib/hooks'
import { useEffect } from 'react'
import { setNavbarPage } from '@/app/lib/slices/appStateSlice'
import BotProfileRenderer from '@/app/organisms/BotProfileRenderer'

const UserBotPage = () => {
    // Verifica che siamo in ambiente browser e ottieni il path
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    console.log(pathname)
    
    // Spezza l'URL in segmenti
    const segments = pathname.split('/');
    
    // Ottieni il penultimo segmento che contiene il nome
    const encodedName = segments[segments.length - 2]; // penultimo segmento
    
    // Decodifica il nome per rimuovere %20 e altri caratteri codificati
    const userNameString = decodeURIComponent(encodedName);

    const userCredential = useAppSelector(state => 
        state.sessionGeneratedAccounts.acc.find(account => account.name === userNameString)
    );

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(setNavbarPage(20));
    }, [dispatch]);

    if (userCredential) {
        return (
            <div id="container bg-danger">
                <ModaleNotificationMobileModale />
                <MobileOptionFullScreenModal />
                <Navbar />
                <BotProfileRenderer user={userCredential} />
            </div>
        );
    }

    return <div>Loading...</div>;
}

export default UserBotPage;
