'use client';

import { useTheme } from '@/context/ThemeContext';
import { CheckIcon } from '@heroicons/react/24/outline';

interface PricingPlan {
  name: string;
  price: number;
  description: string;
  features: string[];
  limitations: string[];
  highlighted?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: 'Básico',
    price: 500,
    description: 'Perfecto para pequeños negocios',
    features: [
      '1 usuario',
      '1 almacén',
      'Hasta 1,000 productos',
      'Hasta 500 clientes',
      'Gestión de inventario (FIFO)',
      'Cotizaciones y ventas básicas',
      'Facturas simples',
      'Reportes básicos',
      'Soporte por email',
    ],
    limitations: [
      'Sin crédito a clientes',
      'Sin CFDI/Timbrado',
      'Sin múltiples almacenes',
      'Sin API REST',
    ],
  },
  {
    name: 'Pro',
    price: 700,
    description: 'Para empresas en crecimiento',
    features: [
      'Usuarios ilimitados',
      'Almacenes ilimitados',
      'Productos ilimitados',
      'Clientes ilimitados',
      'Todas las estrategias de inventario',
      'Gestión de crédito',
      'CFDI y timbrado electrónico',
      'Reportes avanzados',
      'API REST y Webhooks',
      'Soporte prioritario 24h',
    ],
    limitations: [],
    highlighted: true,
  },
];

export default function PricingCards() {
  const { currentTheme } = useTheme();

  const getThemeColors = () => {
    const colors: Record<string, any> = {
      red: {
        primary: 'rgb(255, 92, 92)',
        light: 'rgb(255, 245, 245)',
        dark: 'rgb(230, 26, 26)',
        border: 'rgb(255, 200, 200)',
      },
      blue: {
        primary: 'rgb(59, 130, 246)',
        light: 'rgb(239, 246, 255)',
        dark: 'rgb(29, 78, 216)',
        border: 'rgb(191, 219, 254)',
      },
      gray: {
        primary: 'rgb(107, 114, 128)',
        light: 'rgb(249, 250, 251)',
        dark: 'rgb(55, 65, 81)',
        border: 'rgb(209, 213, 219)',
      },
      'green-gray': {
        primary: 'rgb(107, 124, 107)',
        light: 'rgb(246, 248, 246)',
        dark: 'rgb(70, 84, 70)',
        border: 'rgb(200, 230, 201)',
      },
      brown: {
        primary: 'rgb(89, 52, 19)',
        light: 'rgb(250, 248, 246)',
        dark: 'rgb(59, 35, 13)',
        border: 'rgb(214, 211, 209)',
      },
    };
    return colors[currentTheme] || colors['green-gray'];
  };

  const themeColors = getThemeColors();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
      {plans.map((plan, index) => (
        <div
          key={index}
          className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
            plan.highlighted ? 'md:scale-105 shadow-2xl' : 'shadow-lg'
          }`}
          style={{
            backgroundColor: 'white',
            border: `2px solid ${plan.highlighted ? themeColors.primary : themeColors.border}`,
          }}
        >
          {/* Badge Pro */}
          {plan.highlighted && (
            <div
              className="absolute top-0 right-0 px-4 py-2 text-white text-sm font-bold rounded-bl-lg"
              style={{ backgroundColor: themeColors.primary }}
            >
              RECOMENDADO
            </div>
          )}

          {/* Contenido */}
          <div className="p-8">
            {/* Encabezado */}
            <div className="mb-6">
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: themeColors.primary }}
              >
                {plan.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

              {/* Precio */}
              <div className="flex items-baseline gap-2">
                <span
                  className="text-4xl font-bold"
                  style={{ color: themeColors.primary }}
                >
                  ${plan.price}
                </span>
                <span className="text-gray-600">/mes</span>
              </div>
            </div>

            {/* Botón */}
            <button
              className={`w-full py-3 px-4 rounded-lg font-semibold mb-8 transition-all duration-200 ${
                plan.highlighted
                  ? 'text-white hover:shadow-lg'
                  : 'text-white hover:shadow-lg'
              }`}
              style={{
                backgroundColor: plan.highlighted
                  ? themeColors.primary
                  : themeColors.dark,
              }}
            >
              Seleccionar Plan
            </button>

            {/* Características */}
            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 mb-4">Incluye:</h4>
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckIcon
                      className="h-5 w-5 flex-shrink-0 mt-0.5"
                      style={{ color: themeColors.primary }}
                    />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Limitaciones */}
            {plan.limitations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">No incluye:</h4>
                <ul className="space-y-2">
                  {plan.limitations.map((limitation, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-gray-400 text-sm">✕</span>
                      <span className="text-gray-500 text-sm">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
