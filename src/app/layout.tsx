import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RedFox - Tu Plataforma",
  description: "Plataforma moderna construida con Next.js",
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
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  );
}
