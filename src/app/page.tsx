'use client'
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex">
      <Image className="hidden" alt="logo" width={80} height={80} src={'/img/facekittenlogo.png'} />
      <form className="space-y-4 p-4">
        <div className="mb-3">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1"></p>
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-3 hidden md:block">
          <label htmlFor="checkbox" className="flex items-center">
            <input
              id="checkbox"
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm">Check me out</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
