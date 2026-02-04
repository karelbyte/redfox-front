import React, { useState, useEffect } from 'react';
import Input from './Input';
import Btn from './Btn';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useSurrogate } from '@/hooks/useSurrogate';

interface SurrogateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  surrogateCode: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  showSuggestion?: boolean;
  autoSuggest?: boolean;
}

export function SurrogateInput({
  label,
  value,
  onChange,
  surrogateCode,
  placeholder,
  required = false,
  disabled = false,
  error,
  showSuggestion = true,
  autoSuggest = true,
}: SurrogateInputProps) {
  const [hasUserInput, setHasUserInput] = useState(false);
  
  const {
    suggestedCode,
    loading,
    generateCode,
    refreshSuggestion,
  } = useSurrogate(surrogateCode, {
    autoLoad: showSuggestion,
  });

  // Auto-sugerir cuando el campo está vacío y no ha habido input del usuario
  useEffect(() => {
    if (autoSuggest && !hasUserInput && !value && suggestedCode && !loading) {
      onChange(suggestedCode);
    }
  }, [autoSuggest, hasUserInput, value, suggestedCode, onChange, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasUserInput(true);
    onChange(e.target.value);
  };

  const handleUseSuggestion = () => {
    if (suggestedCode) {
      onChange(suggestedCode);
      setHasUserInput(true);
    }
  };

  const handleGenerateNew = async () => {
    const newCode = await generateCode();
    if (newCode) {
      onChange(newCode);
      setHasUserInput(true);
    }
  };

  const handleRefresh = () => {
    refreshSuggestion();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label={label}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            error={error}
          />
        </div>
        
        {showSuggestion && (
          <div className="flex gap-1 pb-1">
            {suggestedCode && suggestedCode !== value && (
              <Btn
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleUseSuggestion}
                disabled={disabled || loading}
                title={`Usar sugerencia: ${suggestedCode}`}
                leftIcon={<SparklesIcon className="h-4 w-4" />}
              >
                {suggestedCode}
              </Btn>
            )}
            
            <Btn
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={disabled || loading}
              title="Actualizar sugerencia"
              leftIcon={<ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
            />
          </div>
        )}
      </div>
      
      {showSuggestion && suggestedCode && !loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <SparklesIcon className="h-4 w-4" />
          <span>Sugerencia: {suggestedCode}</span>
          {suggestedCode !== value && (
            <button
              type="button"
              onClick={handleUseSuggestion}
              className="text-primary-600 hover:text-primary-700 underline"
              disabled={disabled}
            >
              Usar
            </button>
          )}
        </div>
      )}
      
      {loading && showSuggestion && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <ArrowPathIcon className="h-4 w-4 animate-spin" />
          <span>Cargando sugerencia...</span>
        </div>
      )}
    </div>
  );
}