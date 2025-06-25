'use client'

import React from 'react';
import { useTranslations } from 'next-intl';
import { InventoryProduct } from '@/services/inventory.service';
import { SearchInput } from '@/components/atoms';
import Loading from '@/components/Loading/Loading';
import ProductCard from './ProductCard';

interface ProductsGridProps {
  products: InventoryProduct[];
  searchTerm: string;
  onSearch: (term: string) => void;
  onAddToCart: (product: InventoryProduct) => void;
  loading: boolean;
}

const ProductsGrid = React.memo(({ 
  products, 
  searchTerm,
  onSearch, 
  onAddToCart, 
  loading 
}: ProductsGridProps) => {
  const t = useTranslations('pages.pos');

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold mb-4">{t('products.title')}</h2>
        <SearchInput
          placeholder={t('products.searchPlaceholder')}
          onSearch={onSearch}
          value={searchTerm}
        />
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <Loading size="md" />
            <p className="text-gray-500 mt-2">{t('products.loading')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
            
            {products.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('products.noProducts')}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

ProductsGrid.displayName = 'ProductsGrid';

export default ProductsGrid; 