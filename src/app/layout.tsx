import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Amistada - AI-Powered Connections",
    template: "%s | Amistada",
  },
  description: "Connect with people who truly understand you. Amistada uses advanced AI to match you with like-minded individuals for meaningful conversations.",
  keywords: ["social", "AI matching", "connections", "chat", "conversations"],
  openGraph: {
    title: "Amistada - AI-Powered Connections",
    description: "Connect with people who truly understand you.",
    type: "website",
    siteName: "Amistada",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amistada - AI-Powered Connections",
    description: "Connect with people who truly understand you.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
