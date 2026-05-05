"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { toastService } from "@/services/toast.service";
import { useSearchStore } from "@/stores/search.store";
import { 
  PlusIcon, 
  TrashIcon, 
  BanknotesIcon 
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
import { payrollHelp } from "@/components/Help/configs/payroll.help";
import { useBulkSelection, BulkAction } from "@/hooks/useBulkSelection";
import PayrollForm from "@/components/Payroll/PayrollForm";
import PayrollTable from "@/components/Payroll/PayrollTable";
import DeletePayrollModal from "@/components/Payroll/DeletePayrollModal";
import { payrollService } from "@/services/payroll.service";
import { Payroll } from "@/types/employee";
import { usePayrollTranslations } from "@/components/Payroll/PayrollTranslations.i18n";

export default function NominaPage() {
  const locale = useLocale();
  const t = usePayrollTranslations(locale);



  const { can } = usePermissions();
  const router = useRouter();
  const params = useParams();
  const tenant = params?.tenant as string;
  const { search_payroll, setSearchPayroll } = useSearchStore();
  
  const [payrollRecords, setPayrollRecords] = useState<Payroll[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasInitialData, setHasInitialData] = useState(false);
  const initialFetchDone = useRef(false);
  const formRef = useRef<any>(null);

  const { visibleColumns, toggleColumn } = useColumnPersistence('payroll', [
    'employee',
    'period',
    'base_salary',
    'net_pay',
    'status'
  ]);

  const {
    selectedIds,
    hasSelection,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useBulkSelection((payrollRecords || []).map((p) => ({ ...p, id: p.id })));

  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: t("delete"),
      onClick: async () => {
        clearSelection();
      },
      color: "danger",
    },
  ];

  const fetchPayroll = async (page: number = 1, term?: string) => {
    try {
      setIsLoading(true);
      const response = await payrollService.getPayroll(page, term);
      setPayrollRecords(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setCurrentPage(page);
      setHasInitialData(true);
    } catch (error) {
      toastService.error(t("messages.errorLoading"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      if (search_payroll) {
        setSearchTerm(search_payroll);
        fetchPayroll(1, search_payroll);
      } else {
        fetchPayroll(1);
      }
    }
  }, [fetchPayroll, search_payroll]);

  const handleEdit = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setShowDrawer(true);
  };

  const handleDelete = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setIsDeleteModalOpen(true);
  };

  const handleDrawerClose = () => {
    setSelectedPayroll(null);
    setShowDrawer(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchPayroll(currentPage, searchTerm);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPayroll(page, searchTerm);
  };

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
          <HelpButton config={payrollHelp} />
        </div>
        <div className="flex items-center gap-2">
          {can(["hr_payroll_create"]) && (
            <Btn
              onClick={() => {
                setSelectedPayroll(null);
                setShowDrawer(true);
              }}
              variant="primary"
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              {t("generatePayroll")}
            </Btn>
          )}
        </div>
      </div>

      {((payrollRecords?.length || 0) > 0 || searchTerm) && (
        <div className="mt-6 flex justify-between items-center gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder={t("searchPayroll")}
              value={searchTerm}
              onSearch={(term) => {
                setSearchTerm(term);
                setSearchPayroll(term);
                fetchPayroll(1, term);
              }}
              onClear={() => {
                setSearchTerm("");
                setSearchPayroll("");
                fetchPayroll(1, "");
              }}
            />
          </div>
          <ExportButton
            data={payrollRecords}
            filename="payroll"
            columns={['employee', 'period', 'base_salary', 'net_pay', 'status']}
          />
          <ColumnSelector
            columns={[
              { key: 'employee', label: t('employee') },
              { key: 'period', label: t('period') },
              { key: 'base_salary', label: t('baseSalary') },
              { key: 'net_pay', label: t('netPay') },
              { key: 'status', label: t('status') }
            ]}
            visibleColumns={visibleColumns}
            onChange={toggleColumn}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : payrollRecords.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t("noPayroll")}
          description={t("noPayrollDesc")}
          searchDescription={t("noResultsDesc")}
        />
      ) : (
        <>
          <div className="mt-6">
            <PayrollTable
              payrollRecords={payrollRecords}
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
        id="payroll-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedPayroll ? t("title") : t("generatePayroll")}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
        width="max-w-4xl"
      >
        <div className="p-6">
          <PayrollForm
            ref={formRef}
            payroll={selectedPayroll}
            onClose={handleDrawerClose}
            onSuccess={handleFormSuccess}
            onSavingChange={setIsSaving}
            onValidChange={setIsFormValid}
          />
        </div>
      </Drawer>

      {isDeleteModalOpen && (
        <DeletePayrollModal
          payroll={selectedPayroll}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => {
            setIsDeleteModalOpen(false);
            fetchPayroll(currentPage, searchTerm);
          }}
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
