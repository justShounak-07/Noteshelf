import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "NoteShelf - Collaborative Book Highlights",
  description: "Every book. Every insight. One place. A collaborative platform for book highlights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col relative" suppressHydrationWarning>
        <NavBar />
        <Providers>
          <main className="flex-1 relative z-10 flex flex-col">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
