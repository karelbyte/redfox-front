#!/bin/bash

# Script para limpiar caché en Railway
echo "🧹 Limpiando caché..."

# Limpiar caché de Next.js
rm -rf .next
rm -rf .next/cache

# Limpiar caché de npm
npm cache clean --force

# Limpiar caché de node_modules
rm -rf node_modules/.cache

# Limpiar caché de Docker (si está disponible)
if command -v docker &> /dev/null; then
    echo "🐳 Limpiando caché de Docker..."
    docker system prune -f
    docker builder prune -f
fi

# Limpiar archivos temporales
rm -rf .turbo
rm -rf .swc

echo "✅ Caché limpiada exitosamente"
echo "📝 Para forzar un rebuild completo en Railway, usa:"
echo "   railway up --force" 