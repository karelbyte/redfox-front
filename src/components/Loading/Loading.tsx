import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: { width: '24px', height: '24px' },
  md: { width: '32px', height: '32px' },
  lg: { width: '48px', height: '48px' }
};

const Loading: React.FC<LoadingProps> = ({ size = 'md', className = '' }) => {
  return (
    <div 
      className={`loader ${className}`}
      style={{
        ...sizeStyles[size],
        position: 'relative',
        display: 'inline-block',
        borderRadius: '50%',
        borderTop: `4px solid rgb(var(--color-primary-500))`,
        borderRight: '4px solid transparent',
        boxSizing: 'border-box',
        animation: 'rotation 1s linear infinite'
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes rotation {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          .loader::after {
            content: '';
            box-sizing: border-box;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border-left: 4px solid rgb(var(--color-secondary-500));
            border-bottom: 4px solid transparent;
            animation: rotation 0.5s linear infinite reverse;
          }
        `
      }} />
    </div>
  );
};

export default Loading; 