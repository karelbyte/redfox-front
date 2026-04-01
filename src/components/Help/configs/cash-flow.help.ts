import type { HelpConfig } from '../HelpButton';

export const cashFlowHelp: HelpConfig = {
  title: { es: 'Guía de Flujo de Caja', en: 'Cash Flow Guide' },
  description: {
    es: 'Entiende el movimiento de dinero en tu negocio',
    en: 'Understand the movement of money in your business',
  },
  sections: [
    {
      icon: '💹',
      title: { es: '¿Qué es el flujo de caja?', en: 'What is cash flow?' },
      content: {
        es: 'El flujo de caja muestra todas las entradas y salidas de dinero de tu negocio en un período. A diferencia de las ganancias contables, el flujo de caja refleja el dinero real disponible.\n\nUn flujo positivo significa que entra más dinero del que sale. Un flujo negativo puede indicar problemas de liquidez aunque el negocio sea rentable.',
        en: 'Cash flow shows all money inflows and outflows in your business over a period. Unlike accounting profits, cash flow reflects the actual money available.\n\nPositive flow means more money comes in than goes out. Negative flow can indicate liquidity problems even if the business is profitable.',
      },
    },
    {
      icon: '📊',
      title: { es: 'Resumen y métricas', en: 'Summary and metrics' },
      content: {
        es: 'El panel de resumen muestra:\n\n• Total de ingresos: dinero que entró en el período\n• Total de egresos: dinero que salió en el período\n• Flujo neto: diferencia entre ingresos y egresos\n• Balance proyectado: estimación del saldo futuro\n\nLas tarjetas de resumen se actualizan según el rango de fechas seleccionado.',
        en: 'The summary panel shows:\n\n• Total income: money that came in during the period\n• Total expenses: money that went out during the period\n• Net flow: difference between income and expenses\n• Projected balance: estimated future balance\n\nSummary cards update according to the selected date range.',
      },
    },
    {
      icon: '📅',
      title: { es: 'Filtrar por período', en: 'Filter by period' },
      content: {
        es: 'Usa los campos de fecha de inicio y fin para analizar un período específico. Haz clic en "Aplicar" para actualizar todos los gráficos y tablas.\n\nSi no seleccionas fechas, se muestra el historial completo disponible. Usa "Limpiar" para volver a la vista general.',
        en: 'Use the start and end date fields to analyze a specific period. Click "Apply" to update all charts and tables.\n\nIf no dates are selected, the full available history is shown. Use "Clear" to return to the general view.',
      },
    },
    {
      icon: '📈',
      title: { es: 'Gráficas y tendencias', en: 'Charts and trends' },
      content: {
        es: 'El dashboard incluye múltiples visualizaciones:\n\n• Gráfica de flujo: ingresos vs egresos por período\n• Gráficas avanzadas: análisis detallado por categoría\n• Tendencias: evolución del flujo en el tiempo\n• Comparativa: comparación entre períodos\n• Predicción: proyección basada en el historial\n• Comparativa anual: año actual vs año anterior',
        en: 'The dashboard includes multiple visualizations:\n\n• Flow chart: income vs expenses by period\n• Advanced charts: detailed analysis by category\n• Trends: flow evolution over time\n• Comparison: comparison between periods\n• Prediction: projection based on history\n• Year comparison: current year vs previous year',
      },
    },
    {
      icon: '📋',
      title: { es: 'Tabla de movimientos', en: 'Movements table' },
      content: {
        es: 'La tabla de movimientos lista cada transacción individual: ventas, gastos, pagos de cuentas por cobrar y por pagar, ajustes de caja, etc.\n\nCada movimiento muestra su tipo (ingreso/egreso), monto, fecha y descripción. Puedes revisar el detalle de cada operación que afecta tu flujo.',
        en: 'The movements table lists each individual transaction: sales, expenses, accounts receivable and payable payments, cash adjustments, etc.\n\nEach movement shows its type (income/expense), amount, date and description. You can review the detail of each operation that affects your flow.',
      },
    },
    {
      icon: '🔮',
      title: { es: 'Proyecciones', en: 'Projections' },
      content: {
        es: 'El panel de proyecciones estima el flujo de los próximos 3 meses basándose en el historial de movimientos. Incluye:\n\n• Ingresos proyectados\n• Egresos proyectados\n• Balance neto esperado\n\nLas proyecciones son estimaciones — úsalas como referencia para planificar, no como cifras exactas.',
        en: 'The projections panel estimates the flow for the next 3 months based on movement history. Includes:\n\n• Projected income\n• Projected expenses\n• Expected net balance\n\nProjections are estimates — use them as a planning reference, not as exact figures.',
      },
    },
    {
      icon: '📧',
      title: { es: 'Alertas y exportación', en: 'Alerts and export' },
      content: {
        es: 'Puedes configurar alertas por correo cuando el flujo neto sea negativo o el balance proyectado caiga por debajo de un umbral.\n\nTambién puedes exportar el resumen y los movimientos del período seleccionado para compartir con tu equipo o contador.',
        en: 'You can configure email alerts when net flow is negative or projected balance falls below a threshold.\n\nYou can also export the summary and movements for the selected period to share with your team or accountant.',
      },
    },
  ],
};
