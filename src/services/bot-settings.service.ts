import { api } from './api';
import {
  BotProvider,
  BotSettings,
  UpdateBotSettingsData,
} from '@/types/bot-settings';

class BotSettingsService {
  async get(): Promise<BotSettings> {
    return api.get<BotSettings>('/bot-settings');
  }

  async update(data: UpdateBotSettingsData): Promise<BotSettings> {
    return api.put<BotSettings>(
      '/bot-settings',
      data as unknown as Record<string, unknown>,
    );
  }

  async selectProvider(provider: BotProvider): Promise<BotSettings> {
    return api.post<BotSettings>('/bot-settings/provider', { provider });
  }

  async connectBaileys(): Promise<BotSettings> {
    return api.post<BotSettings>('/bot-settings/baileys/connect', {});
  }

  async refreshBaileysQr(): Promise<BotSettings> {
    return api.post<BotSettings>('/bot-settings/baileys/refresh-qr', {});
  }

  async disconnectBaileys(): Promise<BotSettings> {
    return api.post<BotSettings>('/bot-settings/baileys/disconnect', {});
  }
}

export const botSettingsService = new BotSettingsService();
