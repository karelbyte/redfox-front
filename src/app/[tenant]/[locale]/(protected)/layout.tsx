'use client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CartProvider } from '@/context/CartContext';
import { NotificationProvider } from '@/context/NotificationContext';
import OnboardingModal from '@/components/Onboarding/OnboardingModal';
import { ProductTour } from '@/components/ProductTour/ProductTour';
import { useState, useEffect } from 'react';
import { usersService } from '@/services/users.service';
import { useLocale } from 'next-intl';
import { useProductTour } from '@/hooks/useProductTour';

const TOUR_STEPS_ES = [
  { target: 'aside nav', placement: 'right' as const, title: '📋 Menú de navegación', text: 'Desde aquí accedes a todas las secciones: clientes, productos, ventas, inventario y más. Puedes colapsar el menú para tener más espacio.' },
  { target: 'button[title="Agregar a favoritos"]', placement: 'right' as const, title: '⭐ Favoritos', text: 'Marca cualquier sección como favorita con la estrella. Tus favoritos aparecen en la barra superior para acceso rápido.' },
  { target: '[data-tour="notifications"]', placement: 'bottom' as const, title: '🔔 Notificaciones', text: 'Aquí recibirás alertas importantes: importaciones completadas, stock bajo, facturas generadas y más.' },
  { target: '[data-tour="support"]', placement: 'bottom' as const, title: '🛟 Soporte', text: 'Si tienes dudas o problemas, contáctanos directamente desde aquí. Nuestro equipo te responderá a la brevedad.' },
  { target: '[data-tour="pos"]', placement: 'right' as const, title: '🛒 Punto de Venta', text: 'Accede al POS para realizar ventas rápidas con escáner de código de barras, carrito y cobro en un solo lugar.' },
];

const TOUR_STEPS_EN = [
  { target: 'aside nav', placement: 'right' as const, title: '📋 Navigation menu', text: 'Access all system sections from here: clients, products, sales, inventory and more. You can collapse the menu for more space.' },
  { target: 'button[title="Add to favorites"]', placement: 'right' as const, title: '⭐ Favorites', text: 'Mark any section as favorite with the star. Your favorites appear in the top bar for quick access.' },
  { target: '[data-tour="notifications"]', placement: 'bottom' as const, title: '🔔 Notifications', text: 'You will receive important alerts here: completed imports, low stock, generated invoices and more.' },
  { target: '[data-tour="support"]', placement: 'bottom' as const, title: '🛟 Support', text: 'If you have questions or issues, contact us directly from here. Our team will respond promptly.' },
  { target: '[data-tour="pos"]', placement: 'right' as const, title: '🛒 Point of Sale', text: 'Access the POS to make quick sales with barcode scanner, cart and checkout in one place.' },
];

const TOUR_STEPS_ZH = [
  { target: 'aside nav', placement: 'right' as const, title: '📋 导航菜单', text: '从这里访问系统的所有模块：客户、产品、销售、库存等。您可以折叠菜单以获得更多空间。' },
  { target: 'button[title="添加到收藏夹"]', placement: 'right' as const, title: '⭐ 收藏夹', text: '用星标将任何模块标记为收藏。您的收藏将显示在顶部栏以便快速访问。' },
  { target: '[data-tour="notifications"]', placement: 'bottom' as const, title: '🔔 通知', text: '您将在此收到重要提醒：导入完成、库存不足、发票生成等。' },
  { target: '[data-tour="support"]', placement: 'bottom' as const, title: '🛟 支持', text: '如有疑问或问题，请直接从这里联系我们。我们的团队将尽快回复。' },
  { target: '[data-tour="pos"]', placement: 'right' as const, title: '🛒 销售终端', text: '访问POS进行快速销售，支持条形码扫描、购物车和一站式结账。' },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const { active, startTour, stopTour, resetAndStart } = useProductTour();

  const tourSteps = locale === 'en' ? TOUR_STEPS_EN : locale === 'zh' ? TOUR_STEPS_ZH : TOUR_STEPS_ES;

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();

    // Escuchar evento de test del tour (solo en desarrollo)
    const handleTestTour = () => resetAndStart();
    window.addEventListener('nitro:start-tour', handleTestTour);
    return () => window.removeEventListener('nitro:start-tour', handleTestTour);
  }, [resetAndStart]);

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
    startTour();
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
          {active && (
            <ProductTour
              steps={tourSteps}
              locale={locale}
              onDone={stopTour}
            />
          )}
        </CartProvider>
      </NotificationProvider>
    </ProtectedRoute>
  );
} 