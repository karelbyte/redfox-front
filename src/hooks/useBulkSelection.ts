import { useState, useCallback } from 'react';

export interface BulkAction {
  id: string;
  label: string;
  icon?: string;
  color?: 'danger' | 'warning' | 'success' | 'info';
  onClick: (selectedIds: string[]) => Promise<void> | void;
  requiresConfirm?: boolean;
}

export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item.id)));
    }
  }, [items, selectedIds.size]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const executeBulkAction = useCallback(
    async (action: BulkAction) => {
      if (selectedIds.size === 0) return;

      setIsLoading(true);
      try {
        await action.onClick(Array.from(selectedIds));
        clearSelection();
      } catch (error) {
        console.error('Bulk action error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedIds, clearSelection]
  );

  const isAllSelected = selectedIds.size === items.length && items.length > 0;
  const isPartiallySelected = selectedIds.size > 0 && selectedIds.size < items.length;

  return {
    selectedIds: Array.from(selectedIds),
    isSelected: (id: string) => selectedIds.has(id),
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    executeBulkAction,
    isAllSelected,
    isPartiallySelected,
    hasSelection: selectedIds.size > 0,
    selectionCount: selectedIds.size,
    isLoading,
  };
}
