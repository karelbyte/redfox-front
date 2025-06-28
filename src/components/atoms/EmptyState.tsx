import React from 'react';
import { useTranslations } from 'next-intl';

interface EmptyStateProps {
  searchTerm?: string;
  title: string;
  description: string;
  searchDescription?: string;
  icon?: 'document' | 'search' | 'custom';
  customIcon?: React.ReactNode;
  actionButton?: React.ReactNode;
}

const   EmptyState: React.FC<EmptyStateProps> = ({
  searchTerm,
  title,
  description,
  searchDescription,
  icon = 'document',
  customIcon,
  actionButton
}) => {
  const t = useTranslations('common.labels');
  const isSearchState = searchTerm && searchTerm.trim() !== '';
  const displayTitle = isSearchState ? (searchDescription || title) : title;
  const displayDescription = isSearchState 
    ? t('noResultsMessage', { term: searchTerm })
    : description;

  const renderIcon = () => {
    if (customIcon) {
      return customIcon;
    }

    const iconClass = "h-12 w-12 mb-4";
    const iconStyle = { color: `rgb(var(--color-primary-300))` };

    if (icon === 'search' || isSearchState) {
      return (
        <svg
          className={iconClass}
          style={iconStyle}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      );
    }

    return (
      <svg
        className={iconClass}
        style={iconStyle}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  };

  return (
    <div 
      className="mt-6 flex flex-col items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed"
      style={{ borderColor: `rgb(var(--color-primary-200))` }}
    >
      {renderIcon()}
      <p 
        className="text-lg font-medium mb-2"
        style={{ color: `rgb(var(--color-primary-400))` }}
      >
        {displayTitle}
      </p>
      <p 
        className="text-sm text-center"
        style={{ color: `rgb(var(--color-primary-300))` }}
      >
        {displayDescription}
      </p>
      {actionButton && (
        <div className="mt-4">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default EmptyState; 