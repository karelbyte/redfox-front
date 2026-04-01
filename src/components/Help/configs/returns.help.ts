import type { HelpConfig } from '../HelpButton';

export const returnsHelp: HelpConfig = {
  title: { es: 'Guía de Devoluciones', en: 'Returns Guide' },
  description: {
    es: 'Gestiona las devoluciones de productos a proveedores',
    en: 'Manage product returns to providers',
  },
  sections: [
    {
      icon: '↩️',
      title: { es: '¿Qué es una devolución?', en: 'What is a return?' },
      content: {
        es: 'Una devolución registra el envío de productos de regreso a un proveedor. Se toma del inventario de un almacén cerrado y se envía al proveedor.\n\nEjemplo: devolver 10 unidades defectuosas de "Vitamina B" al proveedor "Laboratorios XYZ".',
        en: 'A return records the shipment of products back to a provider. It is taken from the inventory of a closed warehouse and sent to the provider.\n\nExample: return 10 defective units of "Vitamin B" to provider "XYZ Laboratories".',
      },
    },
    {
      icon: '🏭',
      title: { es: 'Almacén origen', en: 'Source warehouse' },
      content: {
        es: 'El almacén origen debe estar cerrado para poder hacer una devolución. Esto garantiza que el inventario esté consolidado antes de descontar unidades.\n\nSi el almacén está abierto, primero ciérralo desde la vista de almacenes.',
        en: 'The source warehouse must be closed to make a return. This ensures that inventory is consolidated before deducting units.\n\nIf the warehouse is open, first close it from the warehouses view.',
      },
    },
    {
      icon: '📝',
      title: { es: 'Agregar productos a la devolución', en: 'Add products to return' },
      content: {
        es: 'Primero crea la devolución con el almacén origen y el proveedor destino. Luego entra al detalle y agrega los productos con sus cantidades.\n\nSi agregas el mismo producto dos veces, las cantidades se suman automáticamente.',
        en: 'First create the return with the source warehouse and destination provider. Then enter the detail and add the products with their quantities.\n\nIf you add the same product twice, the quantities are automatically added.',
      },
    },
    {
      icon: '✅',
      title: { es: 'Procesar la devolución', en: 'Process the return' },
      content: {
        es: 'Al procesar (cerrar) la devolución:\n\n• Se descuenta el stock del almacén origen\n• Se registra en el historial de movimientos como RETURN_OUT\n\nEste proceso es irreversible. Una devolución procesada no puede editarse ni eliminarse.',
        en: 'When processing (closing) the return:\n\n• Stock is deducted from the source warehouse\n• It is recorded in the movement history as RETURN_OUT\n\nThis process is irreversible. A processed return cannot be edited or deleted.',
      },
    },
  ],
};
