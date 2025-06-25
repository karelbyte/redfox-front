'use client'

import React from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { InventoryProduct } from '@/services/inventory.service';

interface ProductCardProps {
  product: InventoryProduct;
  onAddToCart: (product: InventoryProduct) => void;
}

const ProductCard = React.memo(({ product, onAddToCart }: ProductCardProps) => {
  const t = useTranslations('pages.pos');
  const hasImage = product.product.images && product.product.images.length > 0;
  const imageUrl = hasImage ? `${process.env.NEXT_PUBLIC_URL_API}${product.product.images[0]}` : '';

  const handleClick = () => {
    onAddToCart(product);
  };

  return (
    <div
      className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center overflow-hidden">
          {hasImage ? (
            <img
              src={imageUrl}
              alt={product.product.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <h3 className="font-medium text-sm truncate">{product.product.name}</h3>
        <p className="text-xs text-gray-500">{product.product.sku}</p>
        <p className="text-sm font-semibold mt-1">${product.price || 0}</p>
        <p className="text-xs text-gray-400">{t('products.stock')}: {product.quantity}</p>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard; 