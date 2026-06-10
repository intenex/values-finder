import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "Values — discover what matters most",
    template: "%s · Values",
  },
  description:
    "A guided exercise to discover, rank, and reflect on your ten most important personal values.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans antialiased">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
