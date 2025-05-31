'use client';
import { useState, useRef } from 'react';
import ProductForm from '@/components/Product/ProductForm';
import { Product } from '@/types/product';
import { ProductFormRef } from '@/components/Product/ProductForm';
import { toastService } from '@/services/toast.service';

export default function AgregarProductoPage() {
  const [product] = useState<Product | null>(null);
  const formRef = useRef<ProductFormRef>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handleOnSuccess = () => {
    toastService.success('Producto creado correctamente');
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agregar Nuevo Producto</h1>
        {handleSave && (
              <button
                onClick={handleSave}
                disabled={isSaving || !isFormValid}
                className="px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:hover:bg-red-600 flex items-center"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            )}
      </div>
      <ProductForm 
        ref={formRef}
        product={product}
        onClose={() => {}}
        onSuccess={() => handleOnSuccess()}
        onSavingChange={setIsSaving}
        onValidChange={setIsFormValid}
      />
    </div>
  );
} 