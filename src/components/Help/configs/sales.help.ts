import type { HelpConfig } from '../HelpButton';

export const salesHelp: HelpConfig = {
  title: { es: 'Guía de Ventas', en: 'Sales Guide' },
  description: {
    es: 'Todo lo que necesitas saber para gestionar tus ventas',
    en: 'Everything you need to know to manage your sales',
  },
  sections: [
    {
      icon: '🛒',
      title: { es: '¿Qué es una venta?', en: 'What is a sale?' },
      content: {
        es: 'Una venta registra la entrega de productos o servicios a un cliente. Cada venta tiene un código, cliente, método de pago y productos.\n\nLas ventas pueden crearse manualmente desde esta vista o automáticamente desde el POS.',
        en: 'A sale records the delivery of products or services to a client. Each sale has a code, client, payment method and products.\n\nSales can be created manually from this view or automatically from the POS.',
      },
    },
    {
      icon: '💳',
      title: { es: 'Métodos de pago', en: 'Payment methods' },
      content: {
        es: '• Efectivo: pago inmediato en efectivo\n• Tarjeta: pago con tarjeta de crédito o débito\n• Crédito: pago diferido — genera automáticamente una cuenta por cobrar al cliente\n\nLas ventas en efectivo y tarjeta se registran en la caja activa. Las ventas a crédito no afectan el balance de caja.',
        en: '• Cash: immediate cash payment\n• Card: credit or debit card payment\n• Credit: deferred payment — automatically generates an account receivable for the client\n\nCash and card sales are recorded in the active cash register. Credit sales do not affect the cash balance.',
      },
    },
    {
      icon: '📦',
      title: { es: 'Agregar productos', en: 'Add products' },
      content: {
        es: 'Desde el detalle de la venta puedes agregar productos del inventario. Al cerrar la venta, el stock se descuenta automáticamente según la estrategia del producto (FIFO, FEFO o Promedio).\n\nSi el producto no tiene stock suficiente, el sistema lo indicará al intentar cerrar.',
        en: 'From the sale detail you can add products from inventory. When closing the sale, stock is automatically deducted according to the product strategy (FIFO, FEFO or Average).\n\nIf the product does not have enough stock, the system will indicate this when trying to close.',
      },
    },
    {
      icon: '✅',
      title: { es: 'Cerrar venta', en: 'Close sale' },
      content: {
        es: 'Al cerrar la venta:\n\n• Se descuenta el stock del inventario\n• Se registra la transacción en la caja (si aplica)\n• Se genera e imprime el ticket automáticamente\n• Si el cliente tiene datos fiscales, puedes generar el CFDI\n\nEste proceso es irreversible. Una venta cerrada no puede editarse.',
        en: 'When closing the sale:\n\n• Stock is deducted from inventory\n• The transaction is recorded in the cash register (if applicable)\n• The ticket is automatically generated and printed\n• If the client has tax data, you can generate the CFDI\n\nThis process is irreversible. A closed sale cannot be edited.',
      },
    },
    {
      icon: '🧾',
      title: { es: 'Factura fiscal (CFDI)', en: 'Fiscal invoice (CFDI)' },
      content: {
        es: 'Puedes generar una factura electrónica (CFDI) para una venta cerrada si el cliente tiene RFC y datos fiscales configurados.\n\nDesde el detalle de la venta usa el botón "Generar CFDI". Si la facturación falla, la venta queda guardada y puedes reintentar desde el módulo de Facturas.',
        en: 'You can generate an electronic invoice (CFDI) for a closed sale if the client has RFC and tax data configured.\n\nFrom the sale detail use the "Generate CFDI" button. If billing fails, the sale is saved and you can retry from the Invoices module.',
      },
    },
    {
      icon: '📊',
      title: { es: 'Factura global', en: 'Global invoice' },
      content: {
        es: 'La factura global agrupa múltiples ventas del período en una sola factura a nombre de "Público en General" (RFC XAXX010101000). Es útil para ventas al público que no requieren factura individual.\n\nUsa el botón "Factura Global" para seleccionar el período y generar el CFDI global.',
        en: 'The global invoice groups multiple sales from the period into a single invoice in the name of "General Public" (RFC XAXX010101000). It is useful for public sales that do not require individual invoices.\n\nUse the "Global Invoice" button to select the period and generate the global CFDI.',
      },
    },
    {
      icon: '↩️',
      title: { es: 'Devoluciones', en: 'Refunds' },
      content: {
        es: 'Puedes registrar una devolución de una venta cerrada. Al procesar la devolución, el stock se reintegra al inventario y se genera un movimiento de tipo RETURN_IN en el historial.\n\nSi la venta tenía factura, deberás cancelar el CFDI por separado desde el módulo de Facturas.',
        en: 'You can register a refund for a closed sale. When processing the refund, stock is returned to inventory and a RETURN_IN movement is generated in the history.\n\nIf the sale had an invoice, you will need to cancel the CFDI separately from the Invoices module.',
      },
    },
  ],
};
