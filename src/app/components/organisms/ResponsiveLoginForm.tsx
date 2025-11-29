import { initializeHomePage } from "@/lib/factories/profile/userProfileGenerator";
import { InputLoginForm } from "../atoms/ResponsiveLoginForm.tsx/InputLoginForm";

export type ResponsiveLoginFormProps = {
    email: string;
    password: string;
    showModal: boolean;
    setEmail: (e: string) => void;
    setPassword: (e: string) => void;
    setShowModal: (s: boolean) => void;
    onLoginSuccess?: () => void;

};

export function ResponsiveLoginForm({ email, password, showModal, setEmail, setPassword, setShowModal, onLoginSuccess }: ResponsiveLoginFormProps) {
    const CreateUserProfile = async () => {

        if (email.length > 0) {
            if (password.length == 0) {
                alert("Per favore inventa una password")
                return
            }

            const sessionRes = await fetch("/api/session/init", {
                method: "GET",
                credentials: "include",
            });

            const sessionJson = await sessionRes.json();
            console.log("[CreateUserProfile] session init response:", sessionJson);

            if (!sessionRes.ok) {
                console.error("[CreateUserProfile] session init failed");
                return;
            }

            await initializeHomePage(email)
            onLoginSuccess?.();
        } else {
            alert("Per favore inserisci un'email valida.")
        }
    }

    return (
        <form className="space-y-4 w-full max-w-md md:bg-white md:shadow-xl md:p-6 md:rounded-lg md:align-middle md:justify-center text-center">
            <div className="mb-3">

                <InputLoginForm
                    id={"email"}
                    type={"email"}
                    placeholder={"Nome e cognome utente"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)
                    }
                />


            </div>

            <div className="mb-3">
                <InputLoginForm
                    id={"password"}
                    type={"password"}
                    placeholder={"Password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-full font-medium hover:bg-blue-700 transition-colors py-3 m-0 md:rounded-md lg:font-bold"
                onClick={(e) => { e.preventDefault(); CreateUserProfile(); }}
            >
                Accedi
            </button>
            <button
                type="submit"
                className="w-full text-black py-2 px-4 font-medium hover:bg-blue-700 transition-colors hover:bg-transparent hover:cursor-pointer lg:w-fit md:text-blue-600 py-3 m-0"
            >
                Password dimenticata?
            </button>
            <hr className="hidden md:block border-t border-gray-300" />
            <input type="button" onClick={() => setShowModal(!showModal)} value="Crea un nuovo account" className="hidden md:block px-4 font-bold py-2 border-2 bg-green-500 text-white text-center rounded-lg hover:bg-green-700 mx-auto block py-3 hover:cursor-pointer" />
        </form>
    )
}