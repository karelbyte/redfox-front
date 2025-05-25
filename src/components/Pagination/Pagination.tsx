import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, className = '' }: PaginationProps) {
  return (
    <div className={`flex justify-end items-center space-x-2 ${className}`}>
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:hover:text-gray-600 transition-colors"
        title="Página anterior"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <span className="px-3 py-1 text-sm text-gray-600">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2 text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:hover:text-gray-600 transition-colors"
        title="Página siguiente"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
} 