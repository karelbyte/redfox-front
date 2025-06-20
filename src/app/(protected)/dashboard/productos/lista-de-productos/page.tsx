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
import { Btn, SearchInput, EmptyState } from '@/components/atoms';
import { PlusIcon } from "@heroicons/react/24/outline";
import Loading from '@/components/Loading/Loading';

export default function ListProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasInitialData, setHasInitialData] = useState(false);
  const formRef = useRef<ProductFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchProducts = async (page: number, term?: string) => {
    try {
      setLoading(true);
      const response = await productService.getProducts(page, term);
      setProducts(response.data);
      setTotalPages(response.meta.totalPages);
      setCurrentPage(page);
      
      // Si es la primera carga y no hay término de búsqueda, marcamos que ya tenemos datos iniciales
      if (!hasInitialData && !term) {
        setHasInitialData(true);
      }
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
      fetchProducts(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await productService.deleteProduct(productToDelete.id);
      toastService.success('Producto eliminado correctamente');
      fetchProducts(currentPage, searchTerm);
      setProductToDelete(null);
    } catch (error) {
      setProductToDelete(null);
      toastService.error(error as string);
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
    fetchProducts(currentPage, searchTerm);
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page, searchTerm);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          Productos
        </h1>
        <Btn
          onClick={() => {
            setEditingProduct(null);
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Nuevo Producto
        </Btn>
      </div>

      {/* Filtro de búsqueda */}
      <div className="mt-6">
        <SearchInput
          placeholder="Buscar productos..."
          onSearch={(term: string) => {
            setSearchTerm(term);
            fetchProducts(1, term);
          }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : products && products.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title="No hay productos"
          description="Haz clic en 'Nuevo Producto' para agregar uno."
          searchDescription="No se encontraron resultados"
        />
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
        id="product-drawer"
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