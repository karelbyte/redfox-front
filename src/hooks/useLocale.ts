import { useLocale } from 'next-intl';

export function useLocaleUtils() {
  const locale = useLocale();

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

  const formatCurrency = (amount: number, currencyCode: string = 'MXN', compact: boolean = false) => {
    const code = currencyCode || 'MXN';
    const localeStr = code === 'MXN' ? 'es-MX' : locale === 'es' ? 'es-MX' : 'en-US';
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