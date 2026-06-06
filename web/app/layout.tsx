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
  title: "Alfred OS — Your Personal System Butler",
  description:
    "Alfred is your personal system butler — a British Butler meets Dungeon Master companion that tracks your goals, gamifies your progress, and ensures you become the finest version of yourself.",
  openGraph: {
    title: "Alfred OS — Your Personal System Butler",
    description:
      "Part British butler, part Dungeon Master. Track your goals, gamify your progress with a living D&D character, and become the finest version of yourself.",
    type: "website",
    siteName: "Alfred OS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alfred OS — Your Personal System Butler",
    description:
      "Part British butler, part Dungeon Master. Track your goals and become the finest version of yourself.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">{children}</body>
    </html>
  );
}
