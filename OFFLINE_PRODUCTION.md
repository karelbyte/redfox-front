# 🚀 Offline Features - Guía de Producción

## ✅ Checklist Pre-Deployment

### 1. Verificaciones Técnicas

- [ ] Service Worker registrado correctamente
- [ ] IndexedDB funcionando en todos los navegadores objetivo
- [ ] Traducciones completas (es, en)
- [ ] Logs de consola apropiados para producción
- [ ] Manejo de errores robusto
- [ ] Tests manuales completados

### 2. Configuración de Producción

#### Service Worker
```javascript
// public/sw.js
const CACHE_NAME = 'nitro-v1'; // Actualizar versión en cada deploy
```

#### Timeouts y Límites
```typescript
// Verificar configuración en:
// - src/services/offline/cache-manager.ts (30 días, 90 días)
// - src/services/offline/sync-manager.ts (3 reintentos)
// - src/hooks/useOfflineInit.ts (24 horas)
```

### 3. Monitoreo

- [ ] Configurar logging de errores (Sentry, LogRocket, etc.)
- [ ] Métricas de uso offline
- [ ] Alertas para operaciones fallidas frecuentes
- [ ] Dashboard de salud de caché

## 🔒 Consideraciones de Seguridad

### 1. Datos Sensibles

**⚠️ IMPORTANTE:** IndexedDB no está encriptado por defecto.

```typescript
// NO almacenar en IndexedDB:
// - Contraseñas
// - Tokens de autenticación (usar sessionStorage/localStorage)
// - Información de tarjetas de crédito
// - Datos médicos sensibles

// SÍ almacenar:
// - Datos de proveedores (públicos dentro de la empresa)
// - Operaciones pendientes (sin datos sensibles)
// - Caché de búsquedas
```

### 2. Validación

```typescript
// Siempre validar datos antes de sincronizar
const validateProvider = (data: any) => {
  // Validar formato
  // Sanitizar inputs
  // Verificar permisos
  return isValid;
};
```

### 3. Límites de Almacenamiento

```typescript
// Monitorear uso de cuota
if ('storage' in navigator && 'estimate' in navigator.storage) {
  const estimate = await navigator.storage.estimate();
  const percentUsed = (estimate.usage! / estimate.quota!) * 100;
  
  if (percentUsed > 80) {
    console.warn('Storage quota almost full:', percentUsed);
    // Limpiar caché automáticamente
    await cacheManager.cleanOldData();
  }
}
```

## 📊 Métricas Recomendadas

### 1. Métricas de Uso

```typescript
// Trackear con analytics
analytics.track('offline_operation_created', {
  entity: 'provider',
  type: 'CREATE',
  timestamp: Date.now()
});

analytics.track('offline_sync_completed', {
  operationsCount: 5,
  duration: 2500, // ms
  success: true
});

analytics.track('offline_operation_failed', {
  entity: 'provider',
  type: 'UPDATE',
  error: 'Network timeout',
  retries: 3
});
```

### 2. Métricas de Rendimiento

```typescript
// Medir tiempos de sincronización
const startTime = performance.now();
await syncManager.processPendingOperations();
const duration = performance.now() - startTime;

analytics.track('sync_performance', {
  duration,
  operationsCount: pendingCount
});
```

### 3. Métricas de Caché

```typescript
// Reportar estadísticas periódicamente
setInterval(async () => {
  const stats = await cacheManager.getCacheStats();
  const health = await cacheManager.checkCacheHealth();
  
  analytics.track('cache_stats', {
    ...stats,
    isHealthy: health.isHealthy,
    issuesCount: health.issues.length
  });
}, 60 * 60 * 1000); // Cada hora
```

## 🐛 Debugging en Producción

### 1. Logs Estructurados

```typescript
// Usar niveles de log apropiados
const logger = {
  debug: (msg: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${msg}`, data);
    }
  },
  info: (msg: string, data?: any) => {
    console.log(`[INFO] ${msg}`, data);
  },
  warn: (msg: string, data?: any) => {
    console.warn(`[WARN] ${msg}`, data);
    // Enviar a servicio de logging
  },
  error: (msg: string, error?: any) => {
    console.error(`[ERROR] ${msg}`, error);
    // Enviar a Sentry/LogRocket
  }
};
```

### 2. Feature Flags

```typescript
// Permitir deshabilitar offline en producción si hay problemas
const OFFLINE_ENABLED = process.env.NEXT_PUBLIC_OFFLINE_ENABLED !== 'false';

if (!OFFLINE_ENABLED) {
  console.warn('Offline features disabled by feature flag');
  return;
}
```

### 3. Modo Debug

```typescript
// Agregar parámetro URL para debugging
const isDebugMode = new URLSearchParams(window.location.search).get('debug') === 'offline';

if (isDebugMode) {
  // Mostrar CacheDebugPanel
  // Logs más verbosos
  // Estadísticas en tiempo real
}
```

## 🔄 Estrategia de Actualización

### 1. Versionado de Service Worker

```javascript
// public/sw.js
const VERSION = '1.0.0';
const CACHE_NAME = `nitro-v${VERSION}`;

// En cada deploy, incrementar versión
// El SW se actualizará automáticamente
```

### 2. Migración de Datos

```typescript
// src/lib/db.ts
export class NitroDB extends Dexie {
  constructor() {
    super('NitroDB');

    // Versión 1
    this.version(1).stores({
      providers: 'id, code, name, email, status, created_at',
      pendingOperations: '++id, type, entity, entityId, timestamp',
      syncMetadata: 'key'
    });

    // Versión 2 (ejemplo de migración)
    this.version(2).stores({
      providers: 'id, code, name, email, status, created_at, company_id', // Nuevo campo
      pendingOperations: '++id, type, entity, entityId, timestamp',
      syncMetadata: 'key'
    }).upgrade(tx => {
      // Migrar datos existentes
      return tx.table('providers').toCollection().modify(provider => {
        provider.company_id = 'default';
      });
    });
  }
}
```

### 3. Limpieza de Caché Antigua

```typescript
// Limpiar cachés de versiones anteriores
const cleanOldCaches = async () => {
  const cacheNames = await caches.keys();
  const currentCache = 'nitro-v1';
  
  await Promise.all(
    cacheNames
      .filter(name => name !== currentCache)
      .map(name => caches.delete(name))
  );
};
```

## 🌐 Compatibilidad de Navegadores

### Navegadores Soportados

| Navegador | Versión Mínima | IndexedDB | Service Worker |
|-----------|----------------|-----------|----------------|
| Chrome    | 67+            | ✅        | ✅             |
| Firefox   | 62+            | ✅        | ✅             |
| Safari    | 11.1+          | ✅        | ✅             |
| Edge      | 79+            | ✅        | ✅             |
| Opera     | 54+            | ✅        | ✅             |

### Detección de Soporte

```typescript
const checkOfflineSupport = () => {
  const hasIndexedDB = 'indexedDB' in window;
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasOnlineDetection = 'onLine' in navigator;
  
  if (!hasIndexedDB || !hasServiceWorker) {
    console.warn('Offline features not supported in this browser');
    // Mostrar mensaje al usuario
    // Deshabilitar funcionalidad offline
    return false;
  }
  
  return true;
};
```

## 📱 Consideraciones Móviles

### 1. Límites de Almacenamiento

```typescript
// Móviles tienen límites más estrictos
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
  // Reducir cantidad de datos precargados
  // Limpiar caché más frecuentemente
  // Advertir al usuario sobre uso de espacio
}
```

### 2. Conexión Intermitente

```typescript
// Detectar conexión lenta
const connection = (navigator as any).connection;
if (connection) {
  const effectiveType = connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
  
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    // Reducir frecuencia de sincronización
    // Comprimir datos
    // Mostrar advertencia
  }
}
```

### 3. Ahorro de Batería

```typescript
// Respetar modo de ahorro de batería
if ('getBattery' in navigator) {
  const battery = await (navigator as any).getBattery();
  
  if (battery.level < 0.2 && !battery.charging) {
    // Reducir sincronizaciones automáticas
    // Solo sincronizar manualmente
    console.log('Low battery: reducing background sync');
  }
}
```

## 🔐 GDPR y Privacidad

### 1. Consentimiento

```typescript
// Solicitar consentimiento para almacenamiento local
const hasConsent = localStorage.getItem('offline_consent') === 'true';

if (!hasConsent) {
  // Mostrar modal de consentimiento
  // Explicar qué datos se almacenan
  // Permitir rechazar (deshabilitar offline)
}
```

### 2. Derecho al Olvido

```typescript
// Permitir al usuario borrar todos sus datos locales
const deleteAllUserData = async () => {
  await cacheManager.clearAllCache();
  await caches.delete('nitro-v1');
  localStorage.clear();
  sessionStorage.clear();
  
  console.log('All user data deleted');
};
```

### 3. Exportación de Datos

```typescript
// Permitir exportar datos almacenados localmente
const exportUserData = async () => {
  const providers = await db.providers.toArray();
  const operations = await db.pendingOperations.toArray();
  
  const data = {
    providers,
    operations,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'offline-data.json';
  a.click();
};
```

## 🚨 Plan de Contingencia

### Escenario 1: Bug Crítico en Offline

```typescript
// Feature flag para deshabilitar rápidamente
// 1. Actualizar variable de entorno
NEXT_PUBLIC_OFFLINE_ENABLED=false

// 2. Desplegar
// 3. Los usuarios seguirán trabajando solo online
```

### Escenario 2: Corrupción de Datos

```typescript
// Herramienta de recuperación
const recoverFromCorruption = async () => {
  try {
    // Intentar leer datos
    await db.providers.toArray();
  } catch (error) {
    console.error('Database corrupted, resetting...');
    
    // Borrar base de datos corrupta
    await db.delete();
    
    // Recrear
    const newDb = new NitroDB();
    
    // Recargar datos del servidor
    if (navigator.onLine) {
      await cacheManager.preloadProviders();
    }
  }
};
```

### Escenario 3: Sincronización Masiva Fallida

```typescript
// Si muchas operaciones fallan simultáneamente
const handleMassiveFailure = async () => {
  const failedOps = await db.pendingOperations
    .where('retries')
    .aboveOrEqual(3)
    .toArray();
  
  if (failedOps.length > 50) {
    // Alertar al equipo
    console.error('Massive sync failure detected:', failedOps.length);
    
    // Pausar sincronización automática
    // Notificar al usuario
    // Permitir revisión manual
  }
};
```

## 📈 Optimizaciones de Rendimiento

### 1. Lazy Loading

```typescript
// Cargar componentes offline solo cuando se necesiten
const CacheDebugPanel = lazy(() => import('@/components/Offline/CacheDebugPanel'));
```

### 2. Debouncing

```typescript
// Evitar sincronizaciones muy frecuentes
const debouncedSync = debounce(async () => {
  await syncManager.processPendingOperations();
}, 5000); // 5 segundos
```

### 3. Batch Operations

```typescript
// Agrupar operaciones similares
const batchOperations = async (operations: PendingOperation[]) => {
  const creates = operations.filter(op => op.type === 'CREATE');
  const updates = operations.filter(op => op.type === 'UPDATE');
  const deletes = operations.filter(op => op.type === 'DELETE');
  
  // Procesar en lotes
  await Promise.all([
    processBatch(creates),
    processBatch(updates),
    processBatch(deletes)
  ]);
};
```

## ✅ Checklist Final

Antes de ir a producción:

- [ ] Tests manuales completados
- [ ] Logs de producción configurados
- [ ] Métricas implementadas
- [ ] Feature flags configurados
- [ ] Documentación actualizada
- [ ] Equipo capacitado
- [ ] Plan de rollback listo
- [ ] Monitoreo configurado
- [ ] Alertas configuradas
- [ ] Backup de datos críticos

## 📞 Soporte

En caso de problemas en producción:

1. Verificar logs en consola del navegador
2. Revisar panel de operaciones fallidas
3. Verificar estadísticas de caché
4. Consultar métricas de analytics
5. Revisar este documento
6. Contactar al equipo de desarrollo

---

**Última actualización:** 2024
**Versión:** 1.0.0
**Mantenedor:** Equipo Redfox
