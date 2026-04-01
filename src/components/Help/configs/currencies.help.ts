import type { HelpConfig } from '../HelpButton';

export const currenciesHelp: HelpConfig = {
  title: { es: 'Guía de Monedas', en: 'Currencies Guide' },
  description: {
    es: 'Configura las monedas que usas en tu negocio',
    en: 'Configure the currencies you use in your business',
  },
  sections: [
    {
      icon: '💱',
      title: { es: '¿Para qué sirven las monedas?', en: 'What are currencies for?' },
      content: {
        es: 'Las monedas te permiten manejar precios en diferentes divisas. Puedes asignar una moneda a cada producto, almacén o venta.\n\nEsto es útil si vendes en dólares, euros u otras divisas además del peso mexicano.',
        en: 'Currencies allow you to manage prices in different currencies. You can assign a currency to each product, warehouse or sale.\n\nThis is useful if you sell in dollars, euros or other currencies in addition to the Mexican peso.',
      },
    },
    {
      icon: '🔑',
      title: { es: 'Código de moneda', en: 'Currency code' },
      content: {
        es: 'El código debe seguir el estándar ISO 4217 de 3 letras:\n\n• MXN — Peso mexicano\n• USD — Dólar estadounidense\n• EUR — Euro\n• CAD — Dólar canadiense\n\nEl sistema convierte el código a mayúsculas automáticamente.',
        en: 'The code must follow the 3-letter ISO 4217 standard:\n\n• MXN — Mexican peso\n• USD — US dollar\n• EUR — Euro\n• CAD — Canadian dollar\n\nThe system automatically converts the code to uppercase.',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar monedas', en: 'Delete currencies' },
      content: {
        es: 'Puedes eliminar una moneda siempre que no esté asignada a productos, almacenes o ventas activas.\n\nSi la moneda está en uso, el sistema te lo indicará y no permitirá la eliminación.',
        en: 'You can delete a currency as long as it is not assigned to active products, warehouses or sales.\n\nIf the currency is in use, the system will indicate this and will not allow deletion.',
      },
    },
  ],
};
