'use client'

import { useState } from 'react'
import { Btn } from '@/components/atoms'
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline'

export default function ButtonDemoPage() {
  const [loading, setLoading] = useState(false)

  const simulateLoading = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Demo del Componente Btn
        </h1>
        <p className="text-gray-600">
          Componente de botón escalable con múltiples variantes, tamaños y estados
        </p>
      </div>

      {/* Variantes */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Variantes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Btn variant="primary">Primary</Btn>
          <Btn variant="secondary">Secondary</Btn>
          <Btn variant="outline">Outline</Btn>
          <Btn variant="ghost">Ghost</Btn>
          <Btn variant="danger">Danger</Btn>
          <Btn variant="success">Success</Btn>
        </div>
      </section>

      {/* Tamaños */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tamaños</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Btn size="xs">Extra Small</Btn>
          <Btn size="sm">Small</Btn>
          <Btn size="md">Medium</Btn>
          <Btn size="lg">Large</Btn>
          <Btn size="xl">Extra Large</Btn>
        </div>
      </section>

      {/* Con iconos */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Con Iconos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Btn leftIcon={<PlusIcon className="w-4 h-4" />}>
            Crear Nuevo
          </Btn>
          <Btn variant="danger" leftIcon={<TrashIcon className="w-4 h-4" />}>
            Eliminar
          </Btn>
          <Btn variant="outline" leftIcon={<PencilIcon className="w-4 h-4" />}>
            Editar
          </Btn>
          <Btn variant="success" rightIcon={<CheckIcon className="w-4 h-4" />}>
            Confirmar
          </Btn>
        </div>
      </section>

      {/* Solo iconos */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Solo Iconos</h2>
        <div className="flex flex-wrap gap-4">
          <Btn leftIcon={<PlusIcon className="w-5 h-5" />} title="Agregar" />
          <Btn variant="danger" leftIcon={<TrashIcon className="w-5 h-5" />} title="Eliminar" />
          <Btn variant="outline" leftIcon={<PencilIcon className="w-5 h-5" />} title="Editar" />
          <Btn variant="ghost" leftIcon={<CheckIcon className="w-5 h-5" />} title="Confirmar" />
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Perfecto para barras de herramientas y acciones de tabla
        </p>
      </section>

      {/* Estados */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Estados</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Btn>Normal</Btn>
          <Btn disabled>Deshabilitado</Btn>
          <Btn loading={loading} onClick={simulateLoading}>
            {loading ? 'Cargando...' : 'Con Loading'}
          </Btn>
          <Btn loading>Siempre Cargando</Btn>
        </div>
      </section>

      {/* Ancho completo */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ancho Completo</h2>
        <div className="space-y-4">
          <Btn fullWidth>Botón de Ancho Completo</Btn>
          <Btn variant="outline" fullWidth leftIcon={<PlusIcon className="w-4 h-4" />}>
            Outline Full Width con Icono
          </Btn>
        </div>
      </section>

      {/* Casos de uso comunes */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Casos de Uso Comunes</h2>
        
        {/* Formulario */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Formulario</h3>
          <div className="flex gap-3">
            <Btn variant="outline">Cancelar</Btn>
            <Btn type="submit">Guardar</Btn>
          </div>
        </div>

        {/* Acciones de tabla */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Acciones de Tabla</h3>
          <div className="flex gap-2">
            <Btn size="sm" variant="ghost" leftIcon={<PencilIcon className="w-3 h-3" />}>
              Editar
            </Btn>
            <Btn size="sm" variant="danger" leftIcon={<TrashIcon className="w-3 h-3" />}>
              Eliminar
            </Btn>
          </div>
        </div>

        {/* CTA Principal */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Call to Action</h3>
          <Btn size="lg" leftIcon={<PlusIcon className="w-5 h-5" />}>
            Crear Nuevo Cliente
          </Btn>
        </div>
      </section>

      {/* Código de ejemplo */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ejemplo de Uso</h2>
        <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
          <pre><code>{`import { Btn } from '@/components/atoms'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

// Uso básico
<Btn onClick={() => console.log('Click!')}>
  Botón Básico
</Btn>

// Con variante y tamaño
<Btn variant="outline" size="lg">
  Botón Grande
</Btn>

// Con icono y texto
<Btn 
  loading={isLoading}
  leftIcon={<PlusIcon className="w-4 h-4" />}
  onClick={handleCreate}
>
  Crear Nuevo
</Btn>

// Solo icono (sin texto)
<Btn 
  variant="ghost"
  leftIcon={<TrashIcon className="w-4 h-4" />}
  title="Eliminar"
  onClick={handleDelete}
/>

// Botón de peligro deshabilitado
<Btn variant="danger" disabled>
  Eliminar
</Btn>`}</code></pre>
        </div>
      </section>
    </div>
  )
} 