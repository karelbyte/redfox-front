import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    required = false, 
    helperText,
    className = "",
    style,
    ...props 
  }, ref) => {
    const baseInputStyles: React.CSSProperties & { [key: string]: string } = {
      border: `1px solid rgb(var(--color-secondary-300))`,
      '--tw-ring-color': `rgb(var(--color-primary-500))`,
      '--tw-ring-offset-color': 'white',
    };

    const errorInputStyles: React.CSSProperties & { [key: string]: string } = {
      border: `1px solid rgb(var(--color-primary-500))`,
      '--tw-ring-color': `rgb(var(--color-primary-500))`,
      '--tw-ring-offset-color': 'white',
    };

    const inputStyles = error ? { ...baseInputStyles, ...errorInputStyles } : baseInputStyles;

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
        
        <input
          ref={ref}
          className={`appearance-none block w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${className}`}
          style={{ ...inputStyles, ...style }}
          {...props}
        />
        
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

Input.displayName = 'Input';

export default Input; 