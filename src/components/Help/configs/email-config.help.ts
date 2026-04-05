import type { HelpConfig } from '../HelpButton';

export const emailConfigHelp: HelpConfig = {
  title: { es: 'Guía de Configuración de Correo', en: 'Email Configuration Guide', zh: '邮件配置指南' },
  description: {
    es: 'Configura el servidor de correo para enviar notificaciones y documentos',
    en: 'Configure the mail server to send notifications and documents',
    zh: '配置邮件服务器以发送通知和文件',
  },
  sections: [
    {
      icon: '📧',
      title: { es: '¿Para qué sirve?', en: 'What is it for?', zh: '有什么用？' },
      content: {
        es: 'La configuración de correo permite al sistema enviar emails automáticamente:\n\n• Facturas y tickets a clientes\n• Notificaciones de alertas de inventario\n• Alertas de flujo de caja\n• Confirmaciones de pedidos\n\nSin esta configuración, el sistema no puede enviar correos.',
        en: 'Email configuration allows the system to send emails automatically:\n\n• Invoices and tickets to clients\n• Inventory alert notifications\n• Cash flow alerts\n• Order confirmations\n\nWithout this configuration, the system cannot send emails.',
        zh: '邮件配置允许系统自动发送邮件：\n\n• 向客户发送发票和收据\n• 库存预警通知\n• 现金流提醒\n• 订单确认\n\n没有此配置，系统将无法发送邮件。',
      },
    },
    {
      icon: '🔧',
      title: { es: 'Configuración SMTP', en: 'SMTP Configuration', zh: 'SMTP配置' },
      content: {
        es: 'Necesitas los datos de tu servidor SMTP:\n\n• Host: dirección del servidor (ej. smtp.gmail.com)\n• Puerto: generalmente 587 (TLS) o 465 (SSL)\n• Usuario: tu dirección de correo\n• Contraseña: contraseña o contraseña de aplicación\n• Seguridad: TLS o SSL según tu proveedor\n\nSi usas Gmail, debes generar una "contraseña de aplicación" en tu cuenta de Google.',
        en: 'You need your SMTP server data:\n\n• Host: server address (e.g. smtp.gmail.com)\n• Port: usually 587 (TLS) or 465 (SSL)\n• User: your email address\n• Password: password or app password\n• Security: TLS or SSL depending on your provider\n\nIf using Gmail, you must generate an "app password" in your Google account.',
        zh: '您需要SMTP服务器的相关信息：\n\n• 主机：服务器地址（例如smtp.gmail.com）\n• 端口：通常为587（TLS）或465（SSL）\n• 用户名：您的邮件地址\n• 密码：账户密码或应用专用密码\n• 安全性：根据服务商选择TLS或SSL\n\n如果使用Gmail，需要在Google账户中生成"应用专用密码"。',
      },
    },
    {
      icon: '✉️',
      title: { es: 'Remitente', en: 'Sender', zh: '发件人' },
      content: {
        es: 'El remitente es el nombre y dirección que verán tus clientes cuando reciban un correo:\n\n• Nombre del remitente: ej. "Empresa XYZ"\n• Correo del remitente: la dirección desde la que se envía\n\nAsegúrate de que el correo del remitente coincida con el usuario SMTP para evitar que los correos lleguen a spam.',
        en: 'The sender is the name and address your clients will see when receiving an email:\n\n• Sender name: e.g. "Company XYZ"\n• Sender email: the address from which it is sent\n\nMake sure the sender email matches the SMTP user to avoid emails going to spam.',
        zh: '发件人是客户收到邮件时看到的名称和地址：\n\n• 发件人名称：例如"XYZ公司"\n• 发件人邮箱：发送邮件的地址\n\n请确保发件人邮箱与SMTP用户名一致，以避免邮件被归入垃圾邮件。',
      },
    },
    {
      icon: '🧪',
      title: { es: 'Probar la configuración', en: 'Test the configuration', zh: '测试配置' },
      content: {
        es: 'Después de guardar la configuración, usa el botón "Enviar correo de prueba" para verificar que todo funciona correctamente.\n\nSi el correo de prueba no llega, revisa:\n• Que el host y puerto sean correctos\n• Que la contraseña sea válida\n• Que tu proveedor permita acceso SMTP externo',
        en: 'After saving the configuration, use the "Send test email" button to verify everything works correctly.\n\nIf the test email does not arrive, check:\n• That the host and port are correct\n• That the password is valid\n• That your provider allows external SMTP access',
        zh: '保存配置后，使用"发送测试邮件"按钮验证一切是否正常运行。\n\n如果测试邮件未收到，请检查：\n• 主机和端口是否正确\n• 密码是否有效\n• 您的服务商是否允许外部SMTP访问',
      },
    },
  ],
};
