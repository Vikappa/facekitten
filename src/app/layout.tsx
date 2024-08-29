import type { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
          {children}
      </body>
    </html>
  );
}
