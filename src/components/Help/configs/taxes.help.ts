import type { HelpConfig } from '../HelpButton';

export const taxesHelp: HelpConfig = {
  title: { es: 'Guía de Impuestos', en: 'Taxes Guide' },
  description: {
    es: 'Configura los impuestos que aplican a tus productos',
    en: 'Configure the taxes that apply to your products',
  },
  sections: [
    {
      icon: '🧾',
      title: { es: '¿Qué es un impuesto?', en: 'What is a tax?' },
      content: {
        es: 'Un impuesto es un cargo adicional que se aplica al precio de un producto al momento de la venta o facturación. El más común en México es el IVA (16%).\n\nPuedes crear múltiples impuestos y asignarlos a los productos que los requieran.',
        en: 'A tax is an additional charge applied to the price of a product at the time of sale or invoicing. The most common in Mexico is VAT (16%).\n\nYou can create multiple taxes and assign them to the products that require them.',
      },
    },
    {
      icon: '📊',
      title: { es: 'Tipos de impuesto', en: 'Tax types' },
      content: {
        es: 'Hay dos tipos de impuesto:\n\n• Porcentaje (PERCENTAGE): se calcula como un % del precio. Ej: IVA 16% sobre $100 = $16 de impuesto.\n\n• Valor fijo (FIXED): se suma un monto fijo al precio. Ej: $5 por unidad vendida.\n\nEl tipo más común para facturación electrónica en México es Porcentaje.',
        en: 'There are two types of tax:\n\n• Percentage (PERCENTAGE): calculated as a % of the price. E.g.: VAT 16% on $100 = $16 tax.\n\n• Fixed value (FIXED): a fixed amount is added to the price. E.g.: $5 per unit sold.\n\nThe most common type for electronic invoicing in Mexico is Percentage.',
      },
    },
    {
      icon: '🔗',
      title: { es: 'Asignación a productos', en: 'Assignment to products' },
      content: {
        es: 'Los impuestos se asignan directamente a cada producto. Un producto puede tener múltiples impuestos (ej. IVA + IEPS).\n\nAl generar una venta o factura, los impuestos del producto se calculan automáticamente y se detallan en el documento.',
        en: 'Taxes are assigned directly to each product. A product can have multiple taxes (e.g. VAT + IEPS).\n\nWhen generating a sale or invoice, the product taxes are automatically calculated and detailed in the document.',
      },
    },
    {
      icon: '⚠️',
      title: { es: 'Activar / Desactivar / Eliminar', en: 'Activate / Deactivate / Delete' },
      content: {
        es: 'Puedes activar o desactivar un impuesto sin eliminarlo. Un impuesto inactivo no aparece en los selectores de productos.\n\nNo puedes eliminar un impuesto si está asignado a productos activos. Primero desasígnalo de los productos.',
        en: 'You can activate or deactivate a tax without deleting it. An inactive tax does not appear in product selectors.\n\nYou cannot delete a tax if it is assigned to active products. First unassign it from the products.',
      },
    },
  ],
};
