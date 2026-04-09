import type { HelpConfig } from '../HelpButton';

export const botAssistantHelp: HelpConfig = {
  title: {
    es: 'Guía del Bot de WhatsApp',
    en: 'WhatsApp Bot Guide',
    zh: 'WhatsApp 机器人指南',
  },
  description: {
    es: 'Conecta WhatsApp, configura el tono del bot y prepara tu flujo de cotizaciones.',
    en: 'Connect WhatsApp, configure the bot tone and prepare your quotation flow.',
    zh: '连接 WhatsApp，配置机器人语气并准备报价流程。',
  },
  sections: [
    {
      icon: '🤖',
      title: {
        es: 'Dos providers, un mismo módulo',
        en: 'Two providers, one module',
        zh: '两个提供方，一个模块',
      },
      content: {
        es: 'Puedes trabajar con dos variantes:\n\n• WhatsApp Web (Beta): conexión rápida por QR con Baileys para pruebas y validación inicial.\n• WhatsApp Cloud API: variante oficial orientada a una operación más estable.\n\nLa configuración del bot vive en un solo lugar para que luego puedas cambiar de provider sin rehacer el módulo.',
        en: 'You can work with two variants:\n\n• WhatsApp Web (Beta): fast QR connection with Baileys for testing and early validation.\n• WhatsApp Cloud API: official variant oriented to a more stable operation.\n\nThe bot configuration lives in one place so you can switch providers later without rebuilding the module.',
        zh: '你可以使用两种变体：\n\n• WhatsApp Web（Beta）：通过 Baileys 和二维码快速连接，适合测试和早期验证。\n• WhatsApp Cloud API：官方方案，更适合稳定运营。\n\n机器人配置集中在一个地方，后续切换提供方时无需重做整个模块。',
      },
    },
    {
      icon: '📲',
      title: {
        es: 'Flujo con QR (Beta)',
        en: 'QR flow (Beta)',
        zh: '二维码流程（Beta）',
      },
      content: {
        es: 'Para probar con WhatsApp Web (Beta):\n\n1. Selecciona el provider Beta.\n2. Haz clic en “Conectar WhatsApp Web”.\n3. Abre WhatsApp en tu teléfono.\n4. Ve a “Dispositivos vinculados”.\n5. Escanea el QR que aparece en Nitro.\n6. Espera el estado “Conectado”.\n\nSi la sesión se cae o expira, puedes generar un QR nuevo desde este mismo módulo.',
        en: 'To test with WhatsApp Web (Beta):\n\n1. Select the Beta provider.\n2. Click “Connect WhatsApp Web”.\n3. Open WhatsApp on your phone.\n4. Go to “Linked devices”.\n5. Scan the QR code shown in Nitro.\n6. Wait for the “Connected” status.\n\nIf the session drops or expires, you can generate a new QR from this same module.',
        zh: '如果要用 WhatsApp Web（Beta）测试：\n\n1. 选择 Beta 提供方。\n2. 点击“连接 WhatsApp Web”。\n3. 在手机上打开 WhatsApp。\n4. 进入“已关联设备”。\n5. 扫描 Nitro 中显示的二维码。\n6. 等待状态变为“已连接”。\n\n如果会话断开或过期，可以在这个模块里重新生成二维码。',
      },
    },
    {
      icon: '🧾',
      title: {
        es: 'Cotizaciones y contexto',
        en: 'Quotations and context',
        zh: '报价与上下文',
      },
      content: {
        es: 'El bot usa la información general de tu empresa y puede responder consultas de stock y precio cuando el mensaje del cliente tiene intención de cotización.\n\nDefine bien:\n\n• Nombre del asistente\n• Mensaje de bienvenida\n• Mensaje de escalado a humano\n• Instrucciones de cotización\n\nEso ayuda a que el bot responda con un tono coherente con tu negocio.',
        en: 'The bot uses your company general information and can answer stock and price queries when the client message has quotation intent.\n\nDefine clearly:\n\n• Assistant name\n• Welcome message\n• Human handoff message\n• Quotation instructions\n\nThis helps the bot answer with a tone that matches your business.',
        zh: '机器人会使用公司的基础资料，并在客户消息具有报价意图时回应库存和价格查询。\n\n请明确配置：\n\n• 助手机器人名称\n• 欢迎消息\n• 转人工消息\n• 报价说明\n\n这样可以让机器人的语气更符合你的业务。',
      },
    },
    {
      icon: '💬',
      title: {
        es: 'Cómo crea la cotización',
        en: 'How the quotation is created',
        zh: '报价是如何创建的',
      },
      content: {
        es: 'El flujo actual funciona paso a paso, sin IA libre:\n\n1. El cliente escribe por WhatsApp para pedir una cotización.\n2. Si el teléfono no existe, el bot pide el nombre y el correo del cliente.\n3. En futuras conversaciones, el bot reconoce el teléfono y da la bienvenida de nuevo al cliente.\n4. El bot busca el producto por nombre, código o SKU.\n5. Si hay varias coincidencias, muestra una lista numerada.\n6. El cliente indica la cantidad.\n7. El bot muestra un resumen y permite agregar más productos.\n8. Cuando se confirma, Nitro crea una cotización formal dentro del sistema y adjunta el PDF por WhatsApp.\n\nEste enfoque es más controlado y deja la puerta abierta para agregar IA después sin cambiar la base del módulo.',
        en: 'The current flow works step by step, without free-form AI:\n\n1. The client writes on WhatsApp asking for a quotation.\n2. If the phone does not exist yet, the bot asks for the client name and email.\n3. On future conversations, the bot recognizes the phone number and welcomes the client back.\n4. The bot searches the product by name, code or SKU.\n5. If there are several matches, it shows a numbered list.\n6. The client sends the quantity.\n7. The bot shows a summary and allows adding more products.\n8. Once confirmed, Nitro creates a formal quotation inside the system and attaches the PDF on WhatsApp.\n\nThis approach is more controlled and keeps the door open to add AI later without rebuilding the module.',
        zh: '当前流程是分步骤进行的，并不是自由对话式 AI：\n\n1. 客户通过 WhatsApp 请求报价。\n2. 如果系统里还没有这个手机号，机器人会先询问客户姓名和邮箱。\n3. 在后续对话中，机器人会根据手机号识别客户并再次欢迎对方。\n4. 机器人会按名称、代码或 SKU 搜索产品。\n5. 如果有多个匹配项，会显示编号列表。\n6. 客户回复所需数量。\n7. 机器人会展示汇总，并允许继续添加产品。\n8. 确认后，Nitro 会在系统内创建正式报价单，并通过 WhatsApp 附上 PDF。\n\n这种方式更可控，也为以后接入 AI 留好了空间，而不需要重做整个模块。',
      },
    },
  ],
};
