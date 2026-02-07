'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toastService } from '@/services/toast.service';

// Icons
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ActivatePage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const t = useTranslations('pages.activate');
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const activateAccount = async () => {
            try {
                await authService.activate(token);
                setStatus('success');
                toastService.success(t('successToast'));
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } catch (error) {
                setStatus('error');
            }
        };

        activateAccount();
    }, [token, router, t]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        <h2 className="text-xl font-semibold text-gray-700">{t('activating')}</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center space-y-4">
                        <CheckCircleIcon className="h-16 w-16 text-green-500" />
                        <h2 className="text-2xl font-bold text-gray-800">{t('successTitle')}</h2>
                        <p className="text-gray-600">{t('successMessage')}</p>
                        <Link
                            href="/login"
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {t('loginButton')}
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center space-y-4">
                        <XCircleIcon className="h-16 w-16 text-red-500" />
                        <h2 className="text-2xl font-bold text-gray-800">{t('errorTitle')}</h2>
                        <p className="text-gray-600">{t('errorMessage')}</p>
                        <Link
                            href="/login"
                            className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            {t('backToLogin')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
