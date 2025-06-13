'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

// Tipos de variantes del botón
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'

// Tipos de tamaño del botón
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Props del componente
interface BtnProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** Variante visual del botón */
  variant?: ButtonVariant
  /** Tamaño del botón */
  size?: ButtonSize
  /** Estado de carga */
  loading?: boolean
  /** Icono a mostrar antes del texto */
  leftIcon?: React.ReactNode
  /** Icono a mostrar después del texto */
  rightIcon?: React.ReactNode
  /** Ocupar todo el ancho disponible */
  fullWidth?: boolean
  /** Texto del botón (opcional para botones solo con iconos) */
  children?: React.ReactNode
}

const Btn = forwardRef<HTMLButtonElement, BtnProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Determinar si el botón está deshabilitado
    const isDisabled = disabled || loading

    // Estilos base comunes
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '500' as const,
      borderRadius: '0.5rem',
      border: 'none',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease-in-out',
      opacity: isDisabled ? 0.6 : 1,
      width: fullWidth ? '100%' : 'auto',
    }

    // Estilos por tamaño
    const sizeStyles = {
      xs: {
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        lineHeight: '1rem',
        gap: '0.25rem',
      },
      sm: {
        padding: '0.375rem 0.75rem',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        gap: '0.375rem',
      },
      md: {
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        gap: '0.5rem',
      },
      lg: {
        padding: '0.625rem 1.25rem',
        fontSize: '1rem',
        lineHeight: '1.5rem',
        gap: '0.5rem',
      },
      xl: {
        padding: '0.75rem 1.5rem',
        fontSize: '1.125rem',
        lineHeight: '1.75rem',
        gap: '0.625rem',
      },
    }

    // Estilos por variante
    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: `rgb(var(--color-primary-500))`,
            color: 'white',
            border: `1px solid rgb(var(--color-primary-500))`,
          }
        
        case 'secondary':
          return {
            backgroundColor: `rgb(var(--color-secondary-200))`,
            color: `rgb(var(--color-secondary-800))`,
            border: `1px solid rgb(var(--color-secondary-300))`,
          }
        
        case 'outline':
          return {
            backgroundColor: 'transparent',
            color: `rgb(var(--color-primary-600))`,
            border: `1px solid rgb(var(--color-primary-300))`,
          }
        
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: `rgb(var(--color-primary-600))`,
            border: '1px solid transparent',
          }
        
        case 'danger':
          return {
            backgroundColor: '#dc2626',
            color: 'white',
            border: '1px solid #dc2626',
          }
        
        case 'success':
          return {
            backgroundColor: '#059669',
            color: 'white',
            border: '1px solid #059669',
          }
        
        default:
          return {
            backgroundColor: `rgb(var(--color-primary-500))`,
            color: 'white',
            border: `1px solid rgb(var(--color-primary-500))`,
          }
      }
    }

    // Estilos de hover
    const getHoverStyles = () => {
      if (isDisabled) return {}
      
      // Detectar si es solo un ícono (no tiene children pero sí tiene leftIcon o rightIcon)
      const isIconOnly = !children && (leftIcon || rightIcon)
      
      switch (variant) {
        case 'primary':
          return isIconOnly ? {
            color: `rgb(var(--color-primary-700))`,
          } : {
            backgroundColor: `rgb(var(--color-primary-600))`,
            borderColor: `rgb(var(--color-primary-600))`,
          }
        
        case 'secondary':
          return isIconOnly ? {
            color: `rgb(var(--color-secondary-900))`,
          } : {
            backgroundColor: `rgb(var(--color-secondary-300))`,
            borderColor: `rgb(var(--color-secondary-400))`,
          }
        
        case 'outline':
          return isIconOnly ? {
            color: `rgb(var(--color-primary-700))`,
          } : {
            backgroundColor: `rgb(var(--color-primary-50))`,
            borderColor: `rgb(var(--color-primary-400))`,
          }
        
        case 'ghost':
          return isIconOnly ? {
            color: `rgb(var(--color-primary-700))`,
          } : {
            backgroundColor: `rgb(var(--color-primary-50))`,
          }
        
        case 'danger':
          return isIconOnly ? {
            color: '#991b1b',
          } : {
            backgroundColor: '#b91c1c',
            borderColor: '#b91c1c',
          }
        
        case 'success':
          return isIconOnly ? {
            color: '#065f46',
          } : {
            backgroundColor: '#047857',
            borderColor: '#047857',
          }
        
        default:
          return isIconOnly ? {
            color: `rgb(var(--color-primary-700))`,
          } : {
            backgroundColor: `rgb(var(--color-primary-600))`,
            borderColor: `rgb(var(--color-primary-600))`,
          }
      }
    }

    // Combinar todos los estilos
    const buttonStyles = {
      ...baseStyles,
      ...sizeStyles[size],
      ...getVariantStyles(),
    }

    // Manejadores de eventos
    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        const isIconOnly = !children && (leftIcon || rightIcon)
        const currentColor = e.currentTarget.style.color
        
        // Si es un ícono con color personalizado, oscurecer ese color
        if (isIconOnly && currentColor) {
          // Mapeo de colores comunes a sus versiones más oscuras
          const colorMap: { [key: string]: string } = {
            '#dc2626': '#991b1b', // rojo danger
            'rgb(220, 38, 38)': '#991b1b',
            '#059669': '#065f46', // verde success
            'rgb(5, 150, 105)': '#065f46',
          }
          
          const darkerColor = colorMap[currentColor] || currentColor
          e.currentTarget.style.color = darkerColor
        } else {
          // Comportamiento normal
          const hoverStyles = getHoverStyles()
          Object.assign(e.currentTarget.style, hoverStyles)
        }
      }
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        const isIconOnly = !children && (leftIcon || rightIcon)
        const currentColor = props.style?.color
        
        // Si es un ícono con color personalizado, restaurar el color original
        if (isIconOnly && currentColor) {
          e.currentTarget.style.color = currentColor
        } else {
          // Comportamiento normal
          const originalStyles = getVariantStyles()
          Object.assign(e.currentTarget.style, originalStyles)
        }
      }
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled && onClick) {
        onClick(e)
      }
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={className}
        style={buttonStyles}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        {...props}
      >
        {/* Icono izquierdo o spinner de carga */}
        {loading ? (
          <Loader2 className="animate-spin" size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        
        {/* Texto del botón */}
        {children && children}
        
        {/* Icono derecho (solo si no está cargando) */}
        {!loading && rightIcon && rightIcon}
      </button>
    )
  }
)

Btn.displayName = 'Btn'

export default Btn

// Hook para facilitar el uso con diferentes variantes
export const useBtnVariants = () => ({
  primary: (props: Omit<BtnProps, 'variant'>) => <Btn variant="primary" {...props} />,
  secondary: (props: Omit<BtnProps, 'variant'>) => <Btn variant="secondary" {...props} />,
  outline: (props: Omit<BtnProps, 'variant'>) => <Btn variant="outline" {...props} />,
  ghost: (props: Omit<BtnProps, 'variant'>) => <Btn variant="ghost" {...props} />,
  danger: (props: Omit<BtnProps, 'variant'>) => <Btn variant="danger" {...props} />,
  success: (props: Omit<BtnProps, 'variant'>) => <Btn variant="success" {...props} />,
})

// Exports adicionales
export type { BtnProps, ButtonVariant, ButtonSize } 