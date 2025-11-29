import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FaceKitten",
  description: "Facekitten ti aiuta a connetterti e rimanere in contatto con i micetti della tua vita.",
  keywords: ["cats", "social", "community", "pets"],
  authors: [{ name: "FaceKitten Team" }],
  creator: "FaceKitten",
  openGraph: {
    type: "website",
    locale: "it-IT",
    url: "https://facekitten.com",
    title: "FaceKitten",
    description: "A social platform for cat lovers",
  },
  twitter: {
    card: "summary_large_image",
    title: "FaceKitten",
    description: "A social platform for cat lovers",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/img/facekittenlogo.png" />
      </head>
      <body className={inter.className}>
          {children}
      </body>
    </html>
  );
}
