import type { HelpConfig } from '../HelpButton';

export const backupHelp: HelpConfig = {
  title: { es: 'Guía de Respaldo', en: 'Backup Guide' },
  description: {
    es: 'Protege los datos de tu negocio con respaldos automáticos y manuales',
    en: 'Protect your business data with automatic and manual backups',
  },
  sections: [
    {
      icon: '💾',
      title: { es: '¿Qué se respalda?', en: 'What is backed up?' },
      content: {
        es: 'El sistema genera un respaldo completo de la base de datos de tu empresa: productos, clientes, ventas, facturas, inventario, configuraciones y todos los demás datos.\n\nLos respaldos se almacenan de forma segura y pueden descargarse en cualquier momento.',
        en: 'The system generates a complete backup of your company database: products, clients, sales, invoices, inventory, settings and all other data.\n\nBackups are stored securely and can be downloaded at any time.',
      },
    },
    {
      icon: '⚙️',
      title: { es: 'Respaldo automático', en: 'Automatic backup' },
      content: {
        es: 'Activa el respaldo automático para que el sistema genere copias de seguridad sin intervención manual:\n\n• Frecuencia: diaria, semanal o mensual\n• Hora programada: elige el horario de menor actividad\n• Retención: número de respaldos a conservar (los más antiguos se eliminan automáticamente)\n\nSe recomienda activar el respaldo diario para mayor protección.',
        en: 'Enable automatic backup so the system generates backups without manual intervention:\n\n• Frequency: daily, weekly or monthly\n• Scheduled time: choose the lowest activity time\n• Retention: number of backups to keep (oldest are automatically deleted)\n\nDaily backup is recommended for maximum protection.',
      },
    },
    {
      icon: '▶️',
      title: { es: 'Respaldo manual', en: 'Manual backup' },
      content: {
        es: 'Usa el botón "Ejecutar ahora" para generar un respaldo inmediato en cualquier momento. Esto es útil antes de:\n\n• Realizar cambios importantes en la configuración\n• Importar grandes volúmenes de datos\n• Actualizar el sistema\n\nEl respaldo manual aparecerá en el historial con el tipo "Manual".',
        en: 'Use the "Run now" button to generate an immediate backup at any time. This is useful before:\n\n• Making important configuration changes\n• Importing large volumes of data\n• Updating the system\n\nThe manual backup will appear in the history with type "Manual".',
      },
    },
    {
      icon: '📥',
      title: { es: 'Descargar un respaldo', en: 'Download a backup' },
      content: {
        es: 'Desde el historial de respaldos, puedes descargar cualquier respaldo exitoso haciendo clic en el botón de descarga.\n\nEl archivo descargado es un respaldo completo de la base de datos. Guárdalo en un lugar seguro fuera del servidor (disco externo, nube, etc.) para mayor protección.',
        en: 'From the backup history, you can download any successful backup by clicking the download button.\n\nThe downloaded file is a complete database backup. Store it in a safe place outside the server (external drive, cloud, etc.) for extra protection.',
      },
    },
    {
      icon: '📋',
      title: { es: 'Historial de respaldos', en: 'Backup history' },
      content: {
        es: 'El historial muestra todos los respaldos generados con:\n\n• Fecha y hora de creación\n• Nombre del archivo\n• Tamaño del archivo\n• Tipo (automático o manual)\n• Estado (exitoso o fallido)\n\nSi un respaldo falla, revisa la configuración del servidor o contacta a soporte.',
        en: 'The history shows all generated backups with:\n\n• Creation date and time\n• File name\n• File size\n• Type (automatic or manual)\n• Status (successful or failed)\n\nIf a backup fails, check the server configuration or contact support.',
      },
    },
  ],
};
