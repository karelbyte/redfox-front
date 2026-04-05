import type { HelpConfig } from '../HelpButton';

export const posHelp: HelpConfig = {
  title: { es: 'Guía del Punto de Venta (POS)', en: 'Point of Sale (POS) Guide', zh: '销售点（POS）指南' },
  description: {
    es: 'Todo lo que necesitas saber para operar el POS',
    en: 'Everything you need to know to operate the POS',
    zh: '操作POS所需了解的一切',
  },
  sections: [
    {
      icon: '🛒',
      title: { es: 'Agregar productos al carrito', en: 'Add products to cart', zh: '将产品添加到购物车' },
      content: {
        es: 'En el panel derecho verás la grilla de productos disponibles en inventario. Haz clic en cualquier producto para agregarlo al carrito.\n\nPuedes buscar por nombre, SKU o código de barras usando el buscador. Si un producto tiene múltiples lotes (FIFO/FEFO), verás cada lote como una tarjeta separada con su fecha de caducidad.',
        en: 'On the right panel you will see the grid of products available in inventory. Click on any product to add it to the cart.\n\nYou can search by name, SKU or barcode using the search bar. If a product has multiple batches (FIFO/FEFO), you will see each batch as a separate card with its expiration date.',
        zh: '在右侧面板中，您将看到库存中可用产品的网格。点击任意产品将其添加到购物车。\n\n您可以使用搜索栏按名称、SKU或条形码搜索。如果产品有多个批次（FIFO/FEFO），每个批次将显示为带有到期日的独立卡片。',
      },
    },
    {
      icon: '✏️',
      title: { es: 'Editar cantidad y precio', en: 'Edit quantity and price', zh: '编辑数量和价格' },
      content: {
        es: 'En el carrito puedes modificar:\n\n• Cantidad: escribe directamente en el campo o usa los botones + y −\n• Precio: puedes cambiar el precio unitario si tienes permiso\n\nEl total se recalcula automáticamente al modificar cualquier valor.',
        en: 'In the cart you can modify:\n\n• Quantity: type directly in the field or use the + and − buttons\n• Price: you can change the unit price if you have permission\n\nThe total is automatically recalculated when any value is modified.',
        zh: '在购物车中您可以修改：\n\n• 数量：直接在字段中输入或使用+和−按钮\n• 价格：如果有权限，可以更改单价\n\n修改任何值后总价自动重新计算。',
      },
    },
    {
      icon: '👤',
      title: { es: 'Seleccionar cliente', en: 'Select client', zh: '选择客户' },
      content: {
        es: 'Debes seleccionar un cliente antes de procesar el pago. Usa el selector en la parte superior del carrito.\n\nSi el cliente no existe, haz clic en el botón "+" para crearlo directamente desde el POS sin salir de la pantalla.\n\nEl carrito y el cliente seleccionado se guardan automáticamente — si cierras el navegador y vuelves, el carrito estará intacto.',
        en: 'You must select a client before processing payment. Use the selector at the top of the cart.\n\nIf the client does not exist, click the "+" button to create them directly from the POS without leaving the screen.\n\nThe cart and selected client are automatically saved — if you close the browser and return, the cart will be intact.',
        zh: '处理付款前必须选择客户。使用购物车顶部的选择器。\n\n如果客户不存在，点击"+"按钮直接在POS中创建，无需离开当前页面。\n\n购物车和所选客户会自动保存——关闭浏览器后再返回，购物车内容仍然完整。',
      },
    },
    {
      icon: '💳',
      title: { es: 'Métodos de pago', en: 'Payment methods', zh: '付款方式' },
      content: {
        es: 'Al confirmar el pago, puedes elegir entre:\n\n• Efectivo: ingresa el monto recibido y el sistema calcula el cambio automáticamente\n• Tarjeta: para pagos con tarjeta de crédito o débito\n• Crédito: solo disponible si el cliente tiene una línea de crédito activa. Genera automáticamente una cuenta por cobrar\n\nLas ventas en efectivo y tarjeta se registran en la caja activa.',
        en: 'When confirming payment, you can choose between:\n\n• Cash: enter the amount received and the system automatically calculates the change\n• Card: for credit or debit card payments\n• Credit: only available if the client has an active credit line. Automatically generates an account receivable\n\nCash and card sales are recorded in the active cash register.',
        zh: '确认付款时，您可以选择：\n\n• 现金：输入收到的金额，系统自动计算找零\n• 刷卡：用于信用卡或借记卡付款\n• 赊账：仅在客户有活跃信用额度时可用。自动生成应收账款\n\n现金和刷卡销售记录在当前收银机中。',
      },
    },
    {
      icon: '🧾',
      title: { es: 'Factura fiscal (CFDI)', en: 'Fiscal invoice (CFDI)', zh: '税务发票（CFDI）' },
      content: {
        es: 'Si el cliente tiene datos fiscales (RFC) y está sincronizado con tu proveedor de facturación, aparecerá la opción "Generar factura fiscal" en el modal de pago.\n\nAl activarla, después de procesar la venta se genera automáticamente el CFDI y se envía al SAT.\n\nSi la facturación falla, la venta queda guardada y puedes generar la factura manualmente desde el módulo de facturas.',
        en: 'If the client has tax data (RFC) and is synced with your billing provider, the "Generate fiscal invoice" option will appear in the payment modal.\n\nWhen activated, after processing the sale the CFDI is automatically generated and sent to the SAT.\n\nIf billing fails, the sale is saved and you can generate the invoice manually from the invoices module.',
        zh: '如果客户有税务信息（RFC）并与开票服务商同步，付款弹窗中将出现"生成税务发票"选项。\n\n启用后，销售处理完成后CFDI将自动生成并发送至SAT。\n\n如果开票失败，销售记录已保存，您可以从发票模块手动生成发票。',
      },
    },
    {
      icon: '🖨️',
      title: { es: 'Ticket de venta', en: 'Sale ticket', zh: '销售收据' },
      content: {
        es: 'Al confirmar el pago, el sistema genera e imprime automáticamente un ticket con:\n\n• Datos de la empresa (logo, nombre, RFC)\n• Productos vendidos con cantidades y precios\n• Método de pago y cambio (si aplica)\n• Datos del cliente\n\nEl ticket se abre en una nueva ventana para imprimir. Si hay un error de impresión, la venta ya está guardada.',
        en: 'When confirming payment, the system automatically generates and prints a ticket with:\n\n• Company data (logo, name, RFC)\n• Products sold with quantities and prices\n• Payment method and change (if applicable)\n• Client data\n\nThe ticket opens in a new window for printing. If there is a printing error, the sale is already saved.',
        zh: '确认付款后，系统自动生成并打印收据，包含：\n\n• 公司信息（标志、名称、RFC）\n• 已售产品及数量和价格\n• 付款方式和找零（如适用）\n• 客户信息\n\n收据在新窗口中打开以供打印。如果打印出错，销售记录已保存。',
      },
    },
    {
      icon: '💰',
      title: { es: 'Caja registradora', en: 'Cash register', zh: '收银机' },
      content: {
        es: 'El botón "Balance de caja" muestra el estado actual de la caja activa.\n\nDesde ahí puedes:\n• Inicializar una nueva caja con el monto inicial\n• Registrar ajustes (entradas o salidas de efectivo)\n• Cerrar la caja al final del turno\n\nCada venta en efectivo o tarjeta se registra automáticamente en la caja activa. Las ventas a crédito no afectan el balance de caja.',
        en: 'The "Cash balance" button shows the current status of the active cash register.\n\nFrom there you can:\n• Initialize a new register with the initial amount\n• Record adjustments (cash in or out)\n• Close the register at the end of the shift\n\nEach cash or card sale is automatically recorded in the active register. Credit sales do not affect the cash balance.',
        zh: '"收银余额"按钮显示当前收银机的状态。\n\n在那里您可以：\n• 用初始金额初始化新收银机\n• 登记调整（现金入账或出账）\n• 在班次结束时关机\n\n每笔现金或刷卡销售自动记录在当前收银机中。赊销不影响收银余额。',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Carrito persistente', en: 'Persistent cart', zh: '持久购物车' },
      content: {
        es: 'El carrito del POS se guarda automáticamente en el navegador. Si cierras la pestaña o el navegador, al volver encontrarás el carrito con los mismos productos y cliente seleccionado.\n\nUsa el botón "Limpiar" para vaciar el carrito manualmente cuando quieras empezar una nueva venta desde cero.',
        en: 'The POS cart is automatically saved in the browser. If you close the tab or browser, when you return you will find the cart with the same products and selected client.\n\nUse the "Clear" button to manually empty the cart when you want to start a new sale from scratch.',
        zh: 'POS购物车自动保存在浏览器中。关闭标签页或浏览器后再返回，购物车中仍有相同的产品和所选客户。\n\n当您想从头开始新销售时，使用"清空"按钮手动清空购物车。',
      },
    },
  ],
};
