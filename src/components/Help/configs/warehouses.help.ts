import type { HelpConfig } from '../HelpButton';

export const warehousesHelp: HelpConfig = {
  title: { es: 'Guía de Almacenes', en: 'Warehouses Guide', zh: '仓库指南' },
  description: {
    es: 'Gestiona los almacenes donde guardas tu inventario',
    en: 'Manage the warehouses where you store your inventory',
    zh: '管理存放库存的仓库',
  },
  sections: [
    {
      icon: '🏭',
      title: { es: '¿Qué es un almacén?', en: 'What is a warehouse?', zh: '什么是仓库？' },
      content: {
        es: 'Un almacén es el lugar físico donde guardas tu inventario. Cada almacén tiene su propio stock independiente.\n\nPuedes tener múltiples almacenes: tienda principal, bodega, sucursal, etc. Cada uno puede tener su propia moneda.',
        en: 'A warehouse is the physical location where you store your inventory. Each warehouse has its own independent stock.\n\nYou can have multiple warehouses: main store, warehouse, branch, etc. Each can have its own currency.',
        zh: '仓库是存放库存的实体场所。每个仓库都有独立的库存。\n\n您可以拥有多个仓库：主店、储仓、分店等。每个仓库可以有自己的货币。',
      },
    },
    {
      icon: '🔓',
      title: { es: 'Abrir y cerrar almacén', en: 'Open and close warehouse', zh: '开放与关闭仓库' },
      content: {
        es: 'Un almacén puede estar abierto o cerrado:\n\n• Abierto: acepta recepciones, ventas y ajustes de inventario\n• Cerrado: no acepta movimientos nuevos\n\nAl cerrar un almacén, todos los productos registrados en las aperturas se transfieren automáticamente al inventario general.',
        en: 'A warehouse can be open or closed:\n\n• Open: accepts receptions, sales and inventory adjustments\n• Closed: does not accept new movements\n\nWhen closing a warehouse, all products registered in the openings are automatically transferred to the general inventory.',
        zh: '仓库可以处于开放或关闭状态：\n\n• 开放：接受收货、销售和库存调拨\n• 关闭：不接受新的流水\n\n关闭仓库时，所有在开仓中登记的产品自动转入总库存。',
      },
    },
    {
      icon: '📋',
      title: { es: 'Aperturas de almacén', en: 'Warehouse openings', zh: '仓库开仓' },
      content: {
        es: 'Las aperturas son el inventario inicial de un almacén. Antes de cerrar el almacén, debes registrar todos los productos con sus cantidades y precios.\n\nAl cerrar, estos productos pasan al inventario y quedan disponibles para ventas y ajustes.',
        en: 'Openings are the initial inventory of a warehouse. Before closing the warehouse, you must register all products with their quantities and prices.\n\nWhen closing, these products go to inventory and become available for sales and adjustments.',
        zh: '开仓是仓库的初始库存。关闭仓库前，必须登记所有产品及其数量和价格。\n\n关闭时，这些产品进入库存，可用于销售和调拨。',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar almacenes', en: 'Delete warehouses', zh: '删除仓库' },
      content: {
        es: 'Solo puedes eliminar un almacén si está abierto (sin inventario activo). Un almacén cerrado con inventario no puede eliminarse.\n\nSi ya no usas un almacén, ciérralo y deja de asignarle recepciones.',
        en: 'You can only delete a warehouse if it is open (without active inventory). A closed warehouse with inventory cannot be deleted.\n\nIf you no longer use a warehouse, close it and stop assigning receptions to it.',
        zh: '只有在仓库处于开放状态（无活跃库存）时才能删除。有库存的已关闭仓库无法删除。\n\n如果不再使用某个仓库，请关闭它并停止向其分配收货单。',
      },
    },
  ],
};
