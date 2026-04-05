import type { HelpConfig } from '../HelpButton';

export const quotationsHelp: HelpConfig = {
  title: { es: 'Guía de Cotizaciones', en: 'Quotations Guide', zh: '报价指南' },
  description: {
    es: 'Genera propuestas de precio para tus clientes',
    en: 'Generate price proposals for your clients',
    zh: '为客户生成价格方案',
  },
  sections: [
    {
      icon: '📋',
      title: { es: '¿Qué es una cotización?', en: 'What is a quotation?', zh: '什么是报价？' },
      content: {
        es: 'Una cotización es una propuesta de precio que le envías a un cliente antes de confirmar la venta. Incluye los productos, cantidades, precios y descuentos.\n\nLas cotizaciones no afectan el inventario — solo cuando se convierten a venta se descuenta el stock.',
        en: 'A quotation is a price proposal you send to a client before confirming the sale. It includes products, quantities, prices and discounts.\n\nQuotations do not affect inventory — only when converted to a sale is stock deducted.',
        zh: '报价是在确认销售前发送给客户的价格方案。包含产品、数量、价格和折扣。\n\n报价不影响库存——只有转换为销售时才会扣减库存。',
      },
    },
    {
      icon: '📦',
      title: { es: 'Agregar productos', en: 'Add products', zh: '添加产品' },
      content: {
        es: 'Desde el detalle de la cotización puedes agregar productos del catálogo completo — no está limitado a un almacén específico.\n\nPara cada producto puedes elegir:\n• Precio base\n• Una lista de precios personalizada (ej. "Precio mayoreo")\n• Precio personalizado\n• Descuento por porcentaje o monto fijo',
        en: 'From the quotation detail you can add products from the complete catalog — not limited to a specific warehouse.\n\nFor each product you can choose:\n• Base price\n• A custom price list (e.g. "Wholesale price")\n• Custom price\n• Discount by percentage or fixed amount',
        zh: '在报价详情页，您可以从完整目录中添加产品——不限于特定仓库。\n\n对于每个产品，您可以选择：\n• 基础价格\n• 自定义价格列表（例如"批发价"）\n• 自定义价格\n• 按百分比或固定金额折扣',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Estados de la cotización', en: 'Quotation statuses', zh: '报价状态' },
      content: {
        es: '• Borrador: recién creada, en edición\n• Enviada: enviada al cliente para revisión\n• Aceptada: el cliente aprobó la cotización\n• Rechazada: el cliente rechazó la cotización\n• Expirada: pasó la fecha de validez sin respuesta\n• Convertida: se convirtió en una venta',
        en: '• Draft: just created, being edited\n• Sent: sent to client for review\n• Accepted: client approved the quotation\n• Rejected: client rejected the quotation\n• Expired: validity date passed without response\n• Converted: converted into a sale',
        zh: '• 草稿：刚创建，正在编辑\n• 已发送：已发送给客户审阅\n• 已接受：客户批准了报价\n• 已拒绝：客户拒绝了报价\n• 已过期：有效期已过但无回复\n• 已转换：已转换为销售',
      },
    },
    {
      icon: '⚡',
      title: { es: 'Convertir a venta', en: 'Convert to sale', zh: '转换为销售' },
      content: {
        es: 'Cuando el cliente acepta la cotización, puedes convertirla a venta con un clic. Al convertir:\n\n• Se te pedirá seleccionar el almacén de despacho\n• Se crea una venta abierta con todos los productos y precios de la cotización\n• La cotización queda marcada como "Convertida"\n\nLa venta creada queda abierta para que puedas cerrarla cuando se entregue la mercancía.',
        en: 'When the client accepts the quotation, you can convert it to a sale with one click. When converting:\n\n• You will be asked to select the dispatch warehouse\n• An open sale is created with all products and prices from the quotation\n• The quotation is marked as "Converted"\n\nThe created sale remains open so you can close it when the merchandise is delivered.',
        zh: '当客户接受报价时，您可以一键将其转换为销售。转换时：\n\n• 系统会要求您选择发货仓库\n• 使用报价中的所有产品和价格创建一个开放的销售单\n• 报价标记为"已转换"\n\n创建的销售单保持开放状态，待货物交付时关闭。',
      },
    },
    {
      icon: '📄',
      title: { es: 'PDF de cotización', en: 'Quotation PDF', zh: '报价PDF' },
      content: {
        es: 'Puedes generar un PDF profesional de la cotización para enviar al cliente. Incluye los datos de tu empresa, los productos con precios y descuentos, y el total.\n\nEl PDF incluye el logo y datos de empresa si están configurados en Configuración → Generales de Empresa.',
        en: 'You can generate a professional PDF of the quotation to send to the client. It includes your company data, products with prices and discounts, and the total.\n\nThe PDF includes the logo and company data if configured in Settings → Company General.',
        zh: '您可以生成专业的报价PDF发送给客户。包含公司信息、带价格和折扣的产品列表以及总计。\n\n如果在设置→公司基本信息中已配置，PDF将包含标志和公司信息。',
      },
    },
  ],
};
