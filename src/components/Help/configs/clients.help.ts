import type { HelpConfig } from '../HelpButton';

export const clientsHelp: HelpConfig = {
  title: {
    es: 'Guía de Clientes',
    en: 'Clients Guide',
  },
  description: {
    es: 'Todo lo que necesitas saber para gestionar tus clientes',
    en: 'Everything you need to know to manage your clients',
  },
  sections: [
    {
      icon: '👤',
      title: { es: '¿Qué es un cliente?', en: 'What is a client?' },
      content: {
        es: 'Un cliente es cualquier persona física o empresa a quien le vendes productos o servicios. Cada cliente tiene un código único generado automáticamente y puede tener:\n\n• Datos generales (nombre, teléfono, email)\n• Direcciones de envío o facturación\n• Datos fiscales para facturación electrónica (RFC, régimen fiscal)\n• Línea de crédito para ventas a plazo',
        en: 'A client is any individual or company to whom you sell products or services. Each client has a unique auto-generated code and can have:\n\n• General data (name, phone, email)\n• Shipping or billing addresses\n• Tax data for electronic invoicing (RFC, tax regime)\n• Credit line for deferred payment sales',
      },
    },
    {
      icon: '🏷️',
      title: { es: 'Código de cliente', en: 'Client code' },
      content: {
        es: 'El código se genera automáticamente con el prefijo CLI (ej. CLI-0001). Puedes aceptar el sugerido o escribir el tuyo propio.\n\nEste código es único por organización y sirve para identificar rápidamente al cliente en búsquedas, ventas y cotizaciones.',
        en: 'The code is generated automatically with the prefix CLI (e.g. CLI-0001). You can accept the suggested one or type your own.\n\nThis code is unique per organization and is used to quickly identify the client in searches, sales and quotations.',
      },
    },
    {
      icon: '📍',
      title: { es: 'Direcciones', en: 'Addresses' },
      content: {
        es: 'Puedes agregar múltiples direcciones a un cliente:\n\n• Facturación: dirección que aparece en las facturas electrónicas\n• Envío: dirección de entrega de mercancía\n\nCada dirección puede tener calle, número, colonia, ciudad, estado, código postal y país.',
        en: 'You can add multiple addresses to a client:\n\n• Billing: address that appears on electronic invoices\n• Shipping: merchandise delivery address\n\nEach address can have street, number, neighborhood, city, state, zip code and country.',
      },
    },
    {
      icon: '🧾',
      title: { es: 'Datos fiscales (RFC)', en: 'Tax data (RFC)' },
      content: {
        es: 'Los datos fiscales son necesarios para emitir facturas electrónicas (CFDI) a nombre del cliente. Incluyen:\n\n• RFC: identificador fiscal (12 caracteres para empresa, 13 para persona física)\n• Razón social: nombre legal del cliente\n• Régimen fiscal: régimen SAT del cliente\n• Uso de CFDI: para qué usará la factura (G03 Gastos en general es el más común)\n• Código postal fiscal\n\nSin datos fiscales, el cliente solo puede recibir facturas globales.',
        en: 'Tax data is required to issue electronic invoices (CFDI) in the client\'s name. Includes:\n\n• RFC: tax identifier (12 characters for company, 13 for individual)\n• Legal name: client\'s legal name\n• Tax regime: client\'s SAT regime\n• CFDI use: what the invoice will be used for (G03 General expenses is most common)\n• Tax zip code\n\nWithout tax data, the client can only receive global invoices.',
      },
    },
    {
      icon: '💳',
      title: { es: 'Crédito', en: 'Credit' },
      content: {
        es: 'La línea de crédito permite vender a plazo al cliente. Configura:\n\n• Límite de crédito: monto máximo que puede deber\n• Días de crédito: plazo para pagar (ej. 30 días)\n• Moneda del crédito\n\nCuando se cierra una venta con método de pago "Crédito", se genera automáticamente una cuenta por cobrar asociada al cliente.',
        en: 'The credit line allows selling on credit to the client. Configure:\n\n• Credit limit: maximum amount they can owe\n• Credit days: payment term (e.g. 30 days)\n• Credit currency\n\nWhen a sale is closed with payment method "Credit", an account receivable is automatically generated associated with the client.',
      },
    },
    {
      icon: '🔄',
      title: { es: 'Sincronización con Pack (Facturación)', en: 'Pack sync (Billing)' },
      content: {
        es: 'Si tienes configurado un proveedor de facturación (Factura Green u otro), los clientes se sincronizan automáticamente al crearlos o actualizarlos.\n\nSi la sincronización falla, puedes reintentarla manualmente desde el detalle del cliente.\n\nTambién puedes importar clientes existentes en tu proveedor de facturación con el botón "Importar desde Pack".',
        en: 'If you have a billing provider configured (Factura Green or other), clients are automatically synced when created or updated.\n\nIf sync fails, you can retry it manually from the client detail.\n\nYou can also import existing clients from your billing provider with the "Import from Pack" button.',
      },
    },
    {
      icon: '🔍',
      title: { es: 'Búsqueda', en: 'Search' },
      content: {
        es: 'Puedes buscar clientes por:\n• Código\n• Nombre\n• Teléfono\n• Email\n• RFC\n• Razón social\n• Calle o ciudad de sus direcciones\n\nUsa los filtros para ver solo clientes activos o inactivos.',
        en: 'You can search clients by:\n• Code\n• Name\n• Phone\n• Email\n• RFC\n• Legal name\n• Street or city of their addresses\n\nUse filters to see only active or inactive clients.',
      },
    },
    {
      icon: '🗑️',
      title: { es: 'Eliminar clientes', en: 'Delete clients' },
      content: {
        es: 'Un cliente solo puede eliminarse si no tiene facturas, ventas ni cotizaciones asociadas.\n\nSi el cliente tiene historial, considera desactivarlo en lugar de eliminarlo. Un cliente inactivo no aparece en los selectores de ventas y cotizaciones, pero conserva su historial.',
        en: 'A client can only be deleted if it has no associated invoices, sales or quotations.\n\nIf the client has history, consider deactivating it instead of deleting it. An inactive client does not appear in sales and quotation selectors, but retains its history.',
      },
    },
  ],
};
