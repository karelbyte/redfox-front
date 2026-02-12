import Dexie, { Table } from 'dexie';
import { Provider } from '@/types/provider';
import { Client } from '@/types/client';

export interface PendingOperation {
    id?: number;
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: 'provider' | 'client';
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
    clients!: Table<Client, string>;
    pendingOperations!: Table<PendingOperation, number>;
    syncMetadata!: Table<SyncMetadata, string>;

    constructor() {
        super('NitroDB');

        // Versión 1 - Inicial
        this.version(1).stores({
            providers: 'id, code, name, email, status, created_at',
            pendingOperations: '++id, type, entity, entityId, timestamp',
            syncMetadata: 'key'
        });

        // Versión 2 - Agregar índice deleted_at para limpieza de caché
        this.version(2).stores({
            providers: 'id, code, name, email, status, created_at, deleted_at',
            pendingOperations: '++id, type, entity, entityId, timestamp, retries',
            syncMetadata: 'key'
        });

        // Versión 3 - Agregar tabla de clientes
        this.version(3).stores({
            providers: 'id, code, name, email, status, created_at, deleted_at',
            clients: 'id, code, name, email, status, created_at, deleted_at',
            pendingOperations: '++id, type, entity, entityId, timestamp, retries',
            syncMetadata: 'key'
        });
    }
}

export const db = new NitroDB();
