'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from 'next-intl';
import { toast } from 'react-hot-toast';
import { sipService, type SipUploadResult } from '@/services/sip.service';

export default function ProductUpPage() {
  const { user } = useAuth();
  const locale = useLocale();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<SipUploadResult | null>(null);

  const isAdmin = user?.admin || user?.roles?.some((r: any) => r.code === 'SUPER_ADMIN' || r.code === 'ADMIN');

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Acceso denegado: solo administradores');
    }
  }, [isAdmin]);

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
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploaded(null);

    try {
      const result = await sipService.uploadSip(file);
      setUploaded(result);
      toast.success(result.message);
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
      fileName: 'Archivo:',
      fileSize: 'Tama\u00f1o:',
      storedIn: 'Almacenado en:',
      adminOnly: 'Solo para administradores',
    },
    en: {
      title: 'Upload SIP',
      subtitle: 'Upload a ZIP file with the SIP to process it',
      chooseFile: 'Choose ZIP file',
      upload: 'Upload SIP',
      uploading: 'Uploading...',
      success: 'SIP uploaded successfully',
      fileName: 'File:',
      fileSize: 'Size:',
      storedIn: 'Stored at:',
      adminOnly: 'Admins only',
    },
    zh: {
      title: '上传 SIP',
      subtitle: '上传包含 SIP 的 ZIP 文件进行处理',
      chooseFile: '选择 ZIP 文件',
      upload: '上传 SIP',
      uploading: '上传中...',
      success: 'SIP 上传成功',
      fileName: '文件:',
      fileSize: '大小:',
      storedIn: '存储位置:',
      adminOnly: '仅限管理员',
    },
  } as Record<string, { title: string; subtitle: string; chooseFile: string; upload: string; uploading: string; success: string; fileName: string; fileSize: string; storedIn: string; adminOnly: string }>;

  const t = translations[locale] || translations.es;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
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
      </div>
    </div>
  );
}


