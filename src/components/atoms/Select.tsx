import React, { forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  disablePlaceholderOption?: boolean;
  error?: string;
  required?: boolean;
  helperText?: string;
  isClearable?: boolean;
  onClear?: () => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    options, 
    placeholder,
    disablePlaceholderOption = false,
    error, 
    required = false, 
    helperText,
    isClearable = false,
    onClear,
    className = "",
    style,
    ...props 
  }, ref) => {
    const t = useTranslations('forms.components.select');
    
    // Usar placeholder traducido por defecto si no se proporciona uno
    const defaultPlaceholder = placeholder || t('placeholder');

    const baseSelectStyles: React.CSSProperties = {
      border: `1px solid rgb(var(--color-secondary-300))`,
      ['--tw-ring-color' as string]: `rgb(var(--color-primary-500))`,
      ['--tw-ring-offset-color' as string]: 'white',
    };

    const errorSelectStyles: React.CSSProperties = {
      border: `1px solid rgb(var(--color-primary-500))`,
      ['--tw-ring-color' as string]: `rgb(var(--color-primary-500))`,
      ['--tw-ring-offset-color' as string]: 'white',
    };

    const selectStyles = error ? { ...baseSelectStyles, ...errorSelectStyles } : baseSelectStyles;

    const showClearButton = isClearable && props.value && props.value !== '';

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-500))` }}
          >
            {label}
            {required && <span style={{ color: `rgb(var(--color-primary-500))` }}> *</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            className={`appearance-none block w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${className} ${showClearButton ? 'pr-10' : ''}`}
            style={{ ...selectStyles, ...style }}
            {...props}
          >
            <option
              value=""
              disabled={disablePlaceholderOption}
              hidden={disablePlaceholderOption && !!props.value}
            >
              {defaultPlaceholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {showClearButton && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onClear) onClear();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
              title="Limpiar selección"
            >
              <X size={16} className="text-gray-400" />
            </button>
          )}

          {/* Flecha personalizada ya que usamos appearance-none */}
          {!showClearButton && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-xs text-gray-300">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select; 
