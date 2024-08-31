import type { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import StoreProvider from "./StoreProvider";

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
      </body>
    </html>
  );
}
