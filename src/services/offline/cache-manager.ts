import { db } from '@/lib/db';
import { providersService } from '@/services/providers.service';
import { clientsService } from '@/services/clients.service';

class CacheManager {
    /**
     * Precarga todos los proveedores cuando hay conexión
     * Útil para preparar la aplicación para trabajo offline
     */
    async preloadProviders(): Promise<void> {
        if (!navigator.onLine) {
            console.log('Cannot preload: offline');
            return;
        }

        try {
            console.log('🔄 Preloading providers...');
            
            // Obtener todos los proveedores (sin paginación)
            const response = await providersService.getProviders(1, undefined, undefined);
            
            if (response.data && response.data.length > 0) {
                await db.providers.bulkPut(response.data);
                console.log(`✅ Preloaded ${response.data.length} providers`);
            }

            // Actualizar metadata de sincronización
            await db.syncMetadata.put({
                key: 'providers_preload',
                lastSync: Date.now(),
                status: 'idle'
            });
        } catch (error) {
            console.error('Error preloading providers:', error);
        }
    }

    /**
     * Precarga todos los clientes cuando hay conexión
     * Útil para preparar la aplicación para trabajo offline
     */
    async preloadClients(): Promise<void> {
        if (!navigator.onLine) {
            console.log('Cannot preload: offline');
            return;
        }

        try {
            console.log('🔄 Preloading clients...');
            
            // Obtener todos los clientes (sin paginación)
            const response = await clientsService.getClients(1, undefined, undefined);
            
            if (response.data && response.data.length > 0) {
                await db.clients.bulkPut(response.data);
                console.log(`✅ Preloaded ${response.data.length} clients`);
            }

            // Actualizar metadata de sincronización
            await db.syncMetadata.put({
                key: 'clients_preload',
                lastSync: Date.now(),
                status: 'idle'
            });
        } catch (error) {
            console.error('Error preloading clients:', error);
        }
    }

    /**
     * Limpia datos antiguos de la caché
     * Elimina proveedores y clientes marcados como eliminados hace más de 30 días
     */
    async cleanOldData(): Promise<void> {
        try {
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgoDate = new Date(thirtyDaysAgo).toISOString();

            // Limpiar proveedores eliminados hace más de 30 días
            const allProviders = await db.providers.toArray();
            const deletedProviders = allProviders.filter(p => 
                p.deleted_at && 
                p.deleted_at < thirtyDaysAgoDate
            );

            if (deletedProviders.length > 0) {
                await db.providers.bulkDelete(deletedProviders.map(p => p.id));
                console.log(`🧹 Cleaned ${deletedProviders.length} old deleted providers`);
            }

            // Limpiar clientes eliminados hace más de 30 días
            const allClients = await db.clients.toArray();
            const deletedClients = allClients.filter(c => 
                c.deleted_at && 
                c.deleted_at < thirtyDaysAgoDate
            );

            if (deletedClients.length > 0) {
                await db.clients.bulkDelete(deletedClients.map(c => c.id));
                console.log(`🧹 Cleaned ${deletedClients.length} old deleted clients`);
            }

            // Limpiar operaciones pendientes muy antiguas (más de 90 días)
            const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
            const oldOperations = await db.pendingOperations
                .where('timestamp')
                .below(ninetyDaysAgo)
                .toArray();

            if (oldOperations.length > 0) {
                await db.pendingOperations.bulkDelete(oldOperations.map(op => op.id!));
                console.log(`🧹 Cleaned ${oldOperations.length} old pending operations`);
            }
        } catch (error) {
            console.error('Error cleaning old data:', error);
        }
    }

    /**
     * Obtiene estadísticas de la caché
     */
    async getCacheStats(): Promise<{
        providersCount: number;
        clientsCount: number;
        pendingOperationsCount: number;
        lastSync: number | null;
        cacheSize: string;
    }> {
        try {
            const providersCount = await db.providers.count();
            const clientsCount = await db.clients.count();
            const pendingOperationsCount = await db.pendingOperations.count();
            
            const syncMeta = await db.syncMetadata.get('providers_preload');
            const lastSync = syncMeta?.lastSync || null;

            // Estimar tamaño de caché (aproximado)
            const providers = await db.providers.toArray();
            const clients = await db.clients.toArray();
            const operations = await db.pendingOperations.toArray();
            const estimatedSize = JSON.stringify([...providers, ...clients, ...operations]).length;
            const cacheSizeKB = (estimatedSize / 1024).toFixed(2);

            return {
                providersCount,
                clientsCount,
                pendingOperationsCount,
                lastSync,
                cacheSize: `${cacheSizeKB} KB`
            };
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return {
                providersCount: 0,
                clientsCount: 0,
                pendingOperationsCount: 0,
                lastSync: null,
                cacheSize: '0 KB'
            };
        }
    }

    /**
     * Limpia toda la caché (usar con precaución)
     */
    async clearAllCache(): Promise<void> {
        try {
            await db.providers.clear();
            await db.clients.clear();
            await db.pendingOperations.clear();
            await db.syncMetadata.clear();
            console.log('🧹 All cache cleared');
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    /**
     * Verifica la salud de la caché
     */
    async checkCacheHealth(): Promise<{
        isHealthy: boolean;
        issues: string[];
    }> {
        const issues: string[] = [];

        try {
            // Verificar operaciones pendientes con muchos reintentos
            const failedOperations = await db.pendingOperations
                .where('retries')
                .aboveOrEqual(3)
                .toArray();

            if (failedOperations.length > 0) {
                issues.push(`${failedOperations.length} operations failed after 3 retries`);
            }

            // Verificar proveedores con IDs temporales antiguos (más de 7 días)
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const oldTempProviders = await db.providers
                .filter(p => 
                    p.id.startsWith('temp_') && 
                    new Date(p.created_at).getTime() < sevenDaysAgo
                )
                .toArray();

            if (oldTempProviders.length > 0) {
                issues.push(`${oldTempProviders.length} temporary providers older than 7 days`);
            }

            // Verificar clientes con IDs temporales antiguos (más de 7 días)
            const oldTempClients = await db.clients
                .filter(c => 
                    c.id.startsWith('temp_') && 
                    new Date(c.created_at).getTime() < sevenDaysAgo
                )
                .toArray();

            if (oldTempClients.length > 0) {
                issues.push(`${oldTempClients.length} temporary clients older than 7 days`);
            }

            // Verificar última sincronización
            const syncMeta = await db.syncMetadata.get('providers');
            if (syncMeta && syncMeta.status === 'error') {
                issues.push('Last sync failed');
            }

            return {
                isHealthy: issues.length === 0,
                issues
            };
        } catch (error) {
            console.error('Error checking cache health:', error);
            return {
                isHealthy: false,
                issues: ['Error checking cache health']
            };
        }
    }
}

export const cacheManager = new CacheManager();
