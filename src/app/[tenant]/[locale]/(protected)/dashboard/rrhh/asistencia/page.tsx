"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { toastService } from "@/services/toast.service";
import { useSearchStore } from "@/stores/search.store";
import { PlusIcon } from "@heroicons/react/24/outline";
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
import { attendanceHelp } from "@/components/Help/configs/attendance.help";
import { useBulkSelection, BulkAction } from "@/hooks/useBulkSelection";
import AttendanceForm from "@/components/Attendance/AttendanceForm";
import AttendanceTable from "@/components/Attendance/AttendanceTable";
import DeleteAttendanceModal from "@/components/Attendance/DeleteAttendanceModal";
import { attendanceService } from "@/services/attendance.service";
import { Attendance } from "@/types/employee";
import { useAttendanceTranslations } from "@/components/Attendance/AttendanceTranslations.i18n";

export default function AsistenciaPage() {
  const locale = useLocale();
  const t = useAttendanceTranslations(locale);
  const { can } = usePermissions();
  const params = useParams();
  const { search_attendance, setSearchAttendance } = useSearchStore();

  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(search_attendance || "");
  const initialFetchDone = useRef(false);
  const formRef = useRef<any>(null);

  const availableColumns = [
    { key: 'employee',  label: t('employee') },
    { key: 'date',      label: t('date') },
    { key: 'check_in',  label: t('checkIn') },
    { key: 'check_out', label: t('checkOut') },
    { key: 'status',    label: t('status') },
    { key: 'actions',   label: t('actions.title') },
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence('attendance_table', [
    'employee', 'date', 'check_in', 'check_out', 'status', 'actions',
  ]);

  const { selectedIds, hasSelection, toggleSelect, toggleSelectAll, clearSelection } =
    useBulkSelection((attendance || []).map((a) => ({ ...a, id: a.id })));

  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: t("actions.delete"),
      onClick: async () => { clearSelection(); },
      color: "danger",
    },
  ];

  const fetchAttendance = useCallback(async (page: number = 1, term?: string) => {
    try {
      setIsLoading(true);
      const response = await attendanceService.getAttendance(page, term);
      setAttendance(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setCurrentPage(page);
    } catch {
      toastService.error(t("messages.errorLoading"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchAttendance(1, searchTerm);
    }
  }, [fetchAttendance, searchTerm]);

  const handleEdit = (record: Attendance) => {
    setSelectedAttendance(record);
    setShowDrawer(true);
  };

  const handleDelete = (record: Attendance) => {
    setSelectedAttendance(record);
    setIsDeleteModalOpen(true);
  };

  const handleDrawerClose = () => {
    setSelectedAttendance(null);
    setShowDrawer(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchAttendance(currentPage, searchTerm);
  };

  const handleSave = () => { formRef.current?.submit(); };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAttendance(page, searchTerm);
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
          <HelpButton config={attendanceHelp} />
        </div>
        <div className="flex items-center gap-2">
          {can(["hr_attendance_create"]) && (
            <Btn
              onClick={() => {
                setSelectedAttendance(null);
                setShowDrawer(true);
              }}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              {t("clockIn")}
            </Btn>
          )}
        </div>
      </div>

      {(attendance.length > 0 || searchTerm) && (
        <div className="mt-6 flex justify-between items-center gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder={t("searchAttendance")}
              value={searchTerm}
              onSearch={(term) => {
                setSearchTerm(term);
                setSearchAttendance(term);
                fetchAttendance(1, term);
              }}
              onClear={() => {
                setSearchTerm("");
                setSearchAttendance("");
                fetchAttendance(1, "");
              }}
            />
          </div>
          <ExportButton
            data={attendance}
            filename="attendance"
            columns={['employee', 'date', 'check_in', 'check_out', 'status']}
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
      ) : attendance.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t("noAttendance")}
          description={t("noAttendanceDesc")}
          searchDescription={t("noResultsDesc")}
        />
      ) : (
        <>
          <div className="mt-6">
            <AttendanceTable
              attendance={attendance}
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
        id="attendance-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedAttendance ? t("editAttendance") : t("clockIn")}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
        width="max-w-2xl"
      >
        <AttendanceForm
          ref={formRef}
          attendance={selectedAttendance}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {isDeleteModalOpen && (
        <DeleteAttendanceModal
          attendance={selectedAttendance}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => {
            setIsDeleteModalOpen(false);
            fetchAttendance(currentPage, searchTerm);
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
