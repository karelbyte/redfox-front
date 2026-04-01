import type { HelpConfig } from '../HelpButton';

export const receptionsHelp: HelpConfig = {
  title: { es: 'Guía de Recepciones', en: 'Receptions Guide' },
  description: {
    es: 'Registra las entradas de mercancía de tus proveedores',
    en: 'Record merchandise entries from your providers',
  },
  sections: [
    {
      icon: '📥',
      title: { es: '¿Qué es una recepción?', en: 'What is a reception?' },
      content: {
        es: 'Una recepción registra la entrada de productos de un proveedor a un almacén. Cada recepción tiene un código, fecha, proveedor, almacén y documento de referencia (factura del proveedor).\n\nAl cerrar la recepción, los productos se transfieren automáticamente al inventario del almacén.',
        en: 'A reception records the entry of products from a provider to a warehouse. Each reception has a code, date, provider, warehouse and reference document (provider invoice).\n\nWhen closing the reception, products are automatically transferred to the warehouse inventory.',
      },
    },
    {
      icon: '📦',
      title: { es: 'Agregar productos', en: 'Add products' },
      content: {
        es: 'Desde el detalle de la recepción puedes agregar los productos recibidos con:\n\n• Producto: selecciona del catálogo\n• Cantidad: unidades recibidas\n• Precio: costo de compra\n• Número de lote: para FIFO/FEFO (opcional)\n• Fecha de caducidad: para productos perecederos (opcional)\n\nPuedes agregar el mismo producto varias veces si vienen en lotes diferentes.',
        en: 'From the reception detail you can add the received products with:\n\n• Product: select from catalog\n• Quantity: received units\n• Price: purchase cost\n• Batch number: for FIFO/FEFO (optional)\n• Expiration date: for perishable products (optional)\n\nYou can add the same product multiple times if they come in different batches.',
      },
    },
    {
      icon: '✅',
      title: { es: 'Cerrar recepción', en: 'Close reception' },
      content: {
        es: 'Al cerrar la recepción:\n\n• Los productos pasan al inventario del almacén\n• Si el producto usa FIFO/FEFO, se crea un nuevo lote\n• Si usa Promedio, se recalcula el precio promedio\n• El stock total del producto se actualiza\n\nEste proceso es irreversible. Una recepción cerrada no puede editarse.',
        en: 'When closing the reception:\n\n• Products go to the warehouse inventory\n• If the product uses FIFO/FEFO, a new batch is created\n• If it uses Average, the average price is recalculated\n• The total product stock is updated\n\nThis process is irreversible. A closed reception cannot be edited.',
      },
    },
    {
      icon: '📄',
      title: { es: 'Generar PDF', en: 'Generate PDF' },
      content: {
        es: 'Puedes generar un PDF de la recepción con todos los productos, cantidades y precios. El PDF incluye los datos de tu empresa (logo, nombre, RFC) si están configurados en Configuración → Generales de Empresa.',
        en: 'You can generate a PDF of the reception with all products, quantities and prices. The PDF includes your company data (logo, name, RFC) if configured in Settings → Company General.',
      },
    },
    {
      icon: '⚠️',
      title: { es: 'Recepciones abiertas vs cerradas', en: 'Open vs closed receptions' },
      content: {
        es: '• Abierta: puedes agregar, editar y eliminar productos\n• Cerrada: el inventario ya fue actualizado, no se puede modificar\n\nLos botones de editar y eliminar se deshabilitan automáticamente cuando la recepción está cerrada.',
        en: '• Open: you can add, edit and delete products\n• Closed: inventory has already been updated, cannot be modified\n\nThe edit and delete buttons are automatically disabled when the reception is closed.',
      },
    },
  ],
};
