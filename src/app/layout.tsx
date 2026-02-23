import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OCTAVE Allegro Risk Assessment Platform",
  description: "AI-Assisted Cybersecurity Risk Assessment Platform Based on OCTAVE Allegro Methodology",
  keywords: ["cybersecurity", "risk assessment", "OCTAVE Allegro", "GRC", "risk management"],
  authors: [{ name: "OCTAVE Risk Platform" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
