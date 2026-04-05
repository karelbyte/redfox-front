'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon, BanknotesIcon, CreditCardIcon, ClockIcon } from '@heroicons/react/24/outline';
import { quotationService } from '@/services/quotations.service';
import { inventoryService, InventoryProduct } from '@/services/inventory.service';
import { certificationPackService } from '@/services/certification-packs.service';
import { clientsService } from '@/services/clients.service';
import { toastService } from '@/services/toast.service';
import { Quotation, QuotationDetail } from '@/types/quotation';
import { Btn } from '@/components/atoms';
import Loading from '@/components/Loading/Loading';

interface ItemAssignment {
  detail: QuotationDetail;
  selectedWarehouseId: string;
  availableStock: InventoryProduct[];       // registros originales (lotes)
  warehouseOptions: { id: string; name: string; totalStock: number }[]; // agrupado por almacén
  loadingStock: boolean;
  isTangible: boolean;
}

export default function ConvertToSalePage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.quotations');
  const { formatCurrency } = useLocaleUtils();
  const quotationId = params.id as string;
  const tenant = params.tenant as string;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [assignments, setAssignments] = useState<ItemAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash');
  const [closeSale, setCloseSale] = useState(true);
  const [createInvoice, setCreateInvoice] = useState(false);
  const [stampInvoice, setStampInvoice] = useState(false);
  const [hasActivePack, setHasActivePack] = useState(false);
  const [clientHasCredit, setClientHasCredit] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [q, detailsRes, activePack] = await Promise.all([
        quotationService.getQuotationById(quotationId),
        quotationService.getQuotationDetails(quotationId, 1, 100),
        certificationPackService.getActive().catch(() => null),
      ]);
      setHasActivePack(!!activePack);

      // Verificar crédito del cliente
      if (q?.client?.id) {
        try {
          const clientData = await clientsService.getClient(q.client.id);
          setClientHasCredit(!!(clientData?.credit?.is_active));
        } catch {
          setClientHasCredit(false);
        }
      }
      setQuotation(q);

      // Inicializar assignments con stock loading
      const initial: ItemAssignment[] = detailsRes.data.map(detail => ({
        detail,
        selectedWarehouseId: '',
        availableStock: [],
        warehouseOptions: [],
        loadingStock: true,
        isTangible: (detail.product as any).type === 'tangible' || !(detail.product as any).type,
      }));
      setAssignments(initial);

      // Cargar stock para cada producto tangible en paralelo
      const updated = await Promise.all(
        initial.map(async (item) => {
          if (!item.isTangible) return { ...item, loadingStock: false };
          try {
            const stock = await inventoryService.getInventoryByProduct(item.detail.product.id);

            // Agrupar lotes por almacén — el usuario solo ve un almacén con el stock total
            const warehouseMap = new Map<string, { id: string; name: string; totalStock: number }>();
            for (const s of stock) {
              const wId = s.warehouse?.id || '';
              const wName = s.warehouse?.name || '—';
              const qty = Number(s.quantity) || 0;
              if (warehouseMap.has(wId)) {
                warehouseMap.get(wId)!.totalStock += qty;
              } else {
                warehouseMap.set(wId, { id: wId, name: wName, totalStock: qty });
              }
            }
            const warehouseOptions = Array.from(warehouseMap.values()).filter(w => w.id);

            // Pre-seleccionar si solo hay un almacén con stock suficiente
            const withStock = warehouseOptions.filter(w => w.totalStock >= Number(item.detail.quantity));
            const autoSelect = withStock.length === 1 ? withStock[0].id : '';

            return { ...item, availableStock: stock, warehouseOptions, selectedWarehouseId: autoSelect, loadingStock: false };
          } catch {
            return { ...item, loadingStock: false };
          }
        })
      );
      setAssignments(updated);
    } catch {
      toastService.error(t('messages.errorLoadingQuotation'));
      router.push(`/${tenant}/${locale}/dashboard/cotizaciones/${quotationId}`);
    } finally {
      setLoading(false);
    }
  }, [quotationId, locale, tenant, router, t]);

  useEffect(() => { loadData(); }, [loadData]);

  const setWarehouse = (detailId: string, warehouseId: string) => {
    setAssignments(prev => prev.map(a =>
      a.detail.id === detailId ? { ...a, selectedWarehouseId: warehouseId } : a
    ));
  };

  const handleConvert = async () => {
    if (!quotation) return;
    try {
      setConverting(true);
      const items = assignments.map(a => ({
        detail_id: a.detail.id,
        warehouse_id: a.selectedWarehouseId || undefined,
      }));
      const result = await quotationService.convertToSale(quotationId, items, paymentMethod, {
        close_sale: closeSale,
        create_invoice: createInvoice,
        stamp_invoice: stampInvoice,
      });
      toastService.success(result.message);
      router.push(`/${tenant}/${locale}/dashboard/cotizaciones/${quotationId}`);
    } catch (error) {
      toastService.error(error instanceof Error ? error.message : t('messages.errorConverting'));
    } finally {
      setConverting(false);
    }
  };

  const getStockForWarehouse = (item: ItemAssignment, warehouseId: string) => {
    return item.warehouseOptions.find(w => w.id === warehouseId);
  };

  const hasEnoughStock = (item: ItemAssignment) => {
    if (!item.isTangible) return true;
    if (!item.selectedWarehouseId) return true;
    const opt = getStockForWarehouse(item, item.selectedWarehouseId);
    return !opt || opt.totalStock >= Number(item.detail.quantity);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" />
      </div>
    );
  }

  if (!quotation) return null;

  const tangibleItems = assignments.filter(a => a.isTangible);
  const nonTangibleItems = assignments.filter(a => !a.isTangible);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Btn
          variant="ghost"
          onClick={() => router.push(`/${tenant}/${locale}/dashboard/cotizaciones/${quotationId}`)}
          leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
        >
          {t('details.back')}
        </Btn>
        <div>
          <h1 className="text-xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
            {t('actions.convertToSale')} — {quotation.code}
          </h1>
          <p className="text-sm text-gray-500">{quotation.client.name}</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
        {locale === 'en'
          ? 'Select the warehouse for each tangible product. Services and digital products are included automatically. You can proceed even if some products have insufficient stock.'
          : 'Selecciona el almacén para cada producto tangible. Los servicios y productos digitales se incluyen automáticamente. Puedes proceder aunque algunos productos no tengan stock suficiente.'}
      </div>

      {/* Productos tangibles */}
      {tangibleItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">
              {locale === 'en' ? 'Tangible products — select warehouse' : 'Productos tangibles — selecciona almacén'}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {tangibleItems.map(item => {
              return (
                <div key={item.detail.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Producto */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.detail.product.name}</p>
                    <p className="text-xs text-gray-500">{item.detail.product.sku}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {locale === 'en' ? 'Qty:' : 'Cant:'} <span className="font-semibold">{item.detail.quantity}</span>
                      {' · '}
                      {formatCurrency(Number(item.detail.price))}
                    </p>
                  </div>

                  {/* Selector de almacén */}
                  <div className="sm:w-72">
                    {item.loadingStock ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Loading size="sm" />
                        {locale === 'en' ? 'Loading stock...' : 'Cargando stock...'}
                      </div>
                    ) : item.warehouseOptions.length === 0 ? (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600">
                        <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
                        {locale === 'en' ? 'No stock in any warehouse' : 'Sin stock en ningún almacén'}
                      </div>
                    ) : (
                      <div>
                        <select
                          value={item.selectedWarehouseId}
                          onChange={e => setWarehouse(item.detail.id, e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:border-primary-500 bg-white"
                        >
                          <option value="">{locale === 'en' ? '— No warehouse —' : '— Sin almacén —'}</option>
                          {item.warehouseOptions.map(w => (
                            <option key={w.id} value={w.id}>
                              {w.name} — {locale === 'en' ? 'Stock:' : 'Stock:'} {w.totalStock}
                            </option>
                          ))}
                        </select>
                        {/* Indicador de stock */}
                        {item.selectedWarehouseId && (() => {
                          const opt = getStockForWarehouse(item, item.selectedWarehouseId);
                          const enough = hasEnoughStock(item);
                          return opt ? (
                            <p className={`text-xs mt-1 flex items-center gap-1 ${enough ? 'text-green-600' : 'text-amber-600'}`}>
                              {enough
                                ? <><CheckCircleIcon className="h-3.5 w-3.5" /> {locale === 'en' ? 'Sufficient stock' : 'Stock suficiente'}</>
                                : <><ExclamationTriangleIcon className="h-3.5 w-3.5" /> {locale === 'en' ? `Only ${opt.totalStock} available` : `Solo ${opt.totalStock} disponibles`}</>
                              }
                            </p>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Productos no tangibles */}
      {nonTangibleItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">
              {locale === 'en' ? 'Services & digital products — included automatically' : 'Servicios y productos digitales — se incluyen automáticamente'}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {nonTangibleItems.map(item => (
              <div key={item.detail.id} className="px-6 py-4 flex items-center gap-4">
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.detail.product.name}</p>
                  <p className="text-xs text-gray-500">{item.detail.product.sku} · {(item.detail.product as any).type}</p>
                </div>
                <div className="text-sm text-gray-600">
                  {item.detail.quantity} × {formatCurrency(Number(item.detail.price))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Método de pago */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800">
            {locale === 'en' ? 'Payment method' : 'Método de pago'}
          </h2>
        </div>
        <div className="px-6 py-4 flex flex-col sm:flex-row gap-3">
          {[
            { value: 'cash', icon: <BanknotesIcon className="h-4 w-4" />, label: locale === 'en' ? 'Cash' : 'Efectivo', disabled: false },
            { value: 'card', icon: <CreditCardIcon className="h-4 w-4" />, label: locale === 'en' ? 'Card' : 'Tarjeta', disabled: false },
            { value: 'credit', icon: <ClockIcon className="h-4 w-4" />, label: locale === 'en' ? 'Credit' : 'Crédito', disabled: !clientHasCredit },
          ].map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all flex-1 ${
                opt.disabled
                  ? 'opacity-40 cursor-not-allowed border-gray-200'
                  : paymentMethod === opt.value
                    ? 'border-primary-500 bg-primary-50 cursor-pointer'
                    : 'border-gray-200 hover:border-gray-300 cursor-pointer'
              }`}
              style={!opt.disabled && paymentMethod === opt.value ? { borderColor: `rgb(var(--color-primary-500))`, backgroundColor: `rgb(var(--color-primary-50))` } : {}}
            >
              <input
                type="radio"
                name="payment_method"
                value={opt.value}
                checked={paymentMethod === opt.value}
                disabled={opt.disabled}
                onChange={() => !opt.disabled && setPaymentMethod(opt.value as 'cash' | 'card' | 'credit')}
                className="sr-only"
              />
              <span className="text-gray-500">{opt.icon}</span>
              <div>
                <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                {opt.value === 'credit' && !clientHasCredit && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {locale === 'en' ? 'Client has no active credit' : 'El cliente no tiene crédito activo'}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Opciones de procesamiento */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800">
            {locale === 'en' ? 'Processing options' : 'Opciones de procesamiento'}
          </h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          {/* Cerrar venta */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={closeSale}
              onChange={e => {
                setCloseSale(e.target.checked);
                if (!e.target.checked) { setCreateInvoice(false); setStampInvoice(false); }
              }}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 cursor-pointer"
              style={{ accentColor: `rgb(var(--color-primary-600))` }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {locale === 'en' ? 'Close sale' : 'Cerrar venta'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {locale === 'en'
                  ? 'Deducts inventory, registers in cash register and creates accounts receivable if credit.'
                  : 'Descuenta inventario, registra en caja y crea cuenta por cobrar si es crédito.'}
              </p>
            </div>
          </label>

          {/* Crear factura */}
          <label className={`flex items-start gap-3 ${!closeSale ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={createInvoice}
              disabled={!closeSale}
              onChange={e => {
                setCreateInvoice(e.target.checked);
                if (!e.target.checked) setStampInvoice(false);
              }}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 cursor-pointer"
              style={{ accentColor: `rgb(var(--color-primary-600))` }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {locale === 'en' ? 'Create invoice' : 'Crear factura'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {locale === 'en'
                  ? 'Generates a draft invoice linked to this sale.'
                  : 'Genera una factura en borrador vinculada a esta venta.'}
              </p>
            </div>
          </label>

          {/* Timbrar */}
          <label className={`flex items-start gap-3 ${!createInvoice || !hasActivePack ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={stampInvoice}
              disabled={!createInvoice || !hasActivePack}
              onChange={e => setStampInvoice(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 cursor-pointer"
              style={{ accentColor: `rgb(var(--color-primary-600))` }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {locale === 'en' ? 'Stamp CFDI' : 'Timbrar CFDI'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {!hasActivePack
                  ? (locale === 'en'
                      ? 'No active certification pack configured. Configure one in Settings → SAT Packs.'
                      : 'No hay un pack de certificación activo. Configura uno en Configuración → Packs SAT.')
                  : (locale === 'en'
                      ? 'Sends the invoice to the SAT for electronic stamping. Requires active certification pack.'
                      : 'Envía la factura al SAT para su timbrado electrónico. Requiere pack de certificación activo.')}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Resumen y acción */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
        <div>
          <p className="text-sm text-gray-500">{locale === 'en' ? 'Total' : 'Total'}</p>
          <p className="text-xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
            {formatCurrency(quotation.total)}
          </p>
        </div>
        <div className="flex gap-3">
          <Btn
            variant="outline"
            onClick={() => router.push(`/${tenant}/${locale}/dashboard/cotizaciones/${quotationId}`)}
          >
            {t('actions.cancel')}
          </Btn>
          <Btn
            onClick={handleConvert}
            disabled={converting}
            loading={converting}
            className="!bg-green-600 hover:!bg-green-700"
          >
            {converting
              ? (locale === 'en' ? 'Converting...' : 'Convirtiendo...')
              : t('actions.convertToSale')}
          </Btn>
        </div>
      </div>
    </div>
  );
}
