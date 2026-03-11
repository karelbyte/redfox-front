import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nitro",
  description: "Nitro - Complete business management system for inventory, sales, and finances",
  icons: {
    icon: "/nitro-s.png",
    shortcut: "/nitro-s.png",
    apple: "/nitro-s.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
      </head>
      <body
        className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900`}
        suppressHydrationWarning
      >
        {children}
        {/* PWA/Service Worker - DESHABILITADO */}
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                    console.log('SW unregistered');
                  }
                });
                
                // Limpiar cachés de Service Worker
                if ('caches' in window) {
                   caches.keys().then(function(names) {
                       for (let name of names) caches.delete(name);
                   });
                }
              }
            `,
          }}
        /> */}

      </body>
    </html>
  );
}
