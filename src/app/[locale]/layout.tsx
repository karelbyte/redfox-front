import { locales } from '@/i18n/config';
import { getMessages } from 'next-intl/server';
import { LocaleProvider } from '@/components/LocaleProvider';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <LocaleProvider messages={messages} locale={locale}>
      {children}
    </LocaleProvider>
  );
} 