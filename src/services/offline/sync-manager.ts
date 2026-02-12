import { db, PendingOperation } from '@/lib/db';
import { providersService } from '@/services/providers.service';
import { clientsService } from '@/services/clients.service';
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
            case 'client':
                return this.processClientOperation(operation);
            default:
                throw new Error(`Unknown entity type: ${operation.entity}`);
        }
    }

    private async processProviderOperation(operation: PendingOperation): Promise<void> {
        switch (operation.type) {
            case 'CREATE':
                const created = await providersService.createProvider(operation.data);
                
                // If there was a temporary ID, we need to replace it with the real one
                if (operation.entityId && operation.entityId.startsWith('temp_')) {
                    await db.providers.delete(operation.entityId);
                }
                
                // Update local DB with server-generated ID
                await db.providers.put(created);
                break;

            case 'UPDATE':
                if (!operation.entityId) {
                    throw new Error('Missing entityId for UPDATE operation');
                }
                
                // Skip if it's a temporary ID that hasn't been created yet
                if (operation.entityId.startsWith('temp_')) {
                    console.log('Skipping update for temporary entity:', operation.entityId);
                    return;
                }
                
                // Check for conflicts before updating
                try {
                    const serverVersion = await providersService.getProvider(operation.entityId);
                    const localVersion = await db.providers.get(operation.entityId);
                    
                    // Simple conflict detection: compare updated_at timestamps
                    if (localVersion && serverVersion) {
                        const serverTime = new Date(serverVersion.updated_at).getTime();
                        const localTime = new Date(localVersion.updated_at).getTime();
                        
                        // If server version is newer, warn about potential conflict
                        if (serverTime > localTime) {
                            console.warn('⚠️ Conflict detected: server has newer version', {
                                entityId: operation.entityId,
                                serverTime,
                                localTime
                            });
                            // Strategy: Last-write-wins (proceed with update)
                            // TODO: Implement more sophisticated conflict resolution
                        }
                    }
                } catch (error) {
                    console.warn('Could not check for conflicts:', error);
                    // Proceed with update anyway
                }
                
                const updated = await providersService.updateProvider(operation.entityId, operation.data);
                await db.providers.put(updated);
                break;

            case 'DELETE':
                if (!operation.entityId) {
                    throw new Error('Missing entityId for DELETE operation');
                }
                
                // Skip if it's a temporary ID
                if (operation.entityId.startsWith('temp_')) {
                    console.log('Skipping delete for temporary entity:', operation.entityId);
                    return;
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

    private async processClientOperation(operation: PendingOperation): Promise<void> {
        switch (operation.type) {
            case 'CREATE':
                const result = await clientsService.createClient(operation.data);
                
                // If there was a temporary ID, we need to replace it with the real one
                if (operation.entityId && operation.entityId.startsWith('temp_')) {
                    await db.clients.delete(operation.entityId);
                }
                
                // Update local DB with server-generated ID
                await db.clients.put(result.client);
                break;

            case 'UPDATE':
                if (!operation.entityId) {
                    throw new Error('Missing entityId for UPDATE operation');
                }
                
                // Skip if it's a temporary ID that hasn't been created yet
                if (operation.entityId.startsWith('temp_')) {
                    console.log('Skipping update for temporary entity:', operation.entityId);
                    return;
                }
                
                // Check for conflicts before updating
                try {
                    const serverVersion = await clientsService.getClient(operation.entityId);
                    const localVersion = await db.clients.get(operation.entityId);
                    
                    // Simple conflict detection: compare updated_at timestamps
                    if (localVersion && serverVersion) {
                        const serverTime = new Date(serverVersion.updated_at).getTime();
                        const localTime = new Date(localVersion.updated_at).getTime();
                        
                        // If server version is newer, warn about potential conflict
                        if (serverTime > localTime) {
                            console.warn('⚠️ Conflict detected: server has newer version', {
                                entityId: operation.entityId,
                                serverTime,
                                localTime
                            });
                            // Strategy: Last-write-wins (proceed with update)
                        }
                    }
                } catch (error) {
                    console.warn('Could not check for conflicts:', error);
                    // Proceed with update anyway
                }
                
                const updateResult = await clientsService.updateClient(operation.entityId, operation.data);
                await db.clients.put(updateResult.client);
                break;

            case 'DELETE':
                if (!operation.entityId) {
                    throw new Error('Missing entityId for DELETE operation');
                }
                
                // Skip if it's a temporary ID
                if (operation.entityId.startsWith('temp_')) {
                    console.log('Skipping delete for temporary entity:', operation.entityId);
                    return;
                }
                
                await clientsService.deleteClient(operation.entityId);
                await db.clients.delete(operation.entityId);
                break;

            default:
                throw new Error(`Unknown operation type: ${operation.type}`);
        }
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
