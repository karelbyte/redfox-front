import type { HelpConfig } from '../HelpButton';

export const warehouseAdjustmentsHelp: HelpConfig = {
  title: { es: 'Guía de Ajustes de Almacén', en: 'Warehouse Adjustments Guide' },
  description: {
    es: 'Transfiere productos entre almacenes',
    en: 'Transfer products between warehouses',
  },
  sections: [
    {
      icon: '🔄',
      title: { es: '¿Qué es un ajuste?', en: 'What is an adjustment?' },
      content: {
        es: 'Un ajuste de almacén es una transferencia de productos de un almacén origen a un almacén destino. Ambos almacenes deben estar abiertos.\n\nEjemplo: mover 50 unidades de "Vitamina B" de la Bodega Central a la Sucursal Norte.',
        en: 'A warehouse adjustment is a transfer of products from a source warehouse to a destination warehouse. Both warehouses must be open.\n\nExample: move 50 units of "Vitamin B" from the Central Warehouse to the North Branch.',
      },
    },
    {
      icon: '📝',
      title: { es: 'Agregar productos al ajuste', en: 'Add products to adjustment' },
      content: {
        es: 'Primero crea el ajuste con los almacenes origen y destino. Luego entra al detalle y agrega los productos con sus cantidades.\n\nSi agregas el mismo producto dos veces, las cantidades se suman automáticamente.',
        en: 'First create the adjustment with the source and destination warehouses. Then enter the detail and add the products with their quantities.\n\nIf you add the same product twice, the quantities are automatically added.',
      },
    },
    {
      icon: '✅',
      title: { es: 'Procesar el ajuste', en: 'Process the adjustment' },
      content: {
        es: 'Al procesar (cerrar) el ajuste:\n\n• Se descuenta el stock del almacén origen\n• Se suma el stock al almacén destino\n• Se registra en el historial de movimientos\n\nEste proceso es irreversible. Un ajuste procesado no puede editarse ni eliminarse.',
        en: 'When processing (closing) the adjustment:\n\n• Stock is deducted from the source warehouse\n• Stock is added to the destination warehouse\n• It is recorded in the movement history\n\nThis process is irreversible. A processed adjustment cannot be edited or deleted.',
      },
    },
    {
      icon: '⚠️',
      title: { es: 'Ajuste abierto vs cerrado', en: 'Open vs closed adjustment' },
      content: {
        es: '• Abierto: puedes agregar, editar y eliminar productos del ajuste\n• Cerrado/Procesado: el ajuste ya fue ejecutado, los inventarios ya se actualizaron\n\nLos botones de editar y eliminar se deshabilitan automáticamente cuando el ajuste está cerrado.',
        en: '• Open: you can add, edit and delete products from the adjustment\n• Closed/Processed: the adjustment has already been executed, inventories have been updated\n\nThe edit and delete buttons are automatically disabled when the adjustment is closed.',
      },
    },
  ],
};
