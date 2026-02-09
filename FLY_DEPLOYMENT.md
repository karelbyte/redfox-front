# Guía de Despliegue en Fly.io - NitroCore Frontend

Esta guía describe cómo desplegar la aplicación Next.js en Fly.io.

## 📋 Requisitos Previos

- Cuenta en [Fly.io](https://fly.io)
- CLI de Fly.io instalado
- Git instalado
- Node.js 22+ instalado localmente

## 🚀 Instalación de Fly CLI

### En Windows (PowerShell)
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

### En macOS/Linux
```bash
curl -L https://fly.io/install.sh | sh
export PATH="$HOME/.fly/bin:$PATH"
```

### Verificar instalación
```bash
fly version
```

## 🔑 Autenticación

```bash
# Iniciar sesión en Fly.io
fly auth login

# Verificar autenticación
fly auth whoami
```

## 📦 Preparación del Proyecto

### 1. Verificar configuración de Fly.io

El archivo `fly.toml` ya está configurado con:
- App name: `nitrocore-front`
- Region: `mex` (México)
- Puerto: 3000
- Estrategia de deploy: rolling

### 2. Crear archivo de configuración

```bash
# Crear archivo .env.production.local (no commitear)
cat > .env.production.local << EOF
NEXT_PUBLIC_URL_API=https://nitrocore.fly.dev
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
EOF
```

## 🚀 Desplegar la Aplicación

### 1. Crear la aplicación en Fly.io

```bash
# Desde el directorio redfox-front
cd redfox-front

# Crear la aplicación (si no existe)
fly launch --name nitrocore-front --region mex --no-deploy
```

### 2. Configurar variables de entorno

```bash
# Establecer variables públicas
fly config set env.NEXT_PUBLIC_URL_API=https://nitrocore.fly.dev
fly config set env.NODE_ENV=production
fly config set env.NEXT_TELEMETRY_DISABLED=1
```
fly secrets set NEXT_PUBLIC_URL_API=https://nitrocore.fly.dev NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 --app nitroapp

### 3. Desplegar

```bash
# Desplegar la aplicación
fly deploy

# Ver logs en tiempo real
fly logs

# Verificar estado
fly status
```

## ✅ Verificar Despliegue

```bash
# Ver información de la app
fly info

# Ver logs
fly logs

# Acceder a la aplicación
fly open

# Probar que carga correctamente
curl https://nitrocore-front.fly.dev
```

## 📊 Monitoreo y Logs

### Ver logs en tiempo real

```bash
# Logs de la aplicación
fly logs

# Logs de las últimas 24 horas
fly logs --since 24h

# Logs de una máquina específica
fly logs --instance <instance-id>
```

### Métricas

```bash
# Ver estado de máquinas
fly machines list

# Ver uso de recursos
fly status

# Ver historial de deploys
fly releases
```

## 🔧 Actualizar Aplicación

### Después de hacer cambios en el código

```bash
# Desde el directorio redfox-front
cd redfox-front

# Hacer cambios en el código
# ...

# Commitear cambios
git add .
git commit -m "Descripción de cambios"

# Desplegar
fly deploy

# Ver logs del nuevo deploy
fly logs
```

## 🔐 Gestionar Variables de Entorno

### Ver variables

```bash
# Listar todas las variables
fly config show
```

### Actualizar variables

```bash
# Actualizar una variable
fly config set env.NEXT_PUBLIC_URL_API=https://nuevo-api.fly.dev

# Actualizar múltiples variables
fly config set env.VAR1=valor1 env.VAR2=valor2
```

## 🚨 Troubleshooting

### Problema: Aplicación no inicia

```bash
# Ver logs detallados
fly logs

# Verificar variables de entorno
fly config show

# Verificar que el build fue exitoso
fly logs | grep -i error
```

### Problema: Conexión a API rechazada

```bash
# Verificar que NEXT_PUBLIC_URL_API es correcto
fly config show | grep NEXT_PUBLIC_URL_API

# Actualizar si es necesario
fly config set env.NEXT_PUBLIC_URL_API=https://nitrocore.fly.dev
```

### Problema: Caché de Next.js

```bash
# Limpiar caché y redeploy
fly deploy --force-machines
```

### Problema: Espacio en disco lleno

```bash
# Ver uso de disco
fly ssh console --app nitrocore-front
df -h

# Limpiar caché
rm -rf /app/.next/cache
rm -rf /app/node_modules/.cache
```

## 📈 Escalado

### Aumentar recursos

```bash
# Aumentar CPU y memoria
fly scale vm shared-cpu-2x --memory 512

# Ver configuración actual
fly scale show
```

### Auto-scaling

```bash
# Configurar auto-scaling
fly autoscale set min=1 max=3

# Ver configuración
fly autoscale show
```

## 🔗 Conectar con Backend

Asegúrate de que la variable `NEXT_PUBLIC_URL_API` apunte al backend correcto:

```bash
# Verificar configuración actual
fly config show | grep NEXT_PUBLIC_URL_API

# Actualizar si es necesario
fly config set env.NEXT_PUBLIC_URL_API=https://nitrocore.fly.dev
```

## 📝 Notas Importantes

1. **Región**: La app está configurada para la región `mex` (México)
2. **Build**: Se ejecuta automáticamente durante el deploy
3. **SSL/TLS**: Habilitado automáticamente por Fly.io
4. **Health Checks**: Configurados en `fly.toml`
5. **Variables públicas**: Prefijo `NEXT_PUBLIC_` es visible en el cliente

## 🔗 Enlaces Útiles

- [Documentación de Fly.io](https://fly.io/docs/)
- [Guía de Next.js en Fly.io](https://fly.io/docs/languages-and-frameworks/nextjs/)
- [CLI Reference](https://fly.io/docs/flyctl/help/)
- [Pricing](https://fly.io/pricing/)

## 💡 Tips y Mejores Prácticas

1. **Usar variables de entorno**: Configurar URLs dinámicamente
2. **Monitorear logs regularmente**: Detectar problemas temprano
3. **Hacer deploys incrementales**: Probar cambios antes de producción
4. **Documentar cambios**: Mantener registro de deploys
5. **Revisar costos**: Monitorear uso de recursos
6. **Usar staging**: Tener ambiente de prueba antes de producción

## 🆘 Soporte

Para más ayuda:

1. Revisar [documentación de Fly.io](https://fly.io/docs/)
2. Consultar [comunidad de Fly.io](https://community.fly.io/)
3. Crear issue en el repositorio del proyecto
