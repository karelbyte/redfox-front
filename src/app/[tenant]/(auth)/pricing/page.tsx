'use client';

import { useTheme, ThemeType } from '@/context/ThemeContext';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import PricingCards from '@/components/Pricing/PricingCards';

export default function PricingPage() {
  const { currentTheme, setTheme, themes } = useTheme();
  const locale = useLocale();

  const getImageUrl = (): string => {
    switch (currentTheme) {
      case 'blue':
        return '/nitrob.png';
      case 'red':
        return '/nitro.png';
      case 'green-gray':
        return '/nitrog.png';
      case 'gray':
        return '/nitrogy.png';
      case 'brown':
        return '/nitrobw.png';
      default:
        return '/nitro.png';
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: `rgb(var(--color-secondary-50))` }}
    >
      {/* Selector de tema */}
      <div className="absolute top-4 right-4">
        <select
          value={currentTheme}
          onChange={(e) => setTheme(e.target.value as ThemeType)}
          className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
          style={
            {
              backgroundColor: 'white',
              border: `1px solid rgb(var(--color-secondary-300))`,
              color: `rgb(var(--color-secondary-800))`,
              '--tw-ring-color': `rgb(var(--color-primary-500))`,
            } as React.CSSProperties
          }
        >
          {Object.entries(themes).map(([key, theme]) => (
            <option key={key} value={key}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex-shrink-0 flex items-center justify-center mb-4">
          <img src={getImageUrl()} alt="RedFox" className="h-16 w-auto" />
        </div>
        <h1
          className="text-4xl font-bold mb-4"
          style={{ color: `rgb(var(--color-primary-600))` }}
        >
          Planes de RedFox
        </h1>
        <p
          className="text-lg max-w-2xl mx-auto"
          style={{ color: `rgb(var(--color-secondary-600))` }}
        >
          Elige el plan perfecto para tu negocio. Puedes cambiar de plan en cualquier momento.
        </p>
      </div>

      {/* Pricing Cards */}
      <PricingCards />

      {/* Footer */}
      <div className="mt-12 text-center">
        <p
          className="text-sm mb-4"
          style={{ color: `rgb(var(--color-secondary-600))` }}
        >
          ¿Ya tienes cuenta?{' '}
          <Link
            href={`/${locale}/login`}
            className="font-semibold transition-colors"
            style={{ color: `rgb(var(--color-primary-500))` }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = `rgb(var(--color-primary-600))`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = `rgb(var(--color-primary-500))`;
            }}
          >
            Inicia sesión
          </Link>
        </p>
        <p
          className="text-sm"
          style={{ color: `rgb(var(--color-secondary-600))` }}
        >
          ¿Prefieres crear una cuenta primero?{' '}
          <Link
            href={`/${locale}/register`}
            className="font-semibold transition-colors"
            style={{ color: `rgb(var(--color-primary-500))` }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = `rgb(var(--color-primary-600))`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = `rgb(var(--color-primary-500))`;
            }}
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
