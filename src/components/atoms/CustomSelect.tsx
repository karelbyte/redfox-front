import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  options: CustomSelectOption[];
  value: string;
  onChange: (e: { target: { value: string, name?: string } }) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  name?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  name,
  className = "",
}) => {
  const t = useTranslations('forms.components.select');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const defaultPlaceholder = placeholder || t('placeholder');
  const selectedOption = options.find(opt => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange({ target: { value: optionValue, name } });
    setIsOpen(false);
  };

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-primary-500" style={{ color: `rgb(var(--color-primary-500))` }}>
          {label}
          {required && <span> *</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white border transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          error 
            ? 'border-primary-500 ring-primary-500' 
            : 'border-secondary-300 focus:ring-primary-500'
        }`}
        style={{ 
          borderColor: error ? `rgb(var(--color-primary-500))` : `rgb(var(--color-secondary-300))`,
        }}
      >
        <span className={`block truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
          {selectedOption ? selectedOption.label : defaultPlaceholder}
        </span>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{ color: `rgb(var(--color-secondary-400))` }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 mt-1 w-full bg-white border border-secondary-300 rounded-lg shadow-xl z-[100] overflow-hidden"
          style={{ 
            borderColor: `rgb(var(--color-secondary-200))`,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <ul className="max-h-60 overflow-y-auto py-1">
            {options.length === 0 ? (
              <li className="px-4 py-2 text-sm text-gray-500 italic">No hay opciones disponibles</li>
            ) : (
              options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    option.value === value 
                      ? 'bg-primary-50 text-primary-600 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: option.value === value ? `rgba(var(--color-primary-500), 0.1)` : '',
                    color: option.value === value ? `rgb(var(--color-primary-600))` : ''
                  }}
                >
                  <span className="block truncate">{option.label}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-gray-300">{error}</p>
      )}
    </div>
  );
};

export default CustomSelect;
