import type { HelpConfig } from '../HelpButton';

export const backupHelp: HelpConfig = {
  title: { es: 'Guía de Respaldo', en: 'Backup Guide', zh: '备份指南' },
  description: {
    es: 'Protege los datos de tu negocio con respaldos automáticos y manuales',
    en: 'Protect your business data with automatic and manual backups',
    zh: '通过自动和手动备份保护您的业务数据',
  },
  sections: [
    {
      icon: '💾',
      title: { es: '¿Qué se respalda?', en: 'What is backed up?', zh: '备份哪些内容？' },
      content: {
        es: 'El sistema genera un respaldo completo de la base de datos de tu empresa: productos, clientes, ventas, facturas, inventario, configuraciones y todos los demás datos.\n\nLos respaldos se almacenan de forma segura y pueden descargarse en cualquier momento.',
        en: 'The system generates a complete backup of your company database: products, clients, sales, invoices, inventory, settings and all other data.\n\nBackups are stored securely and can be downloaded at any time.',
        zh: '系统生成公司数据库的完整备份：产品、客户、销售、发票、库存、配置及所有其他数据。\n\n备份安全存储，可随时下载。',
      },
    },
    {
      icon: '⚙️',
      title: { es: 'Respaldo automático', en: 'Automatic backup', zh: '自动备份' },
      content: {
        es: 'Activa el respaldo automático para que el sistema genere copias de seguridad sin intervención manual:\n\n• Frecuencia: diaria, semanal o mensual\n• Hora programada: elige el horario de menor actividad\n• Retención: número de respaldos a conservar (los más antiguos se eliminan automáticamente)\n\nSe recomienda activar el respaldo diario para mayor protección.',
        en: 'Enable automatic backup so the system generates backups without manual intervention:\n\n• Frequency: daily, weekly or monthly\n• Scheduled time: choose the lowest activity time\n• Retention: number of backups to keep (oldest are automatically deleted)\n\nDaily backup is recommended for maximum protection.',
        zh: '启用自动备份，让系统无需人工干预即可生成备份：\n\n• 频率：每日、每周或每月\n• 计划时间：选择业务量最少的时段\n• 保留数量：要保留的备份数量（最旧的自动删除）\n\n建议启用每日备份以获得最大保护。',
      },
    },
    {
      icon: '▶️',
      title: { es: 'Respaldo manual', en: 'Manual backup', zh: '手动备份' },
      content: {
        es: 'Usa el botón "Ejecutar ahora" para generar un respaldo inmediato en cualquier momento. Esto es útil antes de:\n\n• Realizar cambios importantes en la configuración\n• Importar grandes volúmenes de datos\n• Actualizar el sistema\n\nEl respaldo manual aparecerá en el historial con el tipo "Manual".',
        en: 'Use the "Run now" button to generate an immediate backup at any time. This is useful before:\n\n• Making important configuration changes\n• Importing large volumes of data\n• Updating the system\n\nThe manual backup will appear in the history with type "Manual".',
        zh: '使用"立即执行"按钮随时生成即时备份。在以下情况前特别有用：\n\n• 进行重要配置变更\n• 导入大量数据\n• 更新系统\n\n手动备份将以"手动"类型出现在历史记录中。',
      },
    },
    {
      icon: '📥',
      title: { es: 'Descargar un respaldo', en: 'Download a backup', zh: '下载备份' },
      content: {
        es: 'Desde el historial de respaldos, puedes descargar cualquier respaldo exitoso haciendo clic en el botón de descarga.\n\nEl archivo descargado es un respaldo completo de la base de datos. Guárdalo en un lugar seguro fuera del servidor (disco externo, nube, etc.) para mayor protección.',
        en: 'From the backup history, you can download any successful backup by clicking the download button.\n\nThe downloaded file is a complete database backup. Store it in a safe place outside the server (external drive, cloud, etc.) for extra protection.',
        zh: '在备份历史记录中，点击下载按钮可下载任何成功的备份。\n\n下载的文件是完整的数据库备份。请将其存储在服务器外的安全位置（外部硬盘、云端等）以获得额外保护。',
      },
    },
    {
      icon: '📋',
      title: { es: 'Historial de respaldos', en: 'Backup history', zh: '备份历史' },
      content: {
        es: 'El historial muestra todos los respaldos generados con:\n\n• Fecha y hora de creación\n• Nombre del archivo\n• Tamaño del archivo\n• Tipo (automático o manual)\n• Estado (exitoso o fallido)\n\nSi un respaldo falla, revisa la configuración del servidor o contacta a soporte.',
        en: 'The history shows all generated backups with:\n\n• Creation date and time\n• File name\n• File size\n• Type (automatic or manual)\n• Status (successful or failed)\n\nIf a backup fails, check the server configuration or contact support.',
        zh: '历史记录显示所有已生成的备份，包含：\n\n• 创建日期和时间\n• 文件名\n• 文件大小\n• 类型（自动或手动）\n• 状态（成功或失败）\n\n如果备份失败，请检查服务器配置或联系技术支持。',
      },
    },
  ],
};
