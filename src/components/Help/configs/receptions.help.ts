import type { HelpConfig } from '../HelpButton';

export const receptionsHelp: HelpConfig = {
  title: { es: 'Guía de Recepciones', en: 'Receptions Guide', zh: '收货指南' },
  description: {
    es: 'Registra las entradas de mercancía de tus proveedores',
    en: 'Record merchandise entries from your providers',
    zh: '记录来自供应商的货物入库',
  },
  sections: [
    {
      icon: '📥',
      title: { es: '¿Qué es una recepción?', en: 'What is a reception?', zh: '什么是收货？' },
      content: {
        es: 'Una recepción registra la entrada de productos de un proveedor a un almacén. Cada recepción tiene un código, fecha, proveedor, almacén y documento de referencia (factura del proveedor).\n\nAl cerrar la recepción, los productos se transfieren automáticamente al inventario del almacén.',
        en: 'A reception records the entry of products from a provider to a warehouse. Each reception has a code, date, provider, warehouse and reference document (provider invoice).\n\nWhen closing the reception, products are automatically transferred to the warehouse inventory.',
        zh: '收货记录产品从供应商入库到仓库的过程。每次收货包含代码、日期、供应商、仓库和参考文件（供应商发票）。\n\n关闭收货单后，产品自动转入仓库库存。',
      },
    },
    {
      icon: '📦',
      title: { es: 'Agregar productos', en: 'Add products', zh: '添加产品' },
      content: {
        es: 'Desde el detalle de la recepción puedes agregar los productos recibidos con:\n\n• Producto: selecciona del catálogo\n• Cantidad: unidades recibidas\n• Precio: costo de compra\n• Número de lote: para FIFO/FEFO (opcional)\n• Fecha de caducidad: para productos perecederos (opcional)\n\nPuedes agregar el mismo producto varias veces si vienen en lotes diferentes.',
        en: 'From the reception detail you can add the received products with:\n\n• Product: select from catalog\n• Quantity: received units\n• Price: purchase cost\n• Batch number: for FIFO/FEFO (optional)\n• Expiration date: for perishable products (optional)\n\nYou can add the same product multiple times if they come in different batches.',
        zh: '在收货详情页，您可以添加收到的产品：\n\n• 产品：从目录中选择\n• 数量：收到的单位数\n• 价格：采购成本\n• 批次号：用于FIFO/FEFO（可选）\n• 到期日：用于易腐产品（可选）\n\n如果产品来自不同批次，可以多次添加同一产品。',
      },
    },
    {
      icon: '✅',
      title: { es: 'Cerrar recepción', en: 'Close reception', zh: '关闭收货单' },
      content: {
        es: 'Al cerrar la recepción:\n\n• Los productos pasan al inventario del almacén\n• Si el producto usa FIFO/FEFO, se crea un nuevo lote\n• Si usa Promedio, se recalcula el precio promedio\n• El stock total del producto se actualiza\n\nEste proceso es irreversible. Una recepción cerrada no puede editarse.',
        en: 'When closing the reception:\n\n• Products go to the warehouse inventory\n• If the product uses FIFO/FEFO, a new batch is created\n• If it uses Average, the average price is recalculated\n• The total product stock is updated\n\nThis process is irreversible. A closed reception cannot be edited.',
        zh: '关闭收货单时：\n\n• 产品进入仓库库存\n• 如果产品采用FIFO/FEFO，创建新批次\n• 如果采用加权平均，重新计算平均价格\n• 产品总库存更新\n\n此过程不可逆。已关闭的收货单无法编辑。',
      },
    },
    {
      icon: '📄',
      title: { es: 'Generar PDF', en: 'Generate PDF', zh: '生成PDF' },
      content: {
        es: 'Puedes generar un PDF de la recepción con todos los productos, cantidades y precios. El PDF incluye los datos de tu empresa (logo, nombre, RFC) si están configurados en Configuración → Generales de Empresa.',
        en: 'You can generate a PDF of the reception with all products, quantities and prices. The PDF includes your company data (logo, name, RFC) if configured in Settings → Company General.',
        zh: '您可以生成包含所有产品、数量和价格的收货PDF。如果在设置→公司基本信息中已配置，PDF将包含公司信息（标志、名称、RFC）。',
      },
    },
    {
      icon: '⚠️',
      title: { es: 'Recepciones abiertas vs cerradas', en: 'Open vs closed receptions', zh: '开放与已关闭收货单' },
      content: {
        es: '• Abierta: puedes agregar, editar y eliminar productos\n• Cerrada: el inventario ya fue actualizado, no se puede modificar\n\nLos botones de editar y eliminar se deshabilitan automáticamente cuando la recepción está cerrada.',
        en: '• Open: you can add, edit and delete products\n• Closed: inventory has already been updated, cannot be modified\n\nThe edit and delete buttons are automatically disabled when the reception is closed.',
        zh: '• 开放：可以添加、编辑和删除产品\n• 已关闭：库存已更新，无法修改\n\n收货单关闭后，编辑和删除按钮自动禁用。',
      },
    },
  ],
};
