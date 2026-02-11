import Dexie, { Table } from 'dexie';
import { Provider } from '@/types/provider';

export interface PendingOperation {
    id?: number;
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: 'provider';
    entityId?: string;
    data: any;
    timestamp: number;
    retries: number;
    error?: string;
}

export interface SyncMetadata {
    key: string;
    lastSync: number;
    status: 'idle' | 'syncing' | 'error';
}

export class NitroDB extends Dexie {
    providers!: Table<Provider, string>;
    pendingOperations!: Table<PendingOperation, number>;
    syncMetadata!: Table<SyncMetadata, string>;

    constructor() {
        super('NitroDB');

        this.version(1).stores({
            providers: 'id, code, name, email, status, created_at',
            pendingOperations: '++id, type, entity, entityId, timestamp',
            syncMetadata: 'key'
        });
    }
}

export const db = new NitroDB();
