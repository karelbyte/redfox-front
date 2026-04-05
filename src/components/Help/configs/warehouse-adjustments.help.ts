import type { HelpConfig } from '../HelpButton';

export const warehouseAdjustmentsHelp: HelpConfig = {
  title: { es: 'Guía de Ajustes de Almacén', en: 'Warehouse Adjustments Guide', zh: '仓库调拨指南' },
  description: {
    es: 'Transfiere productos entre almacenes',
    en: 'Transfer products between warehouses',
    zh: '在仓库之间转移产品',
  },
  sections: [
    {
      icon: '🔄',
      title: { es: '¿Qué es un ajuste?', en: 'What is an adjustment?', zh: '什么是调拨？' },
      content: {
        es: 'Un ajuste de almacén es una transferencia de productos de un almacén origen a un almacén destino. Ambos almacenes deben estar abiertos.\n\nEjemplo: mover 50 unidades de "Vitamina B" de la Bodega Central a la Sucursal Norte.',
        en: 'A warehouse adjustment is a transfer of products from a source warehouse to a destination warehouse. Both warehouses must be open.\n\nExample: move 50 units of "Vitamin B" from the Central Warehouse to the North Branch.',
        zh: '仓库调拨是将产品从来源仓库转移到目标仓库。两个仓库都必须处于开放状态。\n\n示例：将50件"维生素B"从中央仓库移至北部分店。',
      },
    },
    {
      icon: '📝',
      title: { es: 'Agregar productos al ajuste', en: 'Add products to adjustment', zh: '添加调拨产品' },
      content: {
        es: 'Primero crea el ajuste con los almacenes origen y destino. Luego entra al detalle y agrega los productos con sus cantidades.\n\nSi agregas el mismo producto dos veces, las cantidades se suman automáticamente.',
        en: 'First create the adjustment with the source and destination warehouses. Then enter the detail and add the products with their quantities.\n\nIf you add the same product twice, the quantities are automatically added.',
        zh: '首先创建调拨单，指定来源和目标仓库。然后进入详情页添加产品及其数量。\n\n如果同一产品添加两次，数量会自动合并。',
      },
    },
    {
      icon: '✅',
      title: { es: 'Procesar el ajuste', en: 'Process the adjustment', zh: '处理调拨' },
      content: {
        es: 'Al procesar (cerrar) el ajuste:\n\n• Se descuenta el stock del almacén origen\n• Se suma el stock al almacén destino\n• Se registra en el historial de movimientos\n\nEste proceso es irreversible. Un ajuste procesado no puede editarse ni eliminarse.',
        en: 'When processing (closing) the adjustment:\n\n• Stock is deducted from the source warehouse\n• Stock is added to the destination warehouse\n• It is recorded in the movement history\n\nThis process is irreversible. A processed adjustment cannot be edited or deleted.',
        zh: '处理（关闭）调拨时：\n\n• 从来源仓库扣减库存\n• 向目标仓库增加库存\n• 在流水历史中记录\n\n此过程不可逆。已处理的调拨无法编辑或删除。',
      },
    },
    {
      icon: '⚠️',
      title: { es: 'Ajuste abierto vs cerrado', en: 'Open vs closed adjustment', zh: '开放与已关闭调拨' },
      content: {
        es: '• Abierto: puedes agregar, editar y eliminar productos del ajuste\n• Cerrado/Procesado: el ajuste ya fue ejecutado, los inventarios ya se actualizaron\n\nLos botones de editar y eliminar se deshabilitan automáticamente cuando el ajuste está cerrado.',
        en: '• Open: you can add, edit and delete products from the adjustment\n• Closed/Processed: the adjustment has already been executed, inventories have been updated\n\nThe edit and delete buttons are automatically disabled when the adjustment is closed.',
        zh: '• 开放：可以添加、编辑和删除调拨中的产品\n• 已关闭/已处理：调拨已执行，库存已更新\n\n调拨关闭后，编辑和删除按钮自动禁用。',
      },
    },
  ],
};
