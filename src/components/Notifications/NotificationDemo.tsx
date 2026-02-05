'use client';

import React from 'react';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { NotificationPriority } from '@/types/notification';

const NotificationDemo: React.FC = () => {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showSystemNotification,
    showOrderNotification,
    showInventoryNotification,
    showSaleNotification,
    showQuotationNotification,
    showInvoiceNotification,
  } = useNotificationActions();

  const handleTestNotifications = () => {
    // Test different types of notifications
    showSuccess('Operación Exitosa', 'El producto se ha guardado correctamente');
    
    setTimeout(() => {
      showError('Error de Sistema', 'No se pudo conectar con el servidor');
    }, 1000);

    setTimeout(() => {
      showWarning('Stock Bajo', 'El producto "Laptop HP" tiene solo 2 unidades en stock');
    }, 2000);

    setTimeout(() => {
      showInfo('Nueva Actualización', 'Hay una nueva versión disponible del sistema');
    }, 3000);

    setTimeout(() => {
      showOrderNotification('Nueva Orden', 'Se ha recibido una nueva orden de compra #ORD-001', 'ord-001');
    }, 4000);

    setTimeout(() => {
      showInventoryNotification('Inventario Crítico', 'Varios productos están por debajo del stock mínimo', 'prod-123');
    }, 5000);

    setTimeout(() => {
      showSaleNotification('Venta Completada', 'Se ha procesado la venta #VEN-001 por $1,250.00', 'ven-001');
    }, 6000);

    setTimeout(() => {
      showQuotationNotification('Cotización Aprobada', 'La cotización #COT-001 ha sido aprobada por el cliente', 'cot-001');
    }, 7000);

    setTimeout(() => {
      showInvoiceNotification('Factura Generada', 'Se ha generado la factura #FAC-001 exitosamente', 'fac-001');
    }, 8000);

    setTimeout(() => {
      showSystemNotification('Mantenimiento Programado', 'El sistema estará en mantenimiento mañana de 2:00 AM a 4:00 AM', NotificationPriority.URGENT);
    }, 9000);
  };

  return (
    <div className="p-4">
      <button
        onClick={handleTestNotifications}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Test Notifications
      </button>
    </div>
  );
};

export default NotificationDemo;