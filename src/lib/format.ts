/**
 * Locale de Intl a partir del idioma de la interfaz y el país de la
 * organización. El idioma decide los nombres de los meses; el país, el
 * símbolo de la moneda y los separadores: "S/ 1,234.50" frente a
 * "PEN 1,234.50" es exactamente esa diferencia.
 *
 * Refleja la misma función del backend (src/utils/format.utils.ts).
 */
const LANGUAGE_REGIONS: Record<string, string> = {
  en: 'US',
  zh: 'CN',
};

export function resolveIntlLocale(
  language?: string | null,
  country?: string | null,
): string {
  const lang = (language || 'es').split('-')[0].toLowerCase();
  const region = LANGUAGE_REGIONS[lang] ?? (country || 'MX').toUpperCase();

  return `${lang}-${region}`;
}
