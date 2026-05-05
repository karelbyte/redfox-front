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
import { positionsHelp } from "@/components/Help/configs/positions.help";
import { useBulkSelection, BulkAction } from "@/hooks/useBulkSelection";
import PositionForm from "@/components/Position/PositionForm";
import PositionTable from "@/components/Position/PositionTable";
import DeletePositionModal from "@/components/Position/DeletePositionModal";
import { positionsService } from "@/services/positions.service";
import { Position } from "@/types/employee";
import { usePositionTranslations } from "@/components/Position/PositionTranslations.i18n";

export default function PuestosPage() {
  const locale = useLocale();
  const t = usePositionTranslations(locale);
  const { can } = usePermissions();
  const params = useParams();
  const { search_positions, setSearchPositions } = useSearchStore();
  
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(search_positions || "");
  const [hasInitialData, setHasInitialData] = useState(false);
  const initialFetchDone = useRef(false);
  const formRef = useRef<any>(null);

  const availableColumns = [
    { key: 'title', label: t('title_col') },
    { key: 'department', label: t('department') },
    { key: 'salary_range', label: t('salaryRange') },
    { key: 'employee_count', label: t('employees') },
    { key: 'created_at', label: t('date') },
    { key: 'actions', label: t('actions.title') }
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence('positions_table', [
    'title',
    'department',
    'salary_range',
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
  } = useBulkSelection((positions || []).map((p) => ({ ...p, id: p.id })));

  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: t("actions.delete"),
      onClick: async () => {
        // Implement bulk delete
        clearSelection();
      },
      color: "danger",
    },
  ];

  const fetchPositions = useCallback(async (page: number = 1, term?: string) => {
    try {
      setIsLoading(true);
      const response = await positionsService.getPositions(page, term);
      setPositions(response.data || []);
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
      if (search_positions) {
        setSearchTerm(search_positions);
        fetchPositions(1, search_positions);
      } else {
        fetchPositions(1, searchTerm);
      }
    }
  }, [fetchPositions, searchTerm, search_positions]);

  const handleEdit = (position: Position) => {
    setSelectedPosition(position);
    setShowDrawer(true);
  };

  const handleDelete = (position: Position) => {
    setSelectedPosition(position);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setSelectedPosition(null);
    fetchPositions(currentPage, searchTerm);
  };

  const handleDrawerClose = () => {
    setSelectedPosition(null);
    setShowDrawer(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchPositions(currentPage, searchTerm);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPositions(page, searchTerm);
  };

  if (!can(["hr_position_view"])) {
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
          <HelpButton config={positionsHelp} />
        </div>
        <div className="flex items-center gap-2">
          {can(["hr_position_create"]) && (
            <Btn
              onClick={() => {
                setSelectedPosition(null);
                setShowDrawer(true);
              }}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              {t("newPosition")}
            </Btn>
          )}
        </div>
      </div>

      {(positions.length > 0 || searchTerm) && (
        <div className="mt-6 flex justify-between items-center gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder={t("searchPositions")}
              value={searchTerm}
              onSearch={(term) => {
                setSearchTerm(term);
                setSearchPositions(term);
                fetchPositions(1, term);
              }}
              onClear={() => {
                setSearchTerm("");
                setSearchPositions("");
                fetchPositions(1, "");
              }}
            />
          </div>
          <ExportButton
            data={positions}
            filename="positions"
            columns={['title', 'department', 'salary_range', 'employee_count', 'created_at']}
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
      ) : positions.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t("noPositions")}
          description={t("noPositionsDesc")}
          searchDescription={t("noResultsDesc")}
        />
      ) : (
        <>
          <div className="mt-6">
            <PositionTable
              positions={positions}
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
        id="position-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedPosition ? t("editPosition") : t("newPosition")}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
        width="max-w-2xl"
      >
        <PositionForm
          ref={formRef}
          position={selectedPosition}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {isDeleteModalOpen && (
        <DeletePositionModal
          position={selectedPosition}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedPosition(null);
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
