'use client'

import { useTheme, ThemeType } from '@/context/ThemeContext'
import { CheckIcon } from '@heroicons/react/24/solid'

interface ThemeSelectorProps {
  className?: string
}

export default function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { currentTheme, setTheme, themes } = useTheme()

  const themeOptions: Array<{
    key: ThemeType
    name: string
    colors: { primary: string; secondary: string }
    description: string
  }> = [
    {
      key: 'red',
      name: themes.red.name,
      colors: { primary: themes.red.primary, secondary: themes.red.secondary },
      description: 'Tema cálido y enérgico'
    },
    {
      key: 'blue',
      name: themes.blue.name,
      colors: { primary: themes.blue.primary, secondary: themes.blue.secondary },
      description: 'Tema profesional y confiable'
    },
    {
      key: 'gray',
      name: themes.gray.name,
      colors: { primary: themes.gray.primary, secondary: themes.gray.secondary },
      description: 'Tema minimalista y elegante'
    },
    {
      key: 'green-gray',
      name: themes['green-gray'].name,
      colors: { primary: themes['green-gray'].primary, secondary: themes['green-gray'].secondary },
      description: 'Tema natural y sofisticado'
    }
  ]

  return (
    <div className={`p-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Seleccionar Tema
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Elige el tema que mejor se adapte a tu estilo
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {themeOptions.map((theme) => (
          <button
            key={theme.key}
            onClick={() => setTheme(theme.key)}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-200 
              hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2
              ${currentTheme === theme.key
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            {/* Indicador de selección */}
            {currentTheme === theme.key && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
            )}

            {/* Vista previa de colores */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex space-x-1">
                <div
                  className="w-8 h-8 rounded-full shadow-inner"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div
                  className="w-8 h-8 rounded-full shadow-inner"
                  style={{ backgroundColor: theme.colors.secondary }}
                />
              </div>
            </div>

            {/* Información del tema */}
            <div className="text-left">
              <h4 className={`font-semibold text-base mb-1 ${
                currentTheme === theme.key 
                  ? 'text-primary-700 dark:text-primary-300' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {theme.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {theme.description}
              </p>
            </div>

            {/* Barra de ejemplo con el tema */}
            <div className="mt-4 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full w-3/4 rounded-full"
                style={{ backgroundColor: theme.colors.primary }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          El tema seleccionado se aplicará inmediatamente y se guardará para futuras visitas
        </p>
      </div>
    </div>
  )
}

// Componente compacto para usar en barras de navegación
export function ThemeSelectorCompact({ className = '' }: ThemeSelectorProps) {
  const { currentTheme, setTheme, themes } = useTheme()

  const themeOptions: Array<{
    key: ThemeType
    name: string
    color: string
  }> = [
    { key: 'red', name: themes.red.name, color: themes.red.primary },
    { key: 'blue', name: themes.blue.name, color: themes.blue.primary },
    { key: 'gray', name: themes.gray.name, color: themes.gray.primary },
    { key: 'green-gray', name: themes['green-gray'].name, color: themes['green-gray'].primary }
  ]

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex space-x-1">
        {themeOptions.map((theme) => (
          <button
            key={theme.key}
            onClick={() => setTheme(theme.key)}
            className={`
              w-8 h-8 rounded-full border-2 transition-all duration-200
              hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              ${currentTheme === theme.key
                ? 'border-white dark:border-gray-800 ring-2 ring-primary-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }
            `}
            style={{ backgroundColor: theme.color }}
            title={`Cambiar a tema ${theme.name}`}
          >
            {currentTheme === theme.key && (
              <CheckIcon className="w-4 h-4 text-white mx-auto" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
} 