import type { HelpConfig } from '../HelpButton';

export const clientsHelp: HelpConfig = {
  title: {
    es: 'Guía de Clientes',
    en: 'Clients Guide',
    zh: '客户指南',
  },
  description: {
    es: 'Todo lo que necesitas saber para gestionar tus clientes',
    en: 'Everything you need to know to manage your clients',
    zh: '管理客户所需了解的一切',
  },
  sections: [
    {
      icon: '👤',
      title: { es: '¿Qué es un cliente?', en: 'What is a client?', zh: '什么是客户？' },
      content: {
        es: 'Un cliente es cualquier persona física o empresa a quien le vendes productos o servicios. Cada cliente tiene un código único generado automáticamente y puede tener:\n\n• Datos generales (nombre, teléfono, email)\n• Direcciones de envío o facturación\n• Datos fiscales para facturación electrónica (RFC, régimen fiscal)\n• Línea de crédito para ventas a plazo',
        en: 'A client is any individual or company to whom you sell products or services. Each client has a unique auto-generated code and can have:\n\n• General data (name, phone, email)\n• Shipping or billing addresses\n• Tax data for electronic invoicing (RFC, tax regime)\n• Credit line for deferred payment sales',
        zh: '客户是您向其销售产品或服务的任何个人或企业。每个客户都有自动生成的唯一代码，可以包含：\n\n• 基本信息（姓名、电话、邮箱）\n• 收货或开票地址\n• 电子开票税务信息（RFC、税务制度）\n• 赊销信用额度',
      },
    },
    {
      icon: '🏷️',
      title: { es: 'Código de cliente', en: 'Client code', zh: '客户代码' },
      content: {
        es: 'El código se genera automáticamente con el prefijo CLI (ej. CLI-0001). Puedes aceptar el sugerido o escribir el tuyo propio.\n\nEste código es único por organización y sirve para identificar rápidamente al cliente en búsquedas, ventas y cotizaciones.',
        en: 'The code is generated automatically with the prefix CLI (e.g. CLI-0001). You can accept the suggested one or type your own.\n\nThis code is unique per organization and is used to quickly identify the client in searches, sales and quotations.',
        zh: '代码以CLI为前缀自动生成（例如CLI-0001）。您可以接受建议的代码或自行输入。\n\n此代码在组织内唯一，用于在搜索、销售和报价中快速识别客户。',
      },
    },
    {
      icon: '📍',
      title: { es: 'Direcciones', en: 'Addresses', zh: '地址' },
      content: {
        es: 'Puedes agregar múltiples direcciones a un cliente:\n\n• Facturación: dirección que aparece en las facturas electrónicas\n• Envío: dirección de entrega de mercancía\n\nCada dirección puede tener calle, número, colonia, ciudad, estado, código postal y país.',
        en: 'You can add multiple addresses to a client:\n\n• Billing: address that appears on electronic invoices\n• Shipping: merchandise delivery address\n\nEach address can have street, number, neighborhood, city, state, zip code and country.',
        zh: '您可以为客户添加多个地址：\n\n• 开票地址：出现在电子发票上的地址\n• 收货地址：货物配送地址\n\n每个地址可包含街道、门牌号、社区、城市、省份、邮政编码和国家。',
      },
    },
    {
      icon: '🧾',
      title: { es: 'Datos fiscales (RFC)', en: 'Tax data (RFC)', zh: '税务信息（RFC）' },
      content: {
        es: 'Los datos fiscales son necesarios para emitir facturas electrónicas (CFDI) a nombre del cliente. Incluyen:\n\n• RFC: identificador fiscal (12 caracteres para empresa, 13 para persona física)\n• Razón social: nombre legal del cliente\n• Régimen fiscal: régimen SAT del cliente\n• Uso de CFDI: para qué usará la factura (G03 Gastos en general es el más común)\n• Código postal fiscal\n\nSin datos fiscales, el cliente solo puede recibir facturas globales.',
        en: 'Tax data is required to issue electronic invoices (CFDI) in the client\'s name. Includes:\n\n• RFC: tax identifier (12 characters for company, 13 for individual)\n• Legal name: client\'s legal name\n• Tax regime: client\'s SAT regime\n• CFDI use: what the invoice will be used for (G03 General expenses is most common)\n• Tax zip code\n\nWithout tax data, the client can only receive global invoices.',
        zh: '税务信息是以客户名义开具电子发票（CFDI）的必要条件。包含：\n\n• RFC：税务标识符（企业12位，个人13位）\n• 法定名称：客户的法定名称\n• 税务制度：客户的SAT税务制度\n• CFDI用途：发票的使用目的（G03一般费用最为常见）\n• 税务邮政编码\n\n没有税务信息，客户只能接收全局发票。',
      },
    },
    {
      icon: '💳',
      title: { es: 'Crédito', en: 'Credit', zh: '信用额度' },
      content: {
        es: 'La línea de crédito permite vender a plazo al cliente. Configura:\n\n• Límite de crédito: monto máximo que puede deber\n• Días de crédito: plazo para pagar (ej. 30 días)\n• Moneda del crédito\n\nCuando se cierra una venta con método de pago "Crédito", se genera automáticamente una cuenta por cobrar asociada al cliente.',
        en: 'The credit line allows selling on credit to the client. Configure:\n\n• Credit limit: maximum amount they can owe\n• Credit days: payment term (e.g. 30 days)\n• Credit currency\n\nWhen a sale is closed with payment method "Credit", an account receivable is automatically generated associated with the client.',
        zh: '信用额度允许向客户赊销。配置：\n\n• 信用限额：最大欠款金额\n• 信用天数：付款期限（例如30天）\n• 信用货币\n\n当销售以"赊账"方式结算时，系统自动生成与该客户关联的应收账款。',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Sincronización con Pack (Facturación)', en: 'Pack sync (Billing)', zh: '与证书包同步（开票）' },
      content: {
        es: 'Si tienes configurado un proveedor de facturación (Factura Green u otro), los clientes se sincronizan automáticamente al crearlos o actualizarlos.\n\nSi la sincronización falla, puedes reintentarla manualmente desde el detalle del cliente.\n\nTambién puedes importar clientes existentes en tu proveedor de facturación con el botón "Importar desde Pack".',
        en: 'If you have a billing provider configured (Factura Green or other), clients are automatically synced when created or updated.\n\nIf sync fails, you can retry it manually from the client detail.\n\nYou can also import existing clients from your billing provider with the "Import from Pack" button.',
        zh: '如果您已配置开票服务商（Factura Green或其他），客户在创建或更新时会自动同步。\n\n如果同步失败，可以从客户详情页手动重试。\n\n您也可以使用"从证书包导入"按钮从开票服务商导入现有客户。',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Búsqueda', en: 'Search', zh: '搜索' },
      content: {
        es: 'Puedes buscar clientes por:\n• Código\n• Nombre\n• Teléfono\n• Email\n• RFC\n• Razón social\n• Calle o ciudad de sus direcciones\n\nUsa los filtros para ver solo clientes activos o inactivos.',
        en: 'You can search clients by:\n• Code\n• Name\n• Phone\n• Email\n• RFC\n• Legal name\n• Street or city of their addresses\n\nUse filters to see only active or inactive clients.',
        zh: '您可以按以下条件搜索客户：\n• 代码\n• 姓名\n• 电话\n• 邮箱\n• RFC\n• 法定名称\n• 地址中的街道或城市\n\n使用筛选器仅查看活跃或非活跃客户。',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar clientes', en: 'Delete clients', zh: '删除客户' },
      content: {
        es: 'Un cliente solo puede eliminarse si no tiene facturas, ventas ni cotizaciones asociadas.\n\nSi el cliente tiene historial, considera desactivarlo en lugar de eliminarlo. Un cliente inactivo no aparece en los selectores de ventas y cotizaciones, pero conserva su historial.',
        en: 'A client can only be deleted if it has no associated invoices, sales or quotations.\n\nIf the client has history, consider deactivating it instead of deleting it. An inactive client does not appear in sales and quotation selectors, but retains its history.',
        zh: '只有在没有关联发票、销售或报价的情况下，才能删除客户。\n\n如果客户有历史记录，建议停用而非删除。非活跃客户不会出现在销售和报价选择器中，但保留其历史记录。',
      },
    },
  ],
};
