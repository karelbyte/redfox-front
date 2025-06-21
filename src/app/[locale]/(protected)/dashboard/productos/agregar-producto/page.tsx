'use client';
import { useState, useRef } from 'react';
import ProductForm from '@/components/Product/ProductForm';
import { Product } from '@/types/product';
import { ProductFormRef } from '@/components/Product/ProductForm';
import { toastService } from '@/services/toast.service';
import { Btn } from '@/components/atoms';

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
        <h1 
          className="text-2xl font-bold"
          style={{ color: `rgb(var(--color-primary-800))` }}
        >
          Agregar Nuevo Producto
        </h1>
        {handleSave && (
          <Btn
            onClick={handleSave}
            disabled={!isFormValid}
            loading={isSaving}
          >
            Guardar
          </Btn>
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