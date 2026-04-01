import type { HelpConfig } from '../HelpButton';

export const auditLogsHelp: HelpConfig = {
  title: { es: 'Guía de Logs de Auditoría', en: 'Audit Logs Guide' },
  description: {
    es: 'Rastrea todas las acciones realizadas en el sistema',
    en: 'Track all actions performed in the system',
  },
  sections: [
    {
      icon: '🔍',
      title: { es: '¿Qué son los logs de auditoría?', en: 'What are audit logs?' },
      content: {
        es: 'Los logs de auditoría registran automáticamente cada acción importante realizada en el sistema: quién la hizo, cuándo, qué entidad afectó y qué cambió.\n\nSon útiles para rastrear cambios, detectar errores, resolver disputas y cumplir con requisitos de seguridad.',
        en: 'Audit logs automatically record every important action performed in the system: who did it, when, which entity was affected and what changed.\n\nThey are useful for tracking changes, detecting errors, resolving disputes and meeting security requirements.',
      },
    },
    {
      icon: '🎯',
      title: { es: 'Tipos de acciones', en: 'Action types' },
      content: {
        es: '• Crear (verde): se creó un nuevo registro\n• Actualizar (azul): se modificó un registro existente\n• Eliminar (rojo): se eliminó un registro\n• Restaurar (amarillo): se restauró un registro eliminado\n• Exportar (morado): se exportaron datos\n• Importar (índigo): se importaron datos\n\nCada acción muestra el usuario responsable y la fecha exacta.',
        en: '• Create (green): a new record was created\n• Update (blue): an existing record was modified\n• Delete (red): a record was deleted\n• Restore (yellow): a deleted record was restored\n• Export (purple): data was exported\n• Import (indigo): data was imported\n\nEach action shows the responsible user and exact date.',
      },
    },
    {
      icon: '📋',
      title: { es: 'Ver detalles del cambio', en: 'View change details' },
      content: {
        es: 'Para los registros de tipo Actualizar, puedes ver exactamente qué cambió haciendo clic en "Ver detalles":\n\n• Valores anteriores: cómo estaba el registro antes del cambio\n• Valores nuevos: cómo quedó el registro después del cambio\n\nEsto te permite auditar con precisión cualquier modificación en el sistema.',
        en: 'For Update type records, you can see exactly what changed by clicking "Show details":\n\n• Old values: how the record was before the change\n• New values: how the record ended up after the change\n\nThis allows you to precisely audit any modification in the system.',
      },
    },
    {
      icon: '🔎',
      title: { es: 'Filtros', en: 'Filters' },
      content: {
        es: 'Usa los filtros avanzados para encontrar logs específicos:\n\n• Acción: filtra por tipo (crear, actualizar, eliminar, etc.)\n• Tipo de entidad: filtra por módulo (Product, Sale, Client, etc.)\n• Rango de fechas: acota el período de búsqueda\n\nLos logs se muestran de más reciente a más antiguo, 50 por página.',
        en: 'Use advanced filters to find specific logs:\n\n• Action: filter by type (create, update, delete, etc.)\n• Entity type: filter by module (Product, Sale, Client, etc.)\n• Date range: narrow the search period\n\nLogs are shown from most recent to oldest, 50 per page.',
      },
    },
    {
      icon: '📤',
      title: { es: 'Exportar logs', en: 'Export logs' },
      content: {
        es: 'Puedes exportar los logs visibles a CSV para análisis externo o para compartir con tu equipo de seguridad.\n\nEl archivo incluye: acción, tipo de entidad, ID de entidad, usuario y fecha. Aplica los filtros antes de exportar para obtener solo los datos que necesitas.',
        en: 'You can export visible logs to CSV for external analysis or to share with your security team.\n\nThe file includes: action, entity type, entity ID, user and date. Apply filters before exporting to get only the data you need.',
      },
    },
  ],
};
