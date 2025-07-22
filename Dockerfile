# Dockerfile para Next.js 15
# Usar la imagen oficial de Node.js como base
FROM node:22-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
# Verificar https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine para entender por qué libc6-compat podría ser necesario.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Limpiar caché de npm antes de instalar
RUN npm cache clean --force

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
RUN npm ci --no-cache

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Configurar variables de entorno para el build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_CACHE_DISABLED 1
ENV NEXT_BUILD_CACHE_DISABLED 1

# Limpiar cualquier caché existente antes del build
RUN rm -rf .next
RUN rm -rf node_modules/.cache

# Construir la aplicación
RUN npm run build

# Limpiar caché después del build
RUN rm -rf .next/cache
RUN rm -rf node_modules/.cache

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_CACHE_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar los archivos construidos
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

# Configurar permisos
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Usar npm start en lugar del servidor standalone
CMD ["npm", "start"] 