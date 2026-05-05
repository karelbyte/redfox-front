import type { HelpConfig } from '../HelpButton';

export const documentsHelp: HelpConfig = {
  title: {
    es: 'Guía de Documentos de Empleados',
    en: 'Employee Documents Guide',
    zh: '员工文档指南',
  },
  description: {
    es: 'Organiza y gestiona los archivos, contratos y certificados de tu personal',
    en: 'Organize and manage files, contracts, and certificates for your staff',
    zh: '组织和管理员工的文件、合同和证书',
  },
  sections: [
    {
      icon: '📄',
      title: { es: 'Tipos de Documentos', en: 'Document Types', zh: '文档类型' },
      content: {
        es: 'Puedes subir diversos tipos de archivos: Contratos, Identificaciones, Pasaportes, Currículums, Certificados Médicos y Antecedentes Penales.',
        en: 'You can upload various types of files: Contracts, IDs, Passports, Resumes, Medical Certificates, and Police Records.',
        zh: '您可以上传各种类型的文件：合同、身份证、护照、简历、医疗证明和无犯罪记录证明。',
      },
    },
    {
      icon: '🔔',
      title: { es: 'Fechas de Vencimiento', en: 'Expiry Dates', zh: '到期日期' },
      content: {
        es: 'Es crucial registrar la fecha de vencimiento de documentos como pasaportes o certificados médicos para recibir alertas antes de que caduquen.',
        en: 'It is crucial to record the expiry date of documents such as passports or medical certificates to receive alerts before they expire.',
        zh: '记录护照或医疗证明等文件的到期日期至关重要，以便在过期前收到警报。',
      },
    },
    {
      icon: '🛡️',
      title: { es: 'Verificación de Documentos', en: 'Document Verification', zh: '文档验证' },
      content: {
        es: 'Marca los documentos como "Verificados" una vez que hayas revisado que la información es correcta y auténtica.',
        en: 'Mark documents as "Verified" once you have reviewed that the information is correct and authentic.',
        zh: '核对信息正确无误后，将文档标记为“已验证”。',
      },
    },
  ],
};
