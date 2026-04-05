import type { HelpConfig } from '../HelpButton';

export const companySettingsHelp: HelpConfig = {
  title: { es: 'Guía de Configuración de Empresa', en: 'Company Settings Guide', zh: '公司设置指南' },
  description: {
    es: 'Configura la información general y visual de tu empresa',
    en: 'Configure your company general and visual information',
    zh: '配置公司的基本信息和视觉信息',
  },
  sections: [
    {
      icon: '🏢',
      title: { es: 'Información básica', en: 'Basic information', zh: '基本信息' },
      content: {
        es: 'Aquí configuras los datos principales de tu empresa:\n\n• Nombre comercial: el nombre que aparece en tickets y documentos\n• Razón social: nombre legal registrado ante el SAT\n• RFC: tu Registro Federal de Contribuyentes — necesario para emitir facturas\n\nEstos datos se usan en la generación de CFDIs y en los encabezados de tus documentos.',
        en: 'Here you configure your company main data:\n\n• Trade name: the name that appears on tickets and documents\n• Legal name: legal name registered with the tax authority\n• Tax ID (RFC): your Federal Taxpayer Registry — required to issue invoices\n\nThis data is used in CFDI generation and document headers.',
        zh: '在此配置公司的主要信息：\n\n• 商业名称：出现在收据和文件上的名称\n• 法定名称：在SAT注册的法定名称\n• RFC：联邦纳税人登记号——开具发票所必需\n\n这些数据用于生成CFDI和文件抬头。',
      },
    },
    {
      icon: '📞',
      title: { es: 'Información de contacto', en: 'Contact information', zh: '联系信息' },
      content: {
        es: 'Configura los datos de contacto de tu empresa:\n\n• Dirección: aparece en facturas y documentos fiscales\n• Teléfono: para contacto con clientes\n• Correo electrónico: dirección de contacto principal\n• Sitio web: URL de tu empresa\n\nEstos datos pueden aparecer en los documentos que generas para tus clientes.',
        en: 'Configure your company contact data:\n\n• Address: appears on invoices and fiscal documents\n• Phone: for client contact\n• Email: main contact address\n• Website: your company URL\n\nThis data may appear on documents you generate for your clients.',
        zh: '配置公司的联系信息：\n\n• 地址：出现在发票和税务文件上\n• 电话：客户联系方式\n• 电子邮件：主要联系地址\n• 网站：公司网址\n\n这些数据可能出现在您为客户生成的文件中。',
      },
    },
    {
      icon: '🖼️',
      title: { es: 'Logo de la empresa', en: 'Company logo', zh: '公司标志' },
      content: {
        es: 'Sube el logo de tu empresa para que aparezca en tickets, facturas y documentos PDF.\n\n• Formatos aceptados: PNG, JPG, WEBP\n• Tamaño máximo: 5 MB\n• Recomendado: imagen cuadrada o rectangular con fondo transparente (PNG)\n\nEl logo se actualiza inmediatamente en todos los documentos nuevos que generes.',
        en: 'Upload your company logo to appear on tickets, invoices and PDF documents.\n\n• Accepted formats: PNG, JPG, WEBP\n• Maximum size: 5 MB\n• Recommended: square or rectangular image with transparent background (PNG)\n\nThe logo updates immediately on all new documents you generate.',
        zh: '上传公司标志，使其出现在收据、发票和PDF文件上。\n\n• 支持格式：PNG、JPG、WEBP\n• 最大大小：5 MB\n• 建议：使用透明背景的正方形或矩形图片（PNG）\n\n标志将立即在您生成的所有新文件中更新。',
      },
    },
    {
      icon: '💾',
      title: { es: 'Guardar cambios', en: 'Save changes', zh: '保存更改' },
      content: {
        es: 'Los cambios en el formulario no se guardan automáticamente. Debes hacer clic en "Guardar" para aplicarlos.\n\nEl logo sí se sube y aplica inmediatamente al seleccionar el archivo, sin necesidad de guardar el formulario.',
        en: 'Form changes are not saved automatically. You must click "Save" to apply them.\n\nThe logo is uploaded and applied immediately when you select the file, without needing to save the form.',
        zh: '表单中的更改不会自动保存。您必须点击"保存"才能应用。\n\n标志在选择文件后立即上传并应用，无需保存表单。',
      },
    },
  ],
};
