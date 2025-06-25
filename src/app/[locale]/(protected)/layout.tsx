'use client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CartProvider } from '@/context/CartContext';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <CartProvider>
        {children}
      </CartProvider>
    </ProtectedRoute>
  );
} 