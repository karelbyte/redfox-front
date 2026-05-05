'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RRHHPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const tenant = params?.tenant as string;
  const locale = params?.locale as string;

  const modules = [
    { 
      title: 'Empleados', 
      description: 'Gestión completa de empleados',
      href: `/${tenant}/${locale}/dashboard/rrhh/empleados`,
      icon: '👥',
      color: 'bg-blue-500'
    },
    { 
      title: 'Departamentos', 
      description: 'Organización departamental',
      href: `/${tenant}/${locale}/dashboard/rrhh/departamentos`,
      icon: '🏢',
      color: 'bg-purple-500'
    },
    { 
      title: 'Puestos', 
      description: 'Definición de posiciones y salarios',
      href: `/${tenant}/${locale}/dashboard/rrhh/puestos`,
      icon: '💼',
      color: 'bg-green-500'
    },
    { 
      title: 'Asistencia', 
      description: 'Control de entrada y salida',
      href: `/${tenant}/${locale}/dashboard/rrhh/asistencia`,
      icon: '⏰',
      color: 'bg-yellow-500'
    },
    { 
      title: 'Ausencias', 
      description: 'Solicitudes y aprobaciones',
      href: `/${tenant}/${locale}/dashboard/rrhh/ausencias`,
      icon: '📋',
      color: 'bg-orange-500'
    },
    { 
      title: 'Nómina', 
      description: 'Procesamiento de pagos',
      href: `/${tenant}/${locale}/dashboard/rrhh/nomina`,
      icon: '💰',
      color: 'bg-emerald-500'
    },
    { 
      title: 'Documentos', 
      description: 'Gestión de archivos',
      href: `/${tenant}/${locale}/dashboard/rrhh/documentos`,
      icon: '📄',
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recursos Humanos</h1>
        <p className="text-gray-600">Gestión completa del módulo de RRHH</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {modules.map((module, index) => (
          <div
            key={index}
            onClick={() => router.push(module.href)}
            className={`${module.color} rounded-xl p-6 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg`}
          >
            <div className="text-4xl mb-4">{module.icon}</div>
            <h3 className="text-xl font-bold mb-2">{module.title}</h3>
            <p className="text-white/90 text-sm">{module.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-100 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Métricas RRHH</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Total Empleados</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Empleados Activos</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Departamentos</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-600">Solicitudes Pendientes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
