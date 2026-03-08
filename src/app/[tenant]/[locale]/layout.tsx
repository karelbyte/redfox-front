import { getMessages } from 'next-intl/server';
import { LocaleProvider } from '@/components/LocaleProvider';
import { TenantProvider } from '@/context/TenantContext';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string, tenant: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <TenantProvider>
      <LocaleProvider messages={messages} locale={locale}>
        {children}
      </LocaleProvider>
    </TenantProvider>
  );
}