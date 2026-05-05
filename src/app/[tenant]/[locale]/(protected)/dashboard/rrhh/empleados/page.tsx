"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useEmployeeTranslations } from "@/components/Employee/useEmployeeTranslations.i18n";
import { useRouter, useParams } from "next/navigation";
import { toastService } from "@/services/toast.service";
import { useSearchStore } from "@/stores/search.store";
import { ArrowDownTrayIcon, PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import Drawer from "@/components/Drawer/Drawer";
import { Btn, SearchInput, EmptyState } from "@/components/atoms";
import PermissionEmptyState from "@/components/atoms/PermissionEmptyState";
import ExportButton from "@/components/atoms/ExportButton";
import AdvancedFilters from "@/components/atoms/AdvancedFilters";
import Pagination from "@/components/Pagination/Pagination";
import Loading from "@/components/Loading/Loading";
import { usePermissions } from "@/hooks/usePermissions";
import { useColumnPersistence } from "@/hooks/useColumnPersistence";
import ColumnSelector from "@/components/Table/ColumnSelector";
import BulkActionsBar from "@/components/atoms/BulkActionsBar";
import HelpButton from "@/components/Help/HelpButton";
import { employeesHelp } from "@/components/Help/configs/employees.help";
import { useBulkSelection, BulkAction } from "@/hooks/useBulkSelection";
import EmployeeTable from "@/components/Employee/EmployeeTable";
import EmployeeForm from "@/components/Employee/EmployeeForm";
import DeleteEmployeeModal from "@/components/Employee/DeleteEmployeeModal";
import { employeesService } from "@/services/employees.service";
import { Employee } from "@/types/employee";

export default function EmpleadosPage() {
  const t = useEmployeeTranslations();
  const { can } = usePermissions();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const tenant = params?.tenant as string;
  const { search_employees, setSearchEmployees, clearAllSearches } = useSearchStore();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchTerm, setSearchTerm] = useState(search_employees || "");
  const [hasInitialData, setHasInitialData] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const formRef = useRef<any>(null);
  const initialFetchDone = useRef(false);

  const availableColumns = [
    { key: 'employee_code', label: t('employeeCode') },
    { key: 'first_name', label: t('firstName') },
    { key: 'last_name', label: t('lastName') },
    { key: 'email', label: t('email') },
    { key: 'phone', label: t('phone') },
    { key: 'department', label: t('department') },
    { key: 'position', label: t('position') },
    { key: 'status', label: t('status') },
    { key: 'hire_date', label: t('hireDate') },
    { key: 'actions', label: t('actions') },
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence(
    'employees_table',
    availableColumns.map(c => c.key)
  );

  const {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    hasSelection,
  } = useBulkSelection(employees.map(e => ({ ...e, id: e.id })));

  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: t('actions.delete'),
      color: 'danger',
      requiresConfirm: true,
      onClick: async () => {
        try {
          // Implement bulk delete
          clearSelection();
          fetchEmployees(currentPage, searchTerm);
        } catch (error) {
          console.error('Error deleting employees:', error);
          if (error instanceof Error) {
            toastService.error(error.message);
          } else {
            toastService.error(t("messages.errorDelete"));
          }
        }
      },
    },
  ];

  const fetchEmployees = async (page: number = 1, term?: string, currentFilters?: Record<string, any>) => {
    try {
      setIsLoading(true);
      const activeFilters = currentFilters || filters;
      
      const response = await employeesService.getEmployees(
        page, 
        term, 
        activeFilters.status === 'active' ? true : activeFilters.status === 'inactive' ? false : undefined,
        10
      );

      setEmployees(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setCurrentPage(page);
      setHasInitialData(true);
    } catch (error) {
      console.error('Error fetching employees:', error);
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t("messages.errorLoading"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      if (search_employees) {
        setSearchTerm(search_employees);
        fetchEmployees(1, search_employees);
      } else {
        fetchEmployees(1);
      }
    }
  }, [fetchEmployees, search_employees]);

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setSelectedEmployee(null);
    setShowDrawer(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchEmployees(currentPage, searchTerm);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setSelectedEmployee(null);
    fetchEmployees(currentPage, searchTerm);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchEmployees(page, searchTerm);
  };

  if (!can(["hr_employee_view"])) {
    return <PermissionEmptyState />;
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
          <HelpButton config={employeesHelp} />
        </div>
        <div className="flex items-center gap-2">
          {can(["hr_employee_create"]) && (
            <Btn
              variant="secondary"
              onClick={() => router.push(`/${tenant}/${locale}/dashboard/rrhh/empleados/importar`)}
              leftIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
            >
              {locale === 'zh' ? '导入' : locale === 'en' ? 'Import' : 'Importar'}
            </Btn>
          )}
          {can(["hr_employee_create"]) && (
            <Btn
              onClick={() => {
                setSelectedEmployee(null);
                setShowDrawer(true);
              }}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              {t("newEmployee")}
            </Btn>
          )}
        </div>
      </div>

      {/* Filtro de búsqueda - Solo mostrar si hay empleados o si se está buscando */}
      {
        (employees.length > 0 || searchTerm) && (
          <div className="mt-6 flex justify-between items-center gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder={t("searchEmployees")}
                value={searchTerm}
                onSearch={(term: string) => {
                  setSearchTerm(term);
                  setSearchEmployees(term);
                  fetchEmployees(1, term);
                }}
                onClear={() => {
                  setSearchTerm("");
                  setSearchEmployees("");
                  fetchEmployees(1, "");
                }}
              />
            </div>
            {employees && employees.length > 0 && (
              <>
                <ExportButton
                  data={employees}
                  filename="employees"
                  columns={['employee_code', 'first_name', 'last_name', 'email', 'phone', 'department', 'position', 'status', 'hire_date']}
                >
                </ExportButton>
                <AdvancedFilters
                  fields={[
                    {
                      key: 'status',
                      label: t('status'),
                      type: 'select',
                      options: [
                        { value: 'active', label: t('active') },
                        { value: 'inactive', label: t('inactive') },
                      ],
                    },
                    {
                      key: 'department_id',
                      label: t('department'),
                      type: 'select',
                      options: [], // Load from API
                    },
                    {
                      key: 'position_id',
                      label: t('position'),
                      type: 'select',
                      options: [], // Load from API
                    },
                  ]}
                  onApply={(newFilters) => {
                    setFilters(newFilters);
                    fetchEmployees(1, searchTerm, newFilters);
                  }}
                  storageKey="employee-advanced-filters"
                />
              </>
            )}
            <ColumnSelector
              columns={availableColumns}
              visibleColumns={visibleColumns}
              onChange={toggleColumn}
            />
          </div>
        )
      }
      {
        isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loading size="lg" />
          </div>
        ) : employees && employees.length === 0 ? (
          <EmptyState
            searchTerm={searchTerm}
            title={t("noEmployees")}
            description={t("noEmployeesDesc")}
            searchDescription={t("noResultsDesc")}
            actionButton={
              can(["hr_employee_create"]) && !searchTerm ? (
                <Btn
                  onClick={() => {
                    setSelectedEmployee(null);
                    setShowDrawer(true);
                  }}
                  leftIcon={<PlusIcon className="h-5 w-5" />}
                >
                  {t("newEmployee")}
                </Btn>
              ) : null
            }
          />
        ) : (
          <>
            <div className="mt-6">
              <EmployeeTable
                employees={employees}
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
        )
      }

      <Drawer
        id="employee-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedEmployee ? t("editEmployee") : t("newEmployee")}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
        width="max-w-2xl"
      >
        <EmployeeForm
          ref={formRef}
          employee={selectedEmployee}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {
        hasSelection && (
          <BulkActionsBar
            selectedCount={selectedIds.length}
            actions={bulkActions}
            onClose={clearSelection}
          />
        )
      }
      {isDeleteModalOpen && (
        <DeleteEmployeeModal
          employee={selectedEmployee}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedEmployee(null);
          }}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
