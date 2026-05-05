import type { HelpConfig } from '../HelpButton';

export const positionsHelp: HelpConfig = {
  title: {
    es: 'Guía de Puestos',
    en: 'Positions Guide',
    zh: '职位指南',
  },
  description: {
    es: 'Todo lo que necesitas saber para gestionar los cargos en tu empresa',
    en: 'Everything you need to know to manage roles in your company',
    zh: '管理公司职位所需了解的一切',
  },
  sections: [
    {
      icon: '💼',
      title: { es: '¿Qué es un puesto?', en: 'What is a position?', zh: '什么是职位？' },
      content: {
        es: 'Un puesto representa un cargo específico dentro de la empresa (por ejemplo: "Gerente de Ventas", "Desarrollador Senior"). Define las responsabilidades y a menudo está asociado a un departamento.',
        en: 'A position represents a specific role within the company (for example: "Sales Manager", "Senior Developer"). It defines responsibilities and is often associated with a department.',
        zh: '职位代表公司内的特定角色（例如：“销售经理”、“高级开发人员”）。它定义了职责，并通常与部门关联。',
      },
    },
    {
      icon: '💰',
      title: { es: 'Rangos Salariales', en: 'Salary Ranges', zh: '薪资范围' },
      content: {
        es: 'Puedes definir un salario mínimo y máximo para el puesto. Esto ayuda a Recursos Humanos a mantener la equidad interna y definir bandas salariales para nuevas contrataciones.',
        en: 'You can define a minimum and maximum salary for the position. This helps HR maintain internal equity and define salary bands for new hires.',
        zh: '您可以定义职位的最低和最高薪资。这有助于人力资源保持内部公平，并为新员工定义薪资范围。',
      },
    },
    {
      icon: '🏢',
      title: { es: 'Relación con Departamentos', en: 'Department Relationship', zh: '部门关系' },
      content: {
        es: 'Los puestos pueden vincularse directamente a un departamento. Esto simplifica la visualización de cuántos y cuáles puestos están disponibles en cada área de la organización.',
        en: 'Positions can be linked directly to a department. This simplifies viewing how many and which positions are available in each area of the organization.',
        zh: '职位可以直接链接到部门。这简化了查看组织每个区域中有多少和哪些职位的过程。',
      },
    },
  ],
};
