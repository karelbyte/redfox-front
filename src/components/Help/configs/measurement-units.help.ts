import type { HelpConfig } from '../HelpButton';

export const measurementUnitsHelp: HelpConfig = {
  title: { es: 'Guía de Unidades de Medida', en: 'Measurement Units Guide' },
  description: {
    es: 'Configura las unidades de medida para tus productos',
    en: 'Configure the measurement units for your products',
  },
  sections: [
    {
      icon: '📏',
      title: { es: '¿Qué es una unidad de medida?', en: 'What is a measurement unit?' },
      content: {
        es: 'Una unidad de medida define cómo se cuantifica un producto al venderlo o comprarlo. Por ejemplo:\n\n• Pieza (PZA) — para artículos individuales\n• Kilogramo (KG) — para productos a granel\n• Litro (LT) — para líquidos\n• Metro (MT) — para telas o cables\n\nCada producto debe tener una unidad de medida asignada.',
        en: 'A measurement unit defines how a product is quantified when selling or buying it. For example:\n\n• Piece (PCS) — for individual items\n• Kilogram (KG) — for bulk products\n• Liter (LT) — for liquids\n• Meter (MT) — for fabrics or cables\n\nEach product must have a measurement unit assigned.',
      },
    },
    {
      icon: '🇲🇽',
      title: { es: 'Claves SAT', en: 'SAT keys' },
      content: {
        es: 'Para facturación electrónica (CFDI), el SAT requiere usar claves de unidad de medida específicas del catálogo oficial:\n\n• H87 — Pieza\n• KGM — Kilogramo\n• LTR — Litro\n• MTR — Metro\n• E48 — Unidad de servicio\n\nAl crear una unidad, puedes buscar sugerencias del catálogo SAT directamente desde el formulario.',
        en: 'For electronic invoicing (CFDI), the SAT requires using specific measurement unit keys from the official catalog:\n\n• H87 — Piece\n• KGM — Kilogram\n• LTR — Liter\n• MTR — Meter\n• E48 — Service unit\n\nWhen creating a unit, you can search for SAT catalog suggestions directly from the form.',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar unidades', en: 'Delete units' },
      content: {
        es: 'No puedes eliminar una unidad de medida si está asignada a productos activos.\n\nSi ya no la usas pero tiene historial, desactívala para que no aparezca en los selectores de productos.',
        en: 'You cannot delete a measurement unit if it is assigned to active products.\n\nIf you no longer use it but it has history, deactivate it so it does not appear in product selectors.',
      },
    },
  ],
};
