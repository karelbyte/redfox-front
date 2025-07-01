'use client';

import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { DrawerProvider } from "@/components/Drawer/Drawer";
import { LanguageInitializer } from "@/components/LanguageInitializer";
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

interface LocaleProviderProps {
  messages: Record<string, unknown>;
  locale: string;
  children: React.ReactNode;
}

// Componente wrapper para manejar SSR
function ClientOnlyWrapper({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}

export function LocaleProvider({ messages, locale, children }: LocaleProviderProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ClientOnlyWrapper>
        <ThemeProvider>
          <AuthProvider>
            <DrawerProvider>
              <LanguageInitializer />
              {children}
              {typeof window !== 'undefined' && (
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
              )}
            </DrawerProvider>
          </AuthProvider>
        </ThemeProvider>
      </ClientOnlyWrapper>
    </NextIntlClientProvider>
  );
} 