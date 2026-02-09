# Usamos Slim para evitar problemas de Alpine
FROM node:22-slim AS base

# 1. Dependencias
FROM base AS deps
RUN apt-get update && apt-get install -y libc6 python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copiamos SOLO el package.json (IGNORAMOS el package-lock.json de tu PC)
COPY package.json ./

# Instalamos desde cero en el entorno de Linux
RUN npm install

# Forzamos la instalación del paquete que causa el error
RUN npm install @parcel/watcher-linux-x64-glibc

# 2. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno críticas
ENV NEXT_TELEMETRY_DISABLED 1
# Esta línea le dice a Next que no use el sistema de observación de archivos
ENV WATCHPACK_WATCHER_LIMIT 20 

RUN npm run build

# 3. Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

# Copiamos solo lo necesario
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]