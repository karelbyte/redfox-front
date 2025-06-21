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
import { Btn, SearchInput, EmptyState } from '@/components/atoms';
import { PlusIcon } from "@heroicons/react/24/outline";
import Loading from '@/components/Loading/Loading';


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
  const [searchTerm, setSearchTerm] = useState('');
  const formRef = useRef<BrandFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchBrands = async (page: number, term?: string) => {
    try {
      setLoading(true);
      const response = await brandService.getBrands(page, term);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!brandToDelete) return;

    try {
      await brandService.deleteBrand(brandToDelete.id);
      fetchBrands(currentPage, searchTerm);
      setBrandToDelete(null);
    } catch (error) {
      setBrandToDelete(null);
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(error as string);
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
    fetchBrands(currentPage, searchTerm);
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
    fetchBrands(page, searchTerm);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          Marcas
        </h1>
        <Btn
          onClick={() => {
            setEditingBrand(null);
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Nueva Marca
        </Btn>
      </div>

      <div className="mt-6">
        <SearchInput
          placeholder="Buscar marcas..."
          onSearch={(term: string) => {
            setSearchTerm(term);
            fetchBrands(1, term);
          }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <Loading size="lg" />
        </div>
      ) : brands && brands.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title="No hay marcas"
          description="Haz clic en 'Nueva Marca' para agregar una."
          searchDescription="No se encontraron marcas"
        />
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
        id="brand-drawer"
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