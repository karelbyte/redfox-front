'use client'

import { useState } from 'react';
import Input from './Input';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (term: string) => void;
  onClear?: () => void;
  className?: string;
  initialValue?: string;
}

const SearchInput = ({ 
  placeholder = "Buscar...", 
  onSearch, 
  onClear,
  className = "",
  initialValue = ""
}: SearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    onClear?.();
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
          type={hasText ? 'button' : 'submit'}
          onClick={hasText ? handleClear : undefined}
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