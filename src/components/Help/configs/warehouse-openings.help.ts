import type { HelpConfig } from '../HelpButton';

export const warehouseOpeningsHelp: HelpConfig = {
  title: { es: 'Guía de Aperturas de Almacén', en: 'Warehouse Openings Guide' },
  description: {
    es: 'Registra el inventario inicial de tu almacén',
    en: 'Register the initial inventory of your warehouse',
  },
  sections: [
    {
      icon: '📦',
      title: { es: '¿Qué es una apertura?', en: 'What is an opening?' },
      content: {
        es: 'Una apertura es el registro de un producto con su cantidad y precio inicial en el almacén. Es el punto de partida del inventario.\n\nAntes de cerrar el almacén, debes registrar todos los productos que tiene físicamente.',
        en: 'An opening is the record of a product with its initial quantity and price in the warehouse. It is the starting point of inventory.\n\nBefore closing the warehouse, you must register all products it physically has.',
      },
    },
    {
      icon: '💰',
      title: { es: 'Precio de apertura', en: 'Opening price' },
      content: {
        es: 'El precio que registras en la apertura es el costo de adquisición del producto. Este precio se usa para calcular el costo promedio del inventario.\n\nSi el producto tiene estrategia FIFO o FEFO, el precio de apertura se usa como costo del primer lote.',
        en: 'The price you register in the opening is the acquisition cost of the product. This price is used to calculate the average inventory cost.\n\nIf the product has FIFO or FEFO strategy, the opening price is used as the cost of the first batch.',
      },
    },
    {
      icon: '🔒',
      title: { es: 'Cierre del almacén', en: 'Warehouse closing' },
      content: {
        es: 'Al cerrar el almacén desde esta vista, todos los productos registrados en las aperturas se transfieren al inventario general.\n\nEste proceso es irreversible. Una vez cerrado, el almacén no acepta nuevas aperturas.',
        en: 'When closing the warehouse from this view, all products registered in the openings are transferred to the general inventory.\n\nThis process is irreversible. Once closed, the warehouse does not accept new openings.',
      },
    },
  ],
};
