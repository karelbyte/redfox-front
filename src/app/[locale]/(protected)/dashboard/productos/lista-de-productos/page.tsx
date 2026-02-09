"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Product } from "@/types/product";
import { productService } from "@/services/products.service";
import { PDFService } from "@/services/pdf.service";
import { toastService } from "@/services/toast.service";
import ProductTable from "@/components/Product/ProductTable";
import DeleteProductModal from "@/components/Product/DeleteProductModal";
import BarcodeGeneratorModal from "@/components/Product/BarcodeGeneratorModal";
import Pagination from "@/components/Pagination/Pagination";
import Drawer from "@/components/Drawer/Drawer";
import ProductForm from "@/components/Product/ProductForm";
import { ProductFormRef } from "@/components/Product/ProductForm";
import { Btn, SearchInput, EmptyState } from "@/components/atoms";
import { PlusIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import Loading from "@/components/Loading/Loading";
import { usePermissions } from "@/hooks/usePermissions";
import { useColumnPersistence } from "@/hooks/useColumnPersistence";
import ColumnSelector from "@/components/Table/ColumnSelector";
import BulkActionsBar from "@/components/atoms/BulkActionsBar";
import { useBulkSelection, BulkAction } from "@/hooks/useBulkSelection";
import AdvancedFilters, { FilterField } from "@/components/atoms/AdvancedFilters";
import ExportButton from "@/components/atoms/ExportButton";
import { ProductType } from "@/types/product";

export default function ListProductsPage() {
  const t = useTranslations("pages.products");
  const tCommon = useTranslations("common");
  const { can } = usePermissions();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasInitialData, setHasInitialData] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const formRef = useRef<ProductFormRef>(null);
  const initialFetchDone = useRef(false);

  const availableColumns = [
    { key: 'name', label: t('table.name') },
    { key: 'code', label: t('table.code') },
    { key: 'sku', label: t('table.sku') },
    { key: 'brand', label: t('table.brand') },
    { key: 'category', label: t('table.category') },
    { key: 'status', label: t('table.status') },
    { key: 'actions', label: t('table.actions') },
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence(
    'products_table',
    availableColumns.map(c => c.key)
  );

  const {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    hasSelection,
  } = useBulkSelection(products.map(p => ({ ...p, id: p.id })));

  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: tCommon('actions.delete'),
      color: 'danger',
      requiresConfirm: true,
      onClick: async () => {
        try {
          await productService.deleteProducts(selectedIds);
          toastService.success(t('messages.productDeleted'));
          clearSelection();
          fetchProducts(currentPage, searchTerm);
        } catch (error) {
          console.error('Error deleting products:', error);
          if (error instanceof Error) {
            toastService.error(error.message);
          } else {
            toastService.error(t('messages.errorDelete'));
          }
        }
      },
    },
  ];

  const fetchProducts = async (page: number, term?: string, currentFilters?: Record<string, any>) => {
    try {
      setLoading(true);
      const activeFilters = currentFilters || filters;
      const isActive = activeFilters.status === 'true' ? true : activeFilters.status === 'false' ? false : undefined;
      const type = activeFilters.type;

      const response = await productService.getProducts(page, term, isActive, type);
      setProducts(response.data);
      setTotalPages(response.meta?.totalPages || 1);
      setCurrentPage(page);

      // Si es la primera carga y no hay término de búsqueda, marcamos que ya tenemos datos iniciales
      if (!hasInitialData && !term) {
        setHasInitialData(true);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      toastService.error(t("messages.errorLoading"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchProducts(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await productService.deleteProduct(productToDelete.id);
      toastService.success(t("messages.productDeleted"));
      fetchProducts(currentPage, searchTerm);
      setProductToDelete(null);
    } catch (error) {
      setProductToDelete(null);
      toastService.error(error as string);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowDrawer(true);
  };

  const handleGenerateBarcode = (product: Product) => {
    setSelectedProduct(product);
    setShowBarcodeModal(true);
  };

  const handleGeneratePDF = async () => {
    try {
      setGeneratingPDF(true);

      // Obtener todos los productos sin paginación
      const response = await productService.getProducts(undefined, searchTerm);

      if (response.data.length === 0) {
        toastService.error(t("messages.noProductsToExport"));
        return;
      }

      // Preparar datos para el PDF
      const pdfData = {
        headers: [
          t("table.name"),
          t("table.sku"),
          t("table.brand"),
          t("table.category"),
          t("table.measurementUnit"),
          t("table.type"),
          t("table.tax"),
          t("table.status")
        ],
        rows: response.data.map(product => [
          product.name,
          product.sku,
          typeof product.brand === 'object' ? product.brand.code : product.brand,
          typeof product.category === 'object' ? product.category.name : product.category,
          typeof product.measurement_unit === 'object' ? product.measurement_unit.code : product.measurement_unit,
          product.type,
          typeof product.tax === 'object' ? product.tax.code : product.tax,
          product.is_active ? tCommon("status.active") : tCommon("status.inactive")
        ])
      };

      // Generar PDF
      const pdfService = new PDFService();
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
        now.toTimeString().split(' ')[0].replace(/:/g, '-');

      pdfService.generateTablePDF(pdfData, {
        title: t("pdf.title"),
        subtitle: `${t("pdf.subtitle")} - ${now.toLocaleDateString()}`,
        filename: `productos_${timestamp}.pdf`,
        orientation: 'landscape' // Usar orientación horizontal para mejor visualización
      });

      toastService.success(t("messages.pdfGenerated"));
    } catch (error) {
      console.error("Error generating PDF:", error);
      toastService.error(t("messages.errorGeneratingPDF"));
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingProduct(null);
    setIsSaving(false);
  };

  const handleBarcodeModalClose = () => {
    setShowBarcodeModal(false);
    setSelectedProduct(null);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchProducts(currentPage, searchTerm);
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page, searchTerm);
  };

  if (!can(["product_module_view"])) {
    return <div>{t("noPermission")}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1
          className="text-xl font-semibold"
          style={{ color: `rgb(var(--color-primary-800))` }}
        >
          {t("title")}
        </h1>
        {can(["product_create"]) && (
          <Btn
            onClick={() => {
              setEditingProduct(null);
              setShowDrawer(true);
            }}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            {t("newProduct")}
          </Btn>
        )}
      </div>

      {/* Filtro de búsqueda y botón PDF */}
      <div className="mt-6 flex gap-4 items-center">
        <div className="flex-1">
          <SearchInput
            placeholder={t("searchProducts")}
            onSearch={(term: string) => {
              setSearchTerm(term);
              fetchProducts(1, term);
            }}
          />
        </div>
        <Btn
          variant="ghost"
          onClick={handleGeneratePDF}
          disabled={generatingPDF}
          leftIcon={<DocumentArrowDownIcon className="h-5 w-5" />}
          style={{ color: '#059669' }}
        >
          {generatingPDF ? t("pdf.generating") : t("pdf.export")}
        </Btn>
        {products && products.length > 0 && (
          <>
            <ExportButton
              data={products}
              filename="products"
              columns={['name', 'code', 'sku', 'brand', 'category', 'status']}
            />
            <AdvancedFilters
              fields={[
                {
                  key: 'status',
                  label: t('table.status'),
                  type: 'select',
                  options: [
                    { value: 'true', label: tCommon('status.active') },
                    { value: 'false', label: tCommon('status.inactive') },
                  ],
                },
                {
                  key: 'type',
                  label: t('table.type'),
                  type: 'select',
                  options: [
                    { value: ProductType.TANGIBLE, label: t('form.types.tangible') },
                    { value: ProductType.SERVICE, label: t('form.types.service') },
                  ],
                },
              ]}
              onApply={(newFilters) => {
                setFilters(newFilters);
                fetchProducts(1, searchTerm, newFilters);
              }}
              storageKey="product-advanced-filters"
            />
          </>
        )}
        <ColumnSelector
          columns={availableColumns}
          visibleColumns={visibleColumns}
          onChange={toggleColumn}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : products && products.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t("noProducts")}
          description={t("noProductsDesc")}
          searchDescription={t("noResultsDesc")}
        />
      ) : (
        <>
          <div className="mt-6">
            <ProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={setProductToDelete}
              onGenerateBarcode={handleGenerateBarcode}
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

      {/* Drawer para crear/editar */}
      <Drawer
        id="product-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingProduct ? t("editProduct") : t("newProduct")}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
        width="max-w-4xl"
      >
        <ProductForm
          ref={formRef}
          product={editingProduct || null}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {/* Modal de confirmación para eliminar */}
      <DeleteProductModal
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
      />

      <BarcodeGeneratorModal
        isOpen={showBarcodeModal}
        onClose={handleBarcodeModalClose}
        productCode={selectedProduct?.sku || ''}
        productName={selectedProduct?.name || ''}
      />

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
