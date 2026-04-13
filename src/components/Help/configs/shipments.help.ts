import type { HelpConfig } from '../HelpButton';

export const getShipmentsHelp = (trackingUrl: string): HelpConfig => ({
  title: {
    es: 'Guía de Logística y Envíos',
    en: 'Logistics & Shipments Guide',
    zh: '物流与发货指南',
  },
  description: {
    es: 'Todo lo que necesitas saber para gestionar los envíos de tus ventas',
    en: 'Everything you need to know to manage your sales shipments',
    zh: '管理销售发货所需了解的一切',
  },
  sections: [
    {
      icon: '🚚',
      title: { es: '¿Qué es un envío?', en: 'What is a shipment?', zh: '什么是发货？' },
      content: {
        es: 'Un envío representa el despacho físico de una venta (salida de almacén) hacia el cliente. Cada envío está vinculado a una venta y contiene:\n\n• Paquetería utilizada (FedEx, DHL, Estafeta, etc.)\n• Número de guía para rastreo\n• URL de rastreo en el sitio de la paquetería\n• Costo del envío\n• Estado actual del paquete\n• Fechas de envío y entrega\n• Notas adicionales',
        en: 'A shipment represents the physical dispatch of a sale (warehouse withdrawal) to the client. Each shipment is linked to a sale and contains:\n\n• Carrier used (FedEx, DHL, UPS, etc.)\n• Tracking number\n• Tracking URL on the carrier\'s website\n• Shipping cost\n• Current package status\n• Shipping and delivery dates\n• Additional notes',
        zh: '发货代表将一笔销售（出库）实际发送给客户的过程。每条发货记录与一笔销售关联，包含：\n\n• 使用的承运商（顺丰、DHL、联邦快递等）\n• 运单号\n• 承运商网站的查询链接\n• 运费\n• 当前包裹状态\n• 发货和送达日期\n• 附加备注',
      },
    },
    {
      icon: '📋',
      title: { es: 'Estados del envío', en: 'Shipment statuses', zh: '发货状态' },
      content: {
        es: 'Cada envío pasa por los siguientes estados:\n\n• Pendiente: el envío fue registrado pero aún no se ha empacado\n• Empacando: el pedido está siendo preparado en almacén\n• En camino: el paquete fue entregado a la paquetería y está en tránsito\n• Entregado: el cliente recibió el paquete\n• Devuelto: el paquete fue regresado por la paquetería o el cliente\n• Fallido: el envío no pudo completarse\n\nLos estados "En camino" y "Entregado" registran automáticamente la fecha y hora del cambio.',
        en: 'Each shipment goes through the following statuses:\n\n• Pending: the shipment was registered but not yet packed\n• Packing: the order is being prepared in the warehouse\n• In transit: the package was handed to the carrier and is on its way\n• Delivered: the client received the package\n• Returned: the package was returned by the carrier or client\n• Failed: the shipment could not be completed\n\nThe "In transit" and "Delivered" statuses automatically record the date and time of the change.',
        zh: '每条发货记录经历以下状态：\n\n• 待处理：发货已登记但尚未打包\n• 包装中：订单正在仓库准备中\n• 运送中：包裹已交给承运商，正在运输途中\n• 已送达：客户已收到包裹\n• 已退回：包裹被承运商或客户退回\n• 失败：发货未能完成\n\n"运送中"和"已送达"状态会自动记录变更的日期和时间。',
      },
    },
    {
      icon: '⚡',
      title: { es: 'Cambio rápido de estado', en: 'Quick status change', zh: '快速状态变更' },
      content: {
        es: 'Desde la tabla de envíos puedes cambiar el estado rápidamente sin abrir el formulario completo:\n\n• Si el envío está en Pendiente o Empacando, aparece la opción "Marcar como Enviado"\n• Si el envío está En camino, aparece la opción "Marcar como Entregado"\n\nAl hacer clic se muestra un modal de confirmación antes de aplicar el cambio.',
        en: 'From the shipments table you can quickly change the status without opening the full form:\n\n• If the shipment is Pending or Packing, the option "Mark as Shipped" appears\n• If the shipment is In transit, the option "Mark as Delivered" appears\n\nClicking shows a confirmation modal before applying the change.',
        zh: '在发货列表中，您可以快速更改状态而无需打开完整表单：\n\n• 如果发货处于待处理或包装中状态，会出现"标记为已发货"选项\n• 如果发货处于运送中状态，会出现"标记为已送达"选项\n\n点击后会显示确认弹窗，防止误操作。',
      },
    },
    {
      icon: '✏️',
      title: { es: 'Editar un envío', en: 'Edit a shipment', zh: '编辑发货' },
      content: {
        es: 'Desde el menú de acciones de cada fila puedes editar todos los datos del envío:\n\n• Cambiar la paquetería\n• Actualizar el número de guía o la URL de rastreo\n• Modificar el costo de envío\n• Cambiar el estado manualmente a cualquier valor\n• Agregar o editar notas\n\nEl formulario de edición se abre en un panel lateral sin salir de la página.',
        en: 'From the actions menu of each row you can edit all shipment data:\n\n• Change the carrier\n• Update the tracking number or tracking URL\n• Modify the shipping cost\n• Manually change the status to any value\n• Add or edit notes\n\nThe edit form opens in a side panel without leaving the page.',
        zh: '从每行的操作菜单中，您可以编辑所有发货信息：\n\n• 更改承运商\n• 更新运单号或查询链接\n• 修改运费\n• 手动将状态更改为任意值\n• 添加或编辑备注\n\n编辑表单在侧边面板中打开，无需离开当前页面。',
      },
    },
    {
      icon: '📊',
      title: { es: 'Estadísticas de envíos', en: 'Shipment analytics', zh: '发货统计' },
      content: {
        es: 'En la parte superior de la página se muestran 4 tarjetas con métricas en tiempo real:\n\n• Total Envíos: cantidad total de envíos registrados\n• En Camino: envíos actualmente en tránsito\n• Entregados: envíos completados exitosamente\n• Costo Promedio: promedio del costo de envío por paquete',
        en: 'At the top of the page, 4 cards show real-time metrics:\n\n• Total Shipments: total number of registered shipments\n• In Transit: shipments currently on the way\n• Delivered: successfully completed shipments\n• Avg. Cost: average shipping cost per package',
        zh: '页面顶部显示4张实时统计卡片：\n\n• 总发货量：已登记的发货总数\n• 运送中：当前正在运输的发货数\n• 已送达：成功完成的发货数\n• 平均费用：每个包裹的平均运费',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Búsqueda y filtros', en: 'Search and filters', zh: '搜索与筛选' },
      content: {
        es: 'Puedes buscar envíos por:\n• Nombre de la paquetería\n• Número de guía\n• ID de la venta asociada\n\nAdemás puedes filtrar por estado para ver solo los envíos en un estado específico.',
        en: 'You can search shipments by:\n• Carrier name\n• Tracking number\n• Associated sale ID\n\nYou can also filter by status to see only shipments in a specific state.',
        zh: '您可以按以下条件搜索发货：\n• 承运商名称\n• 运单号\n• 关联销售ID\n\n您还可以按状态筛选，仅查看特定状态的发货。',
      },
    },
    {
      icon: '🔔',
      title: { es: 'Notificaciones automáticas', en: 'Automatic notifications', zh: '自动通知' },
      content: {
        es: 'Al cambiar el estado de un envío, el sistema notifica automáticamente:\n\n• Notificación interna en el dashboard para todos los usuarios de tu organización\n• WhatsApp al cliente si tienes el bot activo y conectado\n• Email al cliente si no hay WhatsApp disponible y tienes email configurado\n\nEl mensaje incluye paquetería, número de guía y enlace de rastreo.',
        en: 'When a shipment status changes, the system notifies automatically:\n\n• Internal dashboard notification for all users in your organization\n• WhatsApp to the client if you have the bot active and connected\n• Email to the client if WhatsApp is not available and you have email configured\n\nThe message includes carrier, tracking number and tracking link.',
        zh: '当发货状态变更时，系统自动通知：\n\n• 组织内所有用户的仪表板内部通知\n• 如果WhatsApp机器人已激活并连接，则向客户发送WhatsApp消息\n• 如果WhatsApp不可用且已配置邮件，则向客户发送邮件\n\n消息包含承运商、运单号和查询链接。',
      },
    },
    {
      icon: '🌐',
      title: { es: 'Página pública de rastreo', en: 'Public tracking page', zh: '公开查询页面' },
      content: {
        es: `Tus clientes pueden rastrear sus envíos sin iniciar sesión en esta URL:\n\n${trackingUrl}\n\nEl cliente ingresa su número de guía y ve el estado, fechas y un enlace al sitio de la paquetería. La página muestra el logo y datos de contacto de tu empresa.`,
        en: `Your clients can track their shipments without logging in at this URL:\n\n${trackingUrl}\n\nThe client enters their tracking number and sees the status, dates and a link to the carrier's website. The page shows your company's logo and contact information.`,
        zh: `您的客户无需登录即可在以下链接查询包裹：\n\n${trackingUrl}\n\n客户输入运单号即可查看状态、日期以及承运商网站链接。页面显示您公司的Logo和联系信息。`,
      },
    },
    {
      icon: '🔗',
      title: { es: 'Relación con ventas', en: 'Relationship with sales', zh: '与销售的关联' },
      content: {
        es: 'Los envíos siempre están vinculados a una venta. Desde la tabla puedes ir directamente a la venta asociada con el enlace "Ir a Venta".\n\nTambién puedes crear y ver los envíos de una venta específica desde el detalle de esa venta.',
        en: 'Shipments are always linked to a sale. From the table you can go directly to the associated sale with the "Go to Sale" link.\n\nYou can also create and view shipments for a specific sale from that sale\'s detail view.',
        zh: '发货始终与一笔销售关联。在列表中，您可以通过"前往销售"链接直接跳转到关联的销售记录。\n\n您也可以在特定销售的详情页中创建和查看该销售的发货记录。',
      },
    },
  ],
});
