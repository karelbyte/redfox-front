import type { HelpConfig } from '../HelpButton';

export const auditLogsHelp: HelpConfig = {
  title: { es: 'Guía de Logs de Auditoría', en: 'Audit Logs Guide', zh: '审计日志指南' },
  description: {
    es: 'Rastrea todas las acciones realizadas en el sistema',
    en: 'Track all actions performed in the system',
    zh: '跟踪系统中执行的所有操作',
  },
  sections: [
    {
      icon: '🔍',
      title: { es: '¿Qué son los logs de auditoría?', en: 'What are audit logs?', zh: '什么是审计日志？' },
      content: {
        es: 'Los logs de auditoría registran automáticamente cada acción importante realizada en el sistema: quién la hizo, cuándo, qué entidad afectó y qué cambió.\n\nSon útiles para rastrear cambios, detectar errores, resolver disputas y cumplir con requisitos de seguridad.',
        en: 'Audit logs automatically record every important action performed in the system: who did it, when, which entity was affected and what changed.\n\nThey are useful for tracking changes, detecting errors, resolving disputes and meeting security requirements.',
        zh: '审计日志自动记录系统中每一项重要操作：操作人、时间、影响的实体及变更内容。\n\n有助于追踪变更、发现错误、解决争议并满足安全合规要求。',
      },
    },
    {
      icon: '🎯',
      title: { es: 'Tipos de acciones', en: 'Action types', zh: '操作类型' },
      content: {
        es: '• Crear (verde): se creó un nuevo registro\n• Actualizar (azul): se modificó un registro existente\n• Eliminar (rojo): se eliminó un registro\n• Restaurar (amarillo): se restauró un registro eliminado\n• Exportar (morado): se exportaron datos\n• Importar (índigo): se importaron datos\n\nCada acción muestra el usuario responsable y la fecha exacta.',
        en: '• Create (green): a new record was created\n• Update (blue): an existing record was modified\n• Delete (red): a record was deleted\n• Restore (yellow): a deleted record was restored\n• Export (purple): data was exported\n• Import (indigo): data was imported\n\nEach action shows the responsible user and exact date.',
        zh: '• 创建（绿色）：新建了一条记录\n• 更新（蓝色）：修改了现有记录\n• 删除（红色）：删除了一条记录\n• 恢复（黄色）：恢复了已删除的记录\n• 导出（紫色）：导出了数据\n• 导入（靛蓝色）：导入了数据\n\n每条操作显示负责用户和确切日期。',
      },
    },
    {
      icon: '📋',
      title: { es: 'Ver detalles del cambio', en: 'View change details', zh: '查看变更详情' },
      content: {
        es: 'Para los registros de tipo Actualizar, puedes ver exactamente qué cambió haciendo clic en "Ver detalles":\n\n• Valores anteriores: cómo estaba el registro antes del cambio\n• Valores nuevos: cómo quedó el registro después del cambio\n\nEsto te permite auditar con precisión cualquier modificación en el sistema.',
        en: 'For Update type records, you can see exactly what changed by clicking "Show details":\n\n• Old values: how the record was before the change\n• New values: how the record ended up after the change\n\nThis allows you to precisely audit any modification in the system.',
        zh: '对于"更新"类型的记录，点击"查看详情"可以看到具体变更内容：\n\n• 旧值：变更前记录的状态\n• 新值：变更后记录的状态\n\n这使您能够精确审计系统中的任何修改。',
      },
    },
    {
      icon: '🔎',
      title: { es: 'Filtros', en: 'Filters', zh: '筛选' },
      content: {
        es: 'Usa los filtros avanzados para encontrar logs específicos:\n\n• Acción: filtra por tipo (crear, actualizar, eliminar, etc.)\n• Tipo de entidad: filtra por módulo (Product, Sale, Client, etc.)\n• Rango de fechas: acota el período de búsqueda\n\nLos logs se muestran de más reciente a más antiguo, 50 por página.',
        en: 'Use advanced filters to find specific logs:\n\n• Action: filter by type (create, update, delete, etc.)\n• Entity type: filter by module (Product, Sale, Client, etc.)\n• Date range: narrow the search period\n\nLogs are shown from most recent to oldest, 50 per page.',
        zh: '使用高级筛选查找特定日志：\n\n• 操作：按类型筛选（创建、更新、删除等）\n• 实体类型：按模块筛选（Product、Sale、Client等）\n• 日期范围：缩小搜索时间段\n\n日志按从最新到最旧的顺序显示，每页50条。',
      },
    },
    {
      icon: '📤',
      title: { es: 'Exportar logs', en: 'Export logs', zh: '导出日志' },
      content: {
        es: 'Puedes exportar los logs visibles a CSV para análisis externo o para compartir con tu equipo de seguridad.\n\nEl archivo incluye: acción, tipo de entidad, ID de entidad, usuario y fecha. Aplica los filtros antes de exportar para obtener solo los datos que necesitas.',
        en: 'You can export visible logs to CSV for external analysis or to share with your security team.\n\nThe file includes: action, entity type, entity ID, user and date. Apply filters before exporting to get only the data you need.',
        zh: '您可以将可见日志导出为CSV，用于外部分析或与安全团队共享。\n\n文件包含：操作、实体类型、实体ID、用户和日期。导出前先应用筛选条件，以获取所需数据。',
      },
    },
  ],
};
