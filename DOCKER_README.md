# Docker para RedFox Front

Este proyecto incluye configuración completa de Docker para desarrollo y producción.

## Archivos de Docker

- `Dockerfile` - Para producción
- `Dockerfile.dev` - Para desarrollo
- `docker-compose.yml` - Orquestación de servicios
- `.dockerignore` - Archivos excluidos del contexto de Docker

## Comandos de Uso

### Producción

```bash
# Construir la imagen de producción
docker build -t redfox-front .

# Ejecutar el contenedor de producción
docker run -p 3000:3000 redfox-front

# Usar docker-compose para producción
docker-compose up --build
```

### Desarrollo

```bash
# Ejecutar en modo desarrollo con docker-compose
docker-compose --profile dev up --build

# O construir manualmente la imagen de desarrollo
docker build -f Dockerfile.dev -t redfox-front-dev .

# Ejecutar el contenedor de desarrollo
docker run -p 5501:5501 -v $(pwd):/app redfox-front-dev
```

## Variables de Entorno

### Producción
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`
- `PORT=3000`
- `HOSTNAME=0.0.0.0`

### Desarrollo
- `NODE_ENV=development`
- `NEXT_TELEMETRY_DISABLED=1`
- Puerto: `5501` (configurado en package.json)

## Puertos

- **Producción**: `3000`
- **Desarrollo**: `5501`

## Características

### Dockerfile de Producción
- Multi-stage build para optimizar el tamaño
- Modo standalone de Next.js
- Usuario no-root para seguridad
- Optimización de capas de Docker

### Dockerfile de Desarrollo
- Hot reload habilitado
- Volúmenes montados para cambios en tiempo real
- Todas las dependencias de desarrollo incluidas

### Docker Compose
- Configuración para producción y desarrollo
- Health checks incluidos
- Restart policies configuradas

## Optimizaciones

1. **Multi-stage build**: Reduce el tamaño final de la imagen
2. **Standalone output**: Next.js genera un servidor independiente
3. **Alpine Linux**: Imagen base ligera
4. **Dockerignore**: Excluye archivos innecesarios
5. **Usuario no-root**: Mejora la seguridad

## Troubleshooting

### Problemas comunes

1. **Puerto ya en uso**:
   ```bash
   # Cambiar el puerto en docker-compose.yml
   ports:
     - "3001:3000"  # Cambiar 3000 por 3001
   ```

2. **Permisos de archivos**:
   ```bash
   # En Windows, asegúrate de que Docker Desktop tenga acceso al directorio
   ```

3. **Memoria insuficiente**:
   ```bash
   # Aumentar memoria en Docker Desktop
   # O usar --memory flag
   docker run --memory=2g redfox-front
   ```

### Logs

```bash
# Ver logs del contenedor
docker-compose logs -f app

# Ver logs específicos
docker logs <container_id>
```

## Despliegue

### Docker Hub
```bash
# Tag de la imagen
docker tag redfox-front tu-usuario/redfox-front:latest

# Push a Docker Hub
docker push tu-usuario/redfox-front:latest
```

### Kubernetes
```bash
# Aplicar configuración
kubectl apply -f k8s/

# Ver pods
kubectl get pods
``` 