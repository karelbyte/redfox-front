import type { HelpConfig } from '../HelpButton';

export const quotationsHelp: HelpConfig = {
  title: { es: 'Guía de Cotizaciones', en: 'Quotations Guide' },
  description: {
    es: 'Genera propuestas de precio para tus clientes',
    en: 'Generate price proposals for your clients',
  },
  sections: [
    {
      icon: '📋',
      title: { es: '¿Qué es una cotización?', en: 'What is a quotation?' },
      content: {
        es: 'Una cotización es una propuesta de precio que le envías a un cliente antes de confirmar la venta. Incluye los productos, cantidades, precios y descuentos.\n\nLas cotizaciones no afectan el inventario — solo cuando se convierten a venta se descuenta el stock.',
        en: 'A quotation is a price proposal you send to a client before confirming the sale. It includes products, quantities, prices and discounts.\n\nQuotations do not affect inventory — only when converted to a sale is stock deducted.',
      },
    },
    {
      icon: '📦',
      title: { es: 'Agregar productos', en: 'Add products' },
      content: {
        es: 'Desde el detalle de la cotización puedes agregar productos del catálogo completo — no está limitado a un almacén específico.\n\nPara cada producto puedes elegir:\n• Precio base\n• Una lista de precios personalizada (ej. "Precio mayoreo")\n• Precio personalizado\n• Descuento por porcentaje o monto fijo',
        en: 'From the quotation detail you can add products from the complete catalog — not limited to a specific warehouse.\n\nFor each product you can choose:\n• Base price\n• A custom price list (e.g. "Wholesale price")\n• Custom price\n• Discount by percentage or fixed amount',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Estados de la cotización', en: 'Quotation statuses' },
      content: {
        es: '• Borrador: recién creada, en edición\n• Enviada: enviada al cliente para revisión\n• Aceptada: el cliente aprobó la cotización\n• Rechazada: el cliente rechazó la cotización\n• Expirada: pasó la fecha de validez sin respuesta\n• Convertida: se convirtió en una venta',
        en: '• Draft: just created, being edited\n• Sent: sent to client for review\n• Accepted: client approved the quotation\n• Rejected: client rejected the quotation\n• Expired: validity date passed without response\n• Converted: converted into a sale',
      },
    },
    {
      icon: '⚡',
      title: { es: 'Convertir a venta', en: 'Convert to sale' },
      content: {
        es: 'Cuando el cliente acepta la cotización, puedes convertirla a venta con un clic. Al convertir:\n\n• Se te pedirá seleccionar el almacén de despacho\n• Se crea una venta abierta con todos los productos y precios de la cotización\n• La cotización queda marcada como "Convertida"\n\nLa venta creada queda abierta para que puedas cerrarla cuando se entregue la mercancía.',
        en: 'When the client accepts the quotation, you can convert it to a sale with one click. When converting:\n\n• You will be asked to select the dispatch warehouse\n• An open sale is created with all products and prices from the quotation\n• The quotation is marked as "Converted"\n\nThe created sale remains open so you can close it when the merchandise is delivered.',
      },
    },
    {
      icon: '📄',
      title: { es: 'PDF de cotización', en: 'Quotation PDF' },
      content: {
        es: 'Puedes generar un PDF profesional de la cotización para enviar al cliente. Incluye los datos de tu empresa, los productos con precios y descuentos, y el total.\n\nEl PDF incluye el logo y datos de empresa si están configurados en Configuración → Generales de Empresa.',
        en: 'You can generate a professional PDF of the quotation to send to the client. It includes your company data, products with prices and discounts, and the total.\n\nThe PDF includes the logo and company data if configured in Settings → Company General.',
      },
    },
  ],
};
