import type { Metadata } from "next";
import { Inter, Crimson_Text, Dancing_Script } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-provider";
import { ApolloWrapper } from "@/lib/apollo-provider";

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

const spiritualScript = Dancing_Script({
  variable: "--font-spiritual-script",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "12thhaus - Spiritual Community Platform",
  description: "Connect with authentic spiritual practitioners, book sessions, and join a supportive spiritual community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="spiritual-sanctuary">
      <body
        className={`${spiritualSans.variable} ${spiritualSerif.variable} ${spiritualScript.variable} spiritual-foundation antialiased`}
      >
        <AuthProvider>
          <ApolloWrapper>
            {children}
          </ApolloWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
