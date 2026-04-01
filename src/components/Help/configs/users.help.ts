import type { HelpConfig } from '../HelpButton';

export const usersHelp: HelpConfig = {
  title: { es: 'Guía de Usuarios', en: 'Users Guide' },
  description: {
    es: 'Gestiona quién tiene acceso al sistema y con qué permisos',
    en: 'Manage who has access to the system and with what permissions',
  },
  sections: [
    {
      icon: '👤',
      title: { es: 'Crear un usuario', en: 'Create a user' },
      content: {
        es: 'Para dar acceso al sistema a un colaborador, crea un usuario con:\n\n• Nombre completo\n• Correo electrónico (será su nombre de usuario para iniciar sesión)\n• Contraseña inicial\n• Rol o roles asignados\n\nEl usuario recibirá sus credenciales y podrá acceder según los permisos de sus roles.',
        en: 'To give a collaborator access to the system, create a user with:\n\n• Full name\n• Email address (will be their username to log in)\n• Initial password\n• Assigned role or roles\n\nThe user will receive their credentials and can access according to their role permissions.',
      },
    },
    {
      icon: '🎭',
      title: { es: 'Asignar roles', en: 'Assign roles' },
      content: {
        es: 'Cada usuario debe tener al menos un rol asignado. Los roles determinan a qué módulos puede acceder y qué acciones puede realizar.\n\nPuedes asignar múltiples roles a un usuario — sus permisos serán la unión de todos los roles. Por ejemplo, un usuario con roles "Vendedor" y "Almacenista" tendrá los permisos de ambos.',
        en: 'Each user must have at least one role assigned. Roles determine which modules they can access and what actions they can perform.\n\nYou can assign multiple roles to a user — their permissions will be the union of all roles. For example, a user with "Salesperson" and "Warehouse" roles will have permissions from both.',
      },
    },
    {
      icon: '🔒',
      title: { es: 'Estado del usuario', en: 'User status' },
      content: {
        es: 'Un usuario puede estar activo o inactivo:\n\n• Activo: puede iniciar sesión y usar el sistema\n• Inactivo: no puede iniciar sesión aunque tenga credenciales válidas\n\nDesactiva un usuario cuando un colaborador deja la empresa en lugar de eliminarlo, para conservar el historial de sus acciones en los logs de auditoría.',
        en: 'A user can be active or inactive:\n\n• Active: can log in and use the system\n• Inactive: cannot log in even with valid credentials\n\nDeactivate a user when a collaborator leaves the company instead of deleting them, to preserve the history of their actions in audit logs.',
      },
    },
    {
      icon: '👁️',
      title: { es: 'Ver detalle del usuario', en: 'View user detail' },
      content: {
        es: 'Haz clic en "Ver detalle" para acceder al perfil completo de un usuario:\n\n• Información personal y de contacto\n• Roles asignados\n• Historial de actividad reciente\n• Opciones para cambiar contraseña o desactivar la cuenta\n\nEsta vista es útil para auditar el acceso y actividad de cada colaborador.',
        en: 'Click "View detail" to access the full profile of a user:\n\n• Personal and contact information\n• Assigned roles\n• Recent activity history\n• Options to change password or deactivate the account\n\nThis view is useful for auditing the access and activity of each collaborator.',
      },
    },
    {
      icon: '🔑',
      title: { es: 'Contraseñas', en: 'Passwords' },
      content: {
        es: 'Las contraseñas se almacenan encriptadas — nadie puede verlas, ni los administradores. Si un usuario olvida su contraseña:\n\n• El administrador puede establecer una nueva contraseña desde el detalle del usuario\n• El usuario puede usar la opción "Olvidé mi contraseña" en la pantalla de login\n\nSe recomienda que cada usuario cambie su contraseña inicial al primer inicio de sesión.',
        en: 'Passwords are stored encrypted — no one can see them, not even administrators. If a user forgets their password:\n\n• The administrator can set a new password from the user detail\n• The user can use the "Forgot password" option on the login screen\n\nIt is recommended that each user changes their initial password on first login.',
      },
    },
  ],
};
