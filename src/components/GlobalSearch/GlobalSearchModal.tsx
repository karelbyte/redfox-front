"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { globalSearchService } from '@/services/global-search.service';
import { SearchResult } from '@/types/global-search';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeIcons = {
  product: '📦',
  client: '👤',
  provider: '🏢',
  invoice: '📄',
  purchase_order: '📋',
  expense: '💰',
  account_receivable: '💳',
};

const typeColors = {
  product: 'bg-blue-100 text-blue-800',
  client: 'bg-green-100 text-green-800',
  provider: 'bg-purple-100 text-purple-800',
  invoice: 'bg-yellow-100 text-yellow-800',
  purchase_order: 'bg-orange-100 text-orange-800',
  expense: 'bg-red-100 text-red-800',
  account_receivable: 'bg-indigo-100 text-indigo-800',
};

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const t = useTranslations('globalSearch');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await globalSearchService.search(query);
        setResults(searchResults);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, (results?.length || 0) - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    onClose();
    setQuery('');
    setResults([]);
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      product: t('types.product'),
      client: t('types.client'),
      provider: t('types.provider'),
      invoice: t('types.invoice'),
      purchase_order: t('types.purchaseOrder'),
      expense: t('types.expense'),
      account_receivable: t('types.accountReceivable'),
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0" onClick={onClose}></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          <div className="flex items-center border-b border-gray-200 px-4 py-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder={t('placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="ml-3 flex-1 border-0 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0"
            />
            <button
              onClick={onClose}
              className="ml-3 flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                <span className="ml-2 text-sm text-gray-500">{t('searching')}</span>
              </div>
            )}

            {!isLoading && query.trim().length >= 2 && results && results.length === 0 && (
              <div className="py-8 text-center">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noResults')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('noResultsDescription')}</p>
              </div>
            )}

            {!isLoading && results && results.length > 0 && (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className={`flex w-full items-center px-4 py-3 text-left hover:bg-gray-50 ${
                      index === selectedIndex ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <span className="text-lg">{typeIcons[result.type]}</span>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          typeColors[result.type]
                        }`}>
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {query.trim().length < 2 && (
              <div className="py-8 text-center">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('startTyping')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('startTypingDescription')}</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>↑↓ {t('navigate')}</span>
                <span>↵ {t('select')}</span>
                <span>esc {t('close')}</span>
              </div>
              <div>
                {results && results.length > 0 && (
                  <span>{results.length} {t('results')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}