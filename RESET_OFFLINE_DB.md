# 🗑️ Resetear Base de Datos Offline

## Opción 1: Desde la Consola del Navegador (Más Rápido)

Abre DevTools (F12) y ejecuta:

```javascript
// Opción A: Usar la función global
resetDB()

// Opción B: Manual
indexedDB.deleteDatabase('NitroDB')
location.reload()
```

## Opción 2: Desde DevTools → Application

1. Abre DevTools (F12)
2. Ve a la pestaña "Application"
3. En el menú izquierdo, busca "Storage" → "IndexedDB"
4. Haz clic derecho en "NitroDB"
5. Selecciona "Delete database"
6. Recarga la página (F5)

## Opción 3: Limpiar Todo el Storage

Si quieres limpiar TODO (caché, localStorage, etc.):

```javascript
// En la consola
indexedDB.deleteDatabase('NitroDB')
localStorage.clear()
sessionStorage.clear()
caches.keys().then(names => names.forEach(name => caches.delete(name)))
location.reload()
```

## Cuándo Resetear

Resetea la base de datos cuando:
- ❌ Ves errores de schema en consola
- ❌ Los datos parecen corruptos
- ❌ Cambias la estructura de la base de datos
- ❌ Quieres empezar de cero en desarrollo

## Nota

En desarrollo, la base de datos se reseteará automáticamente si hay un error de schema. Solo necesitas recargar la página.

## Verificar que se Reseteo

Después de resetear, verifica en consola:

```
✅ Database ready
Current version: 2
```

Si ves `version: 2`, todo está bien.
