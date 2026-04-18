import type { HelpConfig } from '../HelpButton';

export const webhooksHelp: HelpConfig = {
  title: {
    es: 'Guía de Webhooks',
    en: 'Webhooks Guide',
    zh: 'Webhook指南',
  },
  description: {
    es: 'Configura notificaciones automáticas para integrar con servicios externos',
    en: 'Configure automatic notifications to integrate with external services',
    zh: '配置自动通知以与外部服务集成',
  },
  sections: [
    {
      icon: '🔗',
      title: { es: '¿Qué son los Webhooks?', en: 'What are Webhooks?', zh: '什么是Webhook？' },
      content: {
        es: 'Los webhooks son notificaciones automáticas que Redfox envía a tu servidor cuando ocurren eventos importantes en tu organización.\n\nCada webhook envía una solicitud HTTP POST a la URL que configures, con datos JSON del evento. Esto te permite integrar Redfox con otros sistemas como:\n\n• Sistemas de contabilidad\n• Plataformas de e-commerce\n• Herramientas de marketing\n• Sistemas de inventario externos',
        en: 'Webhooks are automatic notifications that Redfox sends to your server when important events occur in your organization.\n\nEach webhook sends an HTTP POST request to the URL you configure, with JSON data of the event. This allows you to integrate Redfox with other systems such as:\n\n• Accounting systems\n• E-commerce platforms\n• Marketing tools\n• External inventory systems',
        zh: 'Webhook是Redfox在您组织中发生重要事件时自动发送到您服务器的通知。\n\n每个webhook都会向您配置的URL发送HTTP POST请求，包含事件的JSON数据。这允许您将Redfox与其他系统集成，例如：\n\n• 会计系统\n• 电子商务平台\n• 营销工具\n• 外部库存系统',
      },
    },
    {
      icon: '📡',
      title: { es: 'Eventos disponibles', en: 'Available events', zh: '可用事件' },
      content: {
        es: 'Configura webhooks para estos eventos:\n\n• **Venta Creada**: cuando se registra una nueva venta\n• **Factura Creada**: cuando se genera una factura\n• **Recepción Creada**: cuando llega mercancía al almacén\n• **Orden de Compra Aprobada**: cuando se aprueba un pedido\n• **Estado de Envío Cambió**: cuando cambia el estado de entrega\n• **Cliente Creado**: cuando se registra un nuevo cliente\n• **Producto Creado**: cuando se agrega un nuevo producto',
        en: 'Configure webhooks for these events:\n\n• **Sale Created**: when a new sale is registered\n• **Invoice Created**: when an invoice is generated\n• **Reception Created**: when merchandise arrives at the warehouse\n• **Purchase Order Approved**: when an order is approved\n• **Shipment Status Changed**: when delivery status changes\n• **Client Created**: when a new client is registered\n• **Product Created**: when a new product is added',
        zh: '为这些事件配置webhook：\n\n• **销售已创建**：注册新销售时\n• **发票已创建**：生成发票时\n• **收货已创建**：商品到达仓库时\n• **采购订单已批准**：订单获得批准时\n• **发货状态已更改**：交货状态发生变化时\n• **客户已创建**：注册新客户时\n• **产品已创建**：添加新产品时',
      },
    },
    {
      icon: '🔐',
      title: { es: 'Seguridad y autenticación', en: 'Security and authentication', zh: '安全性和身份验证' },
      content: {
        es: 'Para asegurar que las notificaciones provienen de Redfox:\n\n• **Token de verificación**: incluye un token secreto en cada petición\n• **Firma HMAC**: las peticiones incluyen una firma para verificar integridad\n• **IP whitelist**: limita las IPs que pueden enviar notificaciones\n\nConfigura estos parámetros en la sección de seguridad del webhook.',
        en: 'To ensure notifications come from Redfox:\n\n• **Verification token**: includes a secret token in each request\n• **HMAC signature**: requests include a signature to verify integrity\n• **IP whitelist**: limit IPs that can send notifications\n\nConfigure these parameters in the webhook security section.',
        zh: '为确保通知来自Redfox：\n\n• **验证令牌**：每个请求中包含秘密令牌\n• **HMAC签名**：请求包含签名以验证完整性\n• **IP白名单**：限制可以发送通知的IP\n\n在webhook安全部分配置这些参数。',
      },
    },
    {
      icon: '⚙️',
      title: { es: 'Configuración del webhook', en: 'Webhook configuration', zh: 'Webhook配置' },
      content: {
        es: 'Campos requeridos:\n\n• **URL**: dirección donde recibirás las notificaciones\n• **Eventos**: selecciona qué eventos activarán el webhook\n• **Estado**: activa o desactiva el webhook\n\nCampos opcionales:\n\n• **Nombre**: descripción del webhook\n• **Encabezados personalizados**: agrega headers HTTP adicionales\n• **Timeout**: tiempo máximo de espera para respuesta',
        en: 'Required fields:\n\n• **URL**: address where you will receive notifications\n• **Events**: select which events will trigger the webhook\n• **Status**: activate or deactivate the webhook\n\nOptional fields:\n\n• **Name**: webhook description\n• **Custom headers**: add additional HTTP headers\n• **Timeout**: maximum response wait time',
        zh: '必填字段：\n\n• **URL**：接收通知的地址\n• **事件**：选择哪些事件将触发webhook\n• **状态**：激活或停用webhook\n\n可选字段：\n\n• **名称**：webhook描述\n• **自定义标头**：添加额外的HTTP标头\n• **超时**：最大响应等待时间',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Probando webhooks', en: 'Testing webhooks', zh: '测试Webhook' },
      content: {
        es: 'Antes de activar un webhook en producción:\n\n1. **Configura una URL de prueba** (como webhook.site)\n2. **Activa el webhook** en modo de prueba\n3. **Genera eventos de prueba** creando ventas, facturas, etc.\n4. **Verifica los logs** para confirmar recepción\n5. **Valida el formato JSON** de los datos enviados\n\nUna vez probado, cambia a la URL de producción.',
        en: 'Before activating a webhook in production:\n\n1. **Configure a test URL** (like webhook.site)\n2. **Activate the webhook** in test mode\n3. **Generate test events** by creating sales, invoices, etc.\n4. **Check logs** to confirm reception\n5. **Validate JSON format** of sent data\n\nOnce tested, switch to the production URL.',
        zh: '在生产环境中激活webhook之前：\n\n1. **配置测试URL**（如webhook.site）\n2. **在测试模式下激活webhook**\n3. **生成测试事件**通过创建销售、发票等\n4. **检查日志**确认接收\n5. **验证发送数据的JSON格式**\n\n测试完成后，切换到生产URL。',
      },
    },
    {
      icon: '📊',
      title: { es: 'Monitoreo y logs', en: 'Monitoring and logs', zh: '监控和日志' },
      content: {
        es: 'Redfox mantiene un registro de todas las entregas de webhook:\n\n• **Estado de entrega**: exitosa, fallida, timeout\n• **Código de respuesta**: HTTP status code\n• **Tiempo de respuesta**: duración de la petición\n• **Reintentos**: número de intentos automáticos\n• **Fecha y hora**: timestamp de cada entrega\n\nRevisa los logs regularmente para detectar problemas de conectividad.',
        en: 'Redfox maintains a record of all webhook deliveries:\n\n• **Delivery status**: successful, failed, timeout\n• **Response code**: HTTP status code\n• **Response time**: request duration\n• **Retries**: number of automatic attempts\n• **Date and time**: timestamp of each delivery\n\nCheck logs regularly to detect connectivity issues.',
        zh: 'Redfox维护所有webhook传递的记录：\n\n• **传递状态**：成功、失败、超时\n• **响应代码**：HTTP状态码\n• **响应时间**：请求持续时间\n• **重试**：自动尝试次数\n• **日期和时间**：每次传递的时间戳\n\n定期检查日志以检测连接问题。',
      },
    },
  ],
};