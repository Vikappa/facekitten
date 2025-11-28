'use client'
import Image from "next/image";
import { useState } from "react";
import { IoLogoOctocat } from "react-icons/io";
import { Modal } from "../organisms/Modal";
import { ResponsiveLoginForm } from "../organisms/ResponsiveLoginForm";
import { AppDispatch } from "@/lib/store";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";


export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    return (
        <>
            <Modal
                open={showModal}
                submitText="Miao"
                closeText="Miao"
                title="Non hai rrrrrealmente bisogno di un account"
                body="Inventa un nome e spara una password a caso: non ti verrà mai più richiesta."
                onSubmit={() => setShowModal(false)}
                onClose={() => setShowModal(false)}
            />
            <main className="flex flex-col lg:flex-row items-center justify-between min-h-screen sm:p-5 md:p-15 lg:min-h-0 gap-8 p-4 md:bg-gray-100 lg:p-x-60 lg:py-30 md:justify-center">
                <span className="md:hidden"></span>
                <Image className="sm:hidden" alt="logo" width={70} height={70} src={'/img/facekittenlogo.png'} priority />
                <div className="hidden sm:block text-center lg:text-left lg:max-w-xl">
                    <h2 className="text-[64px] text-blue-600 font-bold">facekitten</h2>
                    <p className="sm:max-w-1/2 text-2xl mx-auto lg:mx-0">Facekitten ti aiuta a connetterti e rimanere in contatto con i micetti della tua vita.</p>
                </div>

                <ResponsiveLoginForm
                    email={email}
                    password={password}
                    showModal={showModal}
                    setEmail={setEmail}
                    setPassword={setPassword}
                    setShowModal={setShowModal}
                    dispatch={dispatch}
                    onLoginSuccess={() => router.push("/home")}
                />

                <div className="flex flex-col w-full md:hidden items-center gap-4">
                    <input type="button" onClick={() => setShowModal(!showModal)} value="Crea un nuovo account" className="px-4 font-bold py-2 border-2 border-blue-500 text-blue-500 w-full max-w-xs rounded-full hover:bg-blue-700" />
                    <div className="flex items-center justify-center gap-2 py-2"><IoLogoOctocat /><span>Mewta</span></div>
                    <div className="flex items-center justify-center w-full pt-2">
                        <span className="text-[10px] px-2 text-gray-500">Informazioni</span>
                        <span className="text-[10px] px-2 text-gray-500">Aiuto</span>
                        <span className="text-[10px] px-2 text-gray-500">Altro</span>
                    </div>
                </div>

                <div className="hidden sm:block lg:hidden py-3">
                    <span><strong>Crea una Pagina</strong> per un personaggio famoso, un brand o un&apos;azienda.</span>
                </div>
            </main>

            <footer className="hidden lg:block bg-white text-gray-500 p-5 px-12">
                <div className="d-flex gap-2 flex-wrap p-3 items-center">
                    <span className="px-2 py-1 text-sm">Siamese</span>
                    <span className="px-2 py-1 text-sm">Maine Coon</span>
                    <span className="px-2 py-1 text-sm">Ragdoll</span>
                    <span className="px-2 py-1 text-sm">Persiano</span>
                    <span className="px-2 py-1 text-sm">British Shorthair</span>
                    <span className="px-2 py-1 text-sm">Sphynx</span>
                    <span className="px-2 py-1 text-sm">Bengala</span>
                    <span className="px-2 py-1 text-sm">Norvegese delle Foreste</span>
                    <span className="px-2 py-1 text-sm">Scottish Fold</span>
                    <span className="px-2 py-1 text-sm">Devon Rex</span>
                    <span className="px-2 py-1 text-sm">Abissino</span>

                </div>
                <hr className="hidden md:block border-t border-gray-300 py-3" />
                <div className="d-flex gap-4 flex-wrap">
                    <span className="px-2 py-1 text-sm">Grattino Supremo</span>
                    <span className="px-2 py-1 text-sm">Cuscino di Vibrisse</span>
                    <span className="px-2 py-1 text-sm">Crocchettone Arcano</span>
                    <span className="px-2 py-1 text-sm">Sbuffo di Pelo</span>
                    <span className="px-2 py-1 text-sm">Zampata Gentile</span>
                    <span className="px-2 py-1 text-sm">Miao Intergalattico</span>
                    <span className="px-2 py-1 text-sm">PurrBoost 3000</span>
                    <span className="px-2 py-1 text-sm">Sgranocchia Tonno+</span>
                    <span className="px-2 py-1 text-sm">Coda Fluttuante</span>
                    <span className="px-2 py-1 text-sm">Morbidosità Critica</span>
                    <span className="px-2 py-1 text-sm">Fusa Sonore</span>
                    <span className="px-2 py-1 text-sm">Modo Gattone</span>
                    <span className="px-2 py-1 text-sm">Bagnetto Proibito</span>
                    <span className="px-2 py-1 text-sm">Pelo Statale</span>
                    <span className="px-2 py-1 text-sm">Cerchio delle Zampette</span>
                    <span className="px-2 py-1 text-sm">Caccia al Puntino</span>
                    <span className="px-2 py-1 text-sm">Satiro Felino</span>
                    <span className="px-2 py-1 text-sm">Miagolio Infinito</span>
                    <span className="px-2 py-1 text-sm">Criceto Mentale</span>
                    <span className="px-2 py-1 text-sm">Palla di Pelo Oscura</span>
                    <span className="px-2 py-1 text-sm">Zampetta d’Oro</span>
                    <span className="px-2 py-1 text-sm">Fusa Ultra</span>
                    <span className="px-2 py-1 text-sm">Gatto Turbo</span>
                    <span className="px-2 py-1 text-sm">Patto delle Vibrisse</span>
                    <span className="px-2 py-1 text-sm">Micioblob</span>
                    <span className="px-2 py-1 text-sm">Gommino Supremo</span>
                    <span className="px-2 py-1 text-sm">Crocchetta Maggiore</span>
                    <span className="px-2 py-1 text-sm">Miao Quantistico</span>
                    <span className="px-2 py-1 text-sm">Zampalypse</span>
                    <span className="px-2 py-1 text-sm">Felino dello Spazio</span>

                </div>
            </footer>
            <span className="text-sm hidden lg:block text-gray-500 px-12">Mewta © 2025</span>
        </>
    );
}