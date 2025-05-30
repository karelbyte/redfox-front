'use client'

import { useState, useRef, useEffect } from 'react';
import { Product } from '@/types/product';
import { productService } from '@/services/products.service';
import { toastService } from '@/services/toast.service';
import ProductTable from '@/components/Product/ProductTable';
import DeleteProductModal from '@/components/Product/DeleteProductModal';
import Pagination from '@/components/Pagination/Pagination';
import Drawer from '@/components/Drawer/Drawer';
import ProductForm from '@/components/Product/ProductForm';
import { ProductFormRef } from '@/components/Product/ProductForm';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<ProductFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      const response = await productService.getProducts(page);
      setProducts(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      console.error('Error fetching products:', err);
      toastService.error("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchProducts(currentPage);
    }
  }, []);

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await productService.deleteProduct(productToDelete.id);
      toastService.success('Producto eliminado correctamente');
      fetchProducts(currentPage);
      setProductToDelete(null);
    } catch {
      toastService.error('Error al eliminar el producto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingProduct(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchProducts(currentPage);
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-red-900">
          Productos
        </h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowDrawer(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Nuevo Producto
        </button>
      </div>

      {products && products.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-red-200">
          <svg
            className="h-12 w-12 text-red-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium text-red-400 mb-2">
            No hay productos
          </p>
          <p className="text-sm text-red-300">
            Haz clic en &quot;Nuevo Producto&quot; para agregar uno.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <ProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={setProductToDelete}
            />
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-6"
            />
          )}
        </>
      )}

      {/* Drawer para crear/editar */}
      <Drawer
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
        width='max-w-4xl'
      >
        <ProductForm
          ref={formRef}
          product={editingProduct || null}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {/* Modal de confirmación para eliminar */}
      <DeleteProductModal
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
} 