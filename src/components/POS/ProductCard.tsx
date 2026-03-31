'use client'

import React from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { InventoryProduct } from '@/services/inventory.service';
import { API_BASE_URL } from '@/lib/config';

interface ProductCardProps {
  product: InventoryProduct;
  onAddToCart: (product: InventoryProduct) => void;
}

function getExpiryInfo(expirationDate?: string): {
  label: string;
  urgency: 'expired' | 'urgent' | 'warning' | null;
} | null {
  if (!expirationDate) return null;

  const now = new Date();
  const expiry = new Date(expirationDate);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Vencido', urgency: 'expired' };
  if (diffDays === 0) return { label: 'Vence hoy', urgency: 'urgent' };
  if (diffDays <= 3) return { label: `Vence en ${diffDays}d`, urgency: 'urgent' };
  if (diffDays <= 15) return { label: `Vence en ${diffDays}d`, urgency: 'warning' };
  return { label: `Vence en ${diffDays}d`, urgency: null };
}

const urgencyStyles = {
  expired: 'bg-red-100 text-red-700 border border-red-300',
  urgent: 'bg-orange-100 text-orange-700 border border-orange-300',
  warning: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
};

const ProductCard = React.memo(({ product, onAddToCart }: ProductCardProps) => {
  const t = useTranslations('pages.pos');
  const hasImage = product.product.images && product.product.images.length > 0;
  const imageUrl = hasImage ? `${API_BASE_URL}${product.product.images[0]}` : '';

  // Barcode tiene prioridad sobre SKU
  const identifier = product.product.barcode || product.product.sku;

  const expiryInfo = getExpiryInfo(product.expiration_date);

  // Borde de la card según urgencia de caducidad
  const cardBorder = expiryInfo?.urgency === 'expired' || expiryInfo?.urgency === 'urgent'
    ? 'border-orange-400'
    : 'border-gray-200';

  return (
    <div
      className={`border ${cardBorder} rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => onAddToCart(product)}
    >
      {/* Imagen */}
      <div className="w-10 h-10 bg-gray-100 rounded-md mx-auto mb-2 flex items-center justify-center overflow-hidden">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={product.product.name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <ShoppingCartIcon className="h-5 w-5 text-gray-400" />
        )}
      </div>

      {/* Nombre */}
      <h3 className="font-medium text-sm truncate text-center" title={product.product.name}>
        {product.product.name}
      </h3>

      {/* Identificador: barcode o SKU */}
      <p className="text-xs text-gray-400 text-center truncate">{identifier}</p>

      {/* Lote si existe */}
      {product.batch_number && (
        <p className="text-xs text-gray-400 text-center truncate">
          Lote: {product.batch_number}
        </p>
      )}

      {/* Badge de caducidad */}
      {expiryInfo && (
        <div className={`mt-1 px-1.5 py-0.5 rounded text-center text-xs font-medium ${
          expiryInfo.urgency ? urgencyStyles[expiryInfo.urgency] : 'text-gray-400'
        }`}>
          {expiryInfo.urgency === 'expired' ? '⚠️ ' : expiryInfo.urgency ? '⏰ ' : ''}
          {expiryInfo.label}
        </div>
      )}

      {/* Precio */}
      <p className="text-sm font-semibold mt-2 text-center">${product.price || 0}</p>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
