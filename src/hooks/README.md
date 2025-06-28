# Hook usePermissions

Este hook proporciona funcionalidad para verificar permisos del usuario autenticado en la aplicación.

## Uso Básico

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { can, canAll, getUserPermissions } = usePermissions();

  // Verificar si el usuario tiene al menos uno de los permisos especificados
  const canCreateProduct = can(['product.create', 'product.write']);
  
  // Verificar si el usuario tiene todos los permisos especificados
  const canManageUsers = canAll(['user.read', 'user.write', 'user.delete']);
  
  // Obtener todos los permisos del usuario
  const userPermissions = getUserPermissions();

  return (
    <div>
      {canCreateProduct && <button>Crear Producto</button>}
      {canManageUsers && <button>Gestionar Usuarios</button>}
    </div>
  );
}
```

## Métodos Disponibles

### `can(permissions: string[]): boolean`
Verifica si el usuario tiene al menos uno de los permisos especificados.

**Parámetros:**
- `permissions`: Array de códigos de permisos a verificar

**Retorna:** `true` si el usuario tiene al menos uno de los permisos, `false` en caso contrario.

**Nota especial:** Si el array incluye `"all"`, la función retorna `true` inmediatamente, sin verificar otros permisos.

### `canAll(permissions: string[]): boolean`
Verifica si el usuario tiene todos los permisos especificados.

**Parámetros:**
- `permissions`: Array de códigos de permisos a verificar

**Retorna:** `true` si el usuario tiene todos los permisos, `false` en caso contrario.

**Nota especial:** Si el array incluye `"all"`, la función retorna `true` inmediatamente, sin verificar otros permisos.

### `getUserPermissions(): string[]`
Obtiene todos los permisos del usuario autenticado.

**Retorna:** Array de códigos de permisos del usuario.

## Uso del Parámetro "all"

El parámetro `"all"` es especial y otorga acceso completo cuando está presente en el array de permisos:

```tsx
function AdminComponent() {
  const { can } = usePermissions();
  
  // Esto siempre retornará true si el usuario está autenticado
  const hasFullAccess = can(['all']);
  
  // Esto también retornará true (el "all" tiene prioridad)
  const hasMixedAccess = can(['all', 'specific.permission']);
  
  return (
    <div>
      {hasFullAccess && <button>Acceso Completo</button>}
    </div>
  );
}
```

## Componente PermissionGuard

También puedes usar el componente `PermissionGuard` para renderizado condicional:

```tsx
import { PermissionGuard } from '@/components/PermissionGuard';

function MyComponent() {
  return (
    <div>
      <PermissionGuard permissions={['product.create']}>
        <button>Crear Producto</button>
      </PermissionGuard>
      
      <PermissionGuard 
        permissions={['user.read', 'user.write']} 
        requireAll={true}
        fallback={<p>No tienes permisos para gestionar usuarios</p>}
      >
        <button>Gestionar Usuarios</button>
      </PermissionGuard>
      
      {/* Acceso completo usando "all" */}
      <PermissionGuard permissions={['all']}>
        <button>Acceso Administrativo</button>
      </PermissionGuard>
    </div>
  );
}
```

## Ejemplos de Uso Comunes

### 1. Botones de Acción
```tsx
function ProductActions() {
  const { can } = usePermissions();
  
  return (
    <div>
      {can(['product.create']) && (
        <button onClick={handleCreate}>Crear Producto</button>
      )}
      
      {can(['product.update']) && (
        <button onClick={handleEdit}>Editar</button>
      )}
      
      {can(['product.delete']) && (
        <button onClick={handleDelete}>Eliminar</button>
      )}
      
      {/* Acceso completo para administradores */}
      {can(['all']) && (
        <button onClick={handleAdminAction}>Acción Administrativa</button>
      )}
    </div>
  );
}
```

### 2. Menús de Navegación
```tsx
function NavigationMenu() {
  const { can } = usePermissions();
  
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      
      {can(['product.read']) && (
        <Link href="/products">Productos</Link>
      )}
      
      {can(['user.read']) && (
        <Link href="/users">Usuarios</Link>
      )}
      
      {can(['report.read']) && (
        <Link href="/reports">Reportes</Link>
      )}
      
      {/* Panel de administración completo */}
      {can(['all']) && (
        <Link href="/admin">Panel de Administración</Link>
      )}
    </nav>
  );
}
```

### 3. Formularios Complejos
```tsx
function ProductForm() {
  const { can, canAll } = usePermissions();
  
  return (
    <form>
      <input name="name" placeholder="Nombre del producto" />
      <input name="price" placeholder="Precio" />
      
      {/* Solo mostrar campos sensibles si tiene todos los permisos necesarios */}
      {canAll(['product.write', 'product.pricing']) && (
        <input name="cost" placeholder="Costo" />
      )}
      
      {/* Mostrar botón de guardar si tiene al menos uno de los permisos */}
      {can(['product.create', 'product.update']) && (
        <button type="submit">Guardar</button>
      )}
      
      {/* Acceso completo para administradores */}
      {can(['all']) && (
        <button type="button">Configuración Avanzada</button>
      )}
    </form>
  );
}
```

## Notas Importantes

1. **Autenticación**: El hook verifica automáticamente si el usuario está autenticado. Si no lo está, todos los métodos retornarán `false`.

2. **Permisos Vacíos**: Si se pasa un array vacío de permisos, el método `can` retornará `false`.

3. **Parámetro "all"**: Si el array incluye `"all"`, la función retorna `true` inmediatamente, sin verificar otros permisos.

4. **Rendimiento**: El hook utiliza `Array.some()` y `Array.every()` para verificar permisos de manera eficiente.

5. **Tipado**: El hook está completamente tipado con TypeScript para mejor experiencia de desarrollo. 