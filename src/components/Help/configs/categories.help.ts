import type { HelpConfig } from '../HelpButton';

export const categoriesHelp: HelpConfig = {
  title: { es: 'Guía de Categorías', en: 'Categories Guide', zh: '分类指南' },
  description: {
    es: 'Organiza tu catálogo de productos con categorías y subcategorías',
    en: 'Organize your product catalog with categories and subcategories',
    zh: '使用分类和子分类整理您的产品目录',
  },
  sections: [
    {
      icon: '🗂️',
      title: { es: '¿Qué es una categoría?', en: 'What is a category?', zh: '什么是分类？' },
      content: {
        es: 'Una categoría agrupa productos relacionados para facilitar su búsqueda y organización. Por ejemplo: "Electrónica", "Alimentos", "Medicamentos".\n\nPuedes crear una jerarquía de hasta dos niveles: categoría padre y subcategorías.',
        en: 'A category groups related products to make them easier to find and organize. For example: "Electronics", "Food", "Medications".\n\nYou can create a hierarchy of up to two levels: parent category and subcategories.',
        zh: '分类将相关产品归组，便于查找和整理。例如："电子产品"、"食品"、"药品"。\n\n您可以创建最多两级层次结构：父分类和子分类。',
      },
    },
    {
      icon: '🌳',
      title: { es: 'Jerarquía de categorías', en: 'Category hierarchy', zh: '分类层次结构' },
      content: {
        es: 'Puedes asignar una categoría padre al crear o editar una categoría. Esto crea una estructura de árbol:\n\n• Categoría padre: nivel principal (ej. "Salud")\n• Subcategoría: nivel hijo (ej. "Vitaminas", "Medicamentos")\n\nLas subcategorías aparecen indentadas en la tabla. Haz clic en la flecha para expandirlas.',
        en: 'You can assign a parent category when creating or editing a category. This creates a tree structure:\n\n• Parent category: main level (e.g. "Health")\n• Subcategory: child level (e.g. "Vitamins", "Medications")\n\nSubcategories appear indented in the table. Click the arrow to expand them.',
        zh: '创建或编辑分类时可以指定父分类，从而形成树状结构：\n\n• 父分类：主级别（例如"健康"）\n• 子分类：下级（例如"维生素"、"药品"）\n\n子分类在表格中缩进显示。点击箭头展开。',
      },
    },
    {
      icon: '🖼️',
      title: { es: 'Imagen de categoría', en: 'Category image', zh: '分类图片' },
      content: {
        es: 'Puedes subir una imagen representativa para cada categoría. Esta imagen se muestra en la tabla y puede usarse en el catálogo de productos.\n\nFormatos aceptados: JPG, PNG, WebP. Tamaño máximo: 5MB.',
        en: 'You can upload a representative image for each category. This image is shown in the table and can be used in the product catalog.\n\nAccepted formats: JPG, PNG, WebP. Maximum size: 5MB.',
        zh: '您可以为每个分类上传代表性图片。该图片显示在表格中，也可用于产品目录。\n\n支持格式：JPG、PNG、WebP。最大大小：5MB。',
      },
    },
    {
      icon: '⚠️',
      title: { es: 'Desactivar y eliminar', en: 'Deactivate and delete', zh: '停用与删除' },
      content: {
        es: 'No puedes desactivar una categoría si tiene subcategorías activas — primero debes desactivarlas.\n\nNo puedes eliminar una categoría si tiene productos asignados. En ese caso, desactívala para que no aparezca en los selectores sin perder el historial.',
        en: 'You cannot deactivate a category if it has active subcategories — you must deactivate them first.\n\nYou cannot delete a category if it has assigned products. In that case, deactivate it so it does not appear in selectors without losing history.',
        zh: '如果分类有活跃的子分类，则无法停用——必须先停用子分类。\n\n如果分类已分配产品，则无法删除。在这种情况下，请停用它，使其不出现在选择器中，同时保留历史记录。',
      },
    },
  ],
};
