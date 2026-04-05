import type { HelpConfig } from '../HelpButton';

export const usersHelp: HelpConfig = {
  title: { es: 'Guía de Usuarios', en: 'Users Guide', zh: '用户指南' },
  description: {
    es: 'Gestiona quién tiene acceso al sistema y con qué permisos',
    en: 'Manage who has access to the system and with what permissions',
    zh: '管理谁可以访问系统及其权限',
  },
  sections: [
    {
      icon: '👤',
      title: { es: 'Crear un usuario', en: 'Create a user', zh: '创建用户' },
      content: {
        es: 'Para dar acceso al sistema a un colaborador, crea un usuario con:\n\n• Nombre completo\n• Correo electrónico (será su nombre de usuario para iniciar sesión)\n• Contraseña inicial\n• Rol o roles asignados\n\nEl usuario recibirá sus credenciales y podrá acceder según los permisos de sus roles.',
        en: 'To give a collaborator access to the system, create a user with:\n\n• Full name\n• Email address (will be their username to log in)\n• Initial password\n• Assigned role or roles\n\nThe user will receive their credentials and can access according to their role permissions.',
        zh: '要为协作者提供系统访问权限，请创建包含以下信息的用户：\n\n• 全名\n• 电子邮件地址（将作为登录用户名）\n• 初始密码\n• 分配的角色\n\n用户将收到凭据，并可根据其角色权限访问系统。',
      },
    },
    {
      icon: '🎭',
      title: { es: 'Asignar roles', en: 'Assign roles', zh: '分配角色' },
      content: {
        es: 'Cada usuario debe tener al menos un rol asignado. Los roles determinan a qué módulos puede acceder y qué acciones puede realizar.\n\nPuedes asignar múltiples roles a un usuario — sus permisos serán la unión de todos los roles. Por ejemplo, un usuario con roles "Vendedor" y "Almacenista" tendrá los permisos de ambos.',
        en: 'Each user must have at least one role assigned. Roles determine which modules they can access and what actions they can perform.\n\nYou can assign multiple roles to a user — their permissions will be the union of all roles. For example, a user with "Salesperson" and "Warehouse" roles will have permissions from both.',
        zh: '每个用户必须至少分配一个角色。角色决定他们可以访问哪些模块以及可以执行哪些操作。\n\n您可以为用户分配多个角色——其权限将是所有角色的并集。例如，拥有"销售员"和"仓库管理员"角色的用户将拥有两者的权限。',
      },
    },
    {
      icon: '🔒',
      title: { es: 'Estado del usuario', en: 'User status', zh: '用户状态' },
      content: {
        es: 'Un usuario puede estar activo o inactivo:\n\n• Activo: puede iniciar sesión y usar el sistema\n• Inactivo: no puede iniciar sesión aunque tenga credenciales válidas\n\nDesactiva un usuario cuando un colaborador deja la empresa en lugar de eliminarlo, para conservar el historial de sus acciones en los logs de auditoría.',
        en: 'A user can be active or inactive:\n\n• Active: can log in and use the system\n• Inactive: cannot log in even with valid credentials\n\nDeactivate a user when a collaborator leaves the company instead of deleting them, to preserve the history of their actions in audit logs.',
        zh: '用户可以处于活跃或非活跃状态：\n\n• 活跃：可以登录并使用系统\n• 非活跃：即使有有效凭据也无法登录\n\n当协作者离开公司时，请停用用户而非删除，以保留其在审计日志中的操作历史。',
      },
    },
    {
      icon: '👁️',
      title: { es: 'Ver detalle del usuario', en: 'View user detail', zh: '查看用户详情' },
      content: {
        es: 'Haz clic en "Ver detalle" para acceder al perfil completo de un usuario:\n\n• Información personal y de contacto\n• Roles asignados\n• Historial de actividad reciente\n• Opciones para cambiar contraseña o desactivar la cuenta\n\nEsta vista es útil para auditar el acceso y actividad de cada colaborador.',
        en: 'Click "View detail" to access the full profile of a user:\n\n• Personal and contact information\n• Assigned roles\n• Recent activity history\n• Options to change password or deactivate the account\n\nThis view is useful for auditing the access and activity of each collaborator.',
        zh: '点击"查看详情"访问用户的完整档案：\n\n• 个人和联系信息\n• 已分配角色\n• 近期活动历史\n• 更改密码或停用账户的选项\n\n此视图有助于审计每个协作者的访问和活动情况。',
      },
    },
    {
      icon: '🔑',
      title: { es: 'Contraseñas', en: 'Passwords', zh: '密码' },
      content: {
        es: 'Las contraseñas se almacenan encriptadas — nadie puede verlas, ni los administradores. Si un usuario olvida su contraseña:\n\n• El administrador puede establecer una nueva contraseña desde el detalle del usuario\n• El usuario puede usar la opción "Olvidé mi contraseña" en la pantalla de login\n\nSe recomienda que cada usuario cambie su contraseña inicial al primer inicio de sesión.',
        en: 'Passwords are stored encrypted — no one can see them, not even administrators. If a user forgets their password:\n\n• The administrator can set a new password from the user detail\n• The user can use the "Forgot password" option on the login screen\n\nIt is recommended that each user changes their initial password on first login.',
        zh: '密码以加密方式存储——任何人都无法查看，包括管理员。如果用户忘记密码：\n\n• 管理员可以从用户详情页设置新密码\n• 用户可以在登录页面使用"忘记密码"选项\n\n建议每个用户在首次登录时更改初始密码。',
      },
    },
  ],
};
