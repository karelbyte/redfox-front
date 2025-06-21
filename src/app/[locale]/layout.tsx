import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { DrawerProvider } from "@/components/Drawer/Drawer";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nitro",
  description: "Nitro - Sistema de gestión empresarial",
  icons: {
    icon: '/nitro-s.png',
    shortcut: '/nitro-s.png',
    apple: '/nitro-s.png',
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const currentLocale = await getLocale();

  return (
    <html lang={currentLocale}>
      <body
        suppressHydrationWarning
        className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900`}
      >
        <NextIntlClientProvider messages={messages} locale={currentLocale}>
          <ThemeProvider>
            <AuthProvider>
              <DrawerProvider>
                {children}
                <Toaster
                  toastOptions={{
                    className: '',
                    style: {
                      padding: '16px',
                      borderRadius: '8px',
                      maxWidth: '400px',
                    },
                  }}
                />
              </DrawerProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 