'use client'

import React from 'react';
import { useTranslations } from 'next-intl';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectWithAddProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean | null;
  error?: string;
  loading?: boolean;
  showAddButton?: boolean;
  onAddClick?: () => void;
  addButtonTitle?: string;
  helperText?: string;
  className?: string;
}

const SelectWithAdd: React.FC<SelectWithAddProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  error,
  loading = false,
  showAddButton = false,
  onAddClick,
  addButtonTitle,
  helperText,
  className = "",
}) => {
  const t = useTranslations('forms.components.select');
  
  // Usar placeholder traducido por defecto si no se proporciona uno
  const defaultPlaceholder = placeholder || t('placeholder');
  const defaultAddButtonTitle = addButtonTitle || t('addNew');

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

  return (
    <div className={className}>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium mb-2"
        style={{ color: `rgb(var(--color-primary-500))` }}
      >
        {label}
        {required && <span style={{ color: `rgb(var(--color-primary-500))` }}> *</span>}
      </label>
      
      {loading ? (
        <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
      ) : (
        <div className="relative">
          <select
            id={id}
            value={value}
            onChange={onChange}
            className={`appearance-none block w-full rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              showAddButton ? 'pr-12' : 'px-4 py-3'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'px-4 py-3'}`}
            style={selectStyles as React.CSSProperties}
            disabled={disabled || false}
            required={required}
          >
            <option value="">{defaultPlaceholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {showAddButton && onAddClick && (
            <button
              type="button"
              onClick={onAddClick}
              className="absolute right-0 top-0 h-full px-3 text-white transition-colors border-l font-bold text-lg"
              style={{ 
                backgroundColor: `rgb(var(--color-primary-500))`,
                borderColor: `rgb(var(--color-primary-600))`,
                borderTopRightRadius: '0.5rem',
                borderBottomRightRadius: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-600))`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-500))`;
              }}
              title={defaultAddButtonTitle}
            >
              +
            </button>
          )}
        </div>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-gray-300">{error}</p>
      )}
    </div>
  );
};

export default SelectWithAdd; 