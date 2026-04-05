import type { HelpConfig } from '../HelpButton';

export const certificationPacksHelp: HelpConfig = {
  title: { es: 'Guía de Packs SAT', en: 'SAT Packs Guide', zh: 'SAT证书包指南' },
  description: {
    es: 'Gestiona tus certificados digitales para la facturación electrónica',
    en: 'Manage your digital certificates for electronic invoicing',
    zh: '管理电子开票所需的数字证书',
  },
  sections: [
    {
      icon: '🔐',
      title: { es: '¿Qué es un Pack SAT?', en: 'What is a SAT Pack?', zh: '什么是SAT证书包？' },
      content: {
        es: 'Un Pack SAT contiene los certificados digitales necesarios para timbrar facturas electrónicas (CFDI) ante el SAT:\n\n• Certificado de Sello Digital (CSD): archivo .cer emitido por el SAT\n• Llave privada: archivo .key correspondiente al certificado\n• Contraseña: la clave de tu certificado\n\nSin un pack activo y válido, no puedes generar CFDIs.',
        en: 'A SAT Pack contains the digital certificates needed to stamp electronic invoices (CFDI) with the SAT:\n\n• Digital Seal Certificate (CSD): .cer file issued by the SAT\n• Private key: .key file corresponding to the certificate\n• Password: your certificate key\n\nWithout an active and valid pack, you cannot generate CFDIs.',
        zh: 'SAT证书包包含向SAT盖章电子发票（CFDI）所需的数字证书：\n\n• 数字印章证书（CSD）：SAT颁发的.cer文件\n• 私钥：与证书对应的.key文件\n• 密码：您的证书密钥\n\n没有有效的活跃证书包，您将无法生成CFDI。',
      },
    },
    {
      icon: '⭐',
      title: { es: 'Pack por defecto', en: 'Default pack', zh: '默认证书包' },
      content: {
        es: 'Solo un pack puede estar activo como predeterminado a la vez. El pack por defecto es el que se usa automáticamente al generar cualquier CFDI.\n\nPuedes tener múltiples packs registrados (útil cuando tu certificado está por vencer y subes el nuevo antes de que expire el anterior), pero solo uno estará activo.',
        en: 'Only one pack can be active as default at a time. The default pack is the one automatically used when generating any CFDI.\n\nYou can have multiple registered packs (useful when your certificate is about to expire and you upload the new one before the old one expires), but only one will be active.',
        zh: '同一时间只能有一个证书包设为默认。默认证书包是生成任何CFDI时自动使用的。\n\n您可以注册多个证书包（当证书即将到期时，在旧证书过期前上传新证书非常有用），但只有一个处于活跃状态。',
      },
    },
    {
      icon: '📅',
      title: { es: 'Vigencia del certificado', en: 'Certificate validity', zh: '证书有效期' },
      content: {
        es: 'Los Certificados de Sello Digital tienen una vigencia de 2 años. Cuando tu certificado esté próximo a vencer:\n\n1. Solicita un nuevo CSD en el portal del SAT\n2. Sube el nuevo pack en esta sección\n3. Márcalo como predeterminado\n4. El anterior quedará inactivo\n\nSi tu certificado vence, no podrás timbrar facturas hasta renovarlo.',
        en: 'Digital Seal Certificates are valid for 2 years. When your certificate is about to expire:\n\n1. Request a new CSD from the SAT portal\n2. Upload the new pack in this section\n3. Mark it as default\n4. The previous one will become inactive\n\nIf your certificate expires, you cannot stamp invoices until you renew it.',
        zh: '数字印章证书有效期为2年。当证书即将到期时：\n\n1. 在SAT门户申请新的CSD\n2. 在本页面上传新证书包\n3. 将其设为默认\n4. 旧证书包将变为非活跃状态\n\n如果证书过期，在续期之前将无法盖章发票。',
      },
    },
    {
      icon: '🔒',
      title: { es: 'Seguridad', en: 'Security', zh: '安全性' },
      content: {
        es: 'Los certificados y llaves privadas se almacenan de forma segura y encriptada. La contraseña del certificado nunca se muestra en texto plano después de guardarse.\n\nSolo los usuarios con permisos de administración pueden ver y gestionar los packs SAT. Mantén tu llave privada y contraseña en un lugar seguro fuera del sistema.',
        en: 'Certificates and private keys are stored securely and encrypted. The certificate password is never shown in plain text after saving.\n\nOnly users with admin permissions can view and manage SAT packs. Keep your private key and password in a safe place outside the system.',
        zh: '证书和私钥以加密方式安全存储。证书密码保存后不会以明文显示。\n\n只有具有管理员权限的用户才能查看和管理SAT证书包。请将私钥和密码保存在系统外的安全位置。',
      },
    },
  ],
};
