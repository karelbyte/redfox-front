import type { HelpConfig } from '../HelpButton';

export const inventoryHelp: HelpConfig = {
  title: { es: 'Guía de Inventario', en: 'Inventory Guide' },
  description: {
    es: 'Consulta el stock actual de tus almacenes cerrados',
    en: 'Check the current stock of your closed warehouses',
  },
  sections: [
    {
      icon: '📦',
      title: { es: '¿Qué es el inventario?', en: 'What is inventory?' },
      content: {
        es: 'El inventario muestra el stock actual de productos en un almacén cerrado. Cada fila representa un lote de producto con su cantidad, precio de costo y fecha de entrada.\n\nSi un producto tiene estrategia FIFO o FEFO, puede aparecer varias veces con diferentes lotes.',
        en: 'Inventory shows the current stock of products in a closed warehouse. Each row represents a product batch with its quantity, cost price and entry date.\n\nIf a product has FIFO or FEFO strategy, it may appear multiple times with different batches.',
      },
    },
    {
      icon: '🏭',
      title: { es: 'Seleccionar almacén', en: 'Select warehouse' },
      content: {
        es: 'Solo se muestran almacenes cerrados porque son los que tienen inventario consolidado. Un almacén abierto aún está en proceso de apertura.\n\nSi no ves ningún almacén, ve a Almacenes → Lista de Almacenes y cierra uno.',
        en: 'Only closed warehouses are shown because they have consolidated inventory. An open warehouse is still in the opening process.\n\nIf you see no warehouses, go to Warehouses → Warehouse List and close one.',
      },
    },
    {
      icon: '🏷️',
      title: { es: 'Lote y fecha de caducidad', en: 'Batch and expiration date' },
      content: {
        es: 'Si el producto usa FIFO o FEFO, cada entrada de inventario tiene:\n\n• Número de lote: identifica el grupo de productos recibidos juntos\n• Fecha de caducidad: cuándo vence ese lote\n\nAl vender, el sistema descuenta automáticamente del lote más antiguo (FIFO) o del que caduca primero (FEFO).',
        en: 'If the product uses FIFO or FEFO, each inventory entry has:\n\n• Batch number: identifies the group of products received together\n• Expiration date: when that batch expires\n\nWhen selling, the system automatically deducts from the oldest batch (FIFO) or the one that expires first (FEFO).',
      },
    },
    {
      icon: '👁️',
      title: { es: 'Ver detalles del producto', en: 'View product details' },
      content: {
        es: 'El botón de ojo abre un modal con la información completa del producto: nombre, SKU, marca, categoría, precio, impuestos y unidad de medida.',
        en: 'The eye button opens a modal with the complete product information: name, SKU, brand, category, price, taxes and measurement unit.',
      },
    },
    {
      icon: '📊',
      title: { es: 'Historial de movimientos', en: 'Movement history' },
      content: {
        es: 'El botón de reloj te lleva al historial de movimientos del producto en ese almacén. Puedes ver todas las entradas (recepciones, aperturas) y salidas (ventas, ajustes, devoluciones) con fecha y cantidad.',
        en: 'The clock button takes you to the product movement history in that warehouse. You can see all entries (receptions, openings) and exits (sales, adjustments, returns) with date and quantity.',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Sincronizar con Pack', en: 'Sync with Pack' },
      content: {
        es: 'El botón de sincronización actualiza el producto en tu proveedor de facturación (Factura Green u otro). Útil cuando el producto fue creado antes de configurar el Pack o cuando hubo un error de sincronización.',
        en: 'The sync button updates the product in your billing provider (Factura Green or other). Useful when the product was created before configuring the Pack or when there was a sync error.',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Selector de columnas', en: 'Column selector' },
      content: {
        es: 'Usa el selector de columnas para mostrar u ocultar columnas según lo que necesites ver. Las columnas de lote y fecha de caducidad son especialmente útiles para productos con FIFO/FEFO.',
        en: 'Use the column selector to show or hide columns based on what you need to see. The batch and expiration date columns are especially useful for products with FIFO/FEFO.',
      },
    },
  ],
};
