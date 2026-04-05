import type { HelpConfig } from '../HelpButton';

export const invoicesHelp: HelpConfig = {
  title: { es: 'Guía de Facturas', en: 'Invoices Guide', zh: '发票指南' },
  description: {
    es: 'Gestiona la facturación electrónica (CFDI) de tu negocio',
    en: 'Manage your business electronic invoicing (CFDI)',
    zh: '管理业务的电子开票（CFDI）',
  },
  sections: [
    {
      icon: '🧾',
      title: { es: '¿Qué es una factura?', en: 'What is an invoice?', zh: '什么是发票？' },
      content: {
        es: 'Una factura electrónica (CFDI) es el comprobante fiscal digital que emites a tus clientes. Está timbrada por el SAT y tiene validez legal.\n\nPuedes crear facturas directamente o generarlas a partir de una venta cerrada.',
        en: 'An electronic invoice (CFDI) is the digital tax receipt you issue to your clients. It is stamped by the SAT and has legal validity.\n\nYou can create invoices directly or generate them from a closed sale.',
        zh: '电子发票（CFDI）是您向客户开具的数字税务凭证。经SAT盖章，具有法律效力。\n\n您可以直接创建发票，也可以从已结算的销售中生成。',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Estados de la factura', en: 'Invoice statuses', zh: '发票状态' },
      content: {
        es: '• Borrador: creada pero no timbrada — puedes editarla\n• Enviada/Timbrada: CFDI generado y enviado al SAT — tiene UUID fiscal\n• Cancelada: CFDI cancelado ante el SAT\n\nSolo las facturas en Borrador pueden editarse o eliminarse.',
        en: '• Draft: created but not stamped — you can edit it\n• Sent/Stamped: CFDI generated and sent to SAT — has fiscal UUID\n• Cancelled: CFDI cancelled with SAT\n\nOnly Draft invoices can be edited or deleted.',
        zh: '• 草稿：已创建但未盖章——可以编辑\n• 已发送/已盖章：CFDI已生成并发送至SAT——具有税务UUID\n• 已取消：CFDI已在SAT处取消\n\n只有草稿状态的发票可以编辑或删除。',
      },
    },
    {
      icon: '⚡',
      title: { es: 'Generar CFDI', en: 'Generate CFDI', zh: '生成CFDI' },
      content: {
        es: 'Para timbrar una factura:\n\n1. El cliente debe tener RFC y datos fiscales configurados\n2. Los productos deben estar sincronizados con tu proveedor de facturación (Factura Green)\n3. Haz clic en "Generar CFDI" desde el detalle de la factura\n\nSi algún producto no está sincronizado, el sistema lo sincroniza automáticamente antes de timbrar.',
        en: 'To stamp an invoice:\n\n1. The client must have RFC and tax data configured\n2. Products must be synced with your billing provider (Factura Green)\n3. Click "Generate CFDI" from the invoice detail\n\nIf any product is not synced, the system automatically syncs it before stamping.',
        zh: '盖章发票的步骤：\n\n1. 客户必须已配置RFC和税务信息\n2. 产品必须与开票服务商（Factura Green）同步\n3. 在发票详情页点击"生成CFDI"\n\n如果有产品未同步，系统会在盖章前自动同步。',
      },
    },
    {
      icon: '❌',
      title: { es: 'Cancelar CFDI', en: 'Cancel CFDI', zh: '取消CFDI' },
      content: {
        es: 'Puedes cancelar un CFDI timbrado desde el detalle de la factura. La cancelación se envía al SAT.\n\nNo puedes cancelar una factura si tiene complementos de pago timbrados activos — primero debes cancelar los complementos.\n\nLas razones de cancelación más comunes son: error en datos del receptor, error en importe, o comprobante emitido por error.',
        en: 'You can cancel a stamped CFDI from the invoice detail. The cancellation is sent to SAT.\n\nYou cannot cancel an invoice if it has active stamped payment complements — you must cancel the complements first.\n\nThe most common cancellation reasons are: error in recipient data, error in amount, or document issued by mistake.',
        zh: '您可以从发票详情页取消已盖章的CFDI。取消请求将发送至SAT。\n\n如果发票有活跃的已盖章付款补充凭证，则无法取消——必须先取消补充凭证。\n\n最常见的取消原因：收款方信息有误、金额有误或误开凭证。',
      },
    },
    {
      icon: '💳',
      title: { es: 'Complementos de pago', en: 'Payment complements', zh: '付款补充凭证' },
      content: {
        es: 'Cuando una factura se paga a crédito (PPD), debes emitir un complemento de pago cuando el cliente pague.\n\nDesde el detalle de la factura puedes registrar los pagos y generar el complemento de pago (CFDI tipo P).',
        en: 'When an invoice is paid on credit (PPD), you must issue a payment complement when the client pays.\n\nFrom the invoice detail you can record payments and generate the payment complement (CFDI type P).',
        zh: '当发票以赊账方式付款（PPD）时，客户付款时必须开具付款补充凭证。\n\n在发票详情页可以登记付款并生成付款补充凭证（CFDI P类型）。',
      },
    },
    {
      icon: '📊',
      title: { es: 'Factura global', en: 'Global invoice', zh: '全局发票' },
      content: {
        es: 'La factura global agrupa ventas al público general en un solo CFDI. Se emite a nombre de "Público en General" (RFC XAXX010101000).\n\nPuedes generarla desde la vista de Ventas usando el botón "Factura Global", seleccionando el período de ventas a incluir.',
        en: 'The global invoice groups public sales into a single CFDI. It is issued in the name of "General Public" (RFC XAXX010101000).\n\nYou can generate it from the Sales view using the "Global Invoice" button, selecting the sales period to include.',
        zh: '全局发票将面向普通公众的销售汇总为一张CFDI。以"普通公众"名义开具（RFC XAXX010101000）。\n\n您可以在销售视图中使用"全局发票"按钮生成，选择要包含的销售时间段。',
      },
    },
    {
      icon: '📄',
      title: { es: 'Descargar PDF y XML', en: 'Download PDF and XML', zh: '下载PDF和XML' },
      content: {
        es: 'Una vez timbrada la factura, puedes descargar:\n\n• PDF: representación visual del CFDI para enviar al cliente\n• XML: archivo oficial del SAT con la firma digital\n\nAmbos archivos se obtienen directamente de tu proveedor de facturación.',
        en: 'Once the invoice is stamped, you can download:\n\n• PDF: visual representation of the CFDI to send to the client\n• XML: official SAT file with digital signature\n\nBoth files are obtained directly from your billing provider.',
        zh: '发票盖章后，您可以下载：\n\n• PDF：CFDI的可视化表示，用于发送给客户\n• XML：带有数字签名的SAT官方文件\n\n两个文件均直接从您的开票服务商获取。',
      },
    },
  ],
};
