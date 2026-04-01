import type { HelpConfig } from '../HelpButton';

export const emailConfigHelp: HelpConfig = {
  title: { es: 'Guía de Configuración de Correo', en: 'Email Configuration Guide' },
  description: {
    es: 'Configura el servidor de correo para enviar notificaciones y documentos',
    en: 'Configure the mail server to send notifications and documents',
  },
  sections: [
    {
      icon: '📧',
      title: { es: '¿Para qué sirve?', en: 'What is it for?' },
      content: {
        es: 'La configuración de correo permite al sistema enviar emails automáticamente:\n\n• Facturas y tickets a clientes\n• Notificaciones de alertas de inventario\n• Alertas de flujo de caja\n• Confirmaciones de pedidos\n\nSin esta configuración, el sistema no puede enviar correos.',
        en: 'Email configuration allows the system to send emails automatically:\n\n• Invoices and tickets to clients\n• Inventory alert notifications\n• Cash flow alerts\n• Order confirmations\n\nWithout this configuration, the system cannot send emails.',
      },
    },
    {
      icon: '🔧',
      title: { es: 'Configuración SMTP', en: 'SMTP Configuration' },
      content: {
        es: 'Necesitas los datos de tu servidor SMTP:\n\n• Host: dirección del servidor (ej. smtp.gmail.com)\n• Puerto: generalmente 587 (TLS) o 465 (SSL)\n• Usuario: tu dirección de correo\n• Contraseña: contraseña o contraseña de aplicación\n• Seguridad: TLS o SSL según tu proveedor\n\nSi usas Gmail, debes generar una "contraseña de aplicación" en tu cuenta de Google.',
        en: 'You need your SMTP server data:\n\n• Host: server address (e.g. smtp.gmail.com)\n• Port: usually 587 (TLS) or 465 (SSL)\n• User: your email address\n• Password: password or app password\n• Security: TLS or SSL depending on your provider\n\nIf using Gmail, you must generate an "app password" in your Google account.',
      },
    },
    {
      icon: '✉️',
      title: { es: 'Remitente', en: 'Sender' },
      content: {
        es: 'El remitente es el nombre y dirección que verán tus clientes cuando reciban un correo:\n\n• Nombre del remitente: ej. "Empresa XYZ"\n• Correo del remitente: la dirección desde la que se envía\n\nAsegúrate de que el correo del remitente coincida con el usuario SMTP para evitar que los correos lleguen a spam.',
        en: 'The sender is the name and address your clients will see when receiving an email:\n\n• Sender name: e.g. "Company XYZ"\n• Sender email: the address from which it is sent\n\nMake sure the sender email matches the SMTP user to avoid emails going to spam.',
      },
    },
    {
      icon: '🧪',
      title: { es: 'Probar la configuración', en: 'Test the configuration' },
      content: {
        es: 'Después de guardar la configuración, usa el botón "Enviar correo de prueba" para verificar que todo funciona correctamente.\n\nSi el correo de prueba no llega, revisa:\n• Que el host y puerto sean correctos\n• Que la contraseña sea válida\n• Que tu proveedor permita acceso SMTP externo',
        en: 'After saving the configuration, use the "Send test email" button to verify everything works correctly.\n\nIf the test email does not arrive, check:\n• That the host and port are correct\n• That the password is valid\n• That your provider allows external SMTP access',
      },
    },
  ],
};
