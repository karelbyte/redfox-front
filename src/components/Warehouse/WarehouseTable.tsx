"use client";

import { Warehouse } from "@/types/warehouse";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { warehousesService } from "@/services/warehouses.service";
import { toastService } from "@/services/toast.service";

interface WarehouseTableProps {
  warehouses: Warehouse[];
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
}

export default function WarehouseTable({
  warehouses,
  onEdit,
  onDelete,
}: WarehouseTableProps) {
  const handleCloseWarehouse = async (warehouse: Warehouse) => {
    try {
      await warehousesService.updateStatus(warehouse.id, false);
      toastService.success("Almacén cerrado correctamente");
    } catch (error) {
      console.error("Error al cerrar el almacén:", error);
      toastService.error("Error al cerrar el almacén");
    }
  };

  if (!Array.isArray(warehouses)) {
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dirección
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teléfono
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Apertura
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {warehouses.map((warehouse) => (
            <tr key={warehouse.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {warehouse.code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {warehouse.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {warehouse.address}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {warehouse.phone}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    warehouse.status
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {warehouse.status ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    warehouse.is_open
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {warehouse.is_open ? "Abierto" : "Cerrado"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  {warehouse.is_open && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Aperturar
                    </button>
                  )}
                  {warehouse.is_open && (
                    <button
                      onClick={() => handleCloseWarehouse(warehouse)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Cerrar Apertura
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(warehouse)}
                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(warehouse)}
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
