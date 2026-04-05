import type { HelpConfig } from '../HelpButton';

export const taxesHelp: HelpConfig = {
  title: { es: 'Guía de Impuestos', en: 'Taxes Guide', zh: '税费指南' },
  description: {
    es: 'Configura los impuestos que aplican a tus productos',
    en: 'Configure the taxes that apply to your products',
    zh: '配置适用于产品的税费',
  },
  sections: [
    {
      icon: '🧾',
      title: { es: '¿Qué es un impuesto?', en: 'What is a tax?', zh: '什么是税费？' },
      content: {
        es: 'Un impuesto es un cargo adicional que se aplica al precio de un producto al momento de la venta o facturación. El más común en México es el IVA (16%).\n\nPuedes crear múltiples impuestos y asignarlos a los productos que los requieran.',
        en: 'A tax is an additional charge applied to the price of a product at the time of sale or invoicing. The most common in Mexico is VAT (16%).\n\nYou can create multiple taxes and assign them to the products that require them.',
        zh: '税费是在销售或开票时附加到产品价格上的额外费用。墨西哥最常见的是增值税（16%）。\n\n您可以创建多种税费并将其分配给需要的产品。',
      },
    },
    {
      icon: '📊',
      title: { es: 'Tipos de impuesto', en: 'Tax types', zh: '税费类型' },
      content: {
        es: 'Hay dos tipos de impuesto:\n\n• Porcentaje (PERCENTAGE): se calcula como un % del precio. Ej: IVA 16% sobre $100 = $16 de impuesto.\n\n• Valor fijo (FIXED): se suma un monto fijo al precio. Ej: $5 por unidad vendida.\n\nEl tipo más común para facturación electrónica en México es Porcentaje.',
        en: 'There are two types of tax:\n\n• Percentage (PERCENTAGE): calculated as a % of the price. E.g.: VAT 16% on $100 = $16 tax.\n\n• Fixed value (FIXED): a fixed amount is added to the price. E.g.: $5 per unit sold.\n\nThe most common type for electronic invoicing in Mexico is Percentage.',
        zh: '税费有两种类型：\n\n• 百分比（PERCENTAGE）：按价格的百分比计算。例如：$100的16%增值税 = $16税费。\n\n• 固定值（FIXED）：在价格上加一个固定金额。例如：每售出单位$5。\n\n墨西哥电子开票最常见的类型是百分比。',
      },
    },
    {
      icon: '🔗',
      title: { es: 'Asignación a productos', en: 'Assignment to products', zh: '分配给产品' },
      content: {
        es: 'Los impuestos se asignan directamente a cada producto. Un producto puede tener múltiples impuestos (ej. IVA + IEPS).\n\nAl generar una venta o factura, los impuestos del producto se calculan automáticamente y se detallan en el documento.',
        en: 'Taxes are assigned directly to each product. A product can have multiple taxes (e.g. VAT + IEPS).\n\nWhen generating a sale or invoice, the product taxes are automatically calculated and detailed in the document.',
        zh: '税费直接分配给每个产品。一个产品可以有多种税费（例如增值税+IEPS）。\n\n生成销售或发票时，产品税费自动计算并在文件中详细列出。',
      },
    },
    {
      icon: '⚠️',
      title: { es: 'Activar / Desactivar / Eliminar', en: 'Activate / Deactivate / Delete', zh: '启用/停用/删除' },
      content: {
        es: 'Puedes activar o desactivar un impuesto sin eliminarlo. Un impuesto inactivo no aparece en los selectores de productos.\n\nNo puedes eliminar un impuesto si está asignado a productos activos. Primero desasígnalo de los productos.',
        en: 'You can activate or deactivate a tax without deleting it. An inactive tax does not appear in product selectors.\n\nYou cannot delete a tax if it is assigned to active products. First unassign it from the products.',
        zh: '您可以启用或停用税费而不删除它。非活跃税费不会出现在产品选择器中。\n\n如果税费已分配给活跃产品，则无法删除。请先从产品中取消分配。',
      },
    },
  ],
};
