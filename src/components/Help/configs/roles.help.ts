import type { HelpConfig } from '../HelpButton';

export const rolesHelp: HelpConfig = {
  title: { es: 'Guía de Roles', en: 'Roles Guide', zh: '角色指南' },
  description: {
    es: 'Controla qué puede hacer cada usuario en el sistema',
    en: 'Control what each user can do in the system',
    zh: '控制每个用户在系统中可以执行的操作',
  },
  sections: [
    {
      icon: '🎭',
      title: { es: '¿Qué es un rol?', en: 'What is a role?', zh: '什么是角色？' },
      content: {
        es: 'Un rol es un conjunto de permisos que defines una vez y asignas a múltiples usuarios. En lugar de configurar permisos uno por uno para cada usuario, creas roles como "Vendedor", "Almacenista" o "Contador" y los asignas.\n\nCada usuario puede tener uno o más roles asignados.',
        en: 'A role is a set of permissions you define once and assign to multiple users. Instead of configuring permissions one by one for each user, you create roles like "Salesperson", "Warehouse" or "Accountant" and assign them.\n\nEach user can have one or more roles assigned.',
        zh: '角色是您定义一次并分配给多个用户的权限集合。无需逐一为每个用户配置权限，而是创建"销售员"、"仓库管理员"或"会计"等角色并分配。\n\n每个用户可以分配一个或多个角色。',
      },
    },
    {
      icon: '🔑',
      title: { es: 'Permisos', en: 'Permissions', zh: '权限' },
      content: {
        es: 'Los permisos controlan el acceso a cada módulo y acción del sistema:\n\n• Ver: puede acceder y ver el módulo\n• Crear: puede crear nuevos registros\n• Editar: puede modificar registros existentes\n• Eliminar: puede eliminar registros\n• Exportar: puede exportar datos\n\nPuedes activar o desactivar cada permiso de forma granular al crear o editar un rol.',
        en: 'Permissions control access to each module and action in the system:\n\n• View: can access and see the module\n• Create: can create new records\n• Edit: can modify existing records\n• Delete: can delete records\n• Export: can export data\n\nYou can enable or disable each permission granularly when creating or editing a role.',
        zh: '权限控制对系统中每个模块和操作的访问：\n\n• 查看：可以访问和查看模块\n• 创建：可以创建新记录\n• 编辑：可以修改现有记录\n• 删除：可以删除记录\n• 导出：可以导出数据\n\n创建或编辑角色时，可以精细地启用或禁用每个权限。',
      },
    },
    {
      icon: '👁️',
      title: { es: 'Ver detalle del rol', en: 'View role detail', zh: '查看角色详情' },
      content: {
        es: 'Haz clic en "Ver detalle" para acceder a la vista completa de un rol, donde puedes:\n\n• Ver todos los permisos asignados organizados por módulo\n• Editar los permisos directamente\n• Ver qué usuarios tienen este rol asignado\n\nEsta vista es útil para auditar y ajustar los permisos de un rol existente.',
        en: 'Click "View detail" to access the full view of a role, where you can:\n\n• See all assigned permissions organized by module\n• Edit permissions directly\n• See which users have this role assigned\n\nThis view is useful for auditing and adjusting permissions of an existing role.',
        zh: '点击"查看详情"访问角色的完整视图，在那里您可以：\n\n• 查看按模块整理的所有已分配权限\n• 直接编辑权限\n• 查看哪些用户分配了此角色\n\n此视图有助于审计和调整现有角色的权限。',
      },
    },
    {
      icon: '⚠️',
      title: { es: 'Roles del sistema', en: 'System roles', zh: '系统角色' },
      content: {
        es: 'Algunos roles vienen predefinidos por el sistema (como "Administrador") y no pueden eliminarse. Estos roles garantizan que siempre haya al menos un usuario con acceso completo.\n\nPuedes crear tantos roles personalizados como necesites para tu estructura organizacional.',
        en: 'Some roles come predefined by the system (like "Administrator") and cannot be deleted. These roles ensure there is always at least one user with full access.\n\nYou can create as many custom roles as you need for your organizational structure.',
        zh: '某些角色由系统预定义（如"管理员"），无法删除。这些角色确保始终至少有一个具有完全访问权限的用户。\n\n您可以根据组织结构创建任意数量的自定义角色。',
      },
    },
    {
      icon: '💡',
      title: { es: 'Buenas prácticas', en: 'Best practices', zh: '最佳实践' },
      content: {
        es: 'Recomendaciones para gestionar roles:\n\n• Principio de mínimo privilegio: da a cada rol solo los permisos que necesita\n• Crea roles por función: Vendedor, Almacenista, Contador, Supervisor\n• Revisa los roles periódicamente cuando cambien las responsabilidades\n• Evita dar permisos de eliminación a roles operativos\n• Reserva el rol de Administrador para usuarios de confianza',
        en: 'Recommendations for managing roles:\n\n• Principle of least privilege: give each role only the permissions it needs\n• Create roles by function: Salesperson, Warehouse, Accountant, Supervisor\n• Review roles periodically when responsibilities change\n• Avoid giving delete permissions to operational roles\n• Reserve the Administrator role for trusted users',
        zh: '角色管理建议：\n\n• 最小权限原则：只给每个角色所需的权限\n• 按职能创建角色：销售员、仓库管理员、会计、主管\n• 职责变更时定期审查角色\n• 避免给运营角色赋予删除权限\n• 将管理员角色保留给受信任的用户',
      },
    },
  ],
};
