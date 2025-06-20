'use client'

import { useState, useEffect, useRef } from 'react';
import { Tax } from '@/types/tax';
import TaxTable from '@/components/Tax/TaxTable';
import TaxForm, { TaxFormRef } from '@/components/Tax/TaxForm';
import Drawer from '@/components/Drawer/Drawer';
import { toastService } from '@/services/toast.service';
import { taxesService } from '@/services/taxes.service';
import Pagination from '@/components/Pagination/Pagination';
import DeleteTaxModal from '@/components/Tax/DeleteTaxModal';
import { Btn, SearchInput, EmptyState } from '@/components/atoms';
import { PlusIcon } from '@heroicons/react/24/outline';
import Loading from '@/components/Loading/Loading';

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasInitialData, setHasInitialData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const formRef = useRef<TaxFormRef>(null);

  const fetchTaxes = async (page: number = 1, term?: string) => {
    try {
      setIsLoading(true);
      const response = await taxesService.getTaxes(page, term);
      setTaxes(response.data);
      setTotalPages(response.meta.totalPages);
      setCurrentPage(page);
      
      // Si es la primera carga y no hay término de búsqueda, marcamos que ya tenemos datos iniciales
      if (!hasInitialData && !term) {
        setHasInitialData(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error("Error al cargar los impuestos");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes(1);
  }, []);

  const handleEdit = (tax: Tax) => {
    setSelectedTax(tax);
    setShowDrawer(true);
  };

  const handleDelete = (tax: Tax) => {
    setSelectedTax(tax);
    setIsDeleteModalOpen(true);
  };

  const handleDrawerClose = () => {
    setSelectedTax(null);
    setShowDrawer(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchTaxes(currentPage, searchTerm);
  };

  const handleDeleteModalClose = () => {
    setSelectedTax(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    handleDeleteModalClose();
    fetchTaxes(currentPage, searchTerm);
  };

  const handleSave = () => {
    formRef.current?.save();
  };

  const handlePageChange = (page: number) => {
    fetchTaxes(page, searchTerm);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          Impuestos
        </h1>
        <Btn
          onClick={() => {
            setSelectedTax(null);
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Nuevo Impuesto
        </Btn>
      </div>

      {/* Filtro de búsqueda */}
      <div className="mt-6">
        <SearchInput
          placeholder="Buscar impuestos..."
          onSearch={(term: string) => {
            setSearchTerm(term);
            fetchTaxes(1, term);
          }}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : taxes && taxes.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title="No hay impuestos"
          description="Haz clic en 'Nuevo Impuesto' para agregar uno."
          searchDescription="No se encontraron resultados"
        />
      ) : (
        <>
          <div className="mt-6">
            <TaxTable
              taxes={taxes}
              onEdit={handleEdit}
              onDelete={handleDelete}
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

      <Drawer
        id="tax-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedTax ? "Editar Impuesto" : "Nuevo Impuesto"}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <TaxForm
          ref={formRef}
          initialData={selectedTax}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {isDeleteModalOpen && selectedTax && (
        <DeleteTaxModal
          tax={selectedTax}
          onClose={handleDeleteModalClose}
          onConfirm={handleDeleteSuccess}
        />
      )}
    </div>
  );
} 