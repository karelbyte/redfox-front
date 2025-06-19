import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        suppressHydrationWarning
        className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900`}
      >
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
      </body>
    </html>
  );
}
