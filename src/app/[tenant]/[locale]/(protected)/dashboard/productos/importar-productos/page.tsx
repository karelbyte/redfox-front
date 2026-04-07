'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  ArrowLeftIcon, ArrowUpTrayIcon, ArrowDownTrayIcon,
  CheckCircleIcon, ExclamationTriangleIcon, DocumentTextIcon,
  ClockIcon, ChevronDownIcon, ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { productImportService, ImportResult, ImportLog } from '@/services/product-import.service';

const FIELDS = [
  { name: 'name',               req: true,  type: 'texto',   desc: { es: 'Nombre del producto', en: 'Product name', zh: '产品名称' },                                                                                                                    example: 'Leche Entera 1L' },
  { name: 'sku',                req: true,  type: 'texto',   desc: { es: 'Código único interno (no se puede repetir)', en: 'Unique internal code (no duplicates)', zh: '唯一内部编码（不可重复）' },                                                       example: 'LECH-001' },
  { name: 'code',               req: true,  type: 'texto',   desc: { es: 'Código SAT (mínimo 8 caracteres)', en: 'SAT code (min 8 chars)', zh: 'SAT 编码（最少8位）' },                                                                                   example: '50211503' },
  { name: 'measurement_unit',   req: true,  type: 'código',  desc: { es: 'Código de unidad SAT. H87=Pieza, LTR=Litro, E48=Servicio, KGM=Kg, MTR=Metro', en: 'SAT unit code. H87=Piece, LTR=Liter, E48=Service, KGM=Kg', zh: 'SAT单位代码。H87=件，LTR=升，E48=服务，KGM=千克' }, example: 'H87' },
  { name: 'description',        req: false, type: 'texto',   desc: { es: 'Descripción del producto. Si se omite, se usa el nombre automáticamente.', en: 'Product description. If omitted, name is used automatically.', zh: '产品描述。省略时自动使用名称。' },                                                         example: 'Leche entera pasteurizada 1 litro' },
  { name: 'base_price',         req: false, type: 'decimal', desc: { es: 'Precio base de venta. Si se omite, queda en 0.00 y se puede editar después.', en: 'Base selling price. If omitted, defaults to 0.00.', zh: '基础售价。省略时默认为0.00，可后续编辑。' },                                                              example: '25.00' },
  { name: 'type',               req: false, type: 'opción',  desc: { es: 'Tipo de producto: tangible | service | digital. Si se omite, se asume tangible.', en: 'Product type: tangible | service | digital. Default: tangible.', zh: '产品类型：tangible | service | digital。默认：tangible。' },                       example: 'tangible' },
  { name: 'inventory_strategy', req: false, type: 'opción',  desc: { es: 'Estrategia de inventario: fifo | fefo | average. Si se omite, se usa average (promedio ponderado).', en: 'Inventory strategy: fifo | fefo | average. Default: average.', zh: '库存策略：fifo | fefo | average。默认：average（加权平均）。' },                        example: 'average' },
  { name: 'brand',              req: false, type: 'texto',   desc: { es: 'Nombre exacto de la marca. Debe existir previamente en el sistema.', en: 'Exact brand name. Must already exist in the system.', zh: '品牌名称（须已存在于系统中）' },          example: 'Lala' },
  { name: 'category',           req: false, type: 'texto',   desc: { es: 'Nombre exacto de la categoría. Debe existir previamente en el sistema.', en: 'Exact category name. Must already exist in the system.', zh: '分类名称（须已存在于系统中）' },             example: 'Lácteos' },
  { name: 'barcode',            req: false, type: 'texto',   desc: { es: 'Código de barras EAN-13 o UPC', en: 'EAN-13 or UPC barcode', zh: 'EAN-13 或 UPC 条形码' },                                                       example: '7501055300018' },
  { name: 'min_stock',          req: false, type: 'entero',  desc: { es: 'Stock mínimo para alertas. Si se omite, queda en 0 (sin alerta).', en: 'Minimum stock for alerts. Default: 0 (no alert).', zh: '库存预警最低值。默认：0（无预警）。' },                                example: '10' },
  { name: 'weight',             req: false, type: 'decimal', desc: { es: 'Peso en kilogramos', en: 'Weight in kilograms', zh: '重量（千克）' },                                                            example: '1.0' },
  { name: 'width',              req: false, type: 'decimal', desc: { es: 'Ancho en metros', en: 'Width in meters', zh: '宽度（米）' },                                                                     example: '0.10' },
  { name: 'height',             req: false, type: 'decimal', desc: { es: 'Alto en metros', en: 'Height in meters', zh: '高度（米）' },                                                                     example: '0.25' },
  { name: 'length',             req: false, type: 'decimal', desc: { es: 'Largo en metros', en: 'Length in meters', zh: '长度（米）' },                                                                    example: '0.10' },
];

const TYPE_COLORS: Record<string, string> = {
  texto:   'bg-blue-50 text-blue-700',
  decimal: 'bg-purple-50 text-purple-700',
  entero:  'bg-indigo-50 text-indigo-700',
  opción:  'bg-amber-50 text-amber-700',
  código:  'bg-teal-50 text-teal-700',
};

export default function ImportProductsPage() {
  const locale = useLocale() as 'es' | 'en' | 'zh';
  const router = useRouter();
  const params = useParams();
  const tenant = params?.tenant as string;

  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [queued, setQueued] = useState<{ total: number; message: string } | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<ImportLog[]>([]);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    const logs = await productImportService.getHistory(10);
    setHistory(logs);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const T = {
    es: { back: 'Volver a productos', title: 'Importar Productos', subtitle: 'Sube un archivo CSV. Los productos con SKU duplicado serán omitidos automáticamente.', step1: 'Paso 1 — Descarga la plantilla', step1Desc: 'La plantilla incluye los nombres de columnas y ejemplos listos para completar.', download: 'Descargar plantilla CSV', step2: 'Paso 2 — Referencia de campos', colField: 'Campo', colReq: 'Req.', colType: 'Tipo', colDesc: 'Descripción y comportamiento', colExample: 'Ejemplo', step3: 'Paso 3 — Sube el archivo', drag: 'Arrastra tu archivo aquí o haz clic para seleccionar', maxSize: 'Máximo 5 MB · Solo .csv', selected: 'Archivo seleccionado', change: 'Cambiar', importing: 'Importando...', import: 'Importar productos', resultTitle: 'Resultado', created: 'Creados', skipped: 'Omitidos', errors: 'Errores', errorsTitle: 'Detalle de errores — corrígelos y vuelve a importar', row: 'Fila', sku: 'SKU', name: 'Nombre', reason: 'Motivo', another: 'Importar otro', goList: 'Ver productos', historyTitle: 'Historial de importaciones', historyEmpty: 'No hay importaciones anteriores', historyDate: 'Fecha', historyStatus: 'Estado', historyTotal: 'Total', historyCreated: 'Creados', historyErrors: 'Errores', historyDetail: 'Ver detalle', historyHide: 'Ocultar', statusPending: 'Procesando', statusCompleted: 'Completado', statusFailed: 'Fallido' },
    en: { back: 'Back to products', title: 'Import Products', subtitle: 'Upload a CSV file. Products with duplicate SKU will be skipped automatically.', step1: 'Step 1 — Download the template', step1Desc: 'The template includes column names and examples ready to fill.', download: 'Download CSV template', step2: 'Step 2 — Field reference', colField: 'Field', colReq: 'Req.', colType: 'Type', colDesc: 'Description & behavior', colExample: 'Example', step3: 'Step 3 — Upload the file', drag: 'Drag your file here or click to select', maxSize: 'Max 5 MB · .csv only', selected: 'Selected file', change: 'Change', importing: 'Importing...', import: 'Import products', resultTitle: 'Result', created: 'Created', skipped: 'Skipped', errors: 'Errors', errorsTitle: 'Error details — fix them and re-import', row: 'Row', sku: 'SKU', name: 'Name', reason: 'Reason', another: 'Import another', goList: 'View products', historyTitle: 'Import history', historyEmpty: 'No previous imports', historyDate: 'Date', historyStatus: 'Status', historyTotal: 'Total', historyCreated: 'Created', historyErrors: 'Errors', historyDetail: 'View detail', historyHide: 'Hide', statusPending: 'Processing', statusCompleted: 'Completed', statusFailed: 'Failed' },
    zh: { back: '返回产品列表', title: '导入产品', subtitle: '上传 CSV 文件。SKU 重复的产品将被自动跳过。', step1: '第一步 — 下载模板', step1Desc: '模板包含列名和示例，填写后直接上传。', download: '下载 CSV 模板', step2: '第二步 — 字段参考', colField: '字段', colReq: '必填', colType: '类型', colDesc: '说明与默认值', colExample: '示例', step3: '第三步 — 上传文件', drag: '将文件拖放到此处或点击选择', maxSize: '最大 5 MB · 仅 .csv', selected: '已选文件', change: '更换', importing: '导入中...', import: '导入产品', resultTitle: '结果', created: '已创建', skipped: '已跳过', errors: '错误', errorsTitle: '错误详情 — 修正后重新导入', row: '行', sku: 'SKU', name: '名称', reason: '原因', another: '导入另一个', goList: '查看产品', historyTitle: '导入历史', historyEmpty: '暂无导入记录', historyDate: '日期', historyStatus: '状态', historyTotal: '总计', historyCreated: '已创建', historyErrors: '错误', historyDetail: '查看详情', historyHide: '隐藏', statusPending: '处理中', statusCompleted: '已完成', statusFailed: '失败' },
  };
  const c = T[locale] || T.es;

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv') && !f.name.endsWith('.txt')) { setFileError('Solo se aceptan archivos .csv'); return; }
    if (f.size > 5 * 1024 * 1024) { setFileError('El archivo supera el límite de 5 MB'); return; }
    setFile(f); setFileError(''); setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const res = await productImportService.importCSV(file);
      if ((res as any).status === 'queued') {
        setQueued({ total: (res as any).total, message: (res as any).message });
      } else {
        setResult(res as ImportResult);
      }
    }
    catch (e: any) { setFileError(e.message || 'Error al importar'); }
    finally { setImporting(false); }
  };

  const goToProducts = () => router.push(`/${tenant}/${locale}/dashboard/productos/lista-de-productos`);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'en' ? 'en-US' : 'es-MX', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const statusBadge = (status: ImportLog['status']) => {
    if (status === 'pending')   return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">{c.statusPending}</span>;
    if (status === 'completed') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{c.statusCompleted}</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">{c.statusFailed}</span>;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button onClick={goToProducts} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="h-4 w-4" />{c.back}
      </button>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-primary-800))' }}>{c.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{c.subtitle}</p>
      </div>

      {queued ? (
        /* Pantalla de trabajo en cola */
        <div className="bg-white rounded-xl border p-10 text-center space-y-5">
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" style={{ borderTopColor: 'rgb(var(--color-primary-600))' }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {locale === 'zh' ? '导入正在后台处理中' : locale === 'en' ? 'Import is being processed in the background' : 'Importación procesándose en segundo plano'}
            </h2>
            <p className="text-sm text-gray-500 mt-2">{queued.message}</p>
            <p className="text-xs text-gray-400 mt-3">
              {locale === 'zh' ? '完成后您将在通知铃中收到通知。您可以继续使用系统。' : locale === 'en' ? 'You will receive a notification in the bell when done. You can continue using the system.' : 'Recibirás una notificación en el bell cuando termine. Puedes seguir usando el sistema.'}
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => { setQueued(null); setFile(null); setFileError(''); loadHistory(); }}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              {locale === 'zh' ? '导入另一个' : locale === 'en' ? 'Import another' : 'Importar otro'}
            </button>
            <button
              onClick={goToProducts}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg"
              style={{ backgroundColor: 'rgb(var(--color-primary-600))' }}
            >
              {locale === 'zh' ? '查看产品' : locale === 'en' ? 'View products' : 'Ver productos'}
            </button>
          </div>
        </div>
      ) : !result ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Paso 1 */}
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'rgb(var(--color-primary-600))' }}>1</span>
                <h2 className="text-sm font-semibold text-gray-800">{c.step1}</h2>
              </div>
              <p className="text-xs text-gray-500 mb-4">{c.step1Desc}</p>
              <button
                onClick={() => productImportService.downloadTemplate(locale)}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border w-full justify-center hover:bg-gray-50 transition-colors"
                style={{ color: 'rgb(var(--color-primary-600))', borderColor: 'rgb(var(--color-primary-200))' }}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />{c.download}
              </button>
            </div>

            {/* Paso 3 */}
            <div className="bg-white rounded-xl border p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'rgb(var(--color-primary-600))' }}>3</span>
                <h2 className="text-sm font-semibold text-gray-800">{c.step3}</h2>
              </div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => !file && inputRef.current?.click()}
                className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-colors ${file ? 'border-green-300 bg-green-50 cursor-default' : dragging ? 'border-primary-400 bg-primary-50 cursor-copy' : 'border-gray-200 hover:border-gray-300 cursor-pointer'}`}
                style={{ minHeight: '140px' }}
              >
                {file ? (
                  <div className="text-center">
                    <DocumentTextIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }} className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline">{c.change}</button>
                  </div>
                ) : (
                  <div className="text-center">
                    <ArrowUpTrayIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">{c.drag}</p>
                    <p className="text-xs text-gray-400 mt-1">{c.maxSize}</p>
                  </div>
                )}
                <input ref={inputRef} type="file" accept=".csv,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
              {fileError && <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{fileError}</p>}
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-40"
                style={{ backgroundColor: 'rgb(var(--color-primary-600))' }}
              >
                {importing && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {importing ? c.importing : c.import}
              </button>
            </div>
          </div>

          {/* Paso 2 — tabla de campos */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b bg-gray-50">
              <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'rgb(var(--color-primary-600))' }}>2</span>
              <h2 className="text-sm font-semibold text-gray-800">{c.step2}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide w-44">{c.colField}</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-500 uppercase tracking-wide w-16">{c.colReq}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide w-24">{c.colType}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide">{c.colDesc}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide w-44">{c.colExample}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {FIELDS.map((f) => (
                    <tr key={f.name} className={f.req ? 'bg-red-50/40' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <code className={`px-1.5 py-0.5 rounded text-xs font-mono font-semibold ${f.req ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {f.name}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {f.req
                          ? <span className="inline-flex w-5 h-5 rounded-full bg-red-500 text-white text-xs items-center justify-center font-bold">✓</span>
                          : <span className="text-gray-300 text-base">—</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[f.type] || 'bg-gray-100 text-gray-600'}`}>
                          {f.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 leading-relaxed">{f.desc[locale] || f.desc.es}</td>
                      <td className="px-4 py-3">
                        <code className="text-gray-500 font-mono text-xs">{f.example}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">{c.resultTitle}</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
              <CheckCircleIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-3xl font-bold text-green-700">{result.created}</p>
              <p className="text-sm text-green-600 mt-1">{c.created}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-yellow-700">{result.skipped}</p>
              <p className="text-sm text-yellow-600 mt-1">{c.skipped}</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-amber-700">{result.warnings?.length ?? 0}</p>
              <p className="text-sm text-amber-600 mt-1">{locale === 'zh' ? '警告' : locale === 'en' ? 'Warnings' : 'Advertencias'}</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-red-700">{result.errors.length}</p>
              <p className="text-sm text-red-600 mt-1">{c.errors}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">{result.summary}</p>
          {result.warnings && result.warnings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-semibold text-amber-700">
                  {locale === 'zh' ? `${result.warnings.length} 条警告 — 产品已创建，但部分字段未找到` : locale === 'en' ? `${result.warnings.length} warnings — products created but some fields not found` : `${result.warnings.length} advertencias — productos creados pero algunos campos no se encontraron`}
                </h3>
              </div>
              <div className="border border-amber-200 rounded-xl overflow-hidden">
                <table className="min-w-full text-xs">
                  <thead className="bg-amber-50 border-b border-amber-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-amber-700 uppercase w-16">{c.row}</th>
                      <th className="px-4 py-2 text-left font-semibold text-amber-700 uppercase w-32">{c.sku}</th>
                      <th className="px-4 py-2 text-left font-semibold text-amber-700 uppercase">{c.name}</th>
                      <th className="px-4 py-2 text-left font-semibold text-amber-700 uppercase">{c.reason}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {result.warnings.map((w, i) => (
                      <tr key={i} className="hover:bg-amber-50">
                        <td className="px-4 py-2 text-gray-500 font-mono">{w.row}</td>
                        <td className="px-4 py-2 font-mono text-gray-700">{w.sku || '—'}</td>
                        <td className="px-4 py-2 text-gray-700">{w.name || '—'}</td>
                        <td className="px-4 py-2 text-amber-700">{w.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {result.errors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-700">{c.errorsTitle}</h3>
              </div>
              <div className="border rounded-xl overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-16">{c.row}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-32">{c.sku}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{c.name}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{c.reason}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.errors.map((e, i) => (
                      <tr key={i} className="hover:bg-red-50">
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{e.row}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">{e.sku || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{e.name || '—'}</td>
                        <td className="px-4 py-3 text-xs text-red-600">{e.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => { setFile(null); setResult(null); setFileError(''); }} className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">{c.another}</button>
            <button onClick={goToProducts} className="px-4 py-2 text-sm font-semibold text-white rounded-lg" style={{ backgroundColor: 'rgb(var(--color-primary-600))' }}>{c.goList}</button>
          </div>
        </div>
      )}

      {/* Historial de importaciones */}
      <div className="mt-8 bg-white rounded-xl border overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b bg-gray-50">
          <ClockIcon className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-800">{c.historyTitle}</h2>
          <button onClick={loadHistory} className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline">↻</button>
        </div>
        {history.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400 text-center">{c.historyEmpty}</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map(log => (
              <div key={log.id}>
                <div className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      {statusBadge(log.status)}
                      <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                    </div>
                    {log.summary && (
                      <p className="text-xs text-gray-600 mt-1 truncate">{log.summary}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0">
                    <span className="text-center"><span className="block font-semibold text-gray-700">{log.total_rows}</span>{c.historyTotal}</span>
                    <span className="text-center"><span className="block font-semibold text-green-600">{log.created_count}</span>{c.historyCreated}</span>
                    <span className="text-center"><span className="block font-semibold text-red-600">{log.error_count}</span>{c.historyErrors}</span>
                    {(log.errors?.length || log.pack_warnings?.length) ? (
                      <button
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-600"
                      >
                        {expandedLog === log.id ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
                        {expandedLog === log.id ? c.historyHide : c.historyDetail}
                      </button>
                    ) : null}
                  </div>
                </div>
                {expandedLog === log.id && (
                  <div className="px-5 pb-4 space-y-3 bg-gray-50 border-t">
                    {log.errors && log.errors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-red-600 mb-2">{c.errorsTitle}</p>
                        <div className="border border-red-200 rounded-lg overflow-hidden">
                          <table className="min-w-full text-xs">
                            <thead className="bg-red-50 border-b border-red-200">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold text-red-700 w-12">{c.row}</th>
                                <th className="px-3 py-2 text-left font-semibold text-red-700 w-28">{c.sku}</th>
                                <th className="px-3 py-2 text-left font-semibold text-red-700">{c.name}</th>
                                <th className="px-3 py-2 text-left font-semibold text-red-700">{c.reason}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-red-100 bg-white">
                              {log.errors.map((e: any, i: number) => (
                                <tr key={i}>
                                  <td className="px-3 py-2 font-mono text-gray-500">{e.row}</td>
                                  <td className="px-3 py-2 font-mono text-gray-700">{e.sku || '—'}</td>
                                  <td className="px-3 py-2 text-gray-700">{e.name || '—'}</td>
                                  <td className="px-3 py-2 text-red-600">{e.reason}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {log.pack_warnings && log.pack_warnings.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-amber-600 mb-2">
                          {locale === 'zh' ? '字段警告' : locale === 'en' ? 'Field warnings' : 'Advertencias de campos'}
                        </p>
                        <div className="border border-amber-200 rounded-lg overflow-hidden">
                          <table className="min-w-full text-xs">
                            <thead className="bg-amber-50 border-b border-amber-200">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold text-amber-700 w-12">{c.row}</th>
                                <th className="px-3 py-2 text-left font-semibold text-amber-700 w-28">{c.sku}</th>
                                <th className="px-3 py-2 text-left font-semibold text-amber-700">{c.name}</th>
                                <th className="px-3 py-2 text-left font-semibold text-amber-700">{c.reason}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100 bg-white">
                              {log.pack_warnings.map((w: any, i: number) => (
                                <tr key={i}>
                                  <td className="px-3 py-2 font-mono text-gray-500">{w.row || '—'}</td>
                                  <td className="px-3 py-2 font-mono text-gray-700">{w.sku || '—'}</td>
                                  <td className="px-3 py-2 text-gray-700">{w.name || '—'}</td>
                                  <td className="px-3 py-2 text-amber-700">{w.reason}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
