'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  ArrowLeftIcon, ArrowUpTrayIcon, ArrowDownTrayIcon,
  CheckCircleIcon, ExclamationTriangleIcon, DocumentTextIcon,
  ClockIcon, ChevronDownIcon, ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { providerImportService, ImportLog } from '@/services/provider-import.service';

const FIELDS = [
  { name: 'code',            req: true,  type: 'texto',  group: 'provider', desc: { es: 'Código único del proveedor (3-50 chars). No se puede repetir.', en: 'Unique provider code (3-50 chars). Cannot be duplicated.', zh: '供应商唯一编码（3-50位），不可重复。' }, example: 'PROV001' },
  { name: 'name',            req: true,  type: 'texto',  group: 'provider', desc: { es: 'Nombre del proveedor o empresa (3-100 chars).', en: 'Provider or company name (3-100 chars).', zh: '供应商或公司名称（3-100位）。' }, example: 'Distribuidora ABC S.A.' },
  { name: 'description',     req: false, type: 'texto',  group: 'provider', desc: { es: 'Descripción o notas. Si se omite, se usa el nombre.', en: 'Description or notes. If omitted, name is used.', zh: '描述或备注。省略时使用名称。' }, example: 'Proveedor de lácteos' },
  { name: 'phone',           req: false, type: 'texto',  group: 'provider', desc: { es: 'Teléfono de contacto.', en: 'Contact phone.', zh: '联系电话。' }, example: '+52 555 123 4567' },
  { name: 'email',           req: false, type: 'email',  group: 'provider', desc: { es: 'Correo electrónico válido. Se valida el formato.', en: 'Valid email. Format is validated.', zh: '有效的电子邮件地址，格式将被验证。' }, example: 'contacto@abc.com' },
  { name: 'status',          req: false, type: 'opción', group: 'provider', desc: { es: 'true = activo | false = inactivo. Default: true', en: 'true = active | false = inactive. Default: true', zh: 'true = 启用 | false = 禁用。默认：true' }, example: 'true' },
  { name: 'tax_document',    req: false, type: 'texto',  group: 'tax',      desc: { es: 'RFC del proveedor. Si se proporciona, se crea el registro fiscal.', en: 'Provider RFC. If provided, tax record is created.', zh: '供应商RFC。提供后自动创建税务记录。' }, example: 'ABC010101AAA' },
  { name: 'tax_name',        req: false, type: 'texto',  group: 'tax',      desc: { es: 'Razón social. Si se omite, se usa el nombre.', en: 'Legal name. If omitted, provider name is used.', zh: '法定名称。省略时使用供应商名称。' }, example: 'Distribuidora ABC S.A. de C.V.' },
  { name: 'tax_system',      req: false, type: 'código', group: 'tax',      desc: { es: 'Régimen fiscal SAT. Ej: 616, 601, 612', en: 'SAT tax regime. E.g: 616, 601, 612', zh: 'SAT税务制度。例：616，601，612' }, example: '601' },
  { name: 'invoice_use',     req: false, type: 'código', group: 'tax',      desc: { es: 'Uso CFDI. Ej: G03, G01, S01', en: 'CFDI use. E.g: G03, G01, S01', zh: 'CFDI用途。例：G03，G01，S01' }, example: 'G03' },
  { name: 'address_zip',     req: false, type: 'texto',  group: 'addr',     desc: { es: 'Código postal. Si se proporciona, se crea la dirección.', en: 'ZIP code. If provided, address is created.', zh: '邮政编码。提供后自动创建地址。' }, example: '85900' },
  { name: 'address_street',  req: false, type: 'texto',  group: 'addr',     desc: { es: 'Calle y número exterior.', en: 'Street and exterior number.', zh: '街道和门牌号。' }, example: 'Blvd. Industrial 456' },
  { name: 'address_city',    req: false, type: 'texto',  group: 'addr',     desc: { es: 'Ciudad.', en: 'City.', zh: '城市。' }, example: 'Hermosillo' },
  { name: 'address_state',   req: false, type: 'texto',  group: 'addr',     desc: { es: 'Estado o provincia.', en: 'State or province.', zh: '省/州。' }, example: 'Sonora' },
  { name: 'address_country', req: false, type: 'código', group: 'addr',     desc: { es: 'País en código ISO 3 letras. Default: MEX', en: 'Country ISO 3-letter code. Default: MEX', zh: '国家ISO三字母代码。默认：MEX' }, example: 'MEX' },
];

const TYPE_COLORS: Record<string, string> = {
  texto: 'bg-blue-50 text-blue-700', email: 'bg-green-50 text-green-700',
  opción: 'bg-amber-50 text-amber-700', código: 'bg-teal-50 text-teal-700',
};
const GROUP_LABELS: Record<string, Record<string, string>> = {
  provider: { es: 'Datos del proveedor', en: 'Provider data', zh: '供应商数据' },
  tax:      { es: 'Datos fiscales (opcionales — se crean si viene RFC)', en: 'Tax data (optional — created if RFC provided)', zh: '税务数据（可选 — 提供RFC时创建）' },
  addr:     { es: 'Dirección (opcional — se crea si viene código postal)', en: 'Address (optional — created if ZIP provided)', zh: '地址（可选 — 提供邮编时创建）' },
};
const GROUP_COLORS: Record<string, string> = { provider: 'bg-gray-50', tax: 'bg-blue-50/30', addr: 'bg-green-50/30' };

export default function ImportProvidersPage() {
  const locale = useLocale() as 'es' | 'en' | 'zh';
  const router = useRouter();
  const params = useParams();
  const tenant = params?.tenant as string;

  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [queued, setQueued] = useState<{ total: number; message: string } | null>(null);
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<ImportLog[]>([]);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    const logs = await providerImportService.getHistory(10);
    setHistory(logs);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const T = {
    es: { back: 'Volver a proveedores', title: 'Importar Proveedores', subtitle: 'Sube un archivo CSV. Los proveedores con código duplicado serán omitidos automáticamente.', step1: 'Paso 1 — Descarga la plantilla', step1Desc: 'La plantilla incluye columnas para datos del proveedor, datos fiscales y dirección.', download: 'Descargar plantilla CSV', step2: 'Paso 2 — Referencia de campos', colField: 'Campo', colReq: 'Req.', colType: 'Tipo', colDesc: 'Descripción y comportamiento', colExample: 'Ejemplo', step3: 'Paso 3 — Sube el archivo', drag: 'Arrastra tu archivo aquí o haz clic para seleccionar', maxSize: 'Máximo 10 MB · Solo .csv', change: 'Cambiar', importing: 'Importando...', import: 'Importar proveedores', row: 'Fila', code: 'Código', name: 'Nombre', reason: 'Motivo', another: 'Importar otro', goList: 'Ver proveedores', historyTitle: 'Historial de importaciones', historyEmpty: 'No hay importaciones anteriores', historyTotal: 'Total', historyCreated: 'Creados', historyErrors: 'Errores', historyDetail: 'Ver detalle', historyHide: 'Ocultar', statusPending: 'Procesando', statusCompleted: 'Completado', statusFailed: 'Fallido', errorsTitle: 'Detalle de errores — corrígelos y vuelve a importar' },
    en: { back: 'Back to providers', title: 'Import Providers', subtitle: 'Upload a CSV file. Providers with duplicate code will be skipped automatically.', step1: 'Step 1 — Download the template', step1Desc: 'The template includes columns for provider data, tax data and address.', download: 'Download CSV template', step2: 'Step 2 — Field reference', colField: 'Field', colReq: 'Req.', colType: 'Type', colDesc: 'Description & behavior', colExample: 'Example', step3: 'Step 3 — Upload the file', drag: 'Drag your file here or click to select', maxSize: 'Max 10 MB · .csv only', change: 'Change', importing: 'Importing...', import: 'Import providers', row: 'Row', code: 'Code', name: 'Name', reason: 'Reason', another: 'Import another', goList: 'View providers', historyTitle: 'Import history', historyEmpty: 'No previous imports', historyTotal: 'Total', historyCreated: 'Created', historyErrors: 'Errors', historyDetail: 'View detail', historyHide: 'Hide', statusPending: 'Processing', statusCompleted: 'Completed', statusFailed: 'Failed', errorsTitle: 'Error details — fix them and re-import' },
    zh: { back: '返回供应商列表', title: '导入供应商', subtitle: '上传 CSV 文件。编码重复的供应商将被自动跳过。', step1: '第一步 — 下载模板', step1Desc: '模板包含供应商数据、税务数据和地址列。', download: '下载 CSV 模板', step2: '第二步 — 字段参考', colField: '字段', colReq: '必填', colType: '类型', colDesc: '说明与默认值', colExample: '示例', step3: '第三步 — 上传文件', drag: '将文件拖放到此处或点击选择', maxSize: '最大 10 MB · 仅 .csv', change: '更换', importing: '导入中...', import: '导入供应商', row: '行', code: '编码', name: '名称', reason: '原因', another: '导入另一个', goList: '查看供应商', historyTitle: '导入历史', historyEmpty: '暂无导入记录', historyTotal: '总计', historyCreated: '已创建', historyErrors: '错误', historyDetail: '查看详情', historyHide: '隐藏', statusPending: '处理中', statusCompleted: '已完成', statusFailed: '失败', errorsTitle: '错误详情 — 修正后重新导入' },
  };
  const c = T[locale] || T.es;

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv') && !f.name.endsWith('.txt')) { setFileError('Solo se aceptan archivos .csv'); return; }
    if (f.size > 10 * 1024 * 1024) { setFileError('El archivo supera el límite de 10 MB'); return; }
    setFile(f); setFileError('');
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const res = await providerImportService.importCSV(file);
      setQueued({ total: res.total, message: res.message });
    } catch (e: any) { setFileError(e.message || 'Error al importar'); }
    finally { setImporting(false); }
  };

  const goToProviders = () => router.push(`/${tenant}/${locale}/dashboard/proveedores`);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(
    locale === 'zh' ? 'zh-CN' : locale === 'en' ? 'en-US' : 'es-MX',
    { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  );

  const statusBadge = (status: ImportLog['status']) => {
    if (status === 'pending')   return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">{c.statusPending}</span>;
    if (status === 'completed') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{c.statusCompleted}</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">{c.statusFailed}</span>;
  };

  const groups = ['provider', 'tax', 'addr'];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button onClick={goToProviders} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="h-4 w-4" />{c.back}
      </button>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-primary-800))' }}>{c.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{c.subtitle}</p>
      </div>

      {queued ? (
        <div className="bg-white rounded-xl border p-10 text-center space-y-5">
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 rounded-full border-4 animate-spin" style={{ borderColor: 'rgb(var(--color-primary-200))', borderTopColor: 'rgb(var(--color-primary-600))' }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {locale === 'zh' ? '导入正在后台处理中' : locale === 'en' ? 'Import is being processed in the background' : 'Importación procesándose en segundo plano'}
            </h2>
            <p className="text-sm text-gray-500 mt-2">{queued.message}</p>
            <p className="text-xs text-gray-400 mt-3">
              {locale === 'zh' ? '完成后您将在通知铃中收到通知。' : locale === 'en' ? 'You will receive a notification in the bell when done.' : 'Recibirás una notificación en el bell cuando termine.'}
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => { setQueued(null); setFile(null); setFileError(''); loadHistory(); }} className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">{c.another}</button>
            <button onClick={goToProviders} className="px-4 py-2 text-sm font-semibold text-white rounded-lg" style={{ backgroundColor: 'rgb(var(--color-primary-600))' }}>{c.goList}</button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Paso 1 */}
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'rgb(var(--color-primary-600))' }}>1</span>
                <h2 className="text-sm font-semibold text-gray-800">{c.step1}</h2>
              </div>
              <p className="text-xs text-gray-500 mb-4">{c.step1Desc}</p>
              <button onClick={() => providerImportService.downloadTemplate(locale)} className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border w-full justify-center hover:bg-gray-50 transition-colors" style={{ color: 'rgb(var(--color-primary-600))', borderColor: 'rgb(var(--color-primary-200))' }}>
                <ArrowDownTrayIcon className="h-4 w-4" />{c.download}
              </button>
            </div>
            {/* Paso 3 */}
            <div className="bg-white rounded-xl border p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'rgb(var(--color-primary-600))' }}>3</span>
                <h2 className="text-sm font-semibold text-gray-800">{c.step3}</h2>
              </div>
              <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }} onClick={() => !file && inputRef.current?.click()} className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-colors ${file ? 'border-green-300 bg-green-50 cursor-default' : dragging ? 'border-primary-400 bg-primary-50 cursor-copy' : 'border-gray-200 hover:border-gray-300 cursor-pointer'}`} style={{ minHeight: '140px' }}>
                {file ? (
                  <div className="text-center">
                    <DocumentTextIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline">{c.change}</button>
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
              <button onClick={handleImport} disabled={!file || importing} className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-40" style={{ backgroundColor: 'rgb(var(--color-primary-600))' }}>
                {importing && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {importing ? c.importing : c.import}
              </button>
            </div>
          </div>

          {/* Paso 2 — tabla de campos agrupada */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b bg-gray-50">
              <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'rgb(var(--color-primary-600))' }}>2</span>
              <h2 className="text-sm font-semibold text-gray-800">{c.step2}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide w-40">{c.colField}</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-500 uppercase tracking-wide w-16">{c.colReq}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide w-24">{c.colType}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide">{c.colDesc}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide w-44">{c.colExample}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groups.map(group => {
                    const groupFields = FIELDS.filter(f => f.group === group);
                    return (
                      <>
                        <tr key={`group-${group}`} className="border-t-2 border-gray-200">
                          <td colSpan={5} className={`px-4 py-2 text-xs font-semibold text-gray-600 ${GROUP_COLORS[group]}`}>
                            {GROUP_LABELS[group][locale] || GROUP_LABELS[group].es}
                          </td>
                        </tr>
                        {groupFields.map(f => (
                          <tr key={f.name} className={f.req ? 'bg-red-50/40' : `${GROUP_COLORS[group]} hover:brightness-95`}>
                            <td className="px-4 py-3"><code className={`px-1.5 py-0.5 rounded text-xs font-mono font-semibold ${f.req ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{f.name}</code></td>
                            <td className="px-4 py-3 text-center">{f.req ? <span className="inline-flex w-5 h-5 rounded-full bg-red-500 text-white text-xs items-center justify-center font-bold">✓</span> : <span className="text-gray-300 text-base">—</span>}</td>
                            <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[f.type] || 'bg-gray-100 text-gray-600'}`}>{f.type}</span></td>
                            <td className="px-4 py-3 text-gray-600 leading-relaxed">{f.desc[locale] || f.desc.es}</td>
                            <td className="px-4 py-3"><code className="text-gray-500 font-mono text-xs">{f.example}</code></td>
                          </tr>
                        ))}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Historial */}
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
                    {log.summary && <p className="text-xs text-gray-600 mt-1 truncate">{log.summary}</p>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0">
                    <span className="text-center"><span className="block font-semibold text-gray-700">{log.total_rows}</span>{c.historyTotal}</span>
                    <span className="text-center"><span className="block font-semibold text-green-600">{log.created_count}</span>{c.historyCreated}</span>
                    <span className="text-center"><span className="block font-semibold text-red-600">{log.error_count}</span>{c.historyErrors}</span>
                    {log.errors?.length ? (
                      <button onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)} className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-600">
                        {expandedLog === log.id ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
                        {expandedLog === log.id ? c.historyHide : c.historyDetail}
                      </button>
                    ) : null}
                  </div>
                </div>
                {expandedLog === log.id && log.errors && log.errors.length > 0 && (
                  <div className="px-5 pb-4 bg-gray-50 border-t">
                    <p className="text-xs font-semibold text-red-600 mb-2 mt-3">{c.errorsTitle}</p>
                    <div className="border border-red-200 rounded-lg overflow-hidden">
                      <table className="min-w-full text-xs">
                        <thead className="bg-red-50 border-b border-red-200">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-red-700 w-12">{c.row}</th>
                            <th className="px-3 py-2 text-left font-semibold text-red-700 w-28">{c.code}</th>
                            <th className="px-3 py-2 text-left font-semibold text-red-700">{c.name}</th>
                            <th className="px-3 py-2 text-left font-semibold text-red-700">{c.reason}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-100 bg-white">
                          {log.errors.map((e: any, i: number) => (
                            <tr key={i}>
                              <td className="px-3 py-2 font-mono text-gray-500">{e.row}</td>
                              <td className="px-3 py-2 font-mono text-gray-700">{e.code || '—'}</td>
                              <td className="px-3 py-2 text-gray-700">{e.name || '—'}</td>
                              <td className="px-3 py-2 text-red-600">{e.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
