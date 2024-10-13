import type { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import StoreProvider from "./StoreProvider";
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from "@vercel/analytics/react"

const GAID = process.env.GAID

export const metadata: Metadata = {
  title: "Facekitten",
  description: "Prrrrr mau??",
  manifest: "/wepappmanifest.json", 
  icons: {
    icon: "/img/facekittenlogo.png",
  }
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
        <Analytics/>
        {GAID && <GoogleAnalytics gaId={GAID} />}
      </body>
    </html>
  );
}
