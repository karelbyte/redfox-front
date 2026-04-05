import type { HelpConfig } from '../HelpButton';

export const cashFlowHelp: HelpConfig = {
  title: { es: 'Guía de Flujo de Caja', en: 'Cash Flow Guide', zh: '现金流指南' },
  description: {
    es: 'Entiende el movimiento de dinero en tu negocio',
    en: 'Understand the movement of money in your business',
    zh: '了解您业务中的资金流动',
  },
  sections: [
    {
      icon: '💹',
      title: { es: '¿Qué es el flujo de caja?', en: 'What is cash flow?', zh: '什么是现金流？' },
      content: {
        es: 'El flujo de caja muestra todas las entradas y salidas de dinero de tu negocio en un período. A diferencia de las ganancias contables, el flujo de caja refleja el dinero real disponible.\n\nUn flujo positivo significa que entra más dinero del que sale. Un flujo negativo puede indicar problemas de liquidez aunque el negocio sea rentable.',
        en: 'Cash flow shows all money inflows and outflows in your business over a period. Unlike accounting profits, cash flow reflects the actual money available.\n\nPositive flow means more money comes in than goes out. Negative flow can indicate liquidity problems even if the business is profitable.',
        zh: '现金流显示一段时期内业务的所有资金流入和流出。与会计利润不同，现金流反映实际可用资金。\n\n正向现金流意味着流入多于流出。即使业务盈利，负向现金流也可能表明流动性问题。',
      },
    },
    {
      icon: '📊',
      title: { es: 'Resumen y métricas', en: 'Summary and metrics', zh: '摘要与指标' },
      content: {
        es: 'El panel de resumen muestra:\n\n• Total de ingresos: dinero que entró en el período\n• Total de egresos: dinero que salió en el período\n• Flujo neto: diferencia entre ingresos y egresos\n• Balance proyectado: estimación del saldo futuro\n\nLas tarjetas de resumen se actualizan según el rango de fechas seleccionado.',
        en: 'The summary panel shows:\n\n• Total income: money that came in during the period\n• Total expenses: money that went out during the period\n• Net flow: difference between income and expenses\n• Projected balance: estimated future balance\n\nSummary cards update according to the selected date range.',
        zh: '摘要面板显示：\n\n• 总收入：该时期流入的资金\n• 总支出：该时期流出的资金\n• 净现金流：收入与支出的差额\n• 预计余额：未来余额估算\n\n摘要卡片根据所选日期范围更新。',
      },
    },
    {
      icon: '📅',
      title: { es: 'Filtrar por período', en: 'Filter by period', zh: '按时间段筛选' },
      content: {
        es: 'Usa los campos de fecha de inicio y fin para analizar un período específico. Haz clic en "Aplicar" para actualizar todos los gráficos y tablas.\n\nSi no seleccionas fechas, se muestra el historial completo disponible. Usa "Limpiar" para volver a la vista general.',
        en: 'Use the start and end date fields to analyze a specific period. Click "Apply" to update all charts and tables.\n\nIf no dates are selected, the full available history is shown. Use "Clear" to return to the general view.',
        zh: '使用开始和结束日期字段分析特定时间段。点击"应用"更新所有图表和表格。\n\n如果未选择日期，则显示完整的可用历史记录。使用"清除"返回总览视图。',
      },
    },
    {
      icon: '📈',
      title: { es: 'Gráficas y tendencias', en: 'Charts and trends', zh: '图表与趋势' },
      content: {
        es: 'El dashboard incluye múltiples visualizaciones:\n\n• Gráfica de flujo: ingresos vs egresos por período\n• Gráficas avanzadas: análisis detallado por categoría\n• Tendencias: evolución del flujo en el tiempo\n• Comparativa: comparación entre períodos\n• Predicción: proyección basada en el historial\n• Comparativa anual: año actual vs año anterior',
        en: 'The dashboard includes multiple visualizations:\n\n• Flow chart: income vs expenses by period\n• Advanced charts: detailed analysis by category\n• Trends: flow evolution over time\n• Comparison: comparison between periods\n• Prediction: projection based on history\n• Year comparison: current year vs previous year',
        zh: '仪表板包含多种可视化图表：\n\n• 现金流图：按时间段显示收入与支出\n• 高级图表：按类别详细分析\n• 趋势：现金流随时间的变化\n• 对比：不同时间段的比较\n• 预测：基于历史数据的预测\n• 年度对比：当年与上年的比较',
      },
    },
    {
      icon: '📋',
      title: { es: 'Tabla de movimientos', en: 'Movements table', zh: '流水明细表' },
      content: {
        es: 'La tabla de movimientos lista cada transacción individual: ventas, gastos, pagos de cuentas por cobrar y por pagar, ajustes de caja, etc.\n\nCada movimiento muestra su tipo (ingreso/egreso), monto, fecha y descripción. Puedes revisar el detalle de cada operación que afecta tu flujo.',
        en: 'The movements table lists each individual transaction: sales, expenses, accounts receivable and payable payments, cash adjustments, etc.\n\nEach movement shows its type (income/expense), amount, date and description. You can review the detail of each operation that affects your flow.',
        zh: '流水明细表列出每笔单独交易：销售、费用、应收应付账款付款、现金调整等。\n\n每笔流水显示其类型（收入/支出）、金额、日期和描述。您可以查看影响现金流的每笔操作的详情。',
      },
    },
    {
      icon: '🔮',
      title: { es: 'Proyecciones', en: 'Projections', zh: '预测' },
      content: {
        es: 'El panel de proyecciones estima el flujo de los próximos 3 meses basándose en el historial de movimientos. Incluye:\n\n• Ingresos proyectados\n• Egresos proyectados\n• Balance neto esperado\n\nLas proyecciones son estimaciones — úsalas como referencia para planificar, no como cifras exactas.',
        en: 'The projections panel estimates the flow for the next 3 months based on movement history. Includes:\n\n• Projected income\n• Projected expenses\n• Expected net balance\n\nProjections are estimates — use them as a planning reference, not as exact figures.',
        zh: '预测面板根据流水历史估算未来3个月的现金流。包含：\n\n• 预计收入\n• 预计支出\n• 预期净余额\n\n预测仅为估算值——请将其作为规划参考，而非精确数字。',
      },
    },
    {
      icon: '📧',
      title: { es: 'Alertas y exportación', en: 'Alerts and export', zh: '提醒与导出' },
      content: {
        es: 'Puedes configurar alertas por correo cuando el flujo neto sea negativo o el balance proyectado caiga por debajo de un umbral.\n\nTambién puedes exportar el resumen y los movimientos del período seleccionado para compartir con tu equipo o contador.',
        en: 'You can configure email alerts when net flow is negative or projected balance falls below a threshold.\n\nYou can also export the summary and movements for the selected period to share with your team or accountant.',
        zh: '您可以配置邮件提醒，当净现金流为负或预计余额低于阈值时发送通知。\n\n您也可以导出所选时间段的摘要和流水，与团队或会计共享。',
      },
    },
  ],
};
