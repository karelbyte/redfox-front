import type { HelpConfig } from '../HelpButton';

export const invoicesHelp: HelpConfig = {
  title: { es: 'Guía de Facturas', en: 'Invoices Guide' },
  description: {
    es: 'Gestiona la facturación electrónica (CFDI) de tu negocio',
    en: 'Manage your business electronic invoicing (CFDI)',
  },
  sections: [
    {
      icon: '🧾',
      title: { es: '¿Qué es una factura?', en: 'What is an invoice?' },
      content: {
        es: 'Una factura electrónica (CFDI) es el comprobante fiscal digital que emites a tus clientes. Está timbrada por el SAT y tiene validez legal.\n\nPuedes crear facturas directamente o generarlas a partir de una venta cerrada.',
        en: 'An electronic invoice (CFDI) is the digital tax receipt you issue to your clients. It is stamped by the SAT and has legal validity.\n\nYou can create invoices directly or generate them from a closed sale.',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Estados de la factura', en: 'Invoice statuses' },
      content: {
        es: '• Borrador: creada pero no timbrada — puedes editarla\n• Enviada/Timbrada: CFDI generado y enviado al SAT — tiene UUID fiscal\n• Cancelada: CFDI cancelado ante el SAT\n\nSolo las facturas en Borrador pueden editarse o eliminarse.',
        en: '• Draft: created but not stamped — you can edit it\n• Sent/Stamped: CFDI generated and sent to SAT — has fiscal UUID\n• Cancelled: CFDI cancelled with SAT\n\nOnly Draft invoices can be edited or deleted.',
      },
    },
    {
      icon: '⚡',
      title: { es: 'Generar CFDI', en: 'Generate CFDI' },
      content: {
        es: 'Para timbrar una factura:\n\n1. El cliente debe tener RFC y datos fiscales configurados\n2. Los productos deben estar sincronizados con tu proveedor de facturación (Factura Green)\n3. Haz clic en "Generar CFDI" desde el detalle de la factura\n\nSi algún producto no está sincronizado, el sistema lo sincroniza automáticamente antes de timbrar.',
        en: 'To stamp an invoice:\n\n1. The client must have RFC and tax data configured\n2. Products must be synced with your billing provider (Factura Green)\n3. Click "Generate CFDI" from the invoice detail\n\nIf any product is not synced, the system automatically syncs it before stamping.',
      },
    },
    {
      icon: '❌',
      title: { es: 'Cancelar CFDI', en: 'Cancel CFDI' },
      content: {
        es: 'Puedes cancelar un CFDI timbrado desde el detalle de la factura. La cancelación se envía al SAT.\n\nNo puedes cancelar una factura si tiene complementos de pago timbrados activos — primero debes cancelar los complementos.\n\nLas razones de cancelación más comunes son: error en datos del receptor, error en importe, o comprobante emitido por error.',
        en: 'You can cancel a stamped CFDI from the invoice detail. The cancellation is sent to SAT.\n\nYou cannot cancel an invoice if it has active stamped payment complements — you must cancel the complements first.\n\nThe most common cancellation reasons are: error in recipient data, error in amount, or document issued by mistake.',
      },
    },
    {
      icon: '💳',
      title: { es: 'Complementos de pago', en: 'Payment complements' },
      content: {
        es: 'Cuando una factura se paga a crédito (PPD), debes emitir un complemento de pago cuando el cliente pague.\n\nDesde el detalle de la factura puedes registrar los pagos y generar el complemento de pago (CFDI tipo P).',
        en: 'When an invoice is paid on credit (PPD), you must issue a payment complement when the client pays.\n\nFrom the invoice detail you can record payments and generate the payment complement (CFDI type P).',
      },
    },
    {
      icon: '📊',
      title: { es: 'Factura global', en: 'Global invoice' },
      content: {
        es: 'La factura global agrupa ventas al público general en un solo CFDI. Se emite a nombre de "Público en General" (RFC XAXX010101000).\n\nPuedes generarla desde la vista de Ventas usando el botón "Factura Global", seleccionando el período de ventas a incluir.',
        en: 'The global invoice groups public sales into a single CFDI. It is issued in the name of "General Public" (RFC XAXX010101000).\n\nYou can generate it from the Sales view using the "Global Invoice" button, selecting the sales period to include.',
      },
    },
    {
      icon: '📄',
      title: { es: 'Descargar PDF y XML', en: 'Download PDF and XML' },
      content: {
        es: 'Una vez timbrada la factura, puedes descargar:\n\n• PDF: representación visual del CFDI para enviar al cliente\n• XML: archivo oficial del SAT con la firma digital\n\nAmbos archivos se obtienen directamente de tu proveedor de facturación.',
        en: 'Once the invoice is stamped, you can download:\n\n• PDF: visual representation of the CFDI to send to the client\n• XML: official SAT file with digital signature\n\nBoth files are obtained directly from your billing provider.',
      },
    },
  ],
};
