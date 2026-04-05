import type { HelpConfig } from '../HelpButton';

export const accountsPayableHelp: HelpConfig = {
  title: { es: 'Guía de Cuentas por Pagar', en: 'Accounts Payable Guide', zh: '应付账款指南' },
  description: {
    es: 'Controla tus deudas con proveedores y registra tus pagos',
    en: 'Track your debts to suppliers and record your payments',
    zh: '跟踪您对供应商的欠款并记录付款',
  },
  sections: [
    {
      icon: '📤',
      title: { es: '¿Qué es una cuenta por pagar?', en: 'What is an account payable?', zh: '什么是应付账款？' },
      content: {
        es: 'Una cuenta por pagar representa dinero que le debes a un proveedor. Se puede generar automáticamente desde una orden de compra o crearla manualmente para registrar cualquier deuda con un proveedor.\n\nCada cuenta tiene un número de referencia, monto total, monto restante y fecha de vencimiento.',
        en: 'An account payable represents money you owe to a supplier. It can be automatically generated from a purchase order or created manually to record any supplier debt.\n\nEach account has a reference number, total amount, remaining amount and due date.',
        zh: '应付账款代表您欠供应商的款项。可以从采购订单自动生成，也可以手动创建以记录对供应商的任何债务。\n\n每个账款都有参考编号、总金额、剩余金额和到期日。',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Estados', en: 'Statuses', zh: '状态' },
      content: {
        es: '• Pendiente: sin pagos registrados aún\n• Parcial: tiene abonos pero aún queda saldo\n• Pagado: deuda liquidada en su totalidad\n• Vencido: pasó la fecha de vencimiento sin pago completo\n• Cancelado: la cuenta fue cancelada\n\nEl estado se actualiza automáticamente al registrar pagos.',
        en: '• Pending: no payments registered yet\n• Partial: has payments but balance remains\n• Paid: debt fully settled\n• Overdue: due date passed without full payment\n• Cancelled: account was cancelled\n\nStatus updates automatically when payments are registered.',
        zh: '• 待付：尚未登记任何付款\n• 部分付款：已有付款但仍有余额\n• 已付清：债务已全额结清\n• 逾期：到期日已过但未完全付款\n• 已取消：账款已取消\n\n登记付款后状态自动更新。',
      },
    },
    {
      icon: '💳',
      title: { es: 'Registrar un pago', en: 'Register a payment', zh: '登记付款' },
      content: {
        es: 'Desde la tabla, usa el botón de pago para registrar un abono al proveedor. Puedes ingresar:\n\n• Monto del pago (parcial o total)\n• Fecha del pago\n• Método de pago\n• Referencia y notas opcionales\n\nPuedes registrar múltiples pagos parciales hasta liquidar la deuda.',
        en: 'From the table, use the payment button to register a payment to the supplier. You can enter:\n\n• Payment amount (partial or full)\n• Payment date\n• Payment method\n• Optional reference and notes\n\nYou can register multiple partial payments until the debt is settled.',
        zh: '在表格中，使用付款按钮向供应商登记付款。您可以输入：\n\n• 付款金额（部分或全额）\n• 付款日期\n• 付款方式\n• 可选参考和备注\n\n您可以登记多次部分付款，直到债务结清。',
      },
    },
    {
      icon: '📋',
      title: { es: 'Historial de pagos', en: 'Payment history', zh: '付款历史' },
      content: {
        es: 'Haz clic en "Ver pagos" para acceder al detalle completo de una cuenta: todos los abonos realizados, fechas, métodos de pago y el saldo restante.\n\nEste historial te ayuda a llevar un control preciso de tus obligaciones con cada proveedor.',
        en: 'Click "View payments" to access the full detail of an account: all payments made, dates, payment methods and remaining balance.\n\nThis history helps you keep precise control of your obligations with each supplier.',
        zh: '点击"查看付款"以访问账款的完整详情：所有已付款项、日期、付款方式和剩余余额。\n\n此历史记录帮助您精确掌控对每个供应商的义务。',
      },
    },
    {
      icon: '📊',
      title: { es: 'Exportar', en: 'Export', zh: '导出' },
      content: {
        es: 'Puedes exportar la lista de cuentas por pagar a CSV para análisis externo o para compartir con tu contador.\n\nEl archivo incluye: número de referencia, proveedor, monto total, monto restante, fecha de vencimiento y estado.',
        en: 'You can export the accounts payable list to CSV for external analysis or to share with your accountant.\n\nThe file includes: reference number, supplier, total amount, remaining amount, due date and status.',
        zh: '您可以将应付账款列表导出为CSV，用于外部分析或与会计共享。\n\n文件包含：参考编号、供应商、总金额、剩余金额、到期日和状态。',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Filtros', en: 'Filters', zh: '筛选' },
      content: {
        es: 'Usa los filtros avanzados para encontrar cuentas por:\n\n• Estado (pendiente, parcial, pagado, vencido, cancelado)\n• Rango de fechas de vencimiento\n\nTambién puedes buscar por número de referencia o nombre de proveedor en la barra de búsqueda.',
        en: 'Use advanced filters to find accounts by:\n\n• Status (pending, partial, paid, overdue, cancelled)\n• Due date range\n\nYou can also search by reference number or supplier name in the search bar.',
        zh: '使用高级筛选按以下条件查找账款：\n\n• 状态（待付、部分付款、已付清、逾期、已取消）\n• 到期日范围\n\n您也可以在搜索栏中按参考编号或供应商名称搜索。',
      },
    },
  ],
};
