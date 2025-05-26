import { Category } from '@/types/category';
import { PencilIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState, ReactElement } from 'react';
import React from 'react';

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  if (!Array.isArray(categories)) {
    return null;
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderCategoryRow = (category: Category, isChild: boolean = false): ReactElement => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <React.Fragment key={category.id}>
        <tr className={`${isChild ? 'bg-gray-50' : ''}`}>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            <div className="flex items-center">
              {hasChildren && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="mr-2 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <ChevronDownIcon
                    className={`h-5 w-5 transform transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
              <span className={hasChildren ? 'font-medium' : ''}>
                {category.name}
                {hasChildren && category.children && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({category.children.length} subcategorías)
                  </span>
                )}
              </span>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.slug}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            {category.image && (
              <img 
                src={`${process.env.NEXT_PUBLIC_URL_API}${category.image}`}
                alt={category.name}
                width={80}
                height={80}
                className="object-contain rounded-lg border border-gray-200"
              />
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.description}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {category.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => onEdit(category)}
                className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                title="Editar"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(category)}
                className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                title="Eliminar"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && category.children && (
          <>
            {category.children.map(child => renderCategoryRow(child, true))}
          </>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Slug
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Imagen
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map(category => renderCategoryRow(category, false))}
        </tbody>
      </table>
    </div>
  );
} 