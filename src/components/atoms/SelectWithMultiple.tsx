import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectWithMultipleProps {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  required?: boolean;
  helperText?: string;
  loading?: boolean;
  disabled?: boolean;
}

const SelectWithMultiple: React.FC<SelectWithMultipleProps> = ({
  label,
  options,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  helperText,
  loading = false,
  disabled = false
}) => {
  const t = useTranslations('forms.components.select');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const defaultPlaceholder = placeholder || t('placeholder');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeOption = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  const getSelectedLabels = () => {
    return value.map(v => options.find(opt => opt.value === v)?.label || v);
  };

  const baseStyles: React.CSSProperties = {
    border: `1px solid rgb(var(--color-secondary-300))`,
    '--tw-ring-color': `rgb(var(--color-primary-500))`,
    '--tw-ring-offset-color': 'white',
  };

  const errorStyles: React.CSSProperties = {
    border: `1px solid rgb(var(--color-primary-500))`,
    '--tw-ring-color': `rgb(var(--color-primary-500))`,
    '--tw-ring-offset-color': 'white',
  };

  const selectStyles = error ? { ...baseStyles, ...errorStyles } : baseStyles;

  return (
    <div className="w-full relative" ref={dropdownRef}>
      {label && (
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: `rgb(var(--color-primary-500))` }}
        >
          {label}
          {required && <span style={{ color: `rgb(var(--color-primary-500))` }}> *</span>}
        </label>
      )}
      
      <div
        className={`relative cursor-pointer ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleToggle}
      >
        <div
          className="appearance-none block w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors min-h-[48px] flex items-center flex-wrap gap-1"
          style={selectStyles}
        >
          {value.length === 0 ? (
            <span className="text-gray-500">{loading ? 'Cargando...' : defaultPlaceholder}</span>
          ) : (
            <>
              {getSelectedLabels().map((label, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                >
                  {label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(value[index]);
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </>
          )}
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {isOpen && !disabled && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-gray-500 text-sm">
              No hay opciones disponibles
            </div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center ${
                  value.includes(option.value) ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                }`}
                onClick={() => handleOptionClick(option.value)}
              >
                <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                  value.includes(option.value) 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300'
                }`}>
                  {value.includes(option.value) && (
                    <div className="w-2 h-2 bg-white rounded-sm"></div>
                  )}
                </div>
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-gray-300">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default SelectWithMultiple; 