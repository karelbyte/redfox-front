import type { HelpConfig } from '../HelpButton';

export const purchaseOrdersHelp: HelpConfig = {
  title: { es: 'Guía de Órdenes de Compra', en: 'Purchase Orders Guide' },
  description: {
    es: 'Gestiona tus compras a proveedores con flujo de aprobación',
    en: 'Manage your purchases from providers with approval workflow',
  },
  sections: [
    {
      icon: '🛒',
      title: { es: '¿Qué es una orden de compra?', en: 'What is a purchase order?' },
      content: {
        es: 'Una orden de compra es un documento formal que le envías a un proveedor para solicitar productos. Incluye los productos, cantidades, precios y fecha de entrega esperada.\n\nLas órdenes de compra tienen un flujo de aprobación antes de ser enviadas al proveedor.',
        en: 'A purchase order is a formal document you send to a provider to request products. It includes products, quantities, prices and expected delivery date.\n\nPurchase orders have an approval workflow before being sent to the provider.',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Flujo de aprobación', en: 'Approval workflow' },
      content: {
        es: 'Las órdenes de compra pasan por estos estados:\n\n• Pendiente: recién creada, esperando aprobación\n• Aprobada: autorizada para enviar al proveedor\n• Rechazada: no autorizada, requiere correcciones\n• Cancelada: cancelada antes de ser procesada\n\nSolo las órdenes Pendientes pueden editarse o eliminarse.',
        en: 'Purchase orders go through these statuses:\n\n• Pending: just created, awaiting approval\n• Approved: authorized to send to provider\n• Rejected: not authorized, requires corrections\n• Cancelled: cancelled before being processed\n\nOnly Pending orders can be edited or deleted.',
      },
    },
    {
      icon: '📦',
      title: { es: 'Agregar productos', en: 'Add products' },
      content: {
        es: 'Desde el detalle de la orden puedes agregar los productos que quieres comprar con:\n\n• Producto: selecciona del catálogo\n• Cantidad solicitada: cuántas unidades pides\n• Precio unitario: precio acordado con el proveedor\n\nEl monto total se calcula automáticamente.',
        en: 'From the order detail you can add the products you want to purchase with:\n\n• Product: select from catalog\n• Requested quantity: how many units you order\n• Unit price: price agreed with the provider\n\nThe total amount is calculated automatically.',
      },
    },
    {
      icon: '✅',
      title: { es: 'Aprobar y recibir', en: 'Approve and receive' },
      content: {
        es: 'Al aprobar una orden:\n• Queda lista para ser enviada al proveedor\n• Puedes registrar la cantidad recibida cuando llegue la mercancía\n\nCuando el proveedor entrega los productos, crea una Recepción vinculada a la orden para actualizar el inventario.',
        en: 'When approving an order:\n• It is ready to be sent to the provider\n• You can record the received quantity when merchandise arrives\n\nWhen the provider delivers the products, create a Reception linked to the order to update inventory.',
      },
    },
    {
      icon: '📄',
      title: { es: 'PDF de orden de compra', en: 'Purchase order PDF' },
      content: {
        es: 'Puedes generar un PDF de la orden de compra para enviar al proveedor. Incluye todos los productos, cantidades, precios y el total.\n\nEl PDF incluye los datos de tu empresa si están configurados en Configuración → Generales de Empresa.',
        en: 'You can generate a PDF of the purchase order to send to the provider. It includes all products, quantities, prices and the total.\n\nThe PDF includes your company data if configured in Settings → Company General.',
      },
    },
  ],
};
