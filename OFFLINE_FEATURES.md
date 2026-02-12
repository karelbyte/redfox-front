# 📴 Funcionalidades Offline - Guía Completa

## 🎯 Descripción General

La aplicación Redfox cuenta con capacidades completas de trabajo offline para el módulo de proveedores. Los usuarios pueden crear, editar y eliminar proveedores sin conexión a internet, y todos los cambios se sincronizarán automáticamente cuando la conexión se restablezca.

## ✨ Características Principales

### 1. CRUD Completo Offline
- ✅ Crear proveedores sin conexión
- ✅ Editar proveedores existentes
- ✅ Eliminar proveedores
- ✅ Búsqueda y filtrado local
- ✅ Paginación offline

### 2. Sincronización Inteligente
- ✅ Sincronización automática al volver online
- ✅ Sincronización manual bajo demanda
- ✅ Cola de operaciones con reintentos automáticos
- ✅ Manejo de IDs temporales
- ✅ Detección de conflictos

### 3. Feedback Visual
- ✅ Indicador de estado online/offline
- ✅ Barra de sincronización en progreso
- ✅ Contador de operaciones pendientes
- ✅ Badge en proveedores pendientes de sincronizar
- ✅ Panel de operaciones fallidas

### 4. Gestión de Caché
- ✅ Precarga automática de datos
- ✅ Limpieza automática de datos antiguos
- ✅ Estadísticas de caché
- ✅ Panel de debugging

## 🚀 Cómo Funciona

### Flujo Normal (Online)
```
Usuario → Acción → API → Base de Datos → IndexedDB (caché)
```

### Flujo Offline
```
Usuario → Acción → IndexedDB (local) → Cola de Operaciones
```

### Flujo de Sincronización
```
Volver Online → Procesar Cola → API → Actualizar IndexedDB
```

## 📱 Guía de Usuario

### Trabajar Offline

1. **Perder Conexión**
   - Verás una barra roja en la parte superior: "Sin conexión"
   - Puedes seguir trabajando normalmente

2. **Crear Proveedor Offline**
   - Haz clic en "Nuevo Proveedor"
   - Completa el formulario
   - Guarda normalmente
   - El proveedor tendrá un badge amarillo "Pendiente de sincronizar"

3. **Editar/Eliminar Offline**
   - Funciona igual que online
   - Los cambios se guardan localmente

4. **Volver Online**
   - La barra cambia a azul: "Sincronizando cambios..."
   - Muestra el contador de operaciones pendientes
   - Al terminar, la barra se vuelve verde: "Conexión restaurada"

### Sincronización Manual

Si quieres forzar la sincronización:
1. Haz clic en el botón "Sincronizar ahora" en la barra superior
2. O espera a que se sincronice automáticamente

### Operaciones Fallidas

Si una operación falla después de 3 reintentos:
1. Aparecerá un botón flotante rojo en la esquina inferior derecha
2. Haz clic para ver el panel de operaciones fallidas
3. Puedes:
   - Reintentar la operación
   - Descartar la operación
   - Reintentar todas
   - Descartar todas

## 🛠️ Guía para Desarrolladores

### Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    Componentes UI                        │
│  (ProviderTable, OfflineIndicator, FailedOperationsPanel)│
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                      Hooks                               │
│  (useOffline, useCacheManager, useOfflineInit)          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    Servicios                             │
│  (providersService, syncManager, cacheManager)          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   IndexedDB (Dexie)                      │
│  (providers, pendingOperations, syncMetadata)           │
└─────────────────────────────────────────────────────────┘
```

### Estructura de Datos

#### Provider
```typescript
interface Provider {
  id: string;              // "temp_1234567890" para offline
  code: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
```

#### PendingOperation
```typescript
interface PendingOperation {
  id?: number;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'provider';
  entityId?: string;       // ID temporal para CREATE
  data: any;
  timestamp: number;
  retries: number;
  error?: string;
}
```

### APIs Principales

#### providersService
```typescript
// Todas las operaciones funcionan offline
await providersService.getProviders(page, term, isActive);
await providersService.getProvider(id);
await providersService.createProvider(data);
await providersService.updateProvider(id, data);
await providersService.deleteProvider(id);
```

#### syncManager
```typescript
// Procesar operaciones pendientes
await syncManager.processPendingOperations();

// Obtener contador de pendientes
const count = await syncManager.getPendingCount();

// Escuchar cambios de estado
const unsubscribe = syncManager.onSyncStatusChange((status) => {
  console.log('Sync status:', status);
});
```

#### cacheManager
```typescript
// Precargar datos
await cacheManager.preloadProviders();

// Limpiar datos antiguos
await cacheManager.cleanOldData();

// Obtener estadísticas
const stats = await cacheManager.getCacheStats();

// Verificar salud
const health = await cacheManager.checkCacheHealth();

// Limpiar todo (¡cuidado!)
await cacheManager.clearAllCache();
```

### Hooks

#### useOffline
```typescript
const {
  isOnline,           // boolean
  isOffline,          // boolean
  wasOffline,         // boolean
  isSyncing,          // boolean
  pendingCount,       // number
  manualSync,         // () => Promise<void>
  queueOfflineAction  // (action) => Promise<void>
} = useOffline();
```

#### useCacheManager
```typescript
const {
  stats,              // { providersCount, pendingOperationsCount, lastSync, cacheSize }
  health,             // { isHealthy, issues }
  isLoading,          // boolean
  preloadData,        // () => Promise<void>
  cleanOldData,       // () => Promise<void>
  clearCache,         // () => Promise<void>
  refreshStats,       // () => Promise<void>
  checkHealth         // () => Promise<void>
} = useCacheManager();
```

### Componentes

#### OfflineIndicator
Muestra el estado de conexión y sincronización en la parte superior de la pantalla.

```tsx
import OfflineIndicator from '@/components/OfflineIndicator';

// Ya está incluido en el layout del dashboard
```

#### FailedOperationsPanel
Panel flotante que aparece cuando hay operaciones fallidas.

```tsx
import FailedOperationsPanel from '@/components/Offline/FailedOperationsPanel';

// Ya está incluido en el layout del dashboard
```

#### CacheDebugPanel
Panel de debugging para desarrollo (no incluido por defecto).

```tsx
import CacheDebugPanel from '@/components/Offline/CacheDebugPanel';

// Agregar manualmente donde necesites
<CacheDebugPanel />
```

## 🧪 Testing

### Pruebas Manuales

#### Test 1: Crear Offline
1. DevTools → Network → Offline
2. Crear nuevo proveedor
3. Verificar badge "Pendiente de sincronizar"
4. Volver Online
5. Verificar sincronización exitosa

#### Test 2: Editar Offline
1. DevTools → Network → Offline
2. Editar proveedor existente
3. Volver Online
4. Verificar cambios sincronizados

#### Test 3: Eliminar Offline
1. DevTools → Network → Offline
2. Eliminar proveedor
3. Volver Online
4. Verificar eliminación sincronizada

#### Test 4: Operaciones Fallidas
1. DevTools → Network → Offline
2. Crear proveedor con datos inválidos
3. Volver Online
4. Verificar panel de operaciones fallidas
5. Reintentar o descartar

#### Test 5: Conflictos
1. Abrir dos pestañas
2. Poner una offline
3. Editar mismo proveedor en ambas
4. Volver online la pestaña offline
5. Verificar resolución de conflicto

### Pruebas Automatizadas

```typescript
// TODO: Agregar tests con Jest
describe('Offline Functionality', () => {
  it('should create provider offline', async () => {
    // Mock navigator.onLine = false
    // Create provider
    // Verify in IndexedDB
    // Verify in pendingOperations
  });

  it('should sync when back online', async () => {
    // Create operation offline
    // Mock navigator.onLine = true
    // Trigger sync
    // Verify operation processed
  });
});
```

## 🔧 Configuración

### Ajustar Tiempos

**Limpieza de datos antiguos:**
```typescript
// src/services/offline/cache-manager.ts
const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000); // Cambiar 30
```

**Reintentos:**
```typescript
// src/services/offline/sync-manager.ts
if (operation.retries >= 3) { // Cambiar 3
```

**Frecuencia de limpieza:**
```typescript
// src/hooks/useOfflineInit.ts
}, 24 * 60 * 60 * 1000); // Cambiar 24 horas
```

### Estrategia de Conflictos

Actualmente usa "last-write-wins". Para cambiar:

```typescript
// src/services/offline/sync-manager.ts
// En processProviderOperation, caso UPDATE

// Opción 1: Server wins
if (serverTime > localTime) {
  console.warn('Server version is newer, skipping update');
  return;
}

// Opción 2: Client wins (actual)
// Procede con la actualización

// Opción 3: Manual resolution
// Mostrar UI para que el usuario decida
```

## 📊 Monitoreo

### Logs en Consola

```
🔄 Initializing offline capabilities...
✅ Preloaded 150 providers
🧹 Cleaned 5 old deleted providers
📴 Offline mode: reading providers from IndexedDB
📴 Provider queued for creation when online
🔄 Back online, starting sync...
✅ Processed operation 1
⚠️ Conflict detected: server has newer version
❌ Failed to process operation 2: Network error
```

### Estadísticas de Caché

Usa `CacheDebugPanel` o:

```typescript
const stats = await cacheManager.getCacheStats();
console.log('Cache stats:', stats);
// {
//   providersCount: 150,
//   pendingOperationsCount: 3,
//   lastSync: 1234567890,
//   cacheSize: "245.67 KB"
// }
```

### Salud de Caché

```typescript
const health = await cacheManager.checkCacheHealth();
console.log('Cache health:', health);
// {
//   isHealthy: false,
//   issues: [
//     "3 operations failed after 3 retries",
//     "2 temporary providers older than 7 days"
//   ]
// }
```

## 🐛 Troubleshooting

### Problema: Operaciones no se sincronizan

**Solución:**
1. Verificar que estás online
2. Abrir consola y buscar errores
3. Verificar panel de operaciones fallidas
4. Intentar sincronización manual

### Problema: Datos desactualizados

**Solución:**
1. Limpiar caché: `cacheManager.clearAllCache()`
2. Recargar página
3. Los datos se precargarán automáticamente

### Problema: Caché muy grande

**Solución:**
1. Ejecutar limpieza: `cacheManager.cleanOldData()`
2. Ajustar tiempos de limpieza en configuración
3. Considerar limpieza manual periódica

### Problema: Conflictos frecuentes

**Solución:**
1. Revisar estrategia de resolución de conflictos
2. Considerar implementar resolución manual
3. Educar a usuarios sobre trabajo colaborativo

## 📚 Referencias

- [Dexie.js Documentation](https://dexie.org/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)

## 🎉 Conclusión

La funcionalidad offline está completamente implementada y lista para producción. Los usuarios pueden trabajar sin interrupciones incluso sin conexión a internet, y todos los cambios se sincronizarán automáticamente cuando la conexión se restablezca.

Para cualquier duda o mejora, consulta este documento o revisa el código fuente en los archivos mencionados.
