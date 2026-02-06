import { api } from './api';

export interface EmailConfig {
  id: string;
  host: string;
  port: number;
  user: string;
  fromEmail: string;
  fromName: string;
  secure: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailConfigDto {
  host: string;
  port: number;
  user: string;
  password: string;
  fromEmail: string;
  fromName?: string;
  secure?: boolean;
}

export interface UpdateEmailConfigDto extends Partial<CreateEmailConfigDto> {}

class EmailConfigService {
  private baseUrl = '/email-config';

  async getConfig(): Promise<EmailConfig> {
    return api.get<EmailConfig>(this.baseUrl);
  }

  async createConfig(data: CreateEmailConfigDto): Promise<EmailConfig> {
    return api.post<EmailConfig>(this.baseUrl, data as unknown as Record<string, unknown>);
  }

  async updateConfig(data: UpdateEmailConfigDto): Promise<EmailConfig> {
    return api.put<EmailConfig>(this.baseUrl, data as unknown as Record<string, unknown>);
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>(`${this.baseUrl}/test`, {} as unknown as Record<string, unknown>);
  }
}

export const emailConfigService = new EmailConfigService();
