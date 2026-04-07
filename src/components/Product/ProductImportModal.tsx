'use client';

import { useState, useRef } from 'react';
import { useLocale } from 'next-intl';
import { XMarkIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { productImportService, ImportResult } from '@/services/product-import.service';

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COPY = {
  es: {
    title: 'Importar Productos desde CSV',
    desc: 'Sube un archivo CSV con tus productos. Los que ya existan (mismo SKU) serán omitidos.',
    download: 'Descargar plantilla CSV',
    required: 'Campos requeridos',
    optional: 'Campos opcionales',
    selectFile: 'Seleccionar archivo CSV',
    dragDrop: 'o arrastra y suelta aquí',
    maxSize: 'Máximo 5 MB · Solo .csv',
    importing: 'Importando...',
    import: 'Importar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    resultTitle: 'Resultado de la importación',
    created: 'Creados',
    skipped: 'Omitidos (duplicados)',
    errors: 'Con errores',
    errorsTitle: 'Detalle de errores',
    rowLabel: 'Fila',
    skuLabel: 'SKU',
    nameLabel: 'Nombre',
    reasonLabel: 'Motivo',
  },
  en: {
    title: 'Import Products from CSV',
    desc: 'Upload a CSV file with your products. Existing ones (same SKU) will be skipped.',
    download: 'Download CSV template',
    required: 'Required fields',
    optional: 'Optional fields',
    selectFile: 'Select CSV file',
    dragDrop: 'or drag and drop here',
    maxSize: 'Max 5 MB · .csv only',
    importing: 'Importing...',
    import: 'Import',
    cancel: 'Cancel',
    close: 'Close',
    resultTitle: 'Import result',
    created: 'Created',
    skipped: 'Skipped (duplicates)',
    errors: 'With errors',
    errorsTitle: 'Error details',
    rowLabel: 'Row',
    skuLabel: 'SKU',
    nameLabel: 'Name',
    reasonLabel: 'Reason',
  },
  zh: {
    title: '从 CSV 导入产品',
    desc: '上传包含产品的 CSV 文件。已存在的产品（相同 SKU）将被跳过。',
    download: '下载 CSV 模板',
    required: '必填字段',
    optional: '可选字段',
    selectFile: '选择 CSV 文件',
    dragDrop: '或拖放到此处',
    maxSize: '最大 5 MB · 仅 .csv',
    importing: '导入中...',
    import: '导入',
    cancel: '取消',
    close: '关闭',
    resultTitle: '导入结果',
    created: '已创建',
    skipped: '已跳过（重复）',
    errors: '有错误',
    errorsTitle: '错误详情',
    rowLabel: '行',
    skuLabel: 'SKU',
    nameLabel: '名称',
    reasonLabel: '原因',
  },
};

export default function ProductImportModal({ isOpen, onClose, onSuccess }: ProductImportModalProps) {
  const locale = useLocale() as 'es' | 'en' | 'zh';
  const c = COPY[locale] || COPY.es;
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv') && !f.name.endsWith('.txt')) {
      setError('Solo se aceptan archivos .csv');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('El archivo supera el límite de 5 MB');
      return;
    }
    setFile(f);
    setError('');
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError('');
    try {
      const res = await productImportService.importCSV(file);
      setResult(res);
      if (res.created > 0) onSuccess();
    } catch (e: any) {
      setError(e.message || 'Error al importar');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{c.title}</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {!result ? (
            <>
              <p className="text-sm text-gray-500">{c.desc}</p>

              {/* Campos requeridos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-700 mb-2">{c.required} *</p>
                  <ul className="text-xs text-red-600 space-y-1">
                    <li><code>name</code> — Nombre del producto</li>
                    <li><code>sku</code> — Código único interno</li>
                    <li><code>code</code> — Código SAT (8+ chars)</li>
                    <li><code>measurement_unit</code> — Código de unidad (ej: H87, LTR)</li>
                  </ul>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">{c.optional}</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li><code>description</code>, <code>base_price</code></li>
                    <li><code>type</code>: tangible / service / digital</li>
                    <li><code>inventory_strategy</code>: fifo / fefo / average</li>
                    <li><code>brand</code>, <code>category</code>, <code>barcode</code></li>
                    <li><code>min_stock</code>, <code>weight</code>, <code>width</code>, <code>height</code>, <code>length</code></li>
                  </ul>
                </div>
              </div>

              {/* Descargar plantilla */}
              <button
                onClick={() => productImportService.downloadTemplate()}
                className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                style={{ color: 'rgb(var(--color-primary-600))' }}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                {c.download}
              </button>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <ArrowUpTrayIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                {file ? (
                  <p className="text-sm font-medium text-gray-700">{file.name} <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span></p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-600">{c.selectFile}</p>
                    <p className="text-xs text-gray-400 mt-1">{c.dragDrop}</p>
                    <p className="text-xs text-gray-400">{c.maxSize}</p>
                  </>
                )}
                <input ref={inputRef} type="file" accept=".csv,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            </>
          ) : (
            /* Resultado */
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">{c.resultTitle}</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{result.created}</p>
                  <p className="text-xs text-green-600 mt-1">{c.created}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-700">{result.skipped}</p>
                  <p className="text-xs text-yellow-600 mt-1">{c.skipped}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-700">{result.errors.length}</p>
                  <p className="text-xs text-red-600 mt-1">{c.errors}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{result.summary}</p>

              {result.errors.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                    {c.errorsTitle}
                  </p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-gray-500 font-medium">{c.rowLabel}</th>
                          <th className="px-3 py-2 text-left text-gray-500 font-medium">{c.skuLabel}</th>
                          <th className="px-3 py-2 text-left text-gray-500 font-medium">{c.nameLabel}</th>
                          <th className="px-3 py-2 text-left text-gray-500 font-medium">{c.reasonLabel}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {result.errors.map((e, i) => (
                          <tr key={i} className="hover:bg-red-50">
                            <td className="px-3 py-2 text-gray-600">{e.row}</td>
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

              {result.created > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
                  La lista de productos se ha actualizado.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          {!result ? (
            <>
              <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                {c.cancel}
              </button>
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: 'rgb(var(--color-primary-600))' }}
              >
                {importing && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {importing ? c.importing : c.import}
              </button>
            </>
          ) : (
            <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: 'rgb(var(--color-primary-600))' }}>
              {c.close}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
