import type { HelpConfig } from '../HelpButton';

export const measurementUnitsHelp: HelpConfig = {
  title: { es: 'Guía de Unidades de Medida', en: 'Measurement Units Guide', zh: '计量单位指南' },
  description: {
    es: 'Configura las unidades de medida para tus productos',
    en: 'Configure the measurement units for your products',
    zh: '配置产品的计量单位',
  },
  sections: [
    {
      icon: '📏',
      title: { es: '¿Qué es una unidad de medida?', en: 'What is a measurement unit?', zh: '什么是计量单位？' },
      content: {
        es: 'Una unidad de medida define cómo se cuantifica un producto al venderlo o comprarlo. Por ejemplo:\n\n• Pieza (PZA) — para artículos individuales\n• Kilogramo (KG) — para productos a granel\n• Litro (LT) — para líquidos\n• Metro (MT) — para telas o cables\n\nCada producto debe tener una unidad de medida asignada.',
        en: 'A measurement unit defines how a product is quantified when selling or buying it. For example:\n\n• Piece (PCS) — for individual items\n• Kilogram (KG) — for bulk products\n• Liter (LT) — for liquids\n• Meter (MT) — for fabrics or cables\n\nEach product must have a measurement unit assigned.',
        zh: '计量单位定义销售或购买产品时的计量方式。例如：\n\n• 件（PZA）——用于单个物品\n• 千克（KG）——用于散装产品\n• 升（LT）——用于液体\n• 米（MT）——用于布料或电缆\n\n每个产品必须分配一个计量单位。',
      },
    },
    {
      icon: '🇲🇽',
      title: { es: 'Claves SAT', en: 'SAT keys', zh: 'SAT代码' },
      content: {
        es: 'Para facturación electrónica (CFDI), el SAT requiere usar claves de unidad de medida específicas del catálogo oficial:\n\n• H87 — Pieza\n• KGM — Kilogramo\n• LTR — Litro\n• MTR — Metro\n• E48 — Unidad de servicio\n\nAl crear una unidad, puedes buscar sugerencias del catálogo SAT directamente desde el formulario.',
        en: 'For electronic invoicing (CFDI), the SAT requires using specific measurement unit keys from the official catalog:\n\n• H87 — Piece\n• KGM — Kilogram\n• LTR — Liter\n• MTR — Meter\n• E48 — Service unit\n\nWhen creating a unit, you can search for SAT catalog suggestions directly from the form.',
        zh: '电子开票（CFDI）要求使用SAT官方目录中的特定计量单位代码：\n\n• H87 — 件\n• KGM — 千克\n• LTR — 升\n• MTR — 米\n• E48 — 服务单位\n\n创建单位时，可以直接在表单中搜索SAT目录建议。',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar unidades', en: 'Delete units', zh: '删除单位' },
      content: {
        es: 'No puedes eliminar una unidad de medida si está asignada a productos activos.\n\nSi ya no la usas pero tiene historial, desactívala para que no aparezca en los selectores de productos.',
        en: 'You cannot delete a measurement unit if it is assigned to active products.\n\nIf you no longer use it but it has history, deactivate it so it does not appear in product selectors.',
        zh: '如果计量单位已分配给活跃产品，则无法删除。\n\n如果不再使用但有历史记录，请停用它，使其不出现在产品选择器中。',
      },
    },
  ],
};
