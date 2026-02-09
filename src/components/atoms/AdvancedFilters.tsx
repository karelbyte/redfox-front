'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/atoms';
import { useTranslations } from 'next-intl';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'range';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValues {
  [key: string]: any;
}

interface AdvancedFiltersProps {
  fields: FilterField[];
  onApply: (filters: FilterValues) => void;
  onClear?: () => void;
  storageKey?: string;
}

export default function AdvancedFilters({
  fields,
  onApply,
  onClear,
  storageKey,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const t = useTranslations('common.components.advancedFilters');
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, () => setIsOpen(false));

  // Cargar filtros guardados
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFilters(parsed);
        setActiveFiltersCount(Object.values(parsed).filter(v => v).length);
      }
    }
  }, [storageKey]);

  const handleFilterChange = useCallback(
    (key: string, value: any) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(newFilters));
      }
    },
    [filters, storageKey]
  );

  const handleApply = () => {
    onApply(filters);
    const count = Object.values(filters).filter(v => v).length;
    setActiveFiltersCount(count);
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilters({});
    onApply({});
    setActiveFiltersCount(0);
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
    onClear?.();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors relative"
      >
        <FunnelIcon className="w-4 h-4" />
        <span className="text-sm">{t('filters')}</span>
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{t('title')}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>

                {field.type === 'text' && (
                  <Input
                    type="text"
                    placeholder={field.placeholder}
                    value={filters[field.key] || ''}
                    onChange={(e) => handleFilterChange(field.key, e.target.value)}
                  />
                )}

                {field.type === 'number' && (
                  <Input
                    type="number"
                    placeholder={field.placeholder}
                    value={filters[field.key] || ''}
                    onChange={(e) => handleFilterChange(field.key, e.target.value)}
                  />
                )}

                {field.type === 'date' && (
                  <Input
                    type="date"
                    value={filters[field.key] || ''}
                    onChange={(e) => handleFilterChange(field.key, e.target.value)}
                  />
                )}

                {field.type === 'select' && field.options && (
                  <select
                    value={filters[field.key] || ''}
                    onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">{t('select')}</option>
                    {field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'range' && (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={t('min')}
                      value={filters[`${field.key}_min`] || ''}
                      onChange={(e) => handleFilterChange(`${field.key}_min`, e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder={t('max')}
                      value={filters[`${field.key}_max`] || ''}
                      onChange={(e) => handleFilterChange(`${field.key}_max`, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">

            <button
              onClick={handleApply}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              {t('apply')}
            </button>
            <button
              onClick={handleClear}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              {t('clear')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
