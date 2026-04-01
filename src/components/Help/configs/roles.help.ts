import type { HelpConfig } from '../HelpButton';

export const rolesHelp: HelpConfig = {
  title: { es: 'Guía de Roles', en: 'Roles Guide' },
  description: {
    es: 'Controla qué puede hacer cada usuario en el sistema',
    en: 'Control what each user can do in the system',
  },
  sections: [
    {
      icon: '🎭',
      title: { es: '¿Qué es un rol?', en: 'What is a role?' },
      content: {
        es: 'Un rol es un conjunto de permisos que defines una vez y asignas a múltiples usuarios. En lugar de configurar permisos uno por uno para cada usuario, creas roles como "Vendedor", "Almacenista" o "Contador" y los asignas.\n\nCada usuario puede tener uno o más roles asignados.',
        en: 'A role is a set of permissions you define once and assign to multiple users. Instead of configuring permissions one by one for each user, you create roles like "Salesperson", "Warehouse" or "Accountant" and assign them.\n\nEach user can have one or more roles assigned.',
      },
    },
    {
      icon: '🔑',
      title: { es: 'Permisos', en: 'Permissions' },
      content: {
        es: 'Los permisos controlan el acceso a cada módulo y acción del sistema:\n\n• Ver: puede acceder y ver el módulo\n• Crear: puede crear nuevos registros\n• Editar: puede modificar registros existentes\n• Eliminar: puede eliminar registros\n• Exportar: puede exportar datos\n\nPuedes activar o desactivar cada permiso de forma granular al crear o editar un rol.',
        en: 'Permissions control access to each module and action in the system:\n\n• View: can access and see the module\n• Create: can create new records\n• Edit: can modify existing records\n• Delete: can delete records\n• Export: can export data\n\nYou can enable or disable each permission granularly when creating or editing a role.',
      },
    },
    {
      icon: '👁️',
      title: { es: 'Ver detalle del rol', en: 'View role detail' },
      content: {
        es: 'Haz clic en "Ver detalle" para acceder a la vista completa de un rol, donde puedes:\n\n• Ver todos los permisos asignados organizados por módulo\n• Editar los permisos directamente\n• Ver qué usuarios tienen este rol asignado\n\nEsta vista es útil para auditar y ajustar los permisos de un rol existente.',
        en: 'Click "View detail" to access the full view of a role, where you can:\n\n• See all assigned permissions organized by module\n• Edit permissions directly\n• See which users have this role assigned\n\nThis view is useful for auditing and adjusting permissions of an existing role.',
      },
    },
    {
      icon: '⚠️',
      title: { es: 'Roles del sistema', en: 'System roles' },
      content: {
        es: 'Algunos roles vienen predefinidos por el sistema (como "Administrador") y no pueden eliminarse. Estos roles garantizan que siempre haya al menos un usuario con acceso completo.\n\nPuedes crear tantos roles personalizados como necesites para tu estructura organizacional.',
        en: 'Some roles come predefined by the system (like "Administrator") and cannot be deleted. These roles ensure there is always at least one user with full access.\n\nYou can create as many custom roles as you need for your organizational structure.',
      },
    },
    {
      icon: '💡',
      title: { es: 'Buenas prácticas', en: 'Best practices' },
      content: {
        es: 'Recomendaciones para gestionar roles:\n\n• Principio de mínimo privilegio: da a cada rol solo los permisos que necesita\n• Crea roles por función: Vendedor, Almacenista, Contador, Supervisor\n• Revisa los roles periódicamente cuando cambien las responsabilidades\n• Evita dar permisos de eliminación a roles operativos\n• Reserva el rol de Administrador para usuarios de confianza',
        en: 'Recommendations for managing roles:\n\n• Principle of least privilege: give each role only the permissions it needs\n• Create roles by function: Salesperson, Warehouse, Accountant, Supervisor\n• Review roles periodically when responsibilities change\n• Avoid giving delete permissions to operational roles\n• Reserve the Administrator role for trusted users',
      },
    },
  ],
};
