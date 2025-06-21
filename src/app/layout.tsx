import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
} 