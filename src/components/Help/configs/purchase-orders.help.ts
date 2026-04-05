import type { HelpConfig } from '../HelpButton';

export const purchaseOrdersHelp: HelpConfig = {
  title: { es: 'Guía de Órdenes de Compra', en: 'Purchase Orders Guide', zh: '采购订单指南' },
  description: {
    es: 'Gestiona tus compras a proveedores con flujo de aprobación',
    en: 'Manage your purchases from providers with approval workflow',
    zh: '通过审批流程管理向供应商的采购',
  },
  sections: [
    {
      icon: '🛒',
      title: { es: '¿Qué es una orden de compra?', en: 'What is a purchase order?', zh: '什么是采购订单？' },
      content: {
        es: 'Una orden de compra es un documento formal que le envías a un proveedor para solicitar productos. Incluye los productos, cantidades, precios y fecha de entrega esperada.\n\nLas órdenes de compra tienen un flujo de aprobación antes de ser enviadas al proveedor.',
        en: 'A purchase order is a formal document you send to a provider to request products. It includes products, quantities, prices and expected delivery date.\n\nPurchase orders have an approval workflow before being sent to the provider.',
        zh: '采购订单是您发送给供应商以请求产品的正式文件。包含产品、数量、价格和预期交货日期。\n\n采购订单在发送给供应商之前需要经过审批流程。',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Flujo de aprobación', en: 'Approval workflow', zh: '审批流程' },
      content: {
        es: 'Las órdenes de compra pasan por estos estados:\n\n• Pendiente: recién creada, esperando aprobación\n• Aprobada: autorizada para enviar al proveedor\n• Rechazada: no autorizada, requiere correcciones\n• Cancelada: cancelada antes de ser procesada\n\nSolo las órdenes Pendientes pueden editarse o eliminarse.',
        en: 'Purchase orders go through these statuses:\n\n• Pending: just created, awaiting approval\n• Approved: authorized to send to provider\n• Rejected: not authorized, requires corrections\n• Cancelled: cancelled before being processed\n\nOnly Pending orders can be edited or deleted.',
        zh: '采购订单经历以下状态：\n\n• 待审批：刚创建，等待审批\n• 已批准：已授权发送给供应商\n• 已拒绝：未获授权，需要修正\n• 已取消：在处理前取消\n\n只有待审批的订单可以编辑或删除。',
      },
    },
    {
      icon: '📦',
      title: { es: 'Agregar productos', en: 'Add products', zh: '添加产品' },
      content: {
        es: 'Desde el detalle de la orden puedes agregar los productos que quieres comprar con:\n\n• Producto: selecciona del catálogo\n• Cantidad solicitada: cuántas unidades pides\n• Precio unitario: precio acordado con el proveedor\n\nEl monto total se calcula automáticamente.',
        en: 'From the order detail you can add the products you want to purchase with:\n\n• Product: select from catalog\n• Requested quantity: how many units you order\n• Unit price: price agreed with the provider\n\nThe total amount is calculated automatically.',
        zh: '在订单详情页，您可以添加要采购的产品：\n\n• 产品：从目录中选择\n• 请求数量：订购的单位数量\n• 单价：与供应商商定的价格\n\n总金额自动计算。',
      },
    },
    {
      icon: '✅',
      title: { es: 'Aprobar y recibir', en: 'Approve and receive', zh: '审批与收货' },
      content: {
        es: 'Al aprobar una orden:\n• Queda lista para ser enviada al proveedor\n• Puedes registrar la cantidad recibida cuando llegue la mercancía\n\nCuando el proveedor entrega los productos, crea una Recepción vinculada a la orden para actualizar el inventario.',
        en: 'When approving an order:\n• It is ready to be sent to the provider\n• You can record the received quantity when merchandise arrives\n\nWhen the provider delivers the products, create a Reception linked to the order to update inventory.',
        zh: '审批订单时：\n• 订单准备好发送给供应商\n• 货物到达时可以登记收到的数量\n\n当供应商交付产品时，创建与订单关联的收货单以更新库存。',
      },
    },
    {
      icon: '📄',
      title: { es: 'PDF de orden de compra', en: 'Purchase order PDF', zh: '采购订单PDF' },
      content: {
        es: 'Puedes generar un PDF de la orden de compra para enviar al proveedor. Incluye todos los productos, cantidades, precios y el total.\n\nEl PDF incluye los datos de tu empresa si están configurados en Configuración → Generales de Empresa.',
        en: 'You can generate a PDF of the purchase order to send to the provider. It includes all products, quantities, prices and the total.\n\nThe PDF includes your company data if configured in Settings → Company General.',
        zh: '您可以生成采购订单的PDF发送给供应商。包含所有产品、数量、价格和总计。\n\n如果在设置→公司基本信息中已配置，PDF将包含公司信息。',
      },
    },
  ],
};
