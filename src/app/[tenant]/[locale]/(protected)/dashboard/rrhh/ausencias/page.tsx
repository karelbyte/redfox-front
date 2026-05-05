"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { toastService } from "@/services/toast.service";
import { useSearchStore } from "@/stores/search.store";
import { 
  PlusIcon, 
  TrashIcon, 
  CalendarIcon 
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
import { leaveRequestsHelp } from "@/components/Help/configs/leave-requests.help";
import { useBulkSelection, BulkAction } from "@/hooks/useBulkSelection";
import LeaveRequestForm from "@/components/LeaveRequest/LeaveRequestForm";
import LeaveRequestTable from "@/components/LeaveRequest/LeaveRequestTable";
import DeleteLeaveRequestModal from "@/components/LeaveRequest/DeleteLeaveRequestModal";
import { leaveRequestsService } from "@/services/leave-requests.service";
import { LeaveRequest } from "@/types/employee";
import { useLeaveRequestTranslations } from "@/components/LeaveRequest/LeaveRequestTranslations.i18n";

export default function AusenciasPage() {
  const locale = useLocale();
  const t = useLeaveRequestTranslations(locale);

  const { can } = usePermissions();
  const router = useRouter();
  const params = useParams();
  const tenant = params?.tenant as string;
  const { search_leave_request, setSearchLeaveRequest } = useSearchStore();
  
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
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

  const { visibleColumns, toggleColumn } = useColumnPersistence('leave_requests', [
    'employee',
    'leave_type',
    'dates',
    'days_count',
    'status'
  ]);

  const {
    selectedIds,
    hasSelection,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useBulkSelection((leaveRequests || []).map((r) => ({ ...r, id: r.id })));

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

  const fetchLeaveRequests = async (page: number = 1, term?: string) => {
    try {
      setIsLoading(true);
      const response = await leaveRequestsService.getLeaveRequests(page, term);
      setLeaveRequests(response.data || []);
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
      if (search_leave_request) {
        setSearchTerm(search_leave_request);
        fetchLeaveRequests(1, search_leave_request);
      } else {
        fetchLeaveRequests(1);
      }
    }
  }, [fetchLeaveRequests, search_leave_request]);

  const handleEdit = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowDrawer(true);
  };

  const handleDelete = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsDeleteModalOpen(true);
  };

  const handleDrawerClose = () => {
    setSelectedRequest(null);
    setShowDrawer(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchLeaveRequests(currentPage, searchTerm);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLeaveRequests(page, searchTerm);
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
          <HelpButton config={leaveRequestsHelp} />
        </div>
        <div className="flex items-center gap-2">
          {can(["hr_leave_request_create"]) && (
            <Btn
              onClick={() => {
                setSelectedRequest(null);
                setShowDrawer(true);
              }}
              variant="primary"
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              {t("newRequest")}
            </Btn>
          )}
        </div>
      </div>

      {((leaveRequests?.length || 0) > 0 || searchTerm) && (
        <div className="mt-6 flex justify-between items-center gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder={t("searchRequests")}
              value={searchTerm}
              onSearch={(term) => {
                setSearchTerm(term);
                setSearchLeaveRequest(term);
                fetchLeaveRequests(1, term);
              }}
              onClear={() => {
                setSearchTerm("");
                setSearchLeaveRequest("");
                fetchLeaveRequests(1, "");
              }}
            />
          </div>
          <ExportButton
            data={leaveRequests}
            filename="leave_requests"
            columns={['employee', 'leave_type', 'start_date', 'end_date', 'status']}
          />
          <ColumnSelector
            columns={[
              { key: 'employee', label: t('employee') },
              { key: 'leave_type', label: t('leaveType') },
              { key: 'dates', label: t('dates') },
              { key: 'days_count', label: t('days') },
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
      ) : leaveRequests.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t("noRequests")}
          description={t("noRequestsDesc")}
          searchDescription={t("noResultsDesc")}
        />
      ) : (
        <>
          <div className="mt-6">
            <LeaveRequestTable
              leaveRequests={leaveRequests}
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
        id="leave-request-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedRequest ? t("editRequest") : t("newRequest")}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
        width="max-w-2xl"
      >
        <div className="p-6">
          <LeaveRequestForm
            ref={formRef}
            leaveRequest={selectedRequest}
            onClose={handleDrawerClose}
            onSuccess={handleFormSuccess}
            onSavingChange={setIsSaving}
            onValidChange={setIsFormValid}
          />
        </div>
      </Drawer>

      {isDeleteModalOpen && (
        <DeleteLeaveRequestModal
          leaveRequest={selectedRequest}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => {
            setIsDeleteModalOpen(false);
            fetchLeaveRequests(currentPage, searchTerm);
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
