'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const QuotationsPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the quotation list page
    router.replace('/dashboard/cotizaciones/lista-de-cotizaciones');
  }, [router]);

  return null;
};

export default QuotationsPage;