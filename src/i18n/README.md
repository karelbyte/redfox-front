# Sistema de Internacionalización (i18n)

Este proyecto utiliza **next-intl** para manejar la internacionalización con soporte para español (es) e inglés (en).

## Estructura del Proyecto

Con i18n habilitado, toda la aplicación está dentro de la estructura `[locale]`:

```
src/app/
├── [locale]/
│   ├── layout.tsx              # Layout principal con providers
│   ├── page.tsx                # Página principal
│   ├── login/
│   │   └── page.tsx            # Página de login
│   ├── theme-demo/
│   │   └── page.tsx            # Demo de temas
│   └── (protected)/
│       ├── layout.tsx          # Layout para rutas protegidas
│       └── dashboard/
│           ├── page.tsx        # Dashboard principal
│           ├── productos/      # Gestión de productos
│           ├── categorías/     # Gestión de categorías
│           ├── marcas/         # Gestión de marcas
│           ├── impuestos/      # Gestión de impuestos
│           ├── monedas/        # Gestión de monedas
│           ├── unidades-medida/ # Gestión de unidades
│           ├── proveedores/    # Gestión de proveedores
│           ├── clientes/       # Gestión de clientes
│           ├── inventarios/    # Gestión de inventarios
│           ├── compras/        # Gestión de compras
│           └── almacenes/      # Gestión de almacenes
└── globals.css                 # Estilos globales
```

## Configuración

### Archivos de Traducción

Los archivos de traducción se encuentran en:
- `src/i18n/locales/es.json` - Traducciones en español
- `src/i18n/locales/en.json` - Traducciones en inglés

### Configuración Principal

- `src/i18n.ts` - Configuración principal de next-intl
- `src/i18n/config.ts` - Configuración de locales
- `middleware.ts` - Middleware para detección de idioma
- `next.config.js` - Configuración de Next.js con next-intl

## URLs con Locale

Todas las URLs ahora incluyen el locale:

- `/es` - Página principal en español
- `/en` - Página principal en inglés
- `/es/login` - Login en español
- `/en/login` - Login en inglés
- `/es/dashboard` - Dashboard en español
- `/en/dashboard` - Dashboard en inglés
- `/es/dashboard/productos` - Productos en español
- `/en/dashboard/products` - Products en inglés

## Uso

### 1. Hook de Traducciones

```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('pages.products');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### 2. Hook de Utilidades de Locale

```tsx
import { useLocaleUtils } from '@/hooks/useLocale';

function MyComponent() {
  const { formatDate, formatCurrency, formatPrice } = useLocaleUtils();
  
  return (
    <div>
      <p>Fecha: {formatDate('2024-01-01')}</p>
      <p>Precio: {formatPrice(1234.56)}</p>
      <p>Moneda: {formatCurrency(1234.56, 'USD')}</p>
    </div>
  );
}
```

### 3. Navegación con Locale

```tsx
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  
  const changeLanguage = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };
  
  return (
    <button onClick={() => changeLanguage('en')}>
      English
    </button>
  );
}
```

### 4. Navegación Interna

Para navegación interna, siempre incluir el locale:

```tsx
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

function MyComponent() {
  const router = useRouter();
  const locale = useLocale();
  
  const goToProducts = () => {
    router.push(`/${locale}/dashboard/productos`);
  };
  
  return (
    <button onClick={goToProducts}>
      Ir a Productos
    </button>
  );
}
```

### 5. Traducciones con Parámetros

```tsx
// En el archivo de traducciones
{
  "messages": {
    "welcome": "Bienvenido, {name}!"
  }
}

// En el componente
const t = useTranslations('messages');
return <p>{t('welcome', { name: 'Juan' })}</p>;
```

### 6. Pluralización

```tsx
// En el archivo de traducciones
{
  "products": {
    "count": "{count} producto{count, plural, one {} other {s}}"
  }
}

// En el componente
const t = useTranslations('products');
return <p>{t('count', { count: 5 })}</p>; // "5 productos"
```

## Agregar Nuevas Traducciones

1. **Agregar la clave en ambos archivos de traducción:**

```json
// es.json
{
  "pages": {
    "newPage": {
      "title": "Nueva Página",
      "description": "Descripción de la nueva página"
    }
  }
}

// en.json
{
  "pages": {
    "newPage": {
      "title": "New Page",
      "description": "Description of the new page"
    }
  }
}
```

2. **Usar en el componente:**

```tsx
const t = useTranslations('pages.newPage');
return (
  <div>
    <h1>{t('title')}</h1>
    <p>{t('description')}</p>
  </div>
);
```

## Formateo de Fechas y Números

El hook `useLocaleUtils` proporciona funciones para formatear:

- **Fechas**: `formatDate(dateString, options?)`
- **Fechas cortas**: `formatDateShort(dateString)`
- **Monedas**: `formatCurrency(amount, currencyCode?)`
- **Números**: `formatNumber(number, options?)`
- **Precios**: `formatPrice(price)`

## Componente LanguageSelector

El componente `LanguageSelector` está disponible para cambiar el idioma:

```tsx
import LanguageSelector from '@/components/LanguageSelector';

function Header() {
  return (
    <header>
      <LanguageSelector />
    </header>
  );
}
```

## Migración de Componentes Existentes

Para migrar un componente existente:

1. **Importar useTranslations:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Obtener la función de traducción:**
```tsx
const t = useTranslations('ruta.a.las.traducciones');
```

3. **Reemplazar textos hardcodeados:**
```tsx
// Antes
<h1>Productos</h1>

// Después
<h1>{t('title')}</h1>
```

4. **Actualizar navegación para incluir locale:**
```tsx
// Antes
router.push('/dashboard');

// Después
router.push(`/${locale}/dashboard`);
```

5. **Actualizar formateo de fechas/números:**
```tsx
// Antes
new Date(date).toLocaleDateString('es-ES')

// Después
formatDate(date)
```

## Consideraciones Importantes

- **Todas las rutas deben incluir el locale** en la navegación
- **Los componentes que usen traducciones** deben estar dentro del `NextIntlClientProvider`
- **Los archivos de traducción** deben mantenerse sincronizados entre idiomas
- **Usar claves descriptivas** y organizadas jerárquicamente
- **Siempre usar `useLocale()`** para obtener el locale actual en navegación

## Desarrollo

Para desarrollo local:
```bash
npm run dev
```

Acceder a:
- `http://localhost:5501/es` - Versión en español
- `http://localhost:5501/en` - Versión en inglés 