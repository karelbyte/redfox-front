"use client";

import { useState, useEffect, useRef } from "react";
import { categoriesService } from "@/services/categories.service";
import { toastService } from "@/services/toast.service";
import { Category } from "@/types/category";
import CategoryForm from "@/components/Category/CategoryForm";
import CategoryTable from "@/components/Category/CategoryTable";
import DeleteCategoryModal from "@/components/Category/DeleteCategoryModal";
import Pagination from "@/components/Pagination/Pagination";
import Drawer from "@/components/Drawer/Drawer";
import { CategoryFormRef } from "@/components/Category/CategoryForm";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<CategoryFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchCategories = async (page: number) => {
    try {
      setLoading(true);
      const response = await categoriesService.getCategories(page);
      setCategories(response.data);
      setTotalPages(response.meta.totalPages);
    } catch {
      toastService.error("Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchCategories(currentPage);
    }
  }, []);

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await categoriesService.deleteCategory(categoryToDelete.id);
      toastService.success("Categoría eliminada correctamente");
      fetchCategories(currentPage);
      setCategoryToDelete(null);
    } catch {
      toastService.error("Error al eliminar la categoría");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingCategory(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchCategories(currentPage);
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCategories(page);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-red-900">
          Categorías
        </h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowDrawer(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Nueva Categoría
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      ) : categories && categories.length === 0 ? (
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
            No hay categorías
          </p>
          <p className="text-sm text-red-300">
            Haz clic en &quot;Nueva Categoría&quot; para agregar una.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <CategoryTable
              categories={categories}
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
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <CategoryForm
          ref={formRef}
          category={editingCategory}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {/* Modal de confirmación para eliminar */}
      <DeleteCategoryModal
        category={categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
} 