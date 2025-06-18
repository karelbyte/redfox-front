'use client'

import { Tax } from '@/types/tax';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Btn } from '@/components/atoms';

interface TaxTableProps {
  taxes: Tax[];
  onEdit: (tax: Tax) => void;
  onDelete: (tax: Tax) => void;
}

export default function TaxTable({ taxes, onEdit, onDelete }: TaxTableProps) {
  if (!Array.isArray(taxes)) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              Valor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {taxes.map((tax) => (
            <tr key={tax.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tax.code}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tax.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {tax.type === 'PERCENTAGE' ? `${tax.value}%` : tax.value}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {tax.type === 'PERCENTAGE' ? 'Porcentaje' : 'Valor Fijo'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    tax.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {tax.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Btn
                    onClick={() => onEdit(tax)}
                    variant="ghost"
                    size="sm"
                    leftIcon={<PencilIcon className="h-4 w-4" />}
                    title="Editar"
                  />
                  <Btn
                    onClick={() => onDelete(tax)}
                    variant="ghost"
                    size="sm"
                    leftIcon={<TrashIcon className="h-4 w-4" />}
                    title="Eliminar"
                    style={{ color: '#dc2626' }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 