import type { HelpConfig } from '../HelpButton';

export const leaveRequestsHelp: HelpConfig = {
  title: {
    es: 'Guía de Ausencias y Permisos',
    en: 'Leave Requests Guide',
    zh: '请假申请指南',
  },
  description: {
    es: 'Gestiona vacaciones, permisos por enfermedad y otras ausencias de tu equipo',
    en: 'Manage vacations, sick leave, and other absences for your team',
    zh: '管理团队的假期、病假和其他缺勤',
  },
  sections: [
    {
      icon: '🌴',
      title: { es: 'Tipos de Permisos', en: 'Leave Types', zh: '请假类型' },
      content: {
        es: 'Puedes clasificar las ausencias en diferentes categorías: Vacaciones, Enfermedad, Asuntos Personales, Maternidad o Paternidad. Esto te ayuda a llevar un mejor control del saldo de días disponibles.',
        en: 'You can classify absences into different categories: Vacation, Sick, Personal, Maternity or Paternity. This helps you better track available days balance.',
        zh: '您可以将缺勤分类为不同的类别：年假、病假、事假、产假或陪产假。这有助于您更好地跟踪可用天数余额。',
      },
    },
    {
      icon: '✅',
      title: { es: 'Flujo de Aprobación', en: 'Approval Flow', zh: '审批流程' },
      content: {
        es: 'Toda solicitud inicia en estado "Pendiente". Los administradores o gerentes pueden cambiar el estado a "Aprobado" o "Rechazado". El empleado también puede marcarla como "Cancelada".',
        en: 'Every request starts in "Pending" status. Administrators or managers can change the status to "Approved" or "Rejected". The employee can also mark it as "Cancelled".',
        zh: '所有请求都以“待处理”状态开始。管理员或经理可以将状态更改为“已批准”或“已拒绝”。员工也可以将其标记为“已取消”。',
      },
    },
    {
      icon: '📅',
      title: { es: 'Fechas y Días', en: 'Dates and Days', zh: '日期和天数' },
      content: {
        es: 'Asegúrate de especificar correctamente la fecha de inicio, la fecha de fin y la cantidad total de días laborables que abarca el permiso.',
        en: 'Make sure to correctly specify the start date, end date, and the total number of working days covered by the leave.',
        zh: '请确保正确指定开始日期、结束日期以及休假涵盖的总工作日数。',
      },
    },
  ],
};
