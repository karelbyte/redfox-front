import type { HelpConfig } from '../HelpButton';

export const attendanceHelp: HelpConfig = {
  title: {
    es: 'Guía de Asistencia',
    en: 'Attendance Guide',
    zh: '出勤指南',
  },
  description: {
    es: 'Controla y monitorea los horarios y asistencia de tus empleados',
    en: 'Control and monitor your employees\' schedules and attendance',
    zh: '控制并监控员工的时间表和出勤',
  },
  sections: [
    {
      icon: '⏰',
      title: { es: 'Registro de Horarios', en: 'Time Tracking', zh: '时间跟踪' },
      content: {
        es: 'Puedes registrar la hora exacta de entrada (Check In) y salida (Check Out) de cada empleado. Esto permite calcular las horas trabajadas automáticamente.',
        en: 'You can record the exact Check In and Check Out time for each employee. This allows calculating worked hours automatically.',
        zh: '您可以记录每个员工的确切上班和下班时间。这可以自动计算工作时间。',
      },
    },
    {
      icon: '📊',
      title: { es: 'Estados de Asistencia', en: 'Attendance Status', zh: '出勤状态' },
      content: {
        es: 'Clasifica el día de cada empleado como: Presente, Ausente, Tarde o Medio Día. Esto te ayudará a generar reportes precisos para nómina.',
        en: 'Classify each employee\'s day as: Present, Absent, Late, or Half Day. This will help you generate accurate payroll reports.',
        zh: '将每个员工的一天分类为：出勤、缺勤、迟到或半天。这将帮助您生成准确的工资单报告。',
      },
    },
    {
      icon: '📝',
      title: { es: 'Notas Adicionales', en: 'Additional Notes', zh: '补充说明' },
      content: {
        es: 'Utiliza el campo de notas para documentar razones de retraso, justificaciones breves o cualquier incidente relevante del día.',
        en: 'Use the notes field to document reasons for lateness, brief justifications, or any relevant incident of the day.',
        zh: '使用注释字段记录迟到原因、简短的理由或当天的任何相关事件。',
      },
    },
  ],
};
