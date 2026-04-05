import type { HelpConfig } from '../HelpButton';

export const inventoryHelp: HelpConfig = {
  title: { es: 'Guía de Inventario', en: 'Inventory Guide', zh: '库存指南' },
  description: {
    es: 'Consulta el stock actual de tus almacenes cerrados',
    en: 'Check the current stock of your closed warehouses',
    zh: '查看已关闭仓库的当前库存',
  },
  sections: [
    {
      icon: '📦',
      title: { es: '¿Qué es el inventario?', en: 'What is inventory?', zh: '什么是库存？' },
      content: {
        es: 'El inventario muestra el stock actual de productos en un almacén cerrado. Cada fila representa un lote de producto con su cantidad, precio de costo y fecha de entrada.\n\nSi un producto tiene estrategia FIFO o FEFO, puede aparecer varias veces con diferentes lotes.',
        en: 'Inventory shows the current stock of products in a closed warehouse. Each row represents a product batch with its quantity, cost price and entry date.\n\nIf a product has FIFO or FEFO strategy, it may appear multiple times with different batches.',
        zh: '库存显示已关闭仓库中产品的当前库存。每行代表一个产品批次，包含数量、成本价和入库日期。\n\n如果产品采用FIFO或FEFO策略，可能会以不同批次多次出现。',
      },
    },
    {
      icon: '🏭',
      title: { es: 'Seleccionar almacén', en: 'Select warehouse', zh: '选择仓库' },
      content: {
        es: 'Solo se muestran almacenes cerrados porque son los que tienen inventario consolidado. Un almacén abierto aún está en proceso de apertura.\n\nSi no ves ningún almacén, ve a Almacenes → Lista de Almacenes y cierra uno.',
        en: 'Only closed warehouses are shown because they have consolidated inventory. An open warehouse is still in the opening process.\n\nIf you see no warehouses, go to Warehouses → Warehouse List and close one.',
        zh: '只显示已关闭的仓库，因为它们拥有已整合的库存。开放中的仓库仍处于开仓流程中。\n\n如果没有看到任何仓库，请前往仓库→仓库列表并关闭一个仓库。',
      },
    },
    {
      icon: '🏷️',
      title: { es: 'Lote y fecha de caducidad', en: 'Batch and expiration date', zh: '批次与到期日' },
      content: {
        es: 'Si el producto usa FIFO o FEFO, cada entrada de inventario tiene:\n\n• Número de lote: identifica el grupo de productos recibidos juntos\n• Fecha de caducidad: cuándo vence ese lote\n\nAl vender, el sistema descuenta automáticamente del lote más antiguo (FIFO) o del que caduca primero (FEFO).',
        en: 'If the product uses FIFO or FEFO, each inventory entry has:\n\n• Batch number: identifies the group of products received together\n• Expiration date: when that batch expires\n\nWhen selling, the system automatically deducts from the oldest batch (FIFO) or the one that expires first (FEFO).',
        zh: '如果产品采用FIFO或FEFO策略，每条库存记录包含：\n\n• 批次号：标识同批次收到的产品组\n• 到期日：该批次的过期时间\n\n销售时，系统自动从最旧的批次（FIFO）或最先到期的批次（FEFO）中扣减。',
      },
    },
    {
      icon: '👁️',
      title: { es: 'Ver detalles del producto', en: 'View product details', zh: '查看产品详情' },
      content: {
        es: 'El botón de ojo abre un modal con la información completa del producto: nombre, SKU, marca, categoría, precio, impuestos y unidad de medida.',
        en: 'The eye button opens a modal with the complete product information: name, SKU, brand, category, price, taxes and measurement unit.',
        zh: '眼睛按钮打开一个弹窗，显示产品的完整信息：名称、SKU、品牌、类别、价格、税费和计量单位。',
      },
    },
    {
      icon: '📊',
      title: { es: 'Historial de movimientos', en: 'Movement history', zh: '流水历史' },
      content: {
        es: 'El botón de reloj te lleva al historial de movimientos del producto en ese almacén. Puedes ver todas las entradas (recepciones, aperturas) y salidas (ventas, ajustes, devoluciones) con fecha y cantidad.',
        en: 'The clock button takes you to the product movement history in that warehouse. You can see all entries (receptions, openings) and exits (sales, adjustments, returns) with date and quantity.',
        zh: '时钟按钮带您查看该仓库中产品的流水历史。您可以查看所有入库（收货、开仓）和出库（销售、调拨、退货）记录，包含日期和数量。',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Sincronizar con Pack', en: 'Sync with Pack', zh: '与证书包同步' },
      content: {
        es: 'El botón de sincronización actualiza el producto en tu proveedor de facturación (Factura Green u otro). Útil cuando el producto fue creado antes de configurar el Pack o cuando hubo un error de sincronización.',
        en: 'The sync button updates the product in your billing provider (Factura Green or other). Useful when the product was created before configuring the Pack or when there was a sync error.',
        zh: '同步按钮在您的开票服务商（Factura Green或其他）中更新产品。当产品在配置证书包之前创建或发生同步错误时非常有用。',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Selector de columnas', en: 'Column selector', zh: '列选择器' },
      content: {
        es: 'Usa el selector de columnas para mostrar u ocultar columnas según lo que necesites ver. Las columnas de lote y fecha de caducidad son especialmente útiles para productos con FIFO/FEFO.',
        en: 'Use the column selector to show or hide columns based on what you need to see. The batch and expiration date columns are especially useful for products with FIFO/FEFO.',
        zh: '使用列选择器根据需要显示或隐藏列。批次和到期日列对于采用FIFO/FEFO的产品特别有用。',
      },
    },
  ],
};
