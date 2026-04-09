export type BotProvider = 'baileys' | 'whatsapp_cloud';
export type BotConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'qr_ready'
  | 'connected'
  | 'error';
export type BotTone = 'professional' | 'friendly' | 'direct';

export interface CloudProviderConfig {
  appId?: string | null;
  businessAccountId?: string | null;
  phoneNumberId?: string | null;
  accessToken?: string | null;
  verifyToken?: string | null;
}

export interface BotConnectionMeta {
  phoneNumber?: string | null;
  jid?: string | null;
  displayName?: string | null;
  providerLabel?: string | null;
}

export interface BotSettings {
  id: string;
  provider: BotProvider;
  connectionStatus: BotConnectionStatus;
  isEnabled: boolean;
  autoReplyEnabled: boolean;
  quotationModeEnabled: boolean;
  assistantName: string | null;
  defaultLanguage: string;
  tone: BotTone;
  welcomeMessage: string | null;
  handoffMessage: string | null;
  quotationPrompt: string | null;
  cloudConfig: CloudProviderConfig | null;
  connectionMeta: BotConnectionMeta | null;
  qrCode: string | null;
  qrExpiresAt: string | null;
  lastConnectedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBotSettingsData {
  isEnabled?: boolean;
  autoReplyEnabled?: boolean;
  quotationModeEnabled?: boolean;
  assistantName?: string;
  defaultLanguage?: string;
  tone?: BotTone;
  welcomeMessage?: string;
  handoffMessage?: string;
  quotationPrompt?: string;
  cloudConfig?: CloudProviderConfig;
}
