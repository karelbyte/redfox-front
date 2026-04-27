import type { HelpConfig } from '../HelpButton';

export const cashRegistersHelp: HelpConfig = {
  title: { es: 'Guía de Cajas', en: 'Cash Registers Guide' },
  description: {
    es: 'Todo lo que necesitas saber para gestionar tus cajas registradoras',
    en: 'Everything you need to know to manage your cash registers',
  },
  sections: [
    {
      icon: '🏧',
      title: { es: '¿Qué son las cajas?', en: 'What are cash registers?' },
      content: {
        es: 'Las cajas registradoras son los puntos de control de dinero en tu negocio. Puedes tener múltiples cajas operando simultáneamente, cada una con su propio balance y transacciones.\n\nCada caja puede ser asignada a usuarios específicos mediante el sistema de atribuciones.',
        en: 'Cash registers are the money control points in your business. You can have multiple registers operating simultaneously, each with its own balance and transactions.\n\nEach register can be assigned to specific users through the attribution system.',
      },
    },
    {
      icon: '➕',
      title: { es: 'Crear una caja', en: 'Create a register' },
      content: {
        es: 'Usa el botón "Crear" para agregar una nueva caja. Debes proporcionar:\n\n• Nombre: identificador de la caja (ej. "Caja Principal", "Caja 2")\n• Descripción: información adicional opcional\n• Monto inicial: fondo de caja para iniciar operaciones\n\nUna vez creada, la caja estará en estado "cerrado" hasta que sea abierta.',
        en: 'Use the "Create" button to add a new register. You must provide:\n\n• Name: register identifier (e.g. "Main Register", "Register 2")\n• Description: optional additional information\n• Initial amount: cash fund to start operations\n\nOnce created, the register will be in "closed" status until opened.',
      },
    },
    {
      icon: '✏️',
      title: { es: 'Editar una caja', en: 'Edit a register' },
      content: {
        es: 'Puedes editar el nombre y descripción de una caja en cualquier momento. Esto es útil para reorganizar o renombrar cajas según las necesidades del negocio.\n\nPara editar, usa el botón de acciones en la tabla y selecciona "Editar".',
        en: 'You can edit the name and description of a register at any time. This is useful for reorganizing or renaming registers according to business needs.\n\nTo edit, use the actions button in the table and select "Edit".',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar una caja', en: 'Delete a register' },
      content: {
        es: 'Solo puedes eliminar cajas que estén en estado "cerrado". Las cajas abiertas no pueden ser eliminadas para proteger la integridad de los datos.\n\nAl eliminar una caja, se eliminan también todas sus transacciones asociadas. Esta acción es irreversible.',
        en: 'You can only delete registers that are in "closed" status. Open registers cannot be deleted to protect data integrity.\n\nWhen deleting a register, all its associated transactions are also deleted. This action is irreversible.',
      },
    },
    {
      icon: '👥',
      title: { es: 'Atribuciones de usuarios', en: 'User attributions' },
      content: {
        es: 'Controla qué usuarios pueden usar cada caja mediante el sistema de atribuciones:\n\n• Ve a Configuración > Usuarios > Selecciona un usuario > Atribuciones\n• En la pestaña "Cajas", marca las cajas que el usuario puede usar\n• Los administradores tienen acceso a todas las cajas\n\nLos usuarios no administradores solo verán las cajas que les han sido asignadas.',
        en: 'Control which users can use each register through the attribution system:\n\n• Go to Settings > Users > Select a user > Attributions\n• In the "Cash Registers" tab, mark the registers the user can use\n• Administrators have access to all registers\n\nNon-admin users will only see the registers assigned to them.',
      },
    },
    {
      icon: '👁️',
      title: { es: 'Ver detalles de una caja', en: 'View register details' },
      content: {
        es: 'Haz clic en el botón "Ver" de cualquier caja para ver:\n\n• Estado actual (abierta/cerrada)\n• Balance total y efectivo en caja\n• Historial completo de transacciones\n• Opciones para actualizar balance y realizar cortes de caja\n\nEsta vista es similar a la página "Caja" pero para una caja específica.',
        en: 'Click the "View" button on any register to see:\n\n• Current status (open/closed)\n• Total balance and cash in register\n• Complete transaction history\n• Options to update balance and perform cash drawer operations\n\nThis view is similar to the "Cash Register" page but for a specific register.',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Estados de la caja', en: 'Register statuses' },
      content: {
        es: '• Abierta: La caja está activa y acepta transacciones del POS\n• Cerrada: La caja está inactiva y no acepta transacciones\n\nSolo las cajas abiertas aparecen en el POS para selección. Una caja debe ser abierta para registrar ventas.',
        en: '• Open: The register is active and accepts POS transactions\n• Closed: The register is inactive and does not accept transactions\n\nOnly open registers appear in the POS for selection. A register must be open to record sales.',
      },
    },
  ],
};
