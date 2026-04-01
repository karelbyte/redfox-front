import type { HelpConfig } from '../HelpButton';

export const warehousesHelp: HelpConfig = {
  title: { es: 'Guía de Almacenes', en: 'Warehouses Guide' },
  description: {
    es: 'Gestiona los almacenes donde guardas tu inventario',
    en: 'Manage the warehouses where you store your inventory',
  },
  sections: [
    {
      icon: '🏭',
      title: { es: '¿Qué es un almacén?', en: 'What is a warehouse?' },
      content: {
        es: 'Un almacén es el lugar físico donde guardas tu inventario. Cada almacén tiene su propio stock independiente.\n\nPuedes tener múltiples almacenes: tienda principal, bodega, sucursal, etc. Cada uno puede tener su propia moneda.',
        en: 'A warehouse is the physical location where you store your inventory. Each warehouse has its own independent stock.\n\nYou can have multiple warehouses: main store, warehouse, branch, etc. Each can have its own currency.',
      },
    },
    {
      icon: '🔓',
      title: { es: 'Abrir y cerrar almacén', en: 'Open and close warehouse' },
      content: {
        es: 'Un almacén puede estar abierto o cerrado:\n\n• Abierto: acepta recepciones, ventas y ajustes de inventario\n• Cerrado: no acepta movimientos nuevos\n\nAl cerrar un almacén, todos los productos registrados en las aperturas se transfieren automáticamente al inventario general.',
        en: 'A warehouse can be open or closed:\n\n• Open: accepts receptions, sales and inventory adjustments\n• Closed: does not accept new movements\n\nWhen closing a warehouse, all products registered in the openings are automatically transferred to the general inventory.',
      },
    },
    {
      icon: '📋',
      title: { es: 'Aperturas de almacén', en: 'Warehouse openings' },
      content: {
        es: 'Las aperturas son el inventario inicial de un almacén. Antes de cerrar el almacén, debes registrar todos los productos con sus cantidades y precios.\n\nAl cerrar, estos productos pasan al inventario y quedan disponibles para ventas y ajustes.',
        en: 'Openings are the initial inventory of a warehouse. Before closing the warehouse, you must register all products with their quantities and prices.\n\nWhen closing, these products go to inventory and become available for sales and adjustments.',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar almacenes', en: 'Delete warehouses' },
      content: {
        es: 'Solo puedes eliminar un almacén si está abierto (sin inventario activo). Un almacén cerrado con inventario no puede eliminarse.\n\nSi ya no usas un almacén, ciérralo y deja de asignarle recepciones.',
        en: 'You can only delete a warehouse if it is open (without active inventory). A closed warehouse with inventory cannot be deleted.\n\nIf you no longer use a warehouse, close it and stop assigning receptions to it.',
      },
    },
  ],
};
