import type { HelpConfig } from '../HelpButton';

export const expensesHelp: HelpConfig = {
  title: { es: 'Guía de Gastos', en: 'Expenses Guide', zh: '费用指南' },
  description: {
    es: 'Todo lo que necesitas saber para registrar y controlar tus gastos',
    en: 'Everything you need to know to record and control your expenses',
    zh: '记录和管理费用所需了解的一切',
  },
  sections: [
    {
      icon: '💸',
      title: { es: '¿Qué es un gasto?', en: 'What is an expense?', zh: '什么是费用？' },
      content: {
        es: 'Un gasto registra una salida de dinero de tu empresa: pagos a proveedores, servicios, renta, sueldos, etc. Cada gasto tiene una descripción, monto, categoría, proveedor y fecha.\n\nLos gastos te permiten llevar un control detallado de tus egresos y calcular la rentabilidad real del negocio.',
        en: 'An expense records a money outflow from your company: supplier payments, services, rent, salaries, etc. Each expense has a description, amount, category, supplier and date.\n\nExpenses allow you to keep detailed control of your outflows and calculate the real profitability of the business.',
        zh: '费用记录公司的资金支出：供应商付款、服务费、租金、工资等。每笔费用包含描述、金额、类别、供应商和日期。\n\n费用记录帮助您详细掌控支出并计算业务的实际盈利能力。',
      },
    },
    {
      icon: '📁',
      title: { es: 'Categorías de gasto', en: 'Expense categories', zh: '费用类别' },
      content: {
        es: 'Organiza tus gastos por categorías para obtener reportes más claros. Puedes crear categorías personalizadas desde la configuración.\n\nEjemplos comunes: Renta, Servicios, Nómina, Proveedores, Mantenimiento, Marketing.',
        en: 'Organize your expenses by categories for clearer reports. You can create custom categories from settings.\n\nCommon examples: Rent, Services, Payroll, Suppliers, Maintenance, Marketing.',
        zh: '按类别整理费用以获得更清晰的报告。您可以在设置中创建自定义类别。\n\n常见示例：租金、服务费、工资、供应商、维护、营销。',
      },
    },
    {
      icon: '📊',
      title: { es: 'Estados del gasto', en: 'Expense statuses', zh: '费用状态' },
      content: {
        es: '• Pendiente: el gasto fue registrado pero aún no se ha pagado o aprobado\n• Aprobado: el gasto fue revisado y aprobado\n• Rechazado: el gasto fue revisado y rechazado\n\nPuedes filtrar por estado para ver solo los gastos pendientes de pago o aprobación.',
        en: '• Pending: the expense was recorded but not yet paid or approved\n• Approved: the expense was reviewed and approved\n• Rejected: the expense was reviewed and rejected\n\nYou can filter by status to see only expenses pending payment or approval.',
        zh: '• 待处理：费用已登记但尚未付款或审批\n• 已批准：费用已审核并批准\n• 已拒绝：费用已审核并拒绝\n\n您可以按状态筛选，仅查看待付款或待审批的费用。',
      },
    },
    {
      icon: '💳',
      title: { es: 'Registrar un pago', en: 'Register a payment', zh: '登记付款' },
      content: {
        es: 'Un gasto puede pagarse en una o varias partes. Desde la tabla, usa el botón de pago para registrar un abono al gasto.\n\nEl campo "Restante" muestra cuánto falta por pagar. Cuando el monto restante llega a cero, el gasto queda completamente liquidado.',
        en: 'An expense can be paid in one or several parts. From the table, use the payment button to register a payment toward the expense.\n\nThe "Remaining" field shows how much is left to pay. When the remaining amount reaches zero, the expense is fully settled.',
        zh: '费用可以分一次或多次付款。在表格中，使用付款按钮登记费用付款。\n\n"剩余"字段显示还需支付的金额。当剩余金额归零时，费用完全结清。',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Búsqueda y filtros', en: 'Search and filters', zh: '搜索与筛选' },
      content: {
        es: 'Usa la barra de búsqueda para encontrar gastos por descripción o proveedor. Los filtros avanzados te permiten filtrar por:\n\n• Estado (pendiente, aprobado, rechazado)\n• Rango de fechas\n• Categoría\n\nTambién puedes exportar los resultados filtrados a CSV.',
        en: 'Use the search bar to find expenses by description or supplier. Advanced filters let you filter by:\n\n• Status (pending, approved, rejected)\n• Date range\n• Category\n\nYou can also export filtered results to CSV.',
        zh: '使用搜索栏按描述或供应商查找费用。高级筛选允许按以下条件筛选：\n\n• 状态（待处理、已批准、已拒绝）\n• 日期范围\n• 类别\n\n您也可以将筛选结果导出为CSV。',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar gastos', en: 'Delete expenses', zh: '删除费用' },
      content: {
        es: 'Puedes eliminar un gasto individual desde el menú de acciones en la tabla. También puedes seleccionar múltiples gastos y eliminarlos en lote usando la barra de acciones masivas.\n\nLa eliminación es permanente — asegúrate de que el gasto no tenga pagos asociados antes de eliminarlo.',
        en: 'You can delete an individual expense from the actions menu in the table. You can also select multiple expenses and delete them in bulk using the bulk actions bar.\n\nDeletion is permanent — make sure the expense has no associated payments before deleting it.',
        zh: '您可以从表格的操作菜单中删除单笔费用。也可以选择多笔费用，使用批量操作栏批量删除。\n\n删除是永久性的——删除前请确保该费用没有关联的付款记录。',
      },
    },
  ],
};
