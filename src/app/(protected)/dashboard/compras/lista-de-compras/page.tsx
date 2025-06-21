/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Reception } from '@/types/reception';
import { receptionService } from '@/services/receptions.service';
import { toastService } from '@/services/toast.service';
import ReceptionTable from '@/components/Reception/ReceptionTable';
import ReceptionForm from '@/components/Reception/ReceptionForm';
import DeleteReceptionModal from '@/components/Reception/DeleteReceptionModal';
import CloseReceptionModal from '@/components/Reception/CloseReceptionModal';
import Pagination from '@/components/Pagination/Pagination';
import Drawer from '@/components/Drawer/Drawer';
import { ReceptionFormRef } from '@/components/Reception/ReceptionForm';
import { Btn } from '@/components/atoms';
import { PlusIcon } from "@heroicons/react/24/outline";

export default function RecepcionesPage() {
  const router = useRouter();
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingReception, setEditingReception] = useState<Reception | null>(null);
  const [receptionToDelete, setReceptionToDelete] = useState<Reception | null>(null);
  const [receptionToClose, setReceptionToClose] = useState<Reception | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<ReceptionFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchReceptions = async (page: number) => {
    try {
      setLoading(true);
      const response = await receptionService.getReceptions(page);
      setReceptions(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error('Error al cargar las recepciones');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchReceptions(currentPage);
    }
  }, []);

  const handleDelete = async () => {
    if (!receptionToDelete) return;

    try {
      await receptionService.deleteReception(receptionToDelete.id);
      fetchReceptions(currentPage);
      setReceptionToDelete(null);
    } catch (error) {
      setReceptionToDelete(null);
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(error as string);
      }
    }
  };

  const handleClose = async () => {
    if (!receptionToClose) return;

    try {
      // Aquí deberías llamar al método del servicio para cerrar la recepción
      // await receptionService.closeReception(receptionToClose.id);
      toastService.success('Recepción cerrada correctamente');
      fetchReceptions(currentPage);
      setReceptionToClose(null);
    } catch (error) {
      setReceptionToClose(null);
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error('Error al cerrar la recepción');
      }
    }
  };

  const handleDetails = (reception: Reception) => {
    router.push(`/dashboard/compras/recepciones/${reception.id}`);
  };

  const handleEdit = (reception: Reception) => {
    setEditingReception(reception);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingReception(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchReceptions(currentPage);
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const openDeleteModal = (reception: Reception) => {
    setReceptionToDelete(reception);
  };

  const openCloseModal = (reception: Reception) => {
    setReceptionToClose(reception);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchReceptions(page);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          Recepciones
        </h1>
        <Btn
          onClick={() => {
            setEditingReception(null);
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Nueva Recepción
        </Btn>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div 
            className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full"
            style={{ borderColor: `rgb(var(--color-primary-500))` }}
          ></div>
        </div>
      ) : receptions && receptions.length === 0 ? (
        <div 
          className="mt-6 flex flex-col items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed"
          style={{ borderColor: `rgb(var(--color-primary-200))` }}
        >
          <svg
            className="h-12 w-12 mb-4"
            style={{ color: `rgb(var(--color-primary-300))` }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p 
            className="text-lg font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-400))` }}
          >
            No hay recepciones
          </p>
          <p 
            className="text-sm"
            style={{ color: `rgb(var(--color-primary-300))` }}
          >
            Haz clic en &quot;Nueva Recepción&quot; para agregar una.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <ReceptionTable
              receptions={receptions}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
              onDetails={handleDetails}
              onClose={openCloseModal}
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
        id="reception-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingReception ? 'Editar Recepción' : 'Nueva Recepción'}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <ReceptionForm
          ref={formRef}
          reception={editingReception || null}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {/* Modal de confirmación para eliminar */}
      <DeleteReceptionModal
        reception={receptionToDelete}
        onClose={() => setReceptionToDelete(null)}
        onConfirm={handleDelete}
      />

      {/* Modal de confirmación para cerrar */}
      <CloseReceptionModal
        reception={receptionToClose}
        onClose={() => setReceptionToClose(null)}
        onConfirm={handleClose}
      />
    </div>
  );
} 