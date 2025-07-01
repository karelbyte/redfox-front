import React, { forwardRef } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    label, 
    error, 
    required = false, 
    helperText,
    className = "",
    style,
    ...props 
  }, ref) => {
    const baseTextAreaStyles: React.CSSProperties = {
      border: `1px solid rgb(var(--color-secondary-300))`,
      ['--tw-ring-color' as string]: `rgb(var(--color-primary-500))`,
      ['--tw-ring-offset-color' as string]: 'white',
    };

    const errorTextAreaStyles: React.CSSProperties = {
      border: `1px solid rgb(var(--color-primary-500))`,
      ['--tw-ring-color' as string]: `rgb(var(--color-primary-500))`,
      ['--tw-ring-offset-color' as string]: 'white',
    };

    const textAreaStyles = error ? { ...baseTextAreaStyles, ...errorTextAreaStyles } : baseTextAreaStyles;

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
        
        <textarea
          ref={ref}
          className={`appearance-none block w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors resize-vertical ${className}`}
          style={{ ...textAreaStyles, ...style }}
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

TextArea.displayName = 'TextArea';

export default TextArea; 