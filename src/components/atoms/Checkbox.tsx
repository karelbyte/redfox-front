import React, { forwardRef, useRef, useEffect } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  labelPosition?: 'left' | 'right';
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    label, 
    error, 
    helperText,
    labelPosition = 'right',
    className = "",
    style,
    indeterminate = false,
    ...props 
  }, ref) => {
    const baseCheckboxStyles: React.CSSProperties = {
      accentColor: `rgb(var(--color-primary-500))`,
    };

    const errorCheckboxStyles: React.CSSProperties = {
      accentColor: `rgb(var(--color-primary-500))`,
    };

    const checkboxStyles = error ? { ...baseCheckboxStyles, ...errorCheckboxStyles } : baseCheckboxStyles;

    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const renderLabel = () => {
      if (!label) return null;
      
      return (
        <label 
          htmlFor={props.id} 
          className="block text-sm cursor-pointer"
          style={{ color: `rgb(var(--color-text-900))` }}
        >
          {label}
        </label>
      );
    };

    return (
      <div className="w-full">
        <div className={`flex items-center ${labelPosition === 'left' ? 'flex-row-reverse justify-between' : 'gap-2'}`}>
          <input
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              inputRef.current = node;
            }}
            type="checkbox"
            className={`h-4 w-4 rounded cursor-pointer ${className}`}
            style={{ 
              ...checkboxStyles, 
              ...style,
              borderColor: `rgb(var(--color-border-300))`,
              backgroundColor: `rgb(var(--color-background-0))`
            } as React.CSSProperties}
            {...props}
          />
          {renderLabel()}
        </div>
        
        {error && (
          <p className="mt-1 text-xs" style={{ color: `rgb(var(--color-error-500))` }}>{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-xs" style={{ color: `rgb(var(--color-text-500))` }}>{helperText}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox; 