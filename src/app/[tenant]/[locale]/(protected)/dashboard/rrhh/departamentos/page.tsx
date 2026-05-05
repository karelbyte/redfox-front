"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { toastService } from "@/services/toast.service";
import { useSearchStore } from "@/stores/search.store";
import { 
  PlusIcon
} from "@heroicons/react/24/outline";
import Drawer from "@/components/Drawer/Drawer";
import { Btn, SearchInput, EmptyState } from "@/components/atoms";
import ExportButton from "@/components/atoms/ExportButton";
import Pagination from "@/components/Pagination/Pagination";
import Loading from "@/components/Loading/Loading";
import { usePermissions } from "@/hooks/usePermissions";
import { useColumnPersistence } from "@/hooks/useColumnPersistence";
import ColumnSelector from "@/components/Table/ColumnSelector";
import BulkActionsBar from "@/components/atoms/BulkActionsBar";
import HelpButton from "@/components/Help/HelpButton";
import { departmentsHelp } from "@/components/Help/configs/departments.help";
import { useBulkSelection, BulkAction } from "@/hooks/useBulkSelection";
import DepartmentForm from "@/components/Department/DepartmentForm";
import DepartmentTable from "@/components/Department/DepartmentTable";
import DeleteDepartmentModal from "@/components/Department/DeleteDepartmentModal";
import { departmentsService } from "@/services/departments.service";
import { Department } from "@/types/employee";
import { useDepartmentTranslations } from "@/components/Department/DepartmentTranslations.i18n";

export default function DepartamentosPage() {
  const locale = useLocale();
  const t = useDepartmentTranslations(locale);
  const { can } = usePermissions();
  const params = useParams();
  const { search_departments, setSearchDepartments } = useSearchStore();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(search_departments || "");
  const [hasInitialData, setHasInitialData] = useState(false);
  const initialFetchDone = useRef(false);
  const formRef = useRef<any>(null);

  const availableColumns = [
    { key: 'name', label: t('name') },
    { key: 'description', label: t('deptDescription') },
    { key: 'manager', label: t('manager') },
    { key: 'employee_count', label: t('employees') },
    { key: 'created_at', label: t('date') },
    { key: 'actions', label: t('actions.title') }
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence('departments_table', [
    'name',
    'description',
    'manager',
    'employee_count',
    'created_at',
    'actions'
  ]);

  const {
    selectedIds,
    hasSelection,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useBulkSelection((departments || []).map((d) => ({ ...d, id: d.id })));

  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: t("actions.delete"),
      onClick: async () => {
        // Implement bulk delete if needed
        clearSelection();
      },
      color: "danger",
    },
  ];

  const fetchDepartments = useCallback(async (page: number = 1, term?: string) => {
    try {
      setIsLoading(true);
      const response = await departmentsService.getDepartments(page, term);
      setDepartments(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setCurrentPage(page);
      setHasInitialData(true);
    } catch (error) {
      toastService.error(t("messages.errorLoading"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchDepartments(1, searchTerm);
    }
  }, [fetchDepartments, searchTerm]);

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setShowDrawer(true);
  };

  const handleDelete = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setSelectedDepartment(null);
    fetchDepartments(currentPage, searchTerm);
  };

  const handleDrawerClose = () => {
    setSelectedDepartment(null);
    setShowDrawer(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchDepartments(currentPage, searchTerm);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchDepartments(page, searchTerm);
  };

  if (!can(["hr_department_view"])) {
    return <div>{t("noPermission")}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1
            className="text-xl font-semibold"
            style={{ color: `rgb(var(--color-primary-800))` }}
          >
            {t("title")}
          </h1>
          <HelpButton config={departmentsHelp} />
        </div>
        <div className="flex items-center gap-2">
          {can(["hr_department_create"]) && (
            <Btn
              onClick={() => {
                setSelectedDepartment(null);
                setShowDrawer(true);
              }}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              {t("newDepartment")}
            </Btn>
          )}
        </div>
      </div>

      {(departments.length > 0 || searchTerm) && (
        <div className="mt-6 flex justify-between items-center gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder={t("searchDepartments")}
              value={searchTerm}
              onSearch={(term) => {
                setSearchTerm(term);
                setSearchDepartments(term);
                fetchDepartments(1, term);
              }}
              onClear={() => {
                setSearchTerm("");
                setSearchDepartments("");
                fetchDepartments(1, "");
              }}
            />
          </div>
          <ExportButton
            data={departments}
            filename="departments"
            columns={['name', 'description', 'manager', 'employee_count', 'created_at']}
          />
          <ColumnSelector
            columns={availableColumns}
            visibleColumns={visibleColumns}
            onChange={toggleColumn}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : departments.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t("noDepartments")}
          description={t("noDepartmentsDesc")}
          searchDescription={t("noResultsDesc")}
        />
      ) : (
        <>
          <div className="mt-6">
            <DepartmentTable
              departments={departments}
              onEdit={handleEdit}
              onDelete={handleDelete}
              visibleColumns={visibleColumns}
              selectedIds={selectedIds}
              onSelectChange={toggleSelect}
              onSelectAllChange={toggleSelectAll}
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
        id="department-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedDepartment ? t("editDepartment") : t("newDepartment")}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
        width="max-w-2xl"
      >
        <DepartmentForm
          ref={formRef}
          department={selectedDepartment}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {isDeleteModalOpen && (
        <DeleteDepartmentModal
          department={selectedDepartment}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedDepartment(null);
          }}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {hasSelection && (
        <BulkActionsBar
          selectedCount={selectedIds.length}
          actions={bulkActions}
          onClose={clearSelection}
        />
      )}
    </div>
  );
}
