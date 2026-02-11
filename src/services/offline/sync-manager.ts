import { db, PendingOperation } from '@/lib/db';
import { providersService } from '@/services/providers.service';
import { toastService } from '@/services/toast.service';

class SyncManager {
    private isSyncing = false;
    private syncListeners: Array<(status: 'idle' | 'syncing' | 'error') => void> = [];

    async processPendingOperations(): Promise<void> {
        if (this.isSyncing) {
            console.log('Sync already in progress');
            return;
        }

        if (!navigator.onLine) {
            console.log('Cannot sync: offline');
            return;
        }

        this.isSyncing = true;
        this.notifyListeners('syncing');

        try {
            const operations = await db.pendingOperations
                .orderBy('timestamp')
                .toArray();

            console.log(`Processing ${operations.length} pending operations`);

            for (const operation of operations) {
                try {
                    await this.processOperation(operation);
                    await db.pendingOperations.delete(operation.id!);
                    console.log(`✅ Processed operation ${operation.id}`);
                } catch (error) {
                    console.error(`❌ Failed to process operation ${operation.id}:`, error);

                    // Increment retry count
                    await db.pendingOperations.update(operation.id!, {
                        retries: operation.retries + 1,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });

                    // If too many retries, show error
                    if (operation.retries >= 3) {
                        toastService.error(`Failed to sync ${operation.type} operation after 3 attempts`);
                    }
                }
            }

            // Update sync metadata
            await db.syncMetadata.put({
                key: 'providers',
                lastSync: Date.now(),
                status: 'idle'
            });

            this.notifyListeners('idle');

            const remaining = await db.pendingOperations.count();
            if (remaining === 0) {
                toastService.success('All changes synchronized');
            }
        } catch (error) {
            console.error('Sync error:', error);
            this.notifyListeners('error');

            await db.syncMetadata.put({
                key: 'providers',
                lastSync: Date.now(),
                status: 'error'
            });
        } finally {
            this.isSyncing = false;
        }
    }

    private async processOperation(operation: PendingOperation): Promise<void> {
        switch (operation.entity) {
            case 'provider':
                return this.processProviderOperation(operation);
            default:
                throw new Error(`Unknown entity type: ${operation.entity}`);
        }
    }

    private async processProviderOperation(operation: PendingOperation): Promise<void> {
        switch (operation.type) {
            case 'CREATE':
                const created = await providersService.createProvider(operation.data);
                // Update local DB with server-generated ID
                await db.providers.put(created);
                break;

            case 'UPDATE':
                if (!operation.entityId) {
                    throw new Error('Missing entityId for UPDATE operation');
                }
                const updated = await providersService.updateProvider(operation.entityId, operation.data);
                await db.providers.put(updated);
                break;

            case 'DELETE':
                if (!operation.entityId) {
                    throw new Error('Missing entityId for DELETE operation');
                }
                await providersService.deleteProvider(operation.entityId);
                await db.providers.delete(operation.entityId);
                break;

            default:
                throw new Error(`Unknown operation type: ${operation.type}`);
        }
    }

    async getPendingCount(): Promise<number> {
        return await db.pendingOperations.count();
    }

    onSyncStatusChange(listener: (status: 'idle' | 'syncing' | 'error') => void): () => void {
        this.syncListeners.push(listener);
        return () => {
            this.syncListeners = this.syncListeners.filter(l => l !== listener);
        };
    }

    private notifyListeners(status: 'idle' | 'syncing' | 'error'): void {
        this.syncListeners.forEach(listener => listener(status));
    }
}

export const syncManager = new SyncManager();
