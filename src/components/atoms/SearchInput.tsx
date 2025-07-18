'use client'

import { useState, useEffect } from 'react';
import Input from './Input';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (term: string) => void;
  onClear?: () => void;
  onChange?: (value: string) => void;
  className?: string;
  initialValue?: string;
  value?: string;
}

const SearchInput = ({ 
  placeholder = "Buscar...", 
  onSearch, 
  onClear,
  onChange,
  className = "",
  initialValue = "",
  value: externalValue
}: SearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  useEffect(() => {
    if (externalValue !== undefined) {
      setSearchTerm(externalValue);
    }
  }, [externalValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange?.(newValue);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    onClear?.();
  };

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const hasText = searchTerm.trim() !== '';

  return (
    <form onSubmit={handleSubmit} className={`max-w-md ${className}`}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          className="pr-20"
        />
        
        {/* Botón de búsqueda o limpiar */}
        <button
          type={hasText ? 'button' : 'button'}
          onClick={hasText ? handleClear : handleSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors"
          style={{ color: `rgb(var(--color-primary-500))` }}
          title={hasText ? 'Limpiar búsqueda' : 'Buscar'}
        >
          {hasText ? (
            <XMarkIcon className="h-5 w-5" />
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
};

SearchInput.displayName = 'SearchInput';

export default SearchInput; 