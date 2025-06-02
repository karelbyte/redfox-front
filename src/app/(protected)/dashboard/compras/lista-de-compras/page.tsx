'use client'

import { useState } from 'react';

export default function PurchaseListPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-red-900">
          Lista de Compras
        </h1>
        <button
          onClick={() => {
            // Aquí irá la navegación a crear compra
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Nueva Compra
        </button>
      </div>

      <div className="mt-6">
        {/* Aquí irá la tabla de compras */}
        <p className="text-gray-500">Lista de compras en desarrollo...</p>
      </div>
    </div>
  );
} 