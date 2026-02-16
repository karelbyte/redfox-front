import { useState, useRef } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useExportToExcel } from '@/hooks/useExportToExcel';
import { useTranslations } from 'next-intl';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[];
  filename?: string;
  columns?: string[];
  label?: string;
  className?: string;
  children?: React.ReactNode;
  customOptions?: Array<{
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }>;
}

export default function ExportButton<T extends Record<string, any>>({
  data,
  filename = 'export',
  columns,
  label,
  className = '',
  children,
  customOptions = []
}: ExportButtonProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const { exportExcel, exportCSV, exportJSON } = useExportToExcel<T>();
  const t = useTranslations('common.components.exportButton');
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, () => setIsOpen(false));

  const handleExportExcel = () => {
    exportExcel(data, { filename: `${filename}.xlsx`, columns });
    setIsOpen(false);
  };

  const handleExportCSV = () => {
    exportCSV(data, `${filename}.csv`, columns);
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    exportJSON(data, `${filename}.json`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors ${className}`}
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
        <span className="text-sm">{label || t('export')}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <button
            onClick={handleExportExcel}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100"
          >
            📊 {t('excel')}
          </button>
          <button
            onClick={handleExportCSV}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100"
          >
            📄 {t('csv')}
          </button>
      
          <button
            onClick={handleExportJSON}
            className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 ${children || customOptions.length > 0 ? 'border-b border-gray-100' : ''}`}
          >
            🔧 {t('json')}
          </button>

          {children}

          {customOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
              disabled={option.disabled}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
