'use client'

import { Currency } from '@/types/currency';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CurrencyTableProps {
  currencies: Currency[];
  onEdit: (currency: Currency) => void;
  onDelete: (currency: Currency) => void;
}

export default function CurrencyTable({ currencies, onEdit, onDelete }: CurrencyTableProps) {
  if (!Array.isArray(currencies)) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currencies.map((currency) => (
            <tr key={currency.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{currency.code}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{currency.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onEdit(currency)}
                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(currency)}
                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 