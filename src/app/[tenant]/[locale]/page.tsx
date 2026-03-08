'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading/Loading';

export default function Home() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading } = useAuth();

  const tenant = params?.tenant as string;
  const locale = params?.locale as string;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(`/${tenant}/${locale}/dashboard`);
    } else if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, isLoading, router, tenant, locale]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return null;
} 