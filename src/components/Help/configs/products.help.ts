import type { HelpConfig } from '../HelpButton';

export const productsHelp: HelpConfig = {
  title: {
    es: 'Guía de Productos',
    en: 'Products Guide',
    zh: '产品指南',
  },
  description: {
    es: 'Todo lo que necesitas saber para gestionar tu catálogo',
    en: 'Everything you need to know to manage your catalog',
    zh: '管理产品目录所需了解的一切',
  },
  sections: [
    {
      icon: '📦',
      title: { es: '¿Qué es un producto?', en: 'What is a product?', zh: '什么是产品？' },
      content: {
        es: 'Un producto es cualquier artículo o servicio que vendes o compras. Puede ser:\n\n• Tangible: tiene existencia física y se controla en inventario (ej. Vitamina B, Laptop)\n• Servicio: no tiene stock, se vende ilimitadamente (ej. Consultoría, Instalación)\n• Digital: igual que servicio pero para bienes digitales (ej. Licencia de software)',
        en: 'A product is any item or service you sell or purchase. It can be:\n\n• Tangible: has physical existence and is tracked in inventory (e.g. Vitamin B, Laptop)\n• Service: has no stock, sold unlimitedly (e.g. Consulting, Installation)\n• Digital: same as service but for digital goods (e.g. Software license)',
        zh: '产品是您销售或购买的任何商品或服务。可以是：\n\n• 实物：有实体存在，在库存中跟踪（例如维生素B、笔记本电脑）\n• 服务：无库存，可无限销售（例如咨询、安装）\n• 数字：与服务相同，但用于数字商品（例如软件许可证）',
      },
    },
    {
      icon: '🏷️',
      title: { es: 'Código, SKU y Código de barras', en: 'Code, SKU and Barcode', zh: '代码、SKU和条形码' },
      content: {
        es: 'Código: identificador interno generado automáticamente. Puedes aceptar el sugerido o escribir el tuyo.\n\nSKU: tu referencia interna para identificar el producto. Debe ser único.\n\nCódigo de barras: el código EAN/UPC del producto. Se usa para búsqueda rápida en el POS y para imprimir etiquetas.',
        en: 'Code: internal identifier generated automatically. You can accept the suggested one or type your own.\n\nSKU: your internal reference to identify the product. Must be unique.\n\nBarcode: the EAN/UPC code of the product. Used for quick search in POS and to print labels.',
        zh: '代码：自动生成的内部标识符。您可以接受建议的代码或自行输入。\n\nSKU：用于识别产品的内部参考编号。必须唯一。\n\n条形码：产品的EAN/UPC代码。用于POS中的快速搜索和打印标签。',
      },
    },
    {
      icon: '📊',
      title: { es: 'Estrategia de inventario', en: 'Inventory strategy', zh: '库存策略' },
      content: {
        es: 'Define cómo se calcula el costo y se descuenta el stock al vender:\n\n• FIFO (Primero en entrar, primero en salir): se vende el lote más antiguo primero. Ideal para productos con fecha de caducidad.\n\n• FEFO (Primero en vencer, primero en salir): prioriza el lote que caduca antes. Recomendado para alimentos y medicamentos.\n\n• Promedio ponderado: el costo se recalcula con cada entrada. Más simple, ideal para productos sin caducidad.',
        en: 'Defines how cost is calculated and stock is deducted when selling:\n\n• FIFO (First In, First Out): the oldest batch is sold first. Ideal for products with expiration dates.\n\n• FEFO (First Expired, First Out): prioritizes the batch that expires soonest. Recommended for food and medicine.\n\n• Weighted average: cost is recalculated with each entry. Simpler, ideal for products without expiration.',
        zh: '定义销售时如何计算成本和扣减库存：\n\n• FIFO（先进先出）：最旧的批次最先销售。适合有到期日的产品。\n\n• FEFO（先到期先出）：优先处理最先到期的批次。推荐用于食品和药品。\n\n• 加权平均：每次入库时重新计算成本。更简单，适合无到期日的产品。',
      },
    },
    {
      icon: '💰',
      title: { es: 'Precios', en: 'Prices', zh: '价格' },
      content: {
        es: 'Precio base: el precio de venta estándar del producto.\n\nListas de precios: puedes crear precios adicionales con nombre personalizado (ej. "Precio mayoreo", "Precio VIP"). Al cotizar o vender puedes elegir qué lista aplicar.\n\nImpuestos: asigna uno o varios impuestos al producto (ej. IVA 16%). Se calculan automáticamente en ventas y facturas.',
        en: 'Base price: the standard selling price of the product.\n\nPrice lists: you can create additional prices with custom names (e.g. "Wholesale price", "VIP price"). When quoting or selling you can choose which list to apply.\n\nTaxes: assign one or more taxes to the product (e.g. VAT 16%). They are calculated automatically in sales and invoices.',
        zh: '基础价格：产品的标准销售价格。\n\n价格列表：您可以创建带有自定义名称的附加价格（例如"批发价"、"VIP价格"）。报价或销售时可以选择应用哪个价格列表。\n\n税费：为产品分配一个或多个税费（例如增值税16%）。在销售和发票中自动计算。',
      },
    },
    {
      icon: '⚠️',
      title: { es: 'Stock mínimo', en: 'Minimum stock', zh: '最低库存' },
      content: {
        es: 'Define la cantidad mínima que debe haber en inventario. Cuando el stock baje de ese nivel, el sistema te enviará una notificación de alerta en el ícono de campana.\n\nSolo aplica para productos tangibles.',
        en: 'Defines the minimum quantity that must be in inventory. When stock drops below that level, the system will send you an alert notification in the bell icon.\n\nOnly applies to tangible products.',
        zh: '定义库存中必须保持的最低数量。当库存低于该水平时，系统将通过铃铛图标发送预警通知。\n\n仅适用于实物产品。',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Búsqueda y filtros', en: 'Search and filters', zh: '搜索与筛选' },
      content: {
        es: 'Puedes buscar productos por nombre, SKU, código o código de barras.\n\nUsa los filtros avanzados para filtrar por estado (activo/inactivo) o tipo de producto.\n\nEl selector de columnas te permite mostrar u ocultar columnas de la tabla según tus preferencias.',
        en: 'You can search products by name, SKU, code or barcode.\n\nUse advanced filters to filter by status (active/inactive) or product type.\n\nThe column selector lets you show or hide table columns according to your preferences.',
        zh: '您可以按名称、SKU、代码或条形码搜索产品。\n\n使用高级筛选按状态（活跃/非活跃）或产品类型筛选。\n\n列选择器允许您根据偏好显示或隐藏表格列。',
      },
    },
    {
      icon: '📥',
      title: { es: 'Importar desde Pack', en: 'Import from Pack', zh: '从证书包导入' },
      content: {
        es: 'Si tienes productos registrados en tu proveedor de facturación (Factura Green u otro), puedes importarlos directamente con el botón "Importar desde Pack".\n\nEl sistema creará los productos que no existan y actualizará los que ya estén registrados.',
        en: 'If you have products registered in your billing provider (Factura Green or other), you can import them directly with the "Import from Pack" button.\n\nThe system will create products that don\'t exist and update those already registered.',
        zh: '如果您在开票服务商（Factura Green或其他）中注册了产品，可以使用"从证书包导入"按钮直接导入。\n\n系统将创建不存在的产品并更新已注册的产品。',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar productos', en: 'Delete products', zh: '删除产品' },
      content: {
        es: 'Un producto solo puede eliminarse si no tiene movimientos de inventario, ventas, recepciones, facturas u órdenes de compra asociadas.\n\nSi el producto tiene historial, considera desactivarlo en lugar de eliminarlo.',
        en: 'A product can only be deleted if it has no inventory movements, sales, receptions, invoices or purchase orders associated.\n\nIf the product has history, consider deactivating it instead of deleting it.',
        zh: '只有在没有关联的库存流水、销售、收货、发票或采购订单的情况下，才能删除产品。\n\n如果产品有历史记录，建议停用而非删除。',
      },
    },
  ],
};
