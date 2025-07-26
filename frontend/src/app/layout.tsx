import type { Metadata } from "next";
import { Inter, Crimson_Text } from "next/font/google";
import "./globals.css";
import SpiritualApolloProvider from "../lib/apollo-provider";

// Spiritual Typography System
const spiritualSans = Inter({
  variable: "--font-spiritual-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const spiritualSerif = Crimson_Text({
  variable: "--font-spiritual-serif", 
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "12thhaus - Find Your Perfect Spiritual Guide",
  description: "Connect with authentic spiritual practitioners for tarot, astrology, energy healing, and transformative guidance. Your spiritual journey starts here.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="spiritual-sanctuary">
      <body
        className={`${spiritualSans.variable} ${spiritualSerif.variable} antialiased spiritual-foundation`}
      >
        <SpiritualApolloProvider>
          {children}
        </SpiritualApolloProvider>
      </body>
    </html>
  );
}