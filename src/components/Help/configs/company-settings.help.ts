import type { HelpConfig } from '../HelpButton';

export const companySettingsHelp: HelpConfig = {
  title: { es: 'Guía de Configuración de Empresa', en: 'Company Settings Guide' },
  description: {
    es: 'Configura la información general y visual de tu empresa',
    en: 'Configure your company general and visual information',
  },
  sections: [
    {
      icon: '🏢',
      title: { es: 'Información básica', en: 'Basic information' },
      content: {
        es: 'Aquí configuras los datos principales de tu empresa:\n\n• Nombre comercial: el nombre que aparece en tickets y documentos\n• Razón social: nombre legal registrado ante el SAT\n• RFC: tu Registro Federal de Contribuyentes — necesario para emitir facturas\n\nEstos datos se usan en la generación de CFDIs y en los encabezados de tus documentos.',
        en: 'Here you configure your company main data:\n\n• Trade name: the name that appears on tickets and documents\n• Legal name: legal name registered with the tax authority\n• Tax ID (RFC): your Federal Taxpayer Registry — required to issue invoices\n\nThis data is used in CFDI generation and document headers.',
      },
    },
    {
      icon: '📞',
      title: { es: 'Información de contacto', en: 'Contact information' },
      content: {
        es: 'Configura los datos de contacto de tu empresa:\n\n• Dirección: aparece en facturas y documentos fiscales\n• Teléfono: para contacto con clientes\n• Correo electrónico: dirección de contacto principal\n• Sitio web: URL de tu empresa\n\nEstos datos pueden aparecer en los documentos que generas para tus clientes.',
        en: 'Configure your company contact data:\n\n• Address: appears on invoices and fiscal documents\n• Phone: for client contact\n• Email: main contact address\n• Website: your company URL\n\nThis data may appear on documents you generate for your clients.',
      },
    },
    {
      icon: '🖼️',
      title: { es: 'Logo de la empresa', en: 'Company logo' },
      content: {
        es: 'Sube el logo de tu empresa para que aparezca en tickets, facturas y documentos PDF.\n\n• Formatos aceptados: PNG, JPG, WEBP\n• Tamaño máximo: 5 MB\n• Recomendado: imagen cuadrada o rectangular con fondo transparente (PNG)\n\nEl logo se actualiza inmediatamente en todos los documentos nuevos que generes.',
        en: 'Upload your company logo to appear on tickets, invoices and PDF documents.\n\n• Accepted formats: PNG, JPG, WEBP\n• Maximum size: 5 MB\n• Recommended: square or rectangular image with transparent background (PNG)\n\nThe logo updates immediately on all new documents you generate.',
      },
    },
    {
      icon: '💾',
      title: { es: 'Guardar cambios', en: 'Save changes' },
      content: {
        es: 'Los cambios en el formulario no se guardan automáticamente. Debes hacer clic en "Guardar" para aplicarlos.\n\nEl logo sí se sube y aplica inmediatamente al seleccionar el archivo, sin necesidad de guardar el formulario.',
        en: 'Form changes are not saved automatically. You must click "Save" to apply them.\n\nThe logo is uploaded and applied immediately when you select the file, without needing to save the form.',
      },
    },
  ],
};
