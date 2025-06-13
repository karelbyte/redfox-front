'use client'

import { useState, useRef, useEffect } from 'react';
import { Brand } from '@/types/brand';
import { brandService } from '@/services/brand.service';
import { toastService } from '@/services/toast.service';
import BrandTable from '@/components/Brand/BrandTable';
import BrandForm from '@/components/Brand/BrandForm';
import DeleteBrandModal from '@/components/Brand/DeleteBrandModal';
import Pagination from '@/components/Pagination/Pagination';
import Drawer from '@/components/Drawer/Drawer';
import { BrandFormRef } from '@/components/Brand/BrandForm';

interface PaginatedResponse {
  data: Brand[];
  meta: {
    totalPages: number;
    currentPage: number;
  };
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<BrandFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchBrands = async (page: number) => {
    try {
      setLoading(true);
      const response = await brandService.getBrands(page);
      setBrands(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error('Error al cargar las marcas');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchBrands(currentPage);
    }
  }, []);

  const handleDelete = async () => {
    if (!brandToDelete) return;

    try {
      await brandService.deleteBrand(brandToDelete.id);
      fetchBrands(currentPage);
      setBrandToDelete(null);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error('Error al eliminar la marca');
      }
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingBrand(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchBrands(currentPage);
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const openDeleteModal = (brand: Brand) => {
    setBrandToDelete(brand);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBrands(page);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-red-900">
          Marcas
        </h1>
        <button
          onClick={() => {
            setEditingBrand(null);
            setShowDrawer(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Nueva Marca
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      ) : brands && brands.length === 0 ? (
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
            No hay marcas
          </p>
          <p className="text-sm text-red-300">
            Haz clic en &quot;Nueva Marca&quot; para agregar una.
          </p>
              </div>
      ) : (
        <>
          <div className="mt-6">
            <BrandTable
              brands={brands}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
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
        title={editingBrand ? 'Editar Marca' : 'Nueva Marca'}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <BrandForm
          ref={formRef}
          brand={editingBrand || null}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {/* Modal de confirmación para eliminar */}
      <DeleteBrandModal
        brand={brandToDelete}
        onClose={() => setBrandToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
} 