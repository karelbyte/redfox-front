export interface BackupConfig {
    id: string;
    isAutoEnabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    scheduledTime: string;
    retentionCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface BackupLog {
    id: string;
    filename: string;
    fileSize: string;
    status: boolean;
    errorMessage: string | null;
    triggerType: 'manual' | 'automatic';
    createdAt: string;
}
