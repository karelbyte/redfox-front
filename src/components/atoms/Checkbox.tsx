import React, { forwardRef } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  labelPosition?: 'left' | 'right';
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    label, 
    error, 
    helperText,
    labelPosition = 'right',
    className = "",
    style,
    ...props 
  }, ref) => {
    const baseCheckboxStyles: React.CSSProperties = {
      accentColor: `rgb(var(--color-primary-500))`,
    };

    const errorCheckboxStyles: React.CSSProperties = {
      accentColor: `rgb(var(--color-primary-500))`,
    };

    const checkboxStyles = error ? { ...baseCheckboxStyles, ...errorCheckboxStyles } : baseCheckboxStyles;

    const renderLabel = () => {
      if (!label) return null;
      
      return (
        <label 
          htmlFor={props.id} 
          className="block text-sm cursor-pointer"
          style={{ color: `rgb(var(--color-primary-500))` }}
        >
          {label}
        </label>
      );
    };

    return (
      <div className="w-full">
        <div className={`flex items-center ${labelPosition === 'left' ? 'flex-row-reverse justify-between' : 'gap-2'}`}>
          <input
            ref={ref}
            type="checkbox"
            className={`h-4 w-4 border-gray-300 rounded cursor-pointer ${className}`}
            style={{ ...checkboxStyles, ...style } as React.CSSProperties}
            {...props}
          />
          {renderLabel()}
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

Checkbox.displayName = 'Checkbox';

export default Checkbox; 