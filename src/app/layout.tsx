import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Risk Shield System - OCTAVE Allegro",
  description: "Enterprise Cybersecurity Risk Assessment Platform using OCTAVE Allegro methodology",
  keywords: ["cybersecurity", "risk assessment", "OCTAVE Allegro", "GRC", "risk management", "risk shield"],
  authors: [{ name: "Risk Shield System" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
