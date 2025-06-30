/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from 'next-intl';
import { categoriesService } from "@/services/categories.service";
import { toastService } from "@/services/toast.service";
import { Category } from "@/types/category";
import CategoryForm from "@/components/Category/CategoryForm";
import CategoryTable from "@/components/Category/CategoryTable";
import DeleteCategoryModal from "@/components/Category/DeleteCategoryModal";
import Pagination from "@/components/Pagination/Pagination";
import Drawer from "@/components/Drawer/Drawer";
import { CategoryFormRef } from "@/components/Category/CategoryForm";
import Loading from "@/components/Loading/Loading";
import { Btn, SearchInput, EmptyState } from "@/components/atoms";
import { PlusIcon } from "@heroicons/react/24/outline";
import { usePermissions } from "@/hooks/usePermissions";

export default function CategoriesPage() {
  const t = useTranslations('pages.categories');
  const { can } = usePermissions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasInitialData, setHasInitialData] = useState(false);
  const formRef = useRef<CategoryFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchCategories = async (page: number, term?: string) => {
    try {
      setLoading(true);
      const response = await categoriesService.getCategories(page, term);
      setCategories(response.data);
      setTotalPages(response.meta?.totalPages || 1);
      setCurrentPage(page);
      
      // Si es la primera carga y no hay término de búsqueda, marcamos que ya tenemos datos iniciales
      if (!hasInitialData && !term) {
        setHasInitialData(true);
      }
    } catch {
      toastService.error(t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchCategories(1);
    }
  }, []);

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await categoriesService.deleteCategory(categoryToDelete.id);
      toastService.success(t('messages.categoryDeleted'));
      fetchCategories(currentPage, searchTerm);
      setCategoryToDelete(null);
    } catch (error) {
      setCategoryToDelete(null);
      toastService.error(error as string);
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
    fetchCategories(currentPage, searchTerm);
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
    fetchCategories(page, searchTerm);
  };

  if (!can(["category_module_view"])) {
    return <div>{t("noPermission")}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: 'rgb(var(--color-primary-800))' }}>
          {t('title')}
        </h1>
        {can(["category_create"]) && (
          <Btn
            onClick={() => {
              setEditingCategory(null);
              setShowDrawer(true);
            }}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            {t('newCategory')}
          </Btn>
        )}
      </div>

      {/* Filtro de búsqueda */}
      <div className="mt-6">
        <SearchInput
          placeholder={t('searchCategories')}
          onSearch={(term: string) => {
            setSearchTerm(term);
            fetchCategories(1, term);
          }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : categories && categories.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t('noCategories')}
          description={t('noCategoriesDesc')}
          searchDescription={t('noResultsDesc')}
        />
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
        id="category-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingCategory ? t('editCategory') : t('newCategory')}
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