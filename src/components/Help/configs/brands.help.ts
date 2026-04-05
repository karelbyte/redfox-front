import type { HelpConfig } from '../HelpButton';

export const brandsHelp: HelpConfig = {
  title: { es: 'Guía de Marcas', en: 'Brands Guide', zh: '品牌指南' },
  description: {
    es: 'Gestiona las marcas de tus productos',
    en: 'Manage your product brands',
    zh: '管理您的产品品牌',
  },
  sections: [
    {
      icon: '🏷️',
      title: { es: '¿Qué es una marca?', en: 'What is a brand?', zh: '什么是品牌？' },
      content: {
        es: 'Una marca identifica el fabricante o la línea comercial de un producto. Por ejemplo: "Samsung", "Bayer", "Nestlé".\n\nAsignar marcas a tus productos facilita la búsqueda, el filtrado y los reportes de ventas por fabricante.',
        en: 'A brand identifies the manufacturer or commercial line of a product. For example: "Samsung", "Bayer", "Nestlé".\n\nAssigning brands to your products makes it easier to search, filter and generate sales reports by manufacturer.',
        zh: '品牌标识产品的制造商或商业线。例如："Samsung"、"Bayer"、"Nestlé"。\n\n为产品分配品牌便于按制造商进行搜索、筛选和生成销售报告。',
      },
    },
    {
      icon: '🔑',
      title: { es: 'Código de marca', en: 'Brand code', zh: '品牌代码' },
      content: {
        es: 'El código es un identificador corto y único para la marca (ej. "SAM", "BAY"). Debe ser único dentro de tu organización.\n\nSe usa en reportes y exportaciones para identificar la marca de forma compacta.',
        en: 'The code is a short, unique identifier for the brand (e.g. "SAM", "BAY"). It must be unique within your organization.\n\nIt is used in reports and exports to identify the brand in a compact way.',
        zh: '代码是品牌的简短唯一标识符（例如"SAM"、"BAY"）。在您的组织内必须唯一。\n\n用于报告和导出中以简洁方式标识品牌。',
      },
    },
    {
      icon: '🖼️',
      title: { es: 'Logo de la marca', en: 'Brand logo', zh: '品牌标志' },
      content: {
        es: 'Puedes subir el logo de la marca para identificarla visualmente en la tabla y en el catálogo de productos.\n\nFormatos aceptados: JPG, PNG, WebP. Tamaño máximo: 5MB.',
        en: 'You can upload the brand logo to visually identify it in the table and product catalog.\n\nAccepted formats: JPG, PNG, WebP. Maximum size: 5MB.',
        zh: '您可以上传品牌标志，以便在表格和产品目录中直观识别。\n\n支持格式：JPG、PNG、WebP。最大大小：5MB。',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar marcas', en: 'Delete brands', zh: '删除品牌' },
      content: {
        es: 'No puedes eliminar una marca si tiene productos asignados. Primero reasigna o elimina esos productos.\n\nSi la marca ya no está activa pero tiene historial, desactívala en lugar de eliminarla.',
        en: 'You cannot delete a brand if it has assigned products. First reassign or delete those products.\n\nIf the brand is no longer active but has history, deactivate it instead of deleting it.',
        zh: '如果品牌已分配产品，则无法删除。请先重新分配或删除这些产品。\n\n如果品牌不再使用但有历史记录，请停用而非删除。',
      },
    },
  ],
};
