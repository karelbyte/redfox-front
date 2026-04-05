import type { HelpConfig } from '../HelpButton';

export const currenciesHelp: HelpConfig = {
  title: { es: 'Guía de Monedas', en: 'Currencies Guide', zh: '货币指南' },
  description: {
    es: 'Configura las monedas que usas en tu negocio',
    en: 'Configure the currencies you use in your business',
    zh: '配置您业务中使用的货币',
  },
  sections: [
    {
      icon: '💱',
      title: { es: '¿Para qué sirven las monedas?', en: 'What are currencies for?', zh: '货币有什么用？' },
      content: {
        es: 'Las monedas te permiten manejar precios en diferentes divisas. Puedes asignar una moneda a cada producto, almacén o venta.\n\nEsto es útil si vendes en dólares, euros u otras divisas además del peso mexicano.',
        en: 'Currencies allow you to manage prices in different currencies. You can assign a currency to each product, warehouse or sale.\n\nThis is useful if you sell in dollars, euros or other currencies in addition to the Mexican peso.',
        zh: '货币允许您以不同币种管理价格。您可以为每个产品、仓库或销售分配货币。\n\n如果您除墨西哥比索外还以美元、欧元或其他货币销售，这非常有用。',
      },
    },
    {
      icon: '🔑',
      title: { es: 'Código de moneda', en: 'Currency code', zh: '货币代码' },
      content: {
        es: 'El código debe seguir el estándar ISO 4217 de 3 letras:\n\n• MXN — Peso mexicano\n• USD — Dólar estadounidense\n• EUR — Euro\n• CAD — Dólar canadiense\n\nEl sistema convierte el código a mayúsculas automáticamente.',
        en: 'The code must follow the 3-letter ISO 4217 standard:\n\n• MXN — Mexican peso\n• USD — US dollar\n• EUR — Euro\n• CAD — Canadian dollar\n\nThe system automatically converts the code to uppercase.',
        zh: '代码必须遵循ISO 4217三字母标准：\n\n• MXN — 墨西哥比索\n• USD — 美元\n• EUR — 欧元\n• CAD — 加拿大元\n\n系统自动将代码转换为大写。',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar monedas', en: 'Delete currencies', zh: '删除货币' },
      content: {
        es: 'Puedes eliminar una moneda siempre que no esté asignada a productos, almacenes o ventas activas.\n\nSi la moneda está en uso, el sistema te lo indicará y no permitirá la eliminación.',
        en: 'You can delete a currency as long as it is not assigned to active products, warehouses or sales.\n\nIf the currency is in use, the system will indicate this and will not allow deletion.',
        zh: '只要货币未分配给活跃的产品、仓库或销售，即可删除。\n\n如果货币正在使用中，系统会提示并不允许删除。',
      },
    },
  ],
};
