"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { toastService } from "@/services/toast.service";
import { useSearchStore } from "@/stores/search.store";
import { 
  PlusIcon, 
  TrashIcon, 
  DocumentIcon 
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
import { documentsHelp } from "@/components/Help/configs/documents.help";
import { useBulkSelection, BulkAction } from "@/hooks/useBulkSelection";
import DocumentForm from "@/components/Document/DocumentForm";
import DocumentTable from "@/components/Document/DocumentTable";
import DeleteDocumentModal from "@/components/Document/DeleteDocumentModal";
import { documentsService } from "@/services/documents.service";
import { EmployeeDocument } from "@/types/employee";

export default function DocumentosPage() {
  const locale = useLocale();

  const translations: Record<string, any> = {
    es: {
      title: "Documentos de Empleados",
      description: "Gestiona contratos, identificaciones y otros documentos",
      uploadDocument: "Subir Documento",
      editDocument: "Editar Documento",
      searchDocuments: "Buscar documentos...",
      employee: "Empleado",
      documentTitle: "Título",
      documentType: "Tipo",
      expiryDate: "Fecha Vencimiento",
      status: "Estado",
      noDocuments: "No hay documentos registrados",
      noDocumentsDesc: "Comienza subiendo el primer documento.",
      noResults: "No se encontraron documentos",
      noResultsDesc: "No hay resultados para tu búsqueda.",
      delete: "Eliminar",
      messages: {
        errorLoading: "Error al cargar los documentos",
        deleteSuccess: "Documento eliminado correctamente",
        verifySuccess: "Documento verificado correctamente"
      }
    },
    en: {
      title: "Employee Documents",
      description: "Manage contracts, IDs and other documents",
      uploadDocument: "Upload Document",
      editDocument: "Edit Document",
      searchDocuments: "Search documents...",
      employee: "Employee",
      documentTitle: "Title",
      documentType: "Type",
      expiryDate: "Expiry Date",
      status: "Status",
      noDocuments: "No documents found",
      noDocumentsDesc: "Start by uploading the first document.",
      noResults: "No matching documents",
      noResultsDesc: "No results found for your search.",
      delete: "Delete",
      messages: {
        errorLoading: "Error loading documents",
        deleteSuccess: "Document deleted successfully",
        verifySuccess: "Document verified successfully"
      }
    },
    zh: {
      title: "员工文档",
      description: "管理合同、身份证和其他文档",
      uploadDocument: "上传文档",
      editDocument: "编辑文档",
      searchDocuments: "搜索文档...",
      employee: "员工",
      documentTitle: "标题",
      documentType: "类型",
      expiryDate: "有效期",
      status: "状态",
      noDocuments: "未找到文档",
      noDocumentsDesc: "通过上传第一个文档开始。",
      noResults: "没有匹配的文档",
      noResultsDesc: "未找到搜索结果。",
      delete: "删除",
      messages: {
        errorLoading: "加载文档时出错",
        deleteSuccess: "文档删除成功",
        verifySuccess: "文档验证成功"
      }
    }
  };

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale];
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key;
      }
    }
    return value;
  };

  const { can } = usePermissions();
  const router = useRouter();
  const params = useParams();
  const tenant = params?.tenant as string;
  const { search_document, setSearchDocument } = useSearchStore();
  
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<EmployeeDocument | null>(null);
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

  const { visibleColumns, toggleColumn } = useColumnPersistence('documents', [
    'employee',
    'title',
    'document_type',
    'expiry_date',
    'is_verified'
  ]);

  const {
    selectedIds,
    hasSelection,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useBulkSelection((documents || []).map((d) => ({ ...d, id: d.id })));

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

  const fetchDocuments = async (page: number = 1, term?: string) => {
    try {
      setIsLoading(true);
      const response = await documentsService.getDocuments(page, term);
      setDocuments(response.data || []);
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
      if (search_document) {
        setSearchTerm(search_document);
        fetchDocuments(1, search_document);
      } else {
        fetchDocuments(1);
      }
    }
  }, [fetchDocuments, search_document]);

  const handleEdit = (document: EmployeeDocument) => {
    setSelectedDocument(document);
    setShowDrawer(true);
  };

  const handleDelete = (document: EmployeeDocument) => {
    setSelectedDocument(document);
    setIsDeleteModalOpen(true);
  };

  const handleVerify = async (document: EmployeeDocument) => {
    try {
      await documentsService.verifyDocument(document.id);
      toastService.success(t("messages.verifySuccess"));
      fetchDocuments(currentPage, searchTerm);
    } catch (error) {
      toastService.error(error instanceof Error ? error.message : t("messages.errorLoading"));
    }
  };

  const handleDrawerClose = () => {
    setSelectedDocument(null);
    setShowDrawer(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchDocuments(currentPage, searchTerm);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchDocuments(page, searchTerm);
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
          <HelpButton config={documentsHelp} />
        </div>
        <div className="flex items-center gap-2">
          {can(["hr_document_create"]) && (
            <Btn
              onClick={() => {
                setSelectedDocument(null);
                setShowDrawer(true);
              }}
              variant="primary"
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              {t("uploadDocument")}
            </Btn>
          )}
        </div>
      </div>

      {((documents?.length || 0) > 0 || searchTerm) && (
        <div className="mt-6 flex justify-between items-center gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder={t("searchDocuments")}
              value={searchTerm}
              onSearch={(term) => {
                setSearchTerm(term);
                setSearchDocument(term);
                fetchDocuments(1, term);
              }}
              onClear={() => {
                setSearchTerm("");
                setSearchDocument("");
                fetchDocuments(1, "");
              }}
            />
          </div>
          <ExportButton
            data={documents}
            filename="documents"
            columns={['employee', 'title', 'document_type', 'expiry_date', 'is_verified']}
          />
          <ColumnSelector
            columns={[
              { key: 'employee', label: t('employee') },
              { key: 'title', label: t('documentTitle') },
              { key: 'document_type', label: t('documentType') },
              { key: 'expiry_date', label: t('expiryDate') },
              { key: 'is_verified', label: t('status') }
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
      ) : documents.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t("noDocuments")}
          description={t("noDocumentsDesc")}
          searchDescription={t("noResultsDesc")}
        />
      ) : (
        <>
          <div className="mt-6">
            <DocumentTable
              documents={documents}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onVerify={handleVerify}
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
        id="document-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedDocument ? t("editDocument") : t("uploadDocument")}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
        width="max-w-2xl"
      >
        <div className="p-6">
          <DocumentForm
            ref={formRef}
            document={selectedDocument}
            onClose={handleDrawerClose}
            onSuccess={handleFormSuccess}
            onSavingChange={setIsSaving}
            onValidChange={setIsFormValid}
          />
        </div>
      </Drawer>

      {isDeleteModalOpen && (
        <DeleteDocumentModal
          document={selectedDocument}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => {
            setIsDeleteModalOpen(false);
            fetchDocuments(currentPage, searchTerm);
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
