import type { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import StoreProvider from "./StoreProvider";
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from "@vercel/analytics/react"
import { GoogleTagManager } from '@next/third-parties/google'

const GAID = process.env.GAID

export const metadata: Metadata = {
  title: "Facekitten",
  description: "Prrrrr mau??",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en class">
      <body className={`${inter.className} bg-grayBg`}>
        <StoreProvider>
          {children}
        </StoreProvider>
        {GAID && <GoogleAnalytics gaId={GAID} />}
      </body>
    </html>
  );
}
