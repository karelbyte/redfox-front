import type { HelpConfig } from '../HelpButton';

export const cashRegisterHelp: HelpConfig = {
  title: { es: 'Guía de Caja', en: 'Cash Register Guide' },
  description: {
    es: 'Todo lo que necesitas saber para gestionar tu caja registradora',
    en: 'Everything you need to know to manage your cash register',
  },
  sections: [
    {
      icon: '🏧',
      title: { es: '¿Qué es la caja?', en: 'What is the cash register?' },
      content: {
        es: 'La caja registradora es el control central del dinero en tu punto de venta. Registra todas las entradas y salidas de efectivo, así como los pagos con tarjeta realizados durante el turno.\n\nCada turno comienza con una apertura de caja y termina con un cierre.',
        en: 'The cash register is the central money control at your point of sale. It records all cash inflows and outflows, as well as card payments made during the shift.\n\nEach shift starts with an opening and ends with a closing.',
      },
    },
    {
      icon: '▶️',
      title: { es: 'Abrir / Inicializar la caja', en: 'Open / Initialize the register' },
      content: {
        es: 'Para comenzar a operar, debes inicializar la caja con el monto de efectivo inicial (fondo de caja). Este monto representa el dinero con el que arrancas el turno para dar cambio.\n\nUsa el botón "Inicializar Caja" e ingresa el monto inicial. Una vez abierta, la caja estará lista para recibir ventas del POS.',
        en: 'To start operating, you must initialize the register with the initial cash amount (cash fund). This amount represents the money you start the shift with to give change.\n\nUse the "Initialize Register" button and enter the initial amount. Once open, the register is ready to receive POS sales.',
      },
    },
    {
      icon: '💰',
      title: { es: 'Balance de caja', en: 'Cash balance' },
      content: {
        es: '• Balance total: suma de todas las transacciones (efectivo + tarjeta) desde la apertura\n• Efectivo en caja: solo las transacciones en efectivo — ventas suman, devoluciones restan, ajustes pueden sumar o restar\n\nEl balance se actualiza automáticamente con cada venta del POS.',
        en: '• Total balance: sum of all transactions (cash + card) since opening\n• Cash in register: only cash transactions — sales add, refunds subtract, adjustments can add or subtract\n\nThe balance updates automatically with each POS sale.',
      },
    },
    {
      icon: '🔧',
      title: { es: 'Ajustes de caja', en: 'Cash adjustments' },
      content: {
        es: 'Desde el botón "Cajón" puedes registrar movimientos manuales:\n\n• Entrada de efectivo: cuando agregas dinero a la caja (ej. cambio de billetes)\n• Salida de efectivo: cuando retiras dinero (ej. pago a proveedor en efectivo)\n\nCada ajuste queda registrado en el historial de transacciones con su descripción.',
        en: 'From the "Drawer" button you can register manual movements:\n\n• Cash entry: when you add money to the register (e.g. bill change)\n• Cash exit: when you withdraw money (e.g. cash payment to supplier)\n\nEach adjustment is recorded in the transaction history with its description.',
      },
    },
    {
      icon: '🔒',
      title: { es: 'Cerrar la caja', en: 'Close the register' },
      content: {
        es: 'Al cerrar la caja terminas el turno. Debes ingresar el monto de efectivo contado físicamente. El sistema calculará la diferencia entre lo esperado y lo contado.\n\nUna vez cerrada, la caja queda en estado "cerrado" y no acepta más transacciones. Para operar de nuevo deberás abrir una nueva caja.',
        en: 'Closing the register ends the shift. You must enter the physically counted cash amount. The system will calculate the difference between expected and counted.\n\nOnce closed, the register is in "closed" status and accepts no more transactions. To operate again you must open a new register.',
      },
    },
    {
      icon: '📋',
      title: { es: 'Historial de transacciones', en: 'Transaction history' },
      content: {
        es: 'El historial muestra todos los movimientos de la caja actual:\n\n• Venta (verde): ingreso por venta del POS\n• Devolución (rojo): egreso por devolución de venta\n• Ajuste (amarillo): entrada o salida manual registrada\n• Cierre (morado): registro del cierre de turno\n\nPuedes refrescar el historial con el botón de actualizar.',
        en: 'The history shows all movements of the current register:\n\n• Sale (green): income from POS sale\n• Refund (red): outflow from sale refund\n• Adjustment (yellow): manual entry or exit recorded\n• Closing (purple): shift closing record\n\nYou can refresh the history with the update button.',
      },
    },
    {
      icon: '🖥️',
      title: { es: 'Relación con el POS', en: 'Relationship with POS' },
      content: {
        es: 'Cada venta realizada desde el Punto de Venta (POS) se registra automáticamente en la caja activa. Si no hay una caja abierta, el POS te pedirá inicializarla antes de procesar ventas.\n\nLas ventas a crédito no afectan el balance de caja — solo las ventas en efectivo y tarjeta.',
        en: 'Each sale made from the Point of Sale (POS) is automatically recorded in the active register. If there is no open register, the POS will ask you to initialize it before processing sales.\n\nCredit sales do not affect the cash balance — only cash and card sales.',
      },
    },
  ],
};
