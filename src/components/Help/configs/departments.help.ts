import type { HelpConfig } from '../HelpButton';

export const departmentsHelp: HelpConfig = {
  title: {
    es: 'Guía de Departamentos',
    en: 'Departments Guide',
    zh: '部门指南',
  },
  description: {
    es: 'Todo lo que necesitas saber para organizar tu empresa',
    en: 'Everything you need to know to organize your company',
    zh: '组织公司所需了解的一切',
  },
  sections: [
    {
      icon: '🏢',
      title: { es: '¿Qué es un departamento?', en: 'What is a department?', zh: '什么是部门？' },
      content: {
        es: 'Un departamento es una agrupación lógica dentro de tu organización (por ejemplo: Ventas, Recursos Humanos, TI). Permite estructurar a los empleados y facilitar la gestión.',
        en: 'A department is a logical grouping within your organization (for example: Sales, Human Resources, IT). It allows structuring employees and facilitating management.',
        zh: '部门是组织内的逻辑分组（例如：销售部、人力资源部、IT部）。它可以用来构建员工结构并促进管理。',
      },
    },
    {
      icon: '👤',
      title: { es: 'Manager de Departamento', en: 'Department Manager', zh: '部门经理' },
      content: {
        es: 'Puedes asignar a un empleado específico como el "Manager" del departamento. Esto ayuda a definir la jerarquía en los permisos y procesos de aprobación.',
        en: 'You can assign a specific employee as the "Manager" of the department. This helps define the hierarchy in permissions and approval processes.',
        zh: '您可以指定一名特定员工担任部门“经理”。这有助于定义权限和审批流程的层级结构。',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar departamentos', en: 'Delete departments', zh: '删除部门' },
      content: {
        es: 'Solo puedes eliminar un departamento si no tiene empleados asignados a él actualmente.',
        en: 'You can only delete a department if it has no employees currently assigned to it.',
        zh: '只有当部门目前没有分配任何员工时，您才能删除它。',
      },
    },
  ],
};
