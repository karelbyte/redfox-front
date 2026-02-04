import { useState, useEffect } from 'react';

export function useColumnPersistence(key: string, initialColumns: string[]) {
    const [visibleColumns, setVisibleColumns] = useState<string[]>(initialColumns);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(`columns_${key}`);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setVisibleColumns(parsed);
                }
            } catch (e) {
                console.error('Failed to parse stored columns', e);
            }
        }
        setIsLoaded(true);
    }, [key]);

    const toggleColumn = (columnKey: string) => {
        setVisibleColumns((prev) => {
            const newColumns = prev.includes(columnKey)
                ? prev.filter((c) => c !== columnKey)
                : [...prev, columnKey];

            localStorage.setItem(`columns_${key}`, JSON.stringify(newColumns));
            return newColumns;
        });
    };

    const setColumns = (columns: string[]) => {
        setVisibleColumns(columns);
        localStorage.setItem(`columns_${key}`, JSON.stringify(columns));
    };

    return { visibleColumns, toggleColumn, setColumns, isLoaded };
}
