import type { HelpConfig } from '../HelpButton';

export const providersHelp: HelpConfig = {
  title: {
    es: 'Guía de Proveedores',
    en: 'Providers Guide',
  },
  description: {
    es: 'Todo lo que necesitas saber para gestionar tus proveedores',
    en: 'Everything you need to know to manage your providers',
  },
  sections: [
    {
      icon: '🏭',
      title: { es: '¿Qué es un proveedor?', en: 'What is a provider?' },
      content: {
        es: 'Un proveedor es cualquier empresa o persona de quien compras productos o servicios. Cada proveedor tiene un código único generado automáticamente y puede tener:\n\n• Datos generales (nombre, teléfono, email, descripción)\n• Direcciones de contacto o entrega\n• Datos fiscales para recibir facturas\n• Línea de crédito para compras a plazo',
        en: 'A provider is any company or person from whom you purchase products or services. Each provider has a unique auto-generated code and can have:\n\n• General data (name, phone, email, description)\n• Contact or delivery addresses\n• Tax data for receiving invoices\n• Credit line for deferred payment purchases',
      },
    },
    {
      icon: '🏷️',
      title: { es: 'Código de proveedor', en: 'Provider code' },
      content: {
        es: 'El código se genera automáticamente con el prefijo PROV (ej. PROV-0001). Puedes aceptar el sugerido o escribir el tuyo propio.\n\nEste código es único por organización y sirve para identificar rápidamente al proveedor en recepciones y órdenes de compra.',
        en: 'The code is generated automatically with the prefix PROV (e.g. PROV-0001). You can accept the suggested one or type your own.\n\nThis code is unique per organization and is used to quickly identify the provider in receptions and purchase orders.',
      },
    },
    {
      icon: '📍',
      title: { es: 'Direcciones', en: 'Addresses' },
      content: {
        es: 'Puedes agregar múltiples direcciones a un proveedor:\n\n• Dirección principal: oficinas o sede del proveedor\n• Dirección de entrega: desde dónde despacha la mercancía\n\nCada dirección puede tener calle, número, colonia, ciudad, estado, código postal y país.',
        en: 'You can add multiple addresses to a provider:\n\n• Main address: provider\'s offices or headquarters\n• Delivery address: where they dispatch merchandise from\n\nEach address can have street, number, neighborhood, city, state, zip code and country.',
      },
    },
    {
      icon: '🧾',
      title: { es: 'Datos fiscales (RFC)', en: 'Tax data (RFC)' },
      content: {
        es: 'Los datos fiscales del proveedor son útiles para registrar correctamente las facturas que recibes de ellos. Incluyen:\n\n• RFC: identificador fiscal del proveedor\n• Razón social: nombre legal del proveedor\n• Régimen fiscal\n\nEstos datos se usan como referencia al registrar gastos y cuentas por pagar.',
        en: 'Provider tax data is useful for correctly recording invoices you receive from them. Includes:\n\n• RFC: provider\'s tax identifier\n• Legal name: provider\'s legal name\n• Tax regime\n\nThis data is used as reference when recording expenses and accounts payable.',
      },
    },
    {
      icon: '💳',
      title: { es: 'Crédito con el proveedor', en: 'Provider credit' },
      content: {
        es: 'La línea de crédito registra las condiciones de pago que tienes con el proveedor:\n\n• Límite de crédito: monto máximo de deuda permitida\n• Días de crédito: plazo para pagar tus compras (ej. 30 días)\n• Moneda del crédito\n\nEsto te ayuda a controlar cuánto le debes a cada proveedor y cuándo vencen tus pagos.',
        en: 'The credit line records the payment terms you have with the provider:\n\n• Credit limit: maximum allowed debt amount\n• Credit days: payment term for your purchases (e.g. 30 days)\n• Credit currency\n\nThis helps you control how much you owe each provider and when your payments are due.',
      },
    },
    {
      icon: '📦',
      title: { es: 'Relación con recepciones', en: 'Relationship with receptions' },
      content: {
        es: 'Cada recepción de mercancía está asociada a un proveedor. Al cerrar una recepción, el inventario se actualiza automáticamente.\n\nDesde el detalle del proveedor puedes ver el historial de todas las recepciones que has tenido con él.',
        en: 'Each merchandise reception is associated with a provider. When a reception is closed, inventory is automatically updated.\n\nFrom the provider detail you can see the history of all receptions you have had with them.',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Búsqueda', en: 'Search' },
      content: {
        es: 'Puedes buscar proveedores por:\n• Código\n• Nombre\n• Descripción\n• Teléfono\n• Email\n\nUsa los filtros para ver solo proveedores activos o inactivos.',
        en: 'You can search providers by:\n• Code\n• Name\n• Description\n• Phone\n• Email\n\nUse filters to see only active or inactive providers.',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar proveedores', en: 'Delete providers' },
      content: {
        es: 'Un proveedor puede eliminarse siempre que no tenga recepciones u órdenes de compra activas asociadas.\n\nSi el proveedor tiene historial de compras, considera desactivarlo en lugar de eliminarlo para conservar el registro histórico.',
        en: 'A provider can be deleted as long as it has no associated active receptions or purchase orders.\n\nIf the provider has purchase history, consider deactivating it instead of deleting it to preserve the historical record.',
      },
    },
  ],
};
