import type { HelpConfig } from '../HelpButton';

export const providersHelp: HelpConfig = {
  title: {
    es: 'Guía de Proveedores',
    en: 'Providers Guide',
    zh: '供应商指南',
  },
  description: {
    es: 'Todo lo que necesitas saber para gestionar tus proveedores',
    en: 'Everything you need to know to manage your providers',
    zh: '管理供应商所需了解的一切',
  },
  sections: [
    {
      icon: '🏭',
      title: { es: '¿Qué es un proveedor?', en: 'What is a provider?', zh: '什么是供应商？' },
      content: {
        es: 'Un proveedor es cualquier empresa o persona de quien compras productos o servicios. Cada proveedor tiene un código único generado automáticamente y puede tener:\n\n• Datos generales (nombre, teléfono, email, descripción)\n• Direcciones de contacto o entrega\n• Datos fiscales para recibir facturas\n• Línea de crédito para compras a plazo',
        en: 'A provider is any company or person from whom you purchase products or services. Each provider has a unique auto-generated code and can have:\n\n• General data (name, phone, email, description)\n• Contact or delivery addresses\n• Tax data for receiving invoices\n• Credit line for deferred payment purchases',
        zh: '供应商是您向其购买产品或服务的任何企业或个人。每个供应商都有自动生成的唯一代码，可以包含：\n\n• 基本信息（名称、电话、邮箱、描述）\n• 联系或配送地址\n• 接收发票的税务信息\n• 赊购信用额度',
      },
    },
    {
      icon: '🏷️',
      title: { es: 'Código de proveedor', en: 'Provider code', zh: '供应商代码' },
      content: {
        es: 'El código se genera automáticamente con el prefijo PROV (ej. PROV-0001). Puedes aceptar el sugerido o escribir el tuyo propio.\n\nEste código es único por organización y sirve para identificar rápidamente al proveedor en recepciones y órdenes de compra.',
        en: 'The code is generated automatically with the prefix PROV (e.g. PROV-0001). You can accept the suggested one or type your own.\n\nThis code is unique per organization and is used to quickly identify the provider in receptions and purchase orders.',
        zh: '代码以PROV为前缀自动生成（例如PROV-0001）。您可以接受建议的代码或自行输入。\n\n此代码在组织内唯一，用于在收货和采购订单中快速识别供应商。',
      },
    },
    {
      icon: '📍',
      title: { es: 'Direcciones', en: 'Addresses', zh: '地址' },
      content: {
        es: 'Puedes agregar múltiples direcciones a un proveedor:\n\n• Dirección principal: oficinas o sede del proveedor\n• Dirección de entrega: desde dónde despacha la mercancía\n\nCada dirección puede tener calle, número, colonia, ciudad, estado, código postal y país.',
        en: 'You can add multiple addresses to a provider:\n\n• Main address: provider\'s offices or headquarters\n• Delivery address: where they dispatch merchandise from\n\nEach address can have street, number, neighborhood, city, state, zip code and country.',
        zh: '您可以为供应商添加多个地址：\n\n• 主要地址：供应商的办公室或总部\n• 配送地址：发货地点\n\n每个地址可包含街道、门牌号、社区、城市、省份、邮政编码和国家。',
      },
    },
    {
      icon: '🧾',
      title: { es: 'Datos fiscales (RFC)', en: 'Tax data (RFC)', zh: '税务信息（RFC）' },
      content: {
        es: 'Los datos fiscales del proveedor son útiles para registrar correctamente las facturas que recibes de ellos. Incluyen:\n\n• RFC: identificador fiscal del proveedor\n• Razón social: nombre legal del proveedor\n• Régimen fiscal\n\nEstos datos se usan como referencia al registrar gastos y cuentas por pagar.',
        en: 'Provider tax data is useful for correctly recording invoices you receive from them. Includes:\n\n• RFC: provider\'s tax identifier\n• Legal name: provider\'s legal name\n• Tax regime\n\nThis data is used as reference when recording expenses and accounts payable.',
        zh: '供应商税务信息有助于正确记录从其收到的发票。包含：\n\n• RFC：供应商的税务标识符\n• 法定名称：供应商的法定名称\n• 税务制度\n\n这些数据在登记费用和应付账款时作为参考。',
      },
    },
    {
      icon: '💳',
      title: { es: 'Crédito con el proveedor', en: 'Provider credit', zh: '供应商信用额度' },
      content: {
        es: 'La línea de crédito registra las condiciones de pago que tienes con el proveedor:\n\n• Límite de crédito: monto máximo de deuda permitida\n• Días de crédito: plazo para pagar tus compras (ej. 30 días)\n• Moneda del crédito\n\nEsto te ayuda a controlar cuánto le debes a cada proveedor y cuándo vencen tus pagos.',
        en: 'The credit line records the payment terms you have with the provider:\n\n• Credit limit: maximum allowed debt amount\n• Credit days: payment term for your purchases (e.g. 30 days)\n• Credit currency\n\nThis helps you control how much you owe each provider and when your payments are due.',
        zh: '信用额度记录您与供应商的付款条款：\n\n• 信用限额：允许的最大欠款金额\n• 信用天数：采购付款期限（例如30天）\n• 信用货币\n\n这有助于您掌控对每个供应商的欠款金额及付款到期时间。',
      },
    },
    {
      icon: '📦',
      title: { es: 'Relación con recepciones', en: 'Relationship with receptions', zh: '与收货的关联' },
      content: {
        es: 'Cada recepción de mercancía está asociada a un proveedor. Al cerrar una recepción, el inventario se actualiza automáticamente.\n\nDesde el detalle del proveedor puedes ver el historial de todas las recepciones que has tenido con él.',
        en: 'Each merchandise reception is associated with a provider. When a reception is closed, inventory is automatically updated.\n\nFrom the provider detail you can see the history of all receptions you have had with them.',
        zh: '每次收货都与一个供应商关联。关闭收货单后，库存自动更新。\n\n在供应商详情页可以查看与该供应商的所有收货历史记录。',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Búsqueda', en: 'Search', zh: '搜索' },
      content: {
        es: 'Puedes buscar proveedores por:\n• Código\n• Nombre\n• Descripción\n• Teléfono\n• Email\n\nUsa los filtros para ver solo proveedores activos o inactivos.',
        en: 'You can search providers by:\n• Code\n• Name\n• Description\n• Phone\n• Email\n\nUse filters to see only active or inactive providers.',
        zh: '您可以按以下条件搜索供应商：\n• 代码\n• 名称\n• 描述\n• 电话\n• 邮箱\n\n使用筛选器仅查看活跃或非活跃供应商。',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar proveedores', en: 'Delete providers', zh: '删除供应商' },
      content: {
        es: 'Un proveedor puede eliminarse siempre que no tenga recepciones u órdenes de compra activas asociadas.\n\nSi el proveedor tiene historial de compras, considera desactivarlo en lugar de eliminarlo para conservar el registro histórico.',
        en: 'A provider can be deleted as long as it has no associated active receptions or purchase orders.\n\nIf the provider has purchase history, consider deactivating it instead of deleting it to preserve the historical record.',
        zh: '只要供应商没有关联的活跃收货单或采购订单，即可删除。\n\n如果供应商有采购历史记录，建议停用而非删除，以保留历史记录。',
      },
    },
  ],
};
