import type { HelpConfig } from '../HelpButton';

export const expensesHelp: HelpConfig = {
  title: { es: 'Guía de Gastos', en: 'Expenses Guide' },
  description: {
    es: 'Todo lo que necesitas saber para registrar y controlar tus gastos',
    en: 'Everything you need to know to record and control your expenses',
  },
  sections: [
    {
      icon: '💸',
      title: { es: '¿Qué es un gasto?', en: 'What is an expense?' },
      content: {
        es: 'Un gasto registra una salida de dinero de tu empresa: pagos a proveedores, servicios, renta, sueldos, etc. Cada gasto tiene una descripción, monto, categoría, proveedor y fecha.\n\nLos gastos te permiten llevar un control detallado de tus egresos y calcular la rentabilidad real del negocio.',
        en: 'An expense records a money outflow from your company: supplier payments, services, rent, salaries, etc. Each expense has a description, amount, category, supplier and date.\n\nExpenses allow you to keep detailed control of your outflows and calculate the real profitability of the business.',
      },
    },
    {
      icon: '📁',
      title: { es: 'Categorías de gasto', en: 'Expense categories' },
      content: {
        es: 'Organiza tus gastos por categorías para obtener reportes más claros. Puedes crear categorías personalizadas desde la configuración.\n\nEjemplos comunes: Renta, Servicios, Nómina, Proveedores, Mantenimiento, Marketing.',
        en: 'Organize your expenses by categories for clearer reports. You can create custom categories from settings.\n\nCommon examples: Rent, Services, Payroll, Suppliers, Maintenance, Marketing.',
      },
    },
    {
      icon: '📊',
      title: { es: 'Estados del gasto', en: 'Expense statuses' },
      content: {
        es: '• Pendiente: el gasto fue registrado pero aún no se ha pagado o aprobado\n• Aprobado: el gasto fue revisado y aprobado\n• Rechazado: el gasto fue revisado y rechazado\n\nPuedes filtrar por estado para ver solo los gastos pendientes de pago o aprobación.',
        en: '• Pending: the expense was recorded but not yet paid or approved\n• Approved: the expense was reviewed and approved\n• Rejected: the expense was reviewed and rejected\n\nYou can filter by status to see only expenses pending payment or approval.',
      },
    },
    {
      icon: '💳',
      title: { es: 'Registrar un pago', en: 'Register a payment' },
      content: {
        es: 'Un gasto puede pagarse en una o varias partes. Desde la tabla, usa el botón de pago para registrar un abono al gasto.\n\nEl campo "Restante" muestra cuánto falta por pagar. Cuando el monto restante llega a cero, el gasto queda completamente liquidado.',
        en: 'An expense can be paid in one or several parts. From the table, use the payment button to register a payment toward the expense.\n\nThe "Remaining" field shows how much is left to pay. When the remaining amount reaches zero, the expense is fully settled.',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Búsqueda y filtros', en: 'Search and filters' },
      content: {
        es: 'Usa la barra de búsqueda para encontrar gastos por descripción o proveedor. Los filtros avanzados te permiten filtrar por:\n\n• Estado (pendiente, aprobado, rechazado)\n• Rango de fechas\n• Categoría\n\nTambién puedes exportar los resultados filtrados a CSV.',
        en: 'Use the search bar to find expenses by description or supplier. Advanced filters let you filter by:\n\n• Status (pending, approved, rejected)\n• Date range\n• Category\n\nYou can also export filtered results to CSV.',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar gastos', en: 'Delete expenses' },
      content: {
        es: 'Puedes eliminar un gasto individual desde el menú de acciones en la tabla. También puedes seleccionar múltiples gastos y eliminarlos en lote usando la barra de acciones masivas.\n\nLa eliminación es permanente — asegúrate de que el gasto no tenga pagos asociados antes de eliminarlo.',
        en: 'You can delete an individual expense from the actions menu in the table. You can also select multiple expenses and delete them in bulk using the bulk actions bar.\n\nDeletion is permanent — make sure the expense has no associated payments before deleting it.',
      },
    },
  ],
};
