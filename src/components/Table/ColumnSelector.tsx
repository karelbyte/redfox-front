import { useState, useRef, useEffect } from 'react';
import { ViewColumnsIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

interface Column {
    key: string;
    label: string;
}

interface ColumnSelectorProps {
    columns: Column[];
    visibleColumns: string[];
    onChange: (columnKey: string) => void;
}

export default function ColumnSelector({ columns, visibleColumns, onChange }: ColumnSelectorProps) {
    const t = useTranslations('common'); // Assuming common translations available
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                title={t('actions.viewColumns') || 'View Columns'}
            >
                <ViewColumnsIcon className="h-5 w-5 text-gray-500" />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            {t('table.columns') || 'Columns'}
                        </div>
                        {columns.map((col) => (
                            <label
                                key={col.key}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-3"
                                    checked={visibleColumns.includes(col.key)}
                                    onChange={() => onChange(col.key)}
                                />
                                {col.label}
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
