import { useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { resolveIntlLocale } from '@/lib/format';

export function useLocaleUtils() {
  const locale = useLocale();
  // El país y la moneda de la organización llegan en la sesión, así que los
  // importes se formatean bien desde el primer render.
  const { user } = useAuth();
  const country = user?.organization_country || 'MX';
  const defaultCurrency = user?.organization_currency || 'MXN';
  const intlLocale = resolveIntlLocale(locale, country);

  const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions) => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return new Date(dateString).toLocaleDateString(locale, options || defaultOptions);
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currencyCode?: string, compact: boolean = false) => {
    const code = currencyCode || defaultCurrency;
    const localeStr = intlLocale;
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    if (compact) {
      options.notation = 'compact';
      options.compactDisplay = 'short';
    }

    return new Intl.NumberFormat(localeStr, options).format(amount);
  };

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(locale, options).format(number);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return {
    locale,
    formatDate,
    formatDateShort,
    formatCurrency,
    formatNumber,
    formatPrice,
  };
} 