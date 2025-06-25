'use client'

import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Btn, Input } from '@/components/atoms';
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
        
        {/* Precio */}
        <div className="w-32">
          <Input
            type="number"
            value={item.price}
            onChange={(e) => onUpdatePrice(item.product.id, parseFloat(e.target.value) || 0)}
            className="text-sm"
            min="0"
            step="0.01"
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