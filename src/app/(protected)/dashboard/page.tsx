'use client';

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary-600">Dashboard</h1>
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Información del usuario</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Nombre:</span> {user?.name}</p>
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">Rol:</span> {user?.roles[0]?.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 