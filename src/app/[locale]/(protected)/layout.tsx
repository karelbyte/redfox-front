'use client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CartProvider } from '@/context/CartContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { useOfflineInit } from '@/hooks/useOfflineInit';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Inicializar capacidades offline
  useOfflineInit();

  return (
    <ProtectedRoute>
      <NotificationProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </NotificationProvider>
    </ProtectedRoute>
  );
} 