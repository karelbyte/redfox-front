'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// Definición de tipos
export type ThemeType = 'red' | 'blue' | 'gray' | 'green-gray' | 'brown'

export interface ThemeContextType {
  currentTheme: ThemeType
  setTheme: (theme: ThemeType) => void
  themes: {
    red: { name: string; primary: string; secondary: string }
    blue: { name: string; primary: string; secondary: string }
    gray: { name: string; primary: string; secondary: string }
    'green-gray': { name: string; primary: string; secondary: string }
    brown: { name: string; primary: string; secondary: string }
  }
}

// Configuración de los temas
const themeConfig = {
  red: {
    name: 'Rojo',
    primary: '#ff5c5c',
    secondary: '#4e4e4e',
    colors: {
      primary: {
        50: '255, 245, 245',
        100: '255, 232, 232',
        200: '255, 209, 209',
        300: '255, 179, 179',
        400: '255, 138, 138',
        500: '255, 92, 92',
        600: '255, 46, 46',
        700: '230, 26, 26',
        800: '193, 20, 20',
        900: '158, 21, 21',
        950: '92, 10, 10',
      },
      secondary: {
        50: '248, 248, 248',
        100: '240, 240, 240',
        200: '228, 228, 228',
        300: '209, 209, 209',
        400: '180, 180, 180',
        500: '154, 154, 154',
        600: '129, 129, 129',
        700: '106, 106, 106',
        800: '90, 90, 90',
        900: '78, 78, 78',
        950: '40, 40, 40',
      }
    }
  },
  blue: {
    name: 'Azul',
    primary: '#3b82f6',
    secondary: '#6b7280',
    colors: {
      primary: {
        50: '239, 246, 255',
        100: '219, 234, 254',
        200: '191, 219, 254',
        300: '147, 197, 253',
        400: '96, 165, 250',
        500: '59, 130, 246',
        600: '37, 99, 235',
        700: '29, 78, 216',
        800: '30, 64, 175',
        900: '30, 58, 138',
        950: '23, 37, 84',
      },
      secondary: {
        50: '249, 250, 251',
        100: '243, 244, 246',
        200: '229, 231, 235',
        300: '209, 213, 219',
        400: '156, 163, 175',
        500: '107, 114, 128',
        600: '75, 85, 99',
        700: '55, 65, 81',
        800: '31, 41, 55',
        900: '17, 24, 39',
        950: '3, 7, 18',
      }
    }
  },
  gray: {
    name: 'Gris',
    primary: '#6b7280',
    secondary: '#9ca3af',
    colors: {
      primary: {
        50: '249, 250, 251',
        100: '243, 244, 246',
        200: '229, 231, 235',
        300: '209, 213, 219',
        400: '156, 163, 175',
        500: '107, 114, 128',
        600: '75, 85, 99',
        700: '55, 65, 81',
        800: '31, 41, 55',
        900: '17, 24, 39',
        950: '3, 7, 18',
      },
      secondary: {
        50: '248, 248, 248',
        100: '240, 240, 240',
        200: '228, 228, 228',
        300: '209, 209, 209',
        400: '180, 180, 180',
        500: '154, 154, 154',
        600: '129, 129, 129',
        700: '106, 106, 106',
        800: '90, 90, 90',
        900: '78, 78, 78',
        950: '40, 40, 40',
      }
    }
  },
  'green-gray': {
    name: 'Verde Gris',
    primary: '#6b7c6b',
    secondary: '#8a9a8a',
    colors: {
      primary: {
        50: '246, 248, 246',
        100: '237, 242, 237',
        200: '220, 230, 220',
        300: '196, 212, 196',
        400: '162, 186, 162',
        500: '107, 124, 107',
        600: '86, 102, 86',
        700: '70, 84, 70',
        800: '58, 70, 58',
        900: '49, 59, 49',
        950: '27, 33, 27',
      },
      secondary: {
        50: '248, 250, 248',
        100: '241, 245, 241',
        200: '226, 232, 226',
        300: '202, 212, 202',
        400: '164, 178, 164',
        500: '138, 154, 138',
        600: '110, 124, 110',
        700: '88, 100, 88',
        800: '70, 80, 70',
        900: '58, 66, 58',
        950: '32, 36, 32',
      }
    }
  },
  brown: {
    name: 'Marrón',
    primary: '#593413',
    secondary: '#8b7355',
    colors: {
      primary: {
        50: '250, 248, 246',
        100: '245, 241, 237',
        200: '235, 229, 220',
        300: '220, 214, 200',
        400: '200, 188, 165',
        500: '89, 52, 19',
        600: '71, 42, 15',
        700: '59, 35, 13',
        800: '47, 28, 10',
        900: '39, 23, 8',
        950: '20, 12, 4',
      },
      secondary: {
        50: '248, 246, 243',
        100: '243, 240, 235',
        200: '235, 230, 220',
        300: '220, 214, 200',
        400: '200, 188, 165',
        500: '139, 115, 85',
        600: '111, 92, 68',
        700: '89, 74, 55',
        800: '71, 59, 44',
        900: '59, 49, 37',
        950: '32, 27, 20',
      }
    }
  }
}

// Crear el contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Proveedor del contexto
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('green-gray')

  // Cargar tema desde localStorage al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('nitro-theme') as ThemeType
        if (savedTheme && themeConfig[savedTheme]) {
          setCurrentTheme(savedTheme)
        }
      } catch (error) {
        console.warn('Error loading theme from localStorage:', error)
      }
    }
  }, [])

  // Aplicar las variables CSS cuando cambie el tema
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const theme = themeConfig[currentTheme]
        const root = document.documentElement

        // Aplicar variables CSS para primary
        Object.entries(theme.colors.primary).forEach(([shade, rgb]) => {
          root.style.setProperty(`--color-primary-${shade}`, rgb)
        })

        // Aplicar variables CSS para secondary
        Object.entries(theme.colors.secondary).forEach(([shade, rgb]) => {
          root.style.setProperty(`--color-secondary-${shade}`, rgb)
        })

        // Aplicar colores para el scrollbar
        const scrollbarColor = currentTheme === 'red' ? '#ef4444' : 
                              currentTheme === 'blue' ? '#3b82f6' : 
                              currentTheme === 'gray' ? '#6b7280' : 
                              currentTheme === 'brown' ? '#593413' : '#6b7c6b'
        
        root.style.setProperty('--scrollbar-thumb', scrollbarColor)
        
        // Actualizar clases del body para el tema
        document.body.setAttribute('data-theme', currentTheme)
      } catch (error) {
        console.warn('Error applying theme CSS variables:', error)
      }
    }
  }, [currentTheme])

  const setTheme = (theme: ThemeType) => {
    setCurrentTheme(theme)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nitro-theme', theme)
      } catch (error) {
        console.warn('Error saving theme to localStorage:', error)
      }
    }
  }

  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    themes: {
      red: { name: themeConfig.red.name, primary: themeConfig.red.primary, secondary: themeConfig.red.secondary },
      blue: { name: themeConfig.blue.name, primary: themeConfig.blue.primary, secondary: themeConfig.blue.secondary },
      gray: { name: themeConfig.gray.name, primary: themeConfig.gray.primary, secondary: themeConfig.gray.secondary },
      'green-gray': { name: themeConfig['green-gray'].name, primary: themeConfig['green-gray'].primary, secondary: themeConfig['green-gray'].secondary },
      brown: { name: themeConfig.brown.name, primary: themeConfig.brown.primary, secondary: themeConfig.brown.secondary },
    }
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook para usar el contexto
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider')
  }
  return context
} 