import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import AudioManager from "@/components/AudioManager";
import TransitionOverlay from "@/components/TransitionOverlay";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "King's Chamber",
  description: "The words have already been spoken. Enter, and seek.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="antialiased bg-chamber-black text-chamber-warm-white">
        <AudioManager />
        <TransitionOverlay />
        {children}
      </body>
    </html>
  );
}
