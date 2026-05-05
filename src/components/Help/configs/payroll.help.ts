import type { HelpConfig } from '../HelpButton';

export const payrollHelp: HelpConfig = {
  title: {
    es: 'Guía de Nómina',
    en: 'Payroll Guide',
    zh: '工资单指南',
  },
  description: {
    es: 'Gestiona los pagos, salarios, bonos y deducciones de tus empleados',
    en: 'Manage payments, salaries, bonuses, and deductions for your employees',
    zh: '管理员工的付款、薪水、奖金和扣除额',
  },
  sections: [
    {
      icon: '💵',
      title: { es: 'Cálculo del Neto', en: 'Net Pay Calculation', zh: '净工资计算' },
      content: {
        es: 'El sistema calcula automáticamente el Pago Neto sumando el Salario Base, Pago de Horas Extra y Bonos, y restando las Deducciones aplicables.',
        en: 'The system automatically calculates Net Pay by adding Base Salary, Overtime Pay, and Bonuses, and subtracting applicable Deductions.',
        zh: '系统通过将基本工资、加班费和奖金相加，并减去适用的扣除额，自动计算净工资。',
      },
    },
    {
      icon: '📅',
      title: { es: 'Períodos de Pago', en: 'Pay Periods', zh: '付款周期' },
      content: {
        es: 'Define claramente la fecha de inicio y fin del período que estás pagando. Esto ayuda a mantener un historial claro para auditorías y reportes fiscales.',
        en: 'Clearly define the start and end date of the period you are paying. This helps maintain a clear history for audits and tax reports.',
        zh: '明确定义您正在支付的时间段的开始和结束日期。这有助于维护审计和税务报告的清晰历史记录。',
      },
    },
    {
      icon: '⚙️',
      title: { es: 'Estados de Nómina', en: 'Payroll Status', zh: '工资单状态' },
      content: {
        es: 'Usa "Pendiente" para borradores, "Procesado" una vez que el pago se ha realizado, y "Cancelado" si hubo algún error que invalida el registro.',
        en: 'Use "Pending" for drafts, "Processed" once the payment has been made, and "Cancelled" if there was an error that invalidates the record.',
        zh: '使用“待处理”进行草稿，一旦付款完成则使用“已处理”，如果存在使记录失效的错误则使用“已取消”。',
      },
    },
  ],
};
