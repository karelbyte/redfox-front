'use client'

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectWithAddScrolledProps {
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

const SelectWithAddScrolled: React.FC<SelectWithAddScrolledProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  required = false,
  disabled = false,
  error,
  loading = false,
  showAddButton = false,
  onAddClick,
  addButtonTitle = "Agregar nuevo",
  helperText,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Encontrar la etiqueta del valor seleccionado
  useEffect(() => {
    const selectedOption = options.find(option => option.value === value);
    setSelectedLabel(selectedOption ? selectedOption.label : '');
  }, [value, options]);

  // Cerrar dropdown al hacer clic fuera
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

  // Simular el evento onChange del select original
  const handleOptionClick = (option: SelectOption) => {
    const syntheticEvent = {
      target: {
        value: option.value,
        name: id,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  // Estilos exactamente iguales al SelectWithAdd original
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

  // Determinar si necesitamos scroll
  const shouldAddScroll = options.length > 8;
  const maxHeight = shouldAddScroll ? '200px' : 'auto';

  return (
    <div className={className}>
      {/* Select oculto para mantener la funcionalidad del formulario */}
      <select
        ref={selectRef}
        id={id}
        value={value}
        onChange={onChange}
        className="sr-only"
        required={required}
        disabled={disabled || false}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

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
        <div className="relative" ref={dropdownRef}>
          {/* Botón principal del select - estilos exactos del original */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={`appearance-none block w-full rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-left ${
              showAddButton ? 'pr-12' : 'px-4 py-3'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'px-4 py-3'}`}
            style={selectStyles as React.CSSProperties}
            disabled={disabled || false}
          >
            <span className={`block ${value ? 'text-gray-900' : 'text-gray-500'}`}>
              {selectedLabel || placeholder}
            </span>
            <ChevronDownIcon 
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
              style={{ color: `rgb(var(--color-primary-500))` }}
            />
          </button>

          {/* Dropdown personalizado */}
          {isOpen && (
            <div 
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
              style={{ 
                maxHeight,
                overflowY: shouldAddScroll ? 'auto' : 'visible',
                scrollbarWidth: 'thin',
                scrollbarColor: `rgb(var(--color-primary-300)) transparent`,
              }}
            >
              {/* Estilos para scrollbar webkit */}
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 8px;
                }
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                  background-color: rgb(var(--color-primary-300));
                  border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background-color: rgb(var(--color-primary-400));
                }
              `}</style>

              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                    option.value === value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          
          {/* Botón de agregar - exactamente igual al original */}
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
              title={addButtonTitle}
            >
              +
            </button>
          )}
        </div>
      )}
      
      {/* Mensajes de error y helper text - exactamente igual al original */}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-gray-300">{error}</p>
      )}
    </div>
  );
};

export default SelectWithAddScrolled; 