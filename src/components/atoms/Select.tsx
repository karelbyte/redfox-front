import React, { forwardRef } from 'react';
import { useTranslations } from 'next-intl';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    options, 
    placeholder,
    error, 
    required = false, 
    helperText,
    className = "",
    style,
    ...props 
  }, ref) => {
    const t = useTranslations('forms.components.select');
    
    // Usar placeholder traducido por defecto si no se proporciona uno
    const defaultPlaceholder = placeholder || t('placeholder');

    const baseSelectStyles: React.CSSProperties & { [key: string]: string } = {
      border: `1px solid rgb(var(--color-secondary-300))`,
      '--tw-ring-color': `rgb(var(--color-primary-500))`,
      '--tw-ring-offset-color': 'white',
    };

    const errorSelectStyles: React.CSSProperties & { [key: string]: string } = {
      border: `1px solid rgb(var(--color-primary-500))`,
      '--tw-ring-color': `rgb(var(--color-primary-500))`,
      '--tw-ring-offset-color': 'white',
    };

    const selectStyles = error ? { ...baseSelectStyles, ...errorSelectStyles } : baseSelectStyles;

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
        
        <select
          ref={ref}
          className={`appearance-none block w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${className}`}
          style={{ ...selectStyles, ...style }}
          {...props}
        >
          <option value="">{defaultPlaceholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
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