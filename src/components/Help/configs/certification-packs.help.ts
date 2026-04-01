import type { HelpConfig } from '../HelpButton';

export const certificationPacksHelp: HelpConfig = {
  title: { es: 'Guía de Packs SAT', en: 'SAT Packs Guide' },
  description: {
    es: 'Gestiona tus certificados digitales para la facturación electrónica',
    en: 'Manage your digital certificates for electronic invoicing',
  },
  sections: [
    {
      icon: '🔐',
      title: { es: '¿Qué es un Pack SAT?', en: 'What is a SAT Pack?' },
      content: {
        es: 'Un Pack SAT contiene los certificados digitales necesarios para timbrar facturas electrónicas (CFDI) ante el SAT:\n\n• Certificado de Sello Digital (CSD): archivo .cer emitido por el SAT\n• Llave privada: archivo .key correspondiente al certificado\n• Contraseña: la clave de tu certificado\n\nSin un pack activo y válido, no puedes generar CFDIs.',
        en: 'A SAT Pack contains the digital certificates needed to stamp electronic invoices (CFDI) with the SAT:\n\n• Digital Seal Certificate (CSD): .cer file issued by the SAT\n• Private key: .key file corresponding to the certificate\n• Password: your certificate key\n\nWithout an active and valid pack, you cannot generate CFDIs.',
      },
    },
    {
      icon: '⭐',
      title: { es: 'Pack por defecto', en: 'Default pack' },
      content: {
        es: 'Solo un pack puede estar activo como predeterminado a la vez. El pack por defecto es el que se usa automáticamente al generar cualquier CFDI.\n\nPuedes tener múltiples packs registrados (útil cuando tu certificado está por vencer y subes el nuevo antes de que expire el anterior), pero solo uno estará activo.',
        en: 'Only one pack can be active as default at a time. The default pack is the one automatically used when generating any CFDI.\n\nYou can have multiple registered packs (useful when your certificate is about to expire and you upload the new one before the old one expires), but only one will be active.',
      },
    },
    {
      icon: '📅',
      title: { es: 'Vigencia del certificado', en: 'Certificate validity' },
      content: {
        es: 'Los Certificados de Sello Digital tienen una vigencia de 2 años. Cuando tu certificado esté próximo a vencer:\n\n1. Solicita un nuevo CSD en el portal del SAT\n2. Sube el nuevo pack en esta sección\n3. Márcalo como predeterminado\n4. El anterior quedará inactivo\n\nSi tu certificado vence, no podrás timbrar facturas hasta renovarlo.',
        en: 'Digital Seal Certificates are valid for 2 years. When your certificate is about to expire:\n\n1. Request a new CSD from the SAT portal\n2. Upload the new pack in this section\n3. Mark it as default\n4. The previous one will become inactive\n\nIf your certificate expires, you cannot stamp invoices until you renew it.',
      },
    },
    {
      icon: '🔒',
      title: { es: 'Seguridad', en: 'Security' },
      content: {
        es: 'Los certificados y llaves privadas se almacenan de forma segura y encriptada. La contraseña del certificado nunca se muestra en texto plano después de guardarse.\n\nSolo los usuarios con permisos de administración pueden ver y gestionar los packs SAT. Mantén tu llave privada y contraseña en un lugar seguro fuera del sistema.',
        en: 'Certificates and private keys are stored securely and encrypted. The certificate password is never shown in plain text after saving.\n\nOnly users with admin permissions can view and manage SAT packs. Keep your private key and password in a safe place outside the system.',
      },
    },
  ],
};
