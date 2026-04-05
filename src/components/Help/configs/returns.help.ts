import type { HelpConfig } from '../HelpButton';

export const returnsHelp: HelpConfig = {
  title: { es: 'Guía de Devoluciones', en: 'Returns Guide', zh: '退货指南' },
  description: {
    es: 'Gestiona las devoluciones de productos a proveedores',
    en: 'Manage product returns to providers',
    zh: '管理向供应商的产品退货',
  },
  sections: [
    {
      icon: '↩️',
      title: { es: '¿Qué es una devolución?', en: 'What is a return?', zh: '什么是退货？' },
      content: {
        es: 'Una devolución registra el envío de productos de regreso a un proveedor. Se toma del inventario de un almacén cerrado y se envía al proveedor.\n\nEjemplo: devolver 10 unidades defectuosas de "Vitamina B" al proveedor "Laboratorios XYZ".',
        en: 'A return records the shipment of products back to a provider. It is taken from the inventory of a closed warehouse and sent to the provider.\n\nExample: return 10 defective units of "Vitamin B" to provider "XYZ Laboratories".',
        zh: '退货记录将产品退回供应商的过程。从已关闭仓库的库存中取出并发送给供应商。\n\n示例：将10件有缺陷的"维生素B"退回供应商"XYZ实验室"。',
      },
    },
    {
      icon: '🏭',
      title: { es: 'Almacén origen', en: 'Source warehouse', zh: '来源仓库' },
      content: {
        es: 'El almacén origen debe estar cerrado para poder hacer una devolución. Esto garantiza que el inventario esté consolidado antes de descontar unidades.\n\nSi el almacén está abierto, primero ciérralo desde la vista de almacenes.',
        en: 'The source warehouse must be closed to make a return. This ensures that inventory is consolidated before deducting units.\n\nIf the warehouse is open, first close it from the warehouses view.',
        zh: '来源仓库必须处于关闭状态才能进行退货。这确保在扣减单位前库存已整合。\n\n如果仓库处于开放状态，请先从仓库视图关闭它。',
      },
    },
    {
      icon: '📝',
      title: { es: 'Agregar productos a la devolución', en: 'Add products to return', zh: '添加退货产品' },
      content: {
        es: 'Primero crea la devolución con el almacén origen y el proveedor destino. Luego entra al detalle y agrega los productos con sus cantidades.\n\nSi agregas el mismo producto dos veces, las cantidades se suman automáticamente.',
        en: 'First create the return with the source warehouse and destination provider. Then enter the detail and add the products with their quantities.\n\nIf you add the same product twice, the quantities are automatically added.',
        zh: '首先创建退货单，指定来源仓库和目标供应商。然后进入详情页添加产品及其数量。\n\n如果同一产品添加两次，数量会自动合并。',
      },
    },
    {
      icon: '✅',
      title: { es: 'Procesar la devolución', en: 'Process the return', zh: '处理退货' },
      content: {
        es: 'Al procesar (cerrar) la devolución:\n\n• Se descuenta el stock del almacén origen\n• Se registra en el historial de movimientos como RETURN_OUT\n\nEste proceso es irreversible. Una devolución procesada no puede editarse ni eliminarse.',
        en: 'When processing (closing) the return:\n\n• Stock is deducted from the source warehouse\n• It is recorded in the movement history as RETURN_OUT\n\nThis process is irreversible. A processed return cannot be edited or deleted.',
        zh: '处理（关闭）退货时：\n\n• 从来源仓库扣减库存\n• 在流水历史中记录为RETURN_OUT\n\n此过程不可逆。已处理的退货无法编辑或删除。',
      },
    },
  ],
};
