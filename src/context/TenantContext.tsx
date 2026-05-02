'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { locales } from '@/i18n/config';

interface TenantContextType {
    tenant?: string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    const params = useParams();
    const rawTenant = params?.tenant as string;

        const tenant = rawTenant && !locales.includes(rawTenant as any) ? rawTenant : undefined;

    const value = {
        tenant,
    };

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
