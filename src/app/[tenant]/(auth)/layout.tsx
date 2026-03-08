import { getMessages } from 'next-intl/server';
import { LocaleProvider } from '@/components/LocaleProvider';
import { TenantProvider } from '@/context/TenantContext';

export default async function AuthLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ tenant: string }>;
}) {
    const { tenant } = await params;
    // In global auth routes, the 'tenant' parameter is actually the locale
    const locale = tenant;
    const messages = await getMessages({ locale });

    return (
        <TenantProvider>
            <LocaleProvider messages={messages} locale={locale}>
                {children}
            </LocaleProvider>
        </TenantProvider>
    );
}
