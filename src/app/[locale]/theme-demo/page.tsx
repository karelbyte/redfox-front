'use client'

import { useTheme } from '@/context/ThemeContext'
import ThemeSelector, { ThemeSelectorCompact } from '@/components/ThemeSelector'

export default function ThemeDemoPage() {
  const { currentTheme } = useTheme()

  // Definir los tonos de colores
  const colorShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

  // Función para obtener el nombre del tema
  const getThemeName = (theme: string) => {
    switch (theme) {
      case 'red': return 'Rojo'
      case 'blue': return 'Azul'
      case 'gray': return 'Gris'
      case 'green-gray': return 'Verde Gris'
      default: return 'Desconocido'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Sistema de Temas RedFox
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experimenta con nuestros 4 temas disponibles: Rojo, Azul, Gris y Verde Gris. 
            Los cambios se aplican instantáneamente en toda la aplicación.
          </p>
          <div className="mt-6 inline-block">
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `rgb(var(--color-primary-100))`,
                color: `rgb(var(--color-primary-800))`
              }}
            >
              Tema actual: {getThemeName(currentTheme)}
            </span>
          </div>
        </div>

        {/* Selector compacto en la parte superior */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <ThemeSelectorCompact />
          </div>
        </div>

        {/* Selector completo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-12">
          <ThemeSelector />
        </div>

        {/* Ejemplos de componentes con los colores del tema */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Botones */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Botones
            </h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary px-4 py-2 rounded-lg">
                  Botón Primario
                </button>
                <button className="btn-secondary px-4 py-2 rounded-lg">
                  Botón Secundario
                </button>
                <button 
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: `rgb(var(--color-primary-100))`,
                    color: `rgb(var(--color-primary-800))`
                  }}
                >
                  Botón Suave
                </button>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Tarjetas
            </h3>
            <div className="space-y-3">
              <div className="card p-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Tarjeta Normal</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Contenido de la tarjeta</p>
              </div>
              <div 
                className="rounded-lg p-4 border"
                style={{
                  backgroundColor: `rgb(var(--color-primary-50))`,
                  borderColor: `rgb(var(--color-primary-200))`,
                }}
              >
                <h4 
                  className="font-medium"
                  style={{ color: `rgb(var(--color-primary-900))` }}
                >
                  Tarjeta con Tema
                </h4>
                <p 
                  className="text-sm"
                  style={{ color: `rgb(var(--color-primary-700))` }}
                >
                  Contenido con colores del tema
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Paleta de colores */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Paleta de Colores - Tema {getThemeName(currentTheme)}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colores primarios */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Colores Primarios
              </h4>
              <div className="grid grid-cols-6 gap-2">
                {colorShades.map((shade) => (
                  <div key={shade} className="text-center">
                    <div 
                      className="w-full h-12 rounded-md mb-2 border border-gray-200 dark:border-gray-600"
                      style={{
                        backgroundColor: `rgb(var(--color-primary-${shade}))`
                      }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {shade}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Colores secundarios */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Colores Secundarios
              </h4>
              <div className="grid grid-cols-6 gap-2">
                {colorShades.map((shade) => (
                  <div key={shade} className="text-center">
                    <div 
                      className="w-full h-12 rounded-md mb-2 border border-gray-200 dark:border-gray-600"
                      style={{
                        backgroundColor: `rgb(var(--color-secondary-${shade}))`
                      }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {shade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mostrar valores RGB actuales */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
              Valores RGB del Tema Actual
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Primary 500:</span>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: `rgb(var(--color-primary-500))` }}
                  />
                  <code className="text-xs">rgb(var(--color-primary-500))</code>
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Primary 100:</span>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: `rgb(var(--color-primary-100))` }}
                  />
                  <code className="text-xs">rgb(var(--color-primary-100))</code>
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Secondary 500:</span>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: `rgb(var(--color-secondary-500))` }}
                  />
                  <code className="text-xs">rgb(var(--color-secondary-500))</code>
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Secondary 200:</span>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: `rgb(var(--color-secondary-200))` }}
                  />
                  <code className="text-xs">rgb(var(--color-secondary-200))</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ejemplos de uso */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Ejemplos de Uso en Código
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Clases de Tailwind CSS
              </h4>
              <code className="text-sm text-gray-600 dark:text-gray-300">
                className=&quot;bg-primary-500 text-white hover:bg-primary-600&quot;
              </code>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Estilos inline con variables CSS
              </h4>
              <code className="text-sm text-gray-600 dark:text-gray-300">
                style=&#123;&#123; backgroundColor: &#39;rgb(var(--color-primary-500))&#39; &#125;&#125;
              </code>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Hook de React
              </h4>
              <code className="text-sm text-gray-600 dark:text-gray-300">
                const &#123; currentTheme, setTheme &#125; = useTheme()
              </code>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Cambio de tema programático
              </h4>
              <code className="text-sm text-gray-600 dark:text-gray-300">
                setTheme(&#39;green-gray&#39;) // &#39;red&#39;, &#39;blue&#39;, &#39;gray&#39;, &#39;green-gray&#39;
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300">
            Los temas se guardan automáticamente en localStorage y persisten entre sesiones.
          </p>
        </div>
      </div>
    </div>
  )
} 