import type { HelpConfig } from '../HelpButton';

export const brandsHelp: HelpConfig = {
  title: { es: 'Guía de Marcas', en: 'Brands Guide' },
  description: {
    es: 'Gestiona las marcas de tus productos',
    en: 'Manage your product brands',
  },
  sections: [
    {
      icon: '🏷️',
      title: { es: '¿Qué es una marca?', en: 'What is a brand?' },
      content: {
        es: 'Una marca identifica el fabricante o la línea comercial de un producto. Por ejemplo: "Samsung", "Bayer", "Nestlé".\n\nAsignar marcas a tus productos facilita la búsqueda, el filtrado y los reportes de ventas por fabricante.',
        en: 'A brand identifies the manufacturer or commercial line of a product. For example: "Samsung", "Bayer", "Nestlé".\n\nAssigning brands to your products makes it easier to search, filter and generate sales reports by manufacturer.',
      },
    },
    {
      icon: '🔑',
      title: { es: 'Código de marca', en: 'Brand code' },
      content: {
        es: 'El código es un identificador corto y único para la marca (ej. "SAM", "BAY"). Debe ser único dentro de tu organización.\n\nSe usa en reportes y exportaciones para identificar la marca de forma compacta.',
        en: 'The code is a short, unique identifier for the brand (e.g. "SAM", "BAY"). It must be unique within your organization.\n\nIt is used in reports and exports to identify the brand in a compact way.',
      },
    },
    {
      icon: '🖼️',
      title: { es: 'Logo de la marca', en: 'Brand logo' },
      content: {
        es: 'Puedes subir el logo de la marca para identificarla visualmente en la tabla y en el catálogo de productos.\n\nFormatos aceptados: JPG, PNG, WebP. Tamaño máximo: 5MB.',
        en: 'You can upload the brand logo to visually identify it in the table and product catalog.\n\nAccepted formats: JPG, PNG, WebP. Maximum size: 5MB.',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar marcas', en: 'Delete brands' },
      content: {
        es: 'No puedes eliminar una marca si tiene productos asignados. Primero reasigna o elimina esos productos.\n\nSi la marca ya no está activa pero tiene historial, desactívala en lugar de eliminarla.',
        en: 'You cannot delete a brand if it has assigned products. First reassign or delete those products.\n\nIf the brand is no longer active but has history, deactivate it instead of deleting it.',
      },
    },
  ],
};
