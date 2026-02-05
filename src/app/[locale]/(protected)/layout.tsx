'use client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CartProvider } from '@/context/CartContext';
import { NotificationProvider } from '@/context/NotificationContext';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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