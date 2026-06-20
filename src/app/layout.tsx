import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { defaultLocale, localeCodes } from "@/i18n/locales";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requested = await getLocale();
  const locale = hasLocale(localeCodes, requested) ? requested : defaultLocale;

  return (
    <html lang={locale} className={`${inter.variable} ${fraunces.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans antialiased">
        <NextIntlClientProvider>
          {children}
          <Toaster position="top-center" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
