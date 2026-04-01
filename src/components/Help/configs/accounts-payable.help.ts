import type { HelpConfig } from '../HelpButton';

export const accountsPayableHelp: HelpConfig = {
  title: { es: 'Guía de Cuentas por Pagar', en: 'Accounts Payable Guide' },
  description: {
    es: 'Controla tus deudas con proveedores y registra tus pagos',
    en: 'Track your debts to suppliers and record your payments',
  },
  sections: [
    {
      icon: '📤',
      title: { es: '¿Qué es una cuenta por pagar?', en: 'What is an account payable?' },
      content: {
        es: 'Una cuenta por pagar representa dinero que le debes a un proveedor. Se puede generar automáticamente desde una orden de compra o crearla manualmente para registrar cualquier deuda con un proveedor.\n\nCada cuenta tiene un número de referencia, monto total, monto restante y fecha de vencimiento.',
        en: 'An account payable represents money you owe to a supplier. It can be automatically generated from a purchase order or created manually to record any supplier debt.\n\nEach account has a reference number, total amount, remaining amount and due date.',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Estados', en: 'Statuses' },
      content: {
        es: '• Pendiente: sin pagos registrados aún\n• Parcial: tiene abonos pero aún queda saldo\n• Pagado: deuda liquidada en su totalidad\n• Vencido: pasó la fecha de vencimiento sin pago completo\n• Cancelado: la cuenta fue cancelada\n\nEl estado se actualiza automáticamente al registrar pagos.',
        en: '• Pending: no payments registered yet\n• Partial: has payments but balance remains\n• Paid: debt fully settled\n• Overdue: due date passed without full payment\n• Cancelled: account was cancelled\n\nStatus updates automatically when payments are registered.',
      },
    },
    {
      icon: '💳',
      title: { es: 'Registrar un pago', en: 'Register a payment' },
      content: {
        es: 'Desde la tabla, usa el botón de pago para registrar un abono al proveedor. Puedes ingresar:\n\n• Monto del pago (parcial o total)\n• Fecha del pago\n• Método de pago\n• Referencia y notas opcionales\n\nPuedes registrar múltiples pagos parciales hasta liquidar la deuda.',
        en: 'From the table, use the payment button to register a payment to the supplier. You can enter:\n\n• Payment amount (partial or full)\n• Payment date\n• Payment method\n• Optional reference and notes\n\nYou can register multiple partial payments until the debt is settled.',
      },
    },
    {
      icon: '📋',
      title: { es: 'Historial de pagos', en: 'Payment history' },
      content: {
        es: 'Haz clic en "Ver pagos" para acceder al detalle completo de una cuenta: todos los abonos realizados, fechas, métodos de pago y el saldo restante.\n\nEste historial te ayuda a llevar un control preciso de tus obligaciones con cada proveedor.',
        en: 'Click "View payments" to access the full detail of an account: all payments made, dates, payment methods and remaining balance.\n\nThis history helps you keep precise control of your obligations with each supplier.',
      },
    },
    {
      icon: '📊',
      title: { es: 'Exportar', en: 'Export' },
      content: {
        es: 'Puedes exportar la lista de cuentas por pagar a CSV para análisis externo o para compartir con tu contador.\n\nEl archivo incluye: número de referencia, proveedor, monto total, monto restante, fecha de vencimiento y estado.',
        en: 'You can export the accounts payable list to CSV for external analysis or to share with your accountant.\n\nThe file includes: reference number, supplier, total amount, remaining amount, due date and status.',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Filtros', en: 'Filters' },
      content: {
        es: 'Usa los filtros avanzados para encontrar cuentas por:\n\n• Estado (pendiente, parcial, pagado, vencido, cancelado)\n• Rango de fechas de vencimiento\n\nTambién puedes buscar por número de referencia o nombre de proveedor en la barra de búsqueda.',
        en: 'Use advanced filters to find accounts by:\n\n• Status (pending, partial, paid, overdue, cancelled)\n• Due date range\n\nYou can also search by reference number or supplier name in the search bar.',
      },
    },
  ],
};
