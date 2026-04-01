import { api } from './api';

class SupportService {
  async sendMessage(subject: string, message: string): Promise<{ success: boolean }> {
    return api.post<{ success: boolean }>('/support/contact', { subject, message });
  }
}

export const supportService = new SupportService();
