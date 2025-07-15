#!/bin/bash

# Script para limpiar caché en Railway
echo "🧹 Limpiando caché..."

# Limpiar caché de Next.js
rm -rf .next
rm -rf .next/cache

# Limpiar caché de npm
npm cache clean --force

# Limpiar caché de Docker (si está disponible)
if command -v docker &> /dev/null; then
    docker system prune -f
fi

echo "✅ Caché limpiada exitosamente" 