import type { HelpConfig } from '../HelpButton';

export const accountsReceivableHelp: HelpConfig = {
  title: { es: 'Guía de Cuentas por Cobrar', en: 'Accounts Receivable Guide' },
  description: {
    es: 'Controla lo que tus clientes te deben y registra sus pagos',
    en: 'Track what your clients owe you and record their payments',
  },
  sections: [
    {
      icon: '📥',
      title: { es: '¿Qué es una cuenta por cobrar?', en: 'What is an account receivable?' },
      content: {
        es: 'Una cuenta por cobrar representa dinero que un cliente te debe. Se genera automáticamente cuando realizas una venta a crédito, o puedes crearla manualmente para registrar cualquier deuda de un cliente.\n\nCada cuenta tiene un monto total, un monto restante y una fecha de vencimiento.',
        en: 'An account receivable represents money a client owes you. It is automatically generated when you make a credit sale, or you can create it manually to record any client debt.\n\nEach account has a total amount, a remaining amount and a due date.',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Estados', en: 'Statuses' },
      content: {
        es: '• Pendiente: sin pagos registrados aún\n• Parcial: tiene abonos pero aún queda saldo\n• Pagado: el cliente liquidó el total\n• Vencido: pasó la fecha de vencimiento sin pago completo\n• Cancelado: la cuenta fue cancelada manualmente\n\nEl estado se actualiza automáticamente al registrar pagos.',
        en: '• Pending: no payments registered yet\n• Partial: has payments but balance remains\n• Paid: client settled the full amount\n• Overdue: due date passed without full payment\n• Cancelled: account was manually cancelled\n\nStatus updates automatically when payments are registered.',
      },
    },
    {
      icon: '💳',
      title: { es: 'Registrar un pago', en: 'Register a payment' },
      content: {
        es: 'Desde la tabla, usa el botón de pago para registrar un abono. Puedes ingresar:\n\n• Monto del pago (parcial o total)\n• Fecha del pago\n• Método de pago (efectivo, transferencia, tarjeta, cheque)\n• Referencia y notas opcionales\n\nPuedes registrar múltiples pagos parciales hasta liquidar el total.',
        en: 'From the table, use the payment button to register a payment. You can enter:\n\n• Payment amount (partial or full)\n• Payment date\n• Payment method (cash, transfer, card, check)\n• Optional reference and notes\n\nYou can register multiple partial payments until the total is settled.',
      },
    },
    {
      icon: '📋',
      title: { es: 'Historial de pagos', en: 'Payment history' },
      content: {
        es: 'Haz clic en "Ver pagos" para acceder al detalle completo de una cuenta: todos los abonos registrados, fechas, métodos de pago y el saldo restante en cada momento.\n\nEste historial es útil para resolver disputas o verificar el estado de una deuda.',
        en: 'Click "View payments" to access the full detail of an account: all registered payments, dates, payment methods and the remaining balance at each point.\n\nThis history is useful for resolving disputes or verifying the status of a debt.',
      },
    },
    {
      icon: '⚠️',
      title: { es: 'Cuentas vencidas', en: 'Overdue accounts' },
      content: {
        es: 'Una cuenta pasa a estado "Vencido" automáticamente cuando su fecha de vencimiento llega sin que se haya pagado el total. Usa el filtro de estado para ver solo las cuentas vencidas y dar seguimiento.\n\nPuedes editar la fecha de vencimiento si acordaste una prórroga con el cliente.',
        en: 'An account automatically becomes "Overdue" when its due date arrives without full payment. Use the status filter to see only overdue accounts and follow up.\n\nYou can edit the due date if you agreed on an extension with the client.',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Filtros', en: 'Filters' },
      content: {
        es: 'Usa los filtros avanzados para encontrar cuentas por:\n\n• Estado (pendiente, parcial, pagado, vencido, cancelado)\n• Cliente específico\n\nTambién puedes buscar por número de referencia o nombre de cliente en la barra de búsqueda.',
        en: 'Use advanced filters to find accounts by:\n\n• Status (pending, partial, paid, overdue, cancelled)\n• Specific client\n\nYou can also search by reference number or client name in the search bar.',
      },
    },
  ],
};
