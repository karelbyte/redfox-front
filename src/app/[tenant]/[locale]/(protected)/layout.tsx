'use client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CartProvider } from '@/context/CartContext';
import { NotificationProvider } from '@/context/NotificationContext';
import OnboardingModal from '@/components/Onboarding/OnboardingModal';
import { useState, useEffect } from 'react';
import { usersService } from '@/services/users.service';
// import { useOfflineInit } from '@/hooks/useOfflineInit';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Inicializar capacidades offline - DESHABILITADO
  // useOfflineInit();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { onboarding_completed } = await usersService.getOnboardingStatus();
      setShowOnboarding(!onboarding_completed);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsCheckingOnboarding(false);
    }
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  return (
    <ProtectedRoute>
      <NotificationProvider>
        <CartProvider>
          {children}
          {!isCheckingOnboarding && (
            <OnboardingModal 
              isOpen={showOnboarding} 
              onClose={handleCloseOnboarding} 
            />
          )}
        </CartProvider>
      </NotificationProvider>
    </ProtectedRoute>
  );
} 