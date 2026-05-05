import type { HelpConfig } from '../HelpButton';

export const employeesHelp: HelpConfig = {
  title: {
    es: 'Guía de Empleados',
    en: 'Employees Guide',
    zh: '员工指南',
  },
  description: {
    es: 'Todo lo que necesitas saber para gestionar tu personal',
    en: 'Everything you need to know to manage your staff',
    zh: '管理员工所需了解的一切',
  },
  sections: [
    {
      icon: '👥',
      title: { es: '¿Qué es un empleado?', en: 'What is an employee?', zh: '什么是员工？' },
      content: {
        es: 'Un empleado es cualquier persona que trabaja en tu organización. Cada empleado tiene un código único y puede registrarse su información personal, de contacto, su asignación a un departamento, puesto y manager directo.',
        en: 'An employee is anyone who works in your organization. Each employee has a unique code and can have their personal and contact information registered, as well as their department assignment, position, and direct manager.',
        zh: '员工是在您的组织中工作的任何人。每个员工都有一个唯一的代码，可以登记其个人和联系信息，以及其部门分配、职位和直接经理。',
      },
    },
    {
      icon: '🏷️',
      title: { es: 'Código de empleado', en: 'Employee code', zh: '员工代码' },
      content: {
        es: 'El código de empleado sirve para identificar unívocamente a cada miembro del personal en el sistema. Puedes definir tu propio formato (ej. EMP-001) para que coincida con tus expedientes físicos o sistemas externos.',
        en: 'The employee code uniquely identifies each staff member in the system. You can define your own format (e.g., EMP-001) to match your physical records or external systems.',
        zh: '员工代码在系统中唯一标识每位员工。您可以定义自己的格式（例如 EMP-001）以匹配您的物理档案或外部系统。',
      },
    },
    {
      icon: '🏢',
      title: { es: 'Estructura Organizacional', en: 'Organizational Structure', zh: '组织结构' },
      content: {
        es: 'Puedes asignar a cada empleado un Departamento y un Puesto específico. También puedes seleccionar quién es su Manager directo. Estos datos ayudan a estructurar tu organigrama y permisos a futuro.',
        en: 'You can assign each employee a specific Department and Position. You can also select who their direct Manager is. This data helps structure your organizational chart and permissions in the future.',
        zh: '您可以为每位员工分配特定的部门和职位。您还可以选择他们的直接经理。这些数据有助于未来构建您的组织架构图和权限体系。',
      },
    },
    {
      icon: '⚙️',
      title: { es: 'Estado del empleado', en: 'Employee status', zh: '员工状态' },
      content: {
        es: 'Si un empleado se da de baja de la empresa, es recomendable cambiar su estado a "Inactivo" en lugar de borrar el registro. Así se preserva su historial de actividades, nóminas o reportes vinculados sin que aparezca como personal activo.',
        en: 'If an employee leaves the company, it is recommended to change their status to "Inactive" instead of deleting the record. This preserves their history of activities, payrolls, or linked reports without showing them as active staff.',
        zh: '如果员工离职，建议将其状态更改为"非活跃"而不是删除记录。这样可以保留其活动历史、工资单或关联报表，同时不会将其显示为在职员工。',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar empleados', en: 'Delete employees', zh: '删除员工' },
      content: {
        es: 'Solo se deben eliminar los empleados si fueron creados por error y no tienen historial asociado en el sistema (como asistencia, nómina o acciones realizadas).',
        en: 'Employees should only be deleted if they were created by mistake and have no associated history in the system (such as attendance, payroll, or performed actions).',
        zh: '只有当员工是错误创建且在系统中没有相关历史记录（如考勤、工资单或执行的操作）时，才应删除员工。',
      },
    },
  ],
};
