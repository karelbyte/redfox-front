'use client';

import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { DrawerProvider } from "@/components/Drawer/Drawer";
import { Toaster } from 'react-hot-toast';

interface LocaleProviderProps {
  messages: any;
  locale: string;
  children: React.ReactNode;
}

export function LocaleProvider({ messages, locale, children }: LocaleProviderProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
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
  );
} 