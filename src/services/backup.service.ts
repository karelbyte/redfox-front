import { api } from './api';
import { BackupConfig, BackupLog } from '@/types/backup';

class BackupService {
    async getConfig(): Promise<BackupConfig> {
        return await api.get<BackupConfig>('/backups/config');
    }

    async updateConfig(data: Partial<BackupConfig>): Promise<BackupConfig> {
        return await api.put<BackupConfig>('/backups/config', data);
    }

    async runBackup(): Promise<BackupLog> {
        return await api.post<BackupLog>('/backups/run', {});
    }

    async getLogs(): Promise<BackupLog[]> {
        return await api.get<BackupLog[]>('/backups/logs');
    }

    getDownloadUrl(filename: string): string {
        // This assumes the API base URL is available. We can construct it or use api.defaults.baseURL
        const baseUrl = (api as any).defaults?.baseURL || process.env.NEXT_PUBLIC_API_URL;
        return `${baseUrl}/backups/download/${filename}`;
    }
}

export const backupService = new BackupService();
