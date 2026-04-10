import { useTranslations, useLocale } from 'next-intl';
import { BulkDeleteProviderResult } from '@/types/provider';
import { Btn } from "@/components/atoms";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface BulkDeleteResultModalProps {
  results: BulkDeleteProviderResult[];
  onClose: () => void;
}

const BulkDeleteResultModal = ({ results, onClose }: BulkDeleteResultModalProps) => {
  const t = useTranslations('pages.providers');
  const locale = useLocale();

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;

  // Local translations for this specific modal to avoid bloating JSON files
  const localT = {
    es: {
      provider: "Proveedor",
      status: "Estado",
      details: "Detalles",
      success: "Éxito",
      error: "Error",
      close: "Cerrar",
      bulkDeleteResult: "Resultado de eliminación masiva"
    },
    en: {
      provider: "Provider",
      status: "Status",
      details: "Details",
      success: "Success",
      error: "Error",
      close: "Close",
      bulkDeleteResult: "Bulk Deletion Result"
    }
  }[locale as 'es' | 'en'] || {
    provider: "Provider",
    status: "Status",
    details: "Details",
    success: "Success",
    error: "Error",
    close: "Close",
    bulkDeleteResult: "Bulk Deletion Result"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all sm:my-8 w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-900">
            {localT.bulkDeleteResult}
          </h3>
          <div className="flex gap-4 text-sm font-bold">
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1.5 border border-green-200">
              <CheckCircleIcon className="h-4 w-4" /> {successCount}
            </div>
            <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full flex items-center gap-1.5 border border-red-200">
              <XCircleIcon className="h-4 w-4" /> {errorCount}
            </div>
          </div>
        </div>

        {/* Content Table Area */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="w-1/3 px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {localT.provider}
                </th>
                <th scope="col" className="w-24 px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {localT.status}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {localT.details}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 text-sm line-clamp-1">{result.name}</span>
                      <span className="text-gray-400 text-xs font-mono">{result.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    {result.success ? (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20 uppercase tracking-tight">
                        {localT.success}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20 uppercase tracking-tight">
                        {localT.error}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-gray-600 leading-relaxed">
                    <div className="break-words max-w-xs sm:max-w-none">
                      {result.error || '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t p-4 px-6 bg-gray-50 flex justify-end">
          <Btn onClick={onClose} variant="primary" className="min-w-[120px]">
            {localT.close}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default BulkDeleteResultModal;
