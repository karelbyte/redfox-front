'use client'

import { useEffect, useState } from 'react';
import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { Btn, Select } from '@/components/atoms';
import { InventoryProduct } from '@/services/inventory.service';

interface CartItemProps {
  item: {
    product: InventoryProduct;
    quantity: number;
    price: number;
    priceMode?: string;
    subtotal: number;
    tax_amount: number;
    subtotal_no_tax: number;
  };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdatePrice: (productId: string, price: number, priceMode?: string) => void;
  onRemove: (productId: string) => void;
}

interface PriceOption {
  value: string;
  label: string;
  price: number;
}

const PRICE_TOLERANCE = 0.0001;

export default function CartItem({
  item,
  onUpdateQuantity,
  onUpdatePrice,
  onRemove
}: CartItemProps) {
  const t = useTranslations('pages.pos.cart');
  const [customPriceInput, setCustomPriceInput] = useState(item.price.toString());

  const getDefaultPrice = (): number => {
    if (item.product.product.base_price !== undefined) {
      return item.product.product.base_price;
    }

    return typeof item.product.price === 'number'
      ? item.product.price
      : Number(item.product.price) || 0;
  };

  const getPriceOptions = (): PriceOption[] => {
    const options: PriceOption[] = [];

    if (item.product.product.base_price !== undefined) {
      options.push({
        value: 'base',
        label: `${t('basePrice')}: $${item.product.product.base_price.toFixed(2)}`,
        price: item.product.product.base_price,
      });
    }

    if (item.product.product.prices && item.product.product.prices.length > 0) {
      item.product.product.prices.forEach((price) => {
        options.push({
          value: `price:${price.id}`,
          label: `${price.name}: $${price.price.toFixed(2)}`,
          price: price.price,
        });
      });
    }

    if (options.length === 0) {
      options.push({
        value: 'inventory',
        label: `${t('price')}: $${getDefaultPrice().toFixed(2)}`,
        price: getDefaultPrice(),
      });
    }

    options.push({
      value: 'custom',
      label: t('customPrice'),
      price: item.price,
    });

    return options;
  };

  const inferSelectedOption = (): string => {
    if (
      item.product.product.base_price !== undefined &&
      Math.abs(item.product.product.base_price - item.price) < PRICE_TOLERANCE
    ) {
      return 'base';
    }

    const matchingPrice = item.product.product.prices?.find(
      (price) => Math.abs(price.price - item.price) < PRICE_TOLERANCE,
    );

    if (matchingPrice) {
      return `price:${matchingPrice.id}`;
    }

    return 'custom';
  };

  const priceOptions = getPriceOptions();
  const selectedPriceOption =
    item.priceMode && priceOptions.some((option) => option.value === item.priceMode)
      ? item.priceMode
      : inferSelectedOption();

  useEffect(() => {
    if (selectedPriceOption === 'custom') {
      setCustomPriceInput(item.price.toString());
    }
  }, [item.price, selectedPriceOption]);

  const handlePriceSelection = (value: string) => {
    if (!value) {
      return;
    }

    if (value === 'custom') {
      const nextPrice = item.price > 0 ? item.price : getDefaultPrice();
      setCustomPriceInput(nextPrice.toString());
      onUpdatePrice(item.product.id, nextPrice, 'custom');
      return;
    }

    const selectedOption = priceOptions.find((option) => option.value === value);
    if (!selectedOption) {
      return;
    }

    onUpdatePrice(item.product.id, selectedOption.price, value);
  };

  const handleCustomPriceChange = (value: string) => {
    setCustomPriceInput(value);

    if (value.trim() === '') {
      return;
    }

    const numericValue = parseFloat(value);
    if (Number.isNaN(numericValue) || numericValue < 0) {
      return;
    }

    onUpdatePrice(item.product.id, numericValue, 'custom');
  };

  const handleCustomPriceBlur = () => {
    if (customPriceInput.trim() !== '') {
      return;
    }

    setCustomPriceInput(item.price.toString());
  };

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center space-x-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{item.product.product.name}</h3>
          <p className="text-xs text-gray-500">{item.product.product.sku}</p>
        </div>

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

        <div className="w-52 space-y-2">
          <Select
            id={`price-${item.product.id}`}
            value={selectedPriceOption}
            onChange={(e) => handlePriceSelection(e.target.value)}
            options={priceOptions.map(({ value, label }) => ({ value, label }))}
            placeholder={t('price')}
            disablePlaceholderOption
            className="text-sm"
          />

          {selectedPriceOption === 'custom' && (
            <input
              type="number"
              min="0"
              step="0.01"
              value={customPriceInput}
              onChange={(e) => handleCustomPriceChange(e.target.value)}
              onBlur={handleCustomPriceBlur}
              placeholder={t('price')}
              className="block w-full px-4 py-2 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              style={{
                border: `1px solid rgb(var(--color-secondary-300))`,
                ['--tw-ring-color' as string]: `rgb(var(--color-primary-500))`,
                ['--tw-ring-offset-color' as string]: 'white',
              }}
            />
          )}
        </div>

        <div className="w-24 text-right">
          <p className="text-sm font-semibold">${item.subtotal.toFixed(2)}</p>
          {item.tax_amount > 0 && (
            <p className="text-[10px] text-gray-400">
              inc. ${item.tax_amount.toFixed(2)} tax
            </p>
          )}
        </div>

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
