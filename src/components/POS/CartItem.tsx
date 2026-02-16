'use client'

import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { Btn, Select } from '@/components/atoms';
import { InventoryProduct } from '@/services/inventory.service';

interface CartItemProps {
  item: {
    product: InventoryProduct;
    quantity: number;
    price: number;
    subtotal: number;
  };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdatePrice: (productId: string, price: number) => void;
  onRemove: (productId: string) => void;
}

export default function CartItem({ 
  item, 
  onUpdateQuantity, 
  onUpdatePrice, 
  onRemove 
}: CartItemProps) {
  const t = useTranslations('pages.pos.cart');

  // Construir opciones de precio
  const priceOptions = [];

  // Agregar precio base si existe
  if (item.product.product.base_price !== undefined) {
    priceOptions.push({
      value: item.product.product.base_price.toString(),
      label: `${t('basePrice')}: $${item.product.product.base_price.toFixed(2)}`
    });
  }

  // Agregar precios de la lista si existen
  if (item.product.product.prices && item.product.product.prices.length > 0) {
    item.product.product.prices.forEach(price => {
      priceOptions.push({
        value: price.price.toString(),
        label: `${price.name}: $${price.price.toFixed(2)}`
      });
    });
  }

  // Si no hay opciones de precio, usar el precio del inventario
  if (priceOptions.length === 0) {
    priceOptions.push({
      value: item.product.price.toString(),
      label: `${t('price')}: $${item.product.price.toFixed(2)}`
    });
  }

  // Agregar opción de precio personalizado si el precio actual no está en la lista
  const currentPriceInList = priceOptions.some(
    option => parseFloat(option.value) === item.price
  );
  
  if (!currentPriceInList) {
    priceOptions.push({
      value: item.price.toString(),
      label: `${t('customPrice')}: $${item.price.toFixed(2)}`
    });
  }

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center space-x-3">
        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{item.product.product.name}</h3>
          <p className="text-xs text-gray-500">{item.product.product.sku}</p>
        </div>
        
        {/* Cantidad */}
        <div className="flex items-center space-x-1">
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
          >
            <MinusIcon className="h-3 w-3" />
          </Btn>
          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
          >
            <PlusIcon className="h-3 w-3" />
          </Btn>
        </div>
        
        {/* Selector de Precio */}
        <div className="w-48">
          <Select
            id={`price-${item.product.id}`}
            value={item.price.toString()}
            onChange={(e) => onUpdatePrice(item.product.id, parseFloat(e.target.value) || 0)}
            options={priceOptions}
            className="text-sm"
          />
        </div>
        
        {/* Subtotal */}
        <div className="w-20 text-right">
          <p className="text-sm font-semibold">${item.subtotal.toFixed(2)}</p>
        </div>
        
        {/* Botón eliminar */}
        <Btn
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.product.id)}
        >
          <XMarkIcon className="h-4 w-4" />
        </Btn>
      </div>
    </div>
  );
} 