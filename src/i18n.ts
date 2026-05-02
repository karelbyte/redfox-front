import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './i18n/config';

export default getRequestConfig(async ({ locale }) => {
    const validLocale = locale && locales.includes(locale as Locale) ? locale : defaultLocale;

  return {
    messages: (await import(`./i18n/locales/${validLocale}.json`)).default,
    locale: validLocale
  };
}); 