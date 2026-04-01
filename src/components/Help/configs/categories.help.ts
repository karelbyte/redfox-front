import type { HelpConfig } from '../HelpButton';

export const categoriesHelp: HelpConfig = {
  title: { es: 'Guía de Categorías', en: 'Categories Guide' },
  description: {
    es: 'Organiza tu catálogo de productos con categorías y subcategorías',
    en: 'Organize your product catalog with categories and subcategories',
  },
  sections: [
    {
      icon: '🗂️',
      title: { es: '¿Qué es una categoría?', en: 'What is a category?' },
      content: {
        es: 'Una categoría agrupa productos relacionados para facilitar su búsqueda y organización. Por ejemplo: "Electrónica", "Alimentos", "Medicamentos".\n\nPuedes crear una jerarquía de hasta dos niveles: categoría padre y subcategorías.',
        en: 'A category groups related products to make them easier to find and organize. For example: "Electronics", "Food", "Medications".\n\nYou can create a hierarchy of up to two levels: parent category and subcategories.',
      },
    },
    {
      icon: '🌳',
      title: { es: 'Jerarquía de categorías', en: 'Category hierarchy' },
      content: {
        es: 'Puedes asignar una categoría padre al crear o editar una categoría. Esto crea una estructura de árbol:\n\n• Categoría padre: nivel principal (ej. "Salud")\n• Subcategoría: nivel hijo (ej. "Vitaminas", "Medicamentos")\n\nLas subcategorías aparecen indentadas en la tabla. Haz clic en la flecha para expandirlas.',
        en: 'You can assign a parent category when creating or editing a category. This creates a tree structure:\n\n• Parent category: main level (e.g. "Health")\n• Subcategory: child level (e.g. "Vitamins", "Medications")\n\nSubcategories appear indented in the table. Click the arrow to expand them.',
      },
    },
    {
      icon: '🖼️',
      title: { es: 'Imagen de categoría', en: 'Category image' },
      content: {
        es: 'Puedes subir una imagen representativa para cada categoría. Esta imagen se muestra en la tabla y puede usarse en el catálogo de productos.\n\nFormatos aceptados: JPG, PNG, WebP. Tamaño máximo: 5MB.',
        en: 'You can upload a representative image for each category. This image is shown in the table and can be used in the product catalog.\n\nAccepted formats: JPG, PNG, WebP. Maximum size: 5MB.',
      },
    },
    {
      icon: '⚠️',
      title: { es: 'Desactivar y eliminar', en: 'Deactivate and delete' },
      content: {
        es: 'No puedes desactivar una categoría si tiene subcategorías activas — primero debes desactivarlas.\n\nNo puedes eliminar una categoría si tiene productos asignados. En ese caso, desactívala para que no aparezca en los selectores sin perder el historial.',
        en: 'You cannot deactivate a category if it has active subcategories — you must deactivate them first.\n\nYou cannot delete a category if it has assigned products. In that case, deactivate it so it does not appear in selectors without losing history.',
      },
    },
  ],
};
