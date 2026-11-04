'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from 'next-intl';
import { toast } from 'react-hot-toast';
import { sipService, type SipUploadResult, type SipFile } from '@/services/sip.service';
import { API_BASE_URL } from '@/lib/config';

const MAX_SIP_SIZE_MB = 300;
const MAX_SIP_SIZE = MAX_SIP_SIZE_MB * 1024 * 1024;

export default function ProductUpPage() {
  const { user, isLoading } = useAuth();
  const locale = useLocale();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<SipUploadResult | null>(null);
  const [files, setFiles] = useState<SipFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const isAdmin = user?.admin || user?.roles?.some((r: any) => r.code === 'SUPER_ADMIN' || r.code === 'ADMIN');

  const loadFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      setFiles(await sipService.listSips());
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar la lista de SIP');
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) {
      toast.error('Acceso denegado: solo administradores');
      return;
    }
    loadFiles();
  }, [isAdmin, isLoading, loadFiles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Acceso denegado</h1>
          <p className="text-gray-600 mb-6">Solo los usuarios administradores pueden acceder a esta secci\u00f3n.</p>
          <a href="/" className="text-blue-600 hover:text-blue-500 font-medium">
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setUploaded(null);
    if (selectedFile && !selectedFile.name.toLowerCase().endsWith('.zip')) {
      toast.error('Solo se permiten archivos ZIP');
      setFile(null);
      return;
    }
    if (selectedFile && selectedFile.size > MAX_SIP_SIZE) {
      toast.error(`El archivo supera el máximo de ${MAX_SIP_SIZE_MB} MB`);
      setFile(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const form = e.currentTarget as HTMLFormElement;
    setUploading(true);
    setUploaded(null);

    try {
      const result = await sipService.uploadSip(file);
      setUploaded(result);
      toast.success(result.message);
      setFile(null);
      form.reset();
      await loadFiles();
    } catch (error: any) {
      toast.error(error.message || 'Error al subir el SIP');
    } finally {
      setUploading(false);
    }
  };

  const translations = {
    es: {
      title: 'Cargar SIP',
      subtitle: 'Sube un archivo ZIP con el SIP para procesarlo',
      chooseFile: 'Seleccionar archivo ZIP',
      upload: 'Subir SIP',
      uploading: 'Subiendo...',
      success: 'SIP subido correctamente',
      maxSize: 'Máximo 300 MB · Solo archivos .zip',
      fileName: 'Archivo:',
      fileSize: 'Tama\u00f1o:',
      storedIn: 'Almacenado en:',
      adminOnly: 'Solo para administradores',
      listTitle: 'SIP subidos',
      listCount: (n: number) => `${n} archivo${n === 1 ? '' : 's'}`,
      refresh: 'Actualizar',
      loading: 'Cargando...',
      empty: 'Todavía no has subido ningún SIP',
      emptyHint: 'Los archivos ZIP que subas aparecerán aquí.',
      colFile: 'Archivo',
      colSize: 'Tamaño',
      colDate: 'Subido',
      colActions: 'Acciones',
      download: 'Descargar',
      delete: 'Eliminar',
      deleting: 'Eliminando...',
      confirmDelete: '¿Estás seguro de que deseas eliminar este SIP? Esta acción no se puede deshacer.',
      deleted: 'SIP eliminado correctamente',
      deleteError: 'Error al eliminar el SIP',
    },
    en: {
      title: 'Upload SIP',
      subtitle: 'Upload a ZIP file with the SIP to process it',
      chooseFile: 'Choose ZIP file',
      upload: 'Upload SIP',
      uploading: 'Uploading...',
      success: 'SIP uploaded successfully',
      maxSize: 'Max 300 MB · .zip files only',
      fileName: 'File:',
      fileSize: 'Size:',
      storedIn: 'Stored at:',
      adminOnly: 'Admins only',
      listTitle: 'Uploaded SIPs',
      listCount: (n: number) => `${n} file${n === 1 ? '' : 's'}`,
      refresh: 'Refresh',
      loading: 'Loading...',
      empty: "You haven't uploaded any SIP yet",
      emptyHint: 'The ZIP files you upload will appear here.',
      colFile: 'File',
      colSize: 'Size',
      colDate: 'Uploaded',
      colActions: 'Actions',
      download: 'Download',
      delete: 'Delete',
      deleting: 'Deleting...',
      confirmDelete: 'Are you sure you want to delete this SIP? This action cannot be undone.',
      deleted: 'SIP deleted successfully',
      deleteError: 'Error deleting SIP',
    },
    zh: {
      title: '上传 SIP',
      subtitle: '上传包含 SIP 的 ZIP 文件进行处理',
      chooseFile: '选择 ZIP 文件',
      upload: '上传 SIP',
      uploading: '上传中...',
      success: 'SIP 上传成功',
      maxSize: '最大 300 MB · 仅限 .zip 文件',
      fileName: '文件:',
      fileSize: '大小:',
      storedIn: '存储位置:',
      adminOnly: '仅限管理员',
      listTitle: '已上传的 SIP',
      listCount: (n: number) => `${n} 个文件`,
      refresh: '刷新',
      loading: '加载中...',
      empty: '你还没有上传任何 SIP',
      emptyHint: '上传的 ZIP 文件将显示在这里。',
      colFile: '文件',
      colSize: '大小',
      colDate: '上传时间',
      colActions: '操作',
      download: '下载',
      delete: '删除',
      deleting: '删除中...',
      confirmDelete: '您确定要删除此 SIP 吗？此操作无法撤销。',
      deleted: 'SIP 删除成功',
      deleteError: '删除 SIP 时出错',
    },
  } as Record<string, {
    title: string; subtitle: string; chooseFile: string; upload: string;
    uploading: string; success: string; maxSize: string; fileName: string; fileSize: string;
    storedIn: string; adminOnly: string; listTitle: string;
    listCount: (n: number) => string; refresh: string; loading: string;
    empty: string; emptyHint: string; colFile: string; colSize: string;
    colDate: string; colActions: string; download: string;
    delete: string; deleting: string; confirmDelete: string;
    deleted: string; deleteError: string;
  }>;

  const t = translations[locale] || translations.es;

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async (item: SipFile) => {
    if (!window.confirm(`${t.confirmDelete}\n\n${item.displayName}`)) return;

    setDeletingKey(item.key);
    try {
      await sipService.deleteSip(item.filename);
      setFiles((prev) => prev.filter((file) => file.key !== item.key));
      if (uploaded?.key === item.key) setUploaded(null);
      toast.success(t.deleted);
    } catch (error: any) {
      toast.error(error.message || t.deleteError);
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            {t.adminOnly}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.chooseFile}
              </label>
              <input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
              <p className="mt-2 text-xs text-gray-500">{t.maxSize}</p>
            </div>

            {file && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {t.fileName} {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full btn-disabled:bg-gray-200 btn-disabled:text-gray-500 btn-disabled:cursor-not-allowed px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {uploading ? t.uploading : t.upload}
            </button>
          </form>
        </div>

        {uploaded && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="font-semibold text-green-800">{t.success}</h3>
                <p className="text-sm text-green-700 mt-1">
                  {t.fileName} {uploaded.filename}<br />
                  {t.fileSize} {(uploaded.size / 1024 / 1024).toFixed(2)} MB<br />
                  {t.storedIn} {uploaded.key}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">{t.listTitle}</h2>
              {!loadingFiles && (
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                  {t.listCount(files.length)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={loadFiles}
              disabled={loadingFiles}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className={`w-4 h-4 ${loadingFiles ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t.refresh}
            </button>
          </div>

          {loadingFiles && files.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">{t.loading}</div>
          ) : files.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-8" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">{t.empty}</p>
              <p className="text-xs text-gray-500 mt-1">{t.emptyHint}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t.colFile}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t.colSize}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t.colDate}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t.colActions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {files.map((item) => (
                    <tr key={item.key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-900 max-w-xs truncate" title={item.displayName}>
                            {item.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatSize(item.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(item.uploadedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          <a
                            href={`${API_BASE_URL}${item.downloadUrl}`}
                            download={item.displayName}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {t.download}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={deletingKey === item.key}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {deletingKey === item.key ? t.deleting : t.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


