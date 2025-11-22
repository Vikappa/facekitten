'use client'
import Image from "next/image";
import { useState } from "react";
import { IoLogoOctocat } from "react-icons/io";

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <main className="flex flex-col items-center justify-between min-h-screen gap-8 p-4">
      <span></span>
      <Image alt="logo" width={70} height={70} src={'/img/facekittenlogo.png'} priority />
      <form className="space-y-4 w-full max-w-md">
        <div className="mb-3">

          <input
            id="email"
            type="email"
            placeholder="Numero di cellulare o e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 py-4"
          />
          <p className="text-sm text-gray-500 mt-1"></p>
        </div>

        <div className="mb-3">
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 py-4"
          />
        </div>

        <div className="mb-3 hidden md:block">
          <label htmlFor="checkbox" className="flex items-center">
            <input
              id="checkbox"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm">Check me out</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-full font-medium hover:bg-blue-700 transition-colors py-3 m-0"
        >
          Accedi
        </button>
        <button
          type="submit"
          className="w-full text-black py-2 px-4 font-medium hover:bg-blue-700 transition-colors py-3 m-0"
        >
          Password dimenticata?
        </button>
      </form>
      <div className="flex flex-col w-full">
        <input type="button" value="Crea un nuovo account" className="px-4 font-bold py-2 border-2 border-blue-500 text-blue-500 w-full rounded-full w-full hover:bg-blue-700" />
        <div className="flex items-center justify-center gap-2 py-2"><IoLogoOctocat /><span>Mewta</span></div>
        <div className="flex items-center justify-center w-full pt-2">
          <span className="text-[10px] px-2 text-gray-500">Informazioni</span>
          <span className="text-[10px] px-2 text-gray-500">Aiuto</span>
          <span className="text-[10px] px-2 text-gray-500">Altro</span>
        </div>
      </div>
    </main>
  );
}
