import type { HelpConfig } from '../HelpButton';

export const accountsReceivableHelp: HelpConfig = {
  title: { es: 'Guía de Cuentas por Cobrar', en: 'Accounts Receivable Guide', zh: '应收账款指南' },
  description: {
    es: 'Controla lo que tus clientes te deben y registra sus pagos',
    en: 'Track what your clients owe you and record their payments',
    zh: '跟踪客户欠款并记录其付款',
  },
  sections: [
    {
      icon: '📥',
      title: { es: '¿Qué es una cuenta por cobrar?', en: 'What is an account receivable?', zh: '什么是应收账款？' },
      content: {
        es: 'Una cuenta por cobrar representa dinero que un cliente te debe. Se genera automáticamente cuando realizas una venta a crédito, o puedes crearla manualmente para registrar cualquier deuda de un cliente.\n\nCada cuenta tiene un monto total, un monto restante y una fecha de vencimiento.',
        en: 'An account receivable represents money a client owes you. It is automatically generated when you make a credit sale, or you can create it manually to record any client debt.\n\nEach account has a total amount, a remaining amount and a due date.',
        zh: '应收账款代表客户欠您的款项。在进行赊销时自动生成，也可以手动创建以记录客户的任何债务。\n\n每个账款都有总金额、剩余金额和到期日。',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Estados', en: 'Statuses', zh: '状态' },
      content: {
        es: '• Pendiente: sin pagos registrados aún\n• Parcial: tiene abonos pero aún queda saldo\n• Pagado: el cliente liquidó el total\n• Vencido: pasó la fecha de vencimiento sin pago completo\n• Cancelado: la cuenta fue cancelada manualmente\n\nEl estado se actualiza automáticamente al registrar pagos.',
        en: '• Pending: no payments registered yet\n• Partial: has payments but balance remains\n• Paid: client settled the full amount\n• Overdue: due date passed without full payment\n• Cancelled: account was manually cancelled\n\nStatus updates automatically when payments are registered.',
        zh: '• 待收：尚未登记任何付款\n• 部分收款：已有付款但仍有余额\n• 已收清：客户已全额结清\n• 逾期：到期日已过但未完全付款\n• 已取消：账款已手动取消\n\n登记付款后状态自动更新。',
      },
    },
    {
      icon: '💳',
      title: { es: 'Registrar un pago', en: 'Register a payment', zh: '登记收款' },
      content: {
        es: 'Desde la tabla, usa el botón de pago para registrar un abono. Puedes ingresar:\n\n• Monto del pago (parcial o total)\n• Fecha del pago\n• Método de pago (efectivo, transferencia, tarjeta, cheque)\n• Referencia y notas opcionales\n\nPuedes registrar múltiples pagos parciales hasta liquidar el total.',
        en: 'From the table, use the payment button to register a payment. You can enter:\n\n• Payment amount (partial or full)\n• Payment date\n• Payment method (cash, transfer, card, check)\n• Optional reference and notes\n\nYou can register multiple partial payments until the total is settled.',
        zh: '在表格中，使用付款按钮登记收款。您可以输入：\n\n• 收款金额（部分或全额）\n• 收款日期\n• 付款方式（现金、转账、刷卡、支票）\n• 可选参考和备注\n\n您可以登记多次部分收款，直到全额结清。',
      },
    },
    {
      icon: '📋',
      title: { es: 'Historial de pagos', en: 'Payment history', zh: '收款历史' },
      content: {
        es: 'Haz clic en "Ver pagos" para acceder al detalle completo de una cuenta: todos los abonos registrados, fechas, métodos de pago y el saldo restante en cada momento.\n\nEste historial es útil para resolver disputas o verificar el estado de una deuda.',
        en: 'Click "View payments" to access the full detail of an account: all registered payments, dates, payment methods and the remaining balance at each point.\n\nThis history is useful for resolving disputes or verifying the status of a debt.',
        zh: '点击"查看收款"以访问账款的完整详情：所有已登记的收款、日期、付款方式及每次的剩余余额。\n\n此历史记录有助于解决争议或核实债务状态。',
      },
    },
    {
      icon: '⚠️',
      title: { es: 'Cuentas vencidas', en: 'Overdue accounts', zh: '逾期账款' },
      content: {
        es: 'Una cuenta pasa a estado "Vencido" automáticamente cuando su fecha de vencimiento llega sin que se haya pagado el total. Usa el filtro de estado para ver solo las cuentas vencidas y dar seguimiento.\n\nPuedes editar la fecha de vencimiento si acordaste una prórroga con el cliente.',
        en: 'An account automatically becomes "Overdue" when its due date arrives without full payment. Use the status filter to see only overdue accounts and follow up.\n\nYou can edit the due date if you agreed on an extension with the client.',
        zh: '当到期日到达但未全额付款时，账款自动变为"逾期"状态。使用状态筛选器仅查看逾期账款并跟进。\n\n如果与客户协商了延期，可以编辑到期日。',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Filtros', en: 'Filters', zh: '筛选' },
      content: {
        es: 'Usa los filtros avanzados para encontrar cuentas por:\n\n• Estado (pendiente, parcial, pagado, vencido, cancelado)\n• Cliente específico\n\nTambién puedes buscar por número de referencia o nombre de cliente en la barra de búsqueda.',
        en: 'Use advanced filters to find accounts by:\n\n• Status (pending, partial, paid, overdue, cancelled)\n• Specific client\n\nYou can also search by reference number or client name in the search bar.',
        zh: '使用高级筛选按以下条件查找账款：\n\n• 状态（待收、部分收款、已收清、逾期、已取消）\n• 特定客户\n\n您也可以在搜索栏中按参考编号或客户名称搜索。',
      },
    },
  ],
};
