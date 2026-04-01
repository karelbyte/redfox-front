import type { HelpConfig } from '../HelpButton';

export const productsHelp: HelpConfig = {
  title: {
    es: 'Guía de Productos',
    en: 'Products Guide',
  },
  description: {
    es: 'Todo lo que necesitas saber para gestionar tu catálogo',
    en: 'Everything you need to know to manage your catalog',
  },
  sections: [
    {
      icon: '📦',
      title: { es: '¿Qué es un producto?', en: 'What is a product?' },
      content: {
        es: 'Un producto es cualquier artículo o servicio que vendes o compras. Puede ser:\n\n• Tangible: tiene existencia física y se controla en inventario (ej. Vitamina B, Laptop)\n• Servicio: no tiene stock, se vende ilimitadamente (ej. Consultoría, Instalación)\n• Digital: igual que servicio pero para bienes digitales (ej. Licencia de software)',
        en: 'A product is any item or service you sell or purchase. It can be:\n\n• Tangible: has physical existence and is tracked in inventory (e.g. Vitamin B, Laptop)\n• Service: has no stock, sold unlimitedly (e.g. Consulting, Installation)\n• Digital: same as service but for digital goods (e.g. Software license)',
      },
    },
    {
      icon: '🏷️',
      title: { es: 'Código, SKU y Código de barras', en: 'Code, SKU and Barcode' },
      content: {
        es: 'Código: identificador interno generado automáticamente. Puedes aceptar el sugerido o escribir el tuyo.\n\nSKU: tu referencia interna para identificar el producto. Debe ser único.\n\nCódigo de barras: el código EAN/UPC del producto. Se usa para búsqueda rápida en el POS y para imprimir etiquetas.',
        en: 'Code: internal identifier generated automatically. You can accept the suggested one or type your own.\n\nSKU: your internal reference to identify the product. Must be unique.\n\nBarcode: the EAN/UPC code of the product. Used for quick search in POS and to print labels.',
      },
    },
    {
      icon: '📊',
      title: { es: 'Estrategia de inventario', en: 'Inventory strategy' },
      content: {
        es: 'Define cómo se calcula el costo y se descuenta el stock al vender:\n\n• FIFO (Primero en entrar, primero en salir): se vende el lote más antiguo primero. Ideal para productos con fecha de caducidad.\n\n• FEFO (Primero en vencer, primero en salir): prioriza el lote que caduca antes. Recomendado para alimentos y medicamentos.\n\n• Promedio ponderado: el costo se recalcula con cada entrada. Más simple, ideal para productos sin caducidad.',
        en: 'Defines how cost is calculated and stock is deducted when selling:\n\n• FIFO (First In, First Out): the oldest batch is sold first. Ideal for products with expiration dates.\n\n• FEFO (First Expired, First Out): prioritizes the batch that expires soonest. Recommended for food and medicine.\n\n• Weighted average: cost is recalculated with each entry. Simpler, ideal for products without expiration.',
      },
    },
    {
      icon: '💰',
      title: { es: 'Precios', en: 'Prices' },
      content: {
        es: 'Precio base: el precio de venta estándar del producto.\n\nListas de precios: puedes crear precios adicionales con nombre personalizado (ej. "Precio mayoreo", "Precio VIP"). Al cotizar o vender puedes elegir qué lista aplicar.\n\nImpuestos: asigna uno o varios impuestos al producto (ej. IVA 16%). Se calculan automáticamente en ventas y facturas.',
        en: 'Base price: the standard selling price of the product.\n\nPrice lists: you can create additional prices with custom names (e.g. "Wholesale price", "VIP price"). When quoting or selling you can choose which list to apply.\n\nTaxes: assign one or more taxes to the product (e.g. VAT 16%). They are calculated automatically in sales and invoices.',
      },
    },
    {
      icon: '⚠️',
      title: { es: 'Stock mínimo', en: 'Minimum stock' },
      content: {
        es: 'Define la cantidad mínima que debe haber en inventario. Cuando el stock baje de ese nivel, el sistema te enviará una notificación de alerta en el ícono de campana.\n\nSolo aplica para productos tangibles.',
        en: 'Defines the minimum quantity that must be in inventory. When stock drops below that level, the system will send you an alert notification in the bell icon.\n\nOnly applies to tangible products.',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Búsqueda y filtros', en: 'Search and filters' },
      content: {
        es: 'Puedes buscar productos por nombre, SKU, código o código de barras.\n\nUsa los filtros avanzados para filtrar por estado (activo/inactivo) o tipo de producto.\n\nEl selector de columnas te permite mostrar u ocultar columnas de la tabla según tus preferencias.',
        en: 'You can search products by name, SKU, code or barcode.\n\nUse advanced filters to filter by status (active/inactive) or product type.\n\nThe column selector lets you show or hide table columns according to your preferences.',
      },
    },
    {
      icon: '📥',
      title: { es: 'Importar desde Pack', en: 'Import from Pack' },
      content: {
        es: 'Si tienes productos registrados en tu proveedor de facturación (Factura Green u otro), puedes importarlos directamente con el botón "Importar desde Pack".\n\nEl sistema creará los productos que no existan y actualizará los que ya estén registrados.',
        en: 'If you have products registered in your billing provider (Factura Green or other), you can import them directly with the "Import from Pack" button.\n\nThe system will create products that don\'t exist and update those already registered.',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar productos', en: 'Delete products' },
      content: {
        es: 'Un producto solo puede eliminarse si no tiene movimientos de inventario, ventas, recepciones, facturas u órdenes de compra asociadas.\n\nSi el producto tiene historial, considera desactivarlo en lugar de eliminarlo.',
        en: 'A product can only be deleted if it has no inventory movements, sales, receptions, invoices or purchase orders associated.\n\nIf the product has history, consider deactivating it instead of deleting it.',
      },
    },
  ],
};
