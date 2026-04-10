'use client';

import { useEffect, useState, useRef } from 'react';
import { authService } from '@/services/auth.service';
import { useTranslations } from 'next-intl';
import { useTheme } from "@/context/ThemeContext";
import Link from 'next/link';
import { toastService } from '@/services/toast.service';

// Icons
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ActivatePage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'already-active' | 'error'>('loading');
    const t = useTranslations('pages.activate');
    const { currentTheme } = useTheme();

    // Use refs to track state across re-renders and effects
    const activationTried = useRef(false);
    const isSuccess = useRef(false);

    const getImageUrl = (): string => {
        switch (currentTheme) {
            case "blue": return "/nitrob.png";
            case "red": return "/nitro.png";
            case "green-gray": return "/nitrog.png";
            case "gray": return "/nitrogy.png";
            case "brown": return "/nitrobw.png";
            default: return "/nitro.png";
        }
    };

    useEffect(() => {
        // If we already succeeded, NEVER run again or change status
        if (isSuccess.current) return;
        if (activationTried.current) return;

        console.log('[ActivatePage] Effect mounted. URL:', window.location.href);

        const getToken = () => {
            const params = new URLSearchParams(window.location.search);
            return params.get('token');
        };

        const token = getToken();

        if (!token) {
            console.warn('[ActivatePage] No token found on mount. Starting 3-second grace period...');
            const timer = setTimeout(() => {
                // Final check after 3 seconds, ONLY if we haven't succeeded yet
                if (!isSuccess.current && !activationTried.current) {
                    const finalToken = getToken();
                    if (!finalToken) {
                        console.error('[ActivatePage] Token still missing after 3s. Showing error.');
                        setStatus('error');
                    } else {
                        console.log('[ActivatePage] Token found after grace period! Activating...');
                        performActivation(finalToken);
                    }
                }
            }, 3000);
            return () => clearTimeout(timer);
        }

        async function performActivation(tkn: string) {
            if (activationTried.current || isSuccess.current) return;
            activationTried.current = true;

            console.log('[ActivatePage] Triggering activation API...');
            try {
                const response = await authService.activate(tkn);
                console.log('[ActivatePage] API Response:', response);

                if (response.alreadyActive) {
                    isSuccess.current = true;
                    setStatus('already-active');
                } else {
                    isSuccess.current = true;
                    setStatus('success');
                    toastService.success(t('successToast'));
                }
            } catch (error) {
                console.error('[ActivatePage] Activation failed:', error);
                // Only show error if we aren't already successful from a parallel mount/effect
                if (!isSuccess.current) {
                    setStatus('error');
                }
            }
        }

        performActivation(token);
    }, [t]);

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ backgroundColor: `rgb(var(--color-secondary-50))` }}
        >
            <div className="max-w-md w-full p-8 text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex-shrink-0 flex items-center self-center mb-4">
                            <img src={getImageUrl()} alt="Nitro" className="h-12 w-auto" />
                        </div>
                        <div className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full"
                            style={{ borderColor: `rgb(var(--color-primary-500))`, borderTopColor: 'transparent' }}
                        ></div>
                        <h2 className="text-xl font-semibold text-gray-700">{t('activating')}</h2>
                    </div>
                )}

                {(status === 'success') && (
                    <div className="flex flex-col items-center space-y-4 ">
                        <span className="text-3xl font-bold text-gray-800 ">Nitro Stock</span>
                        <CheckCircleIcon className="h-16 w-16 text-green-500" />
                        <h2 className="text-2xl font-bold text-gray-800">{t('successTitle')}</h2>
                        <p className="text-gray-600">{t('successMessage')}</p>
                        <Link
                            href="/login"
                            className="mt-4 px-6 py-2 text-white rounded-lg transition-colors font-medium"
                            style={{ backgroundColor: `rgb(var(--color-primary-500))` }}
                        >
                            {t('loginButton')}
                        </Link>
                    </div>
                )}

                {status === 'already-active' && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex-shrink-0 flex items-center self-center mb-4">
                            <img src={getImageUrl()} alt="Nitro" className="h-12 w-auto" />
                        </div>
                        <CheckCircleIcon className="h-16 w-16 text-blue-500" />
                        <h2 className="text-2xl font-bold text-gray-800">{t('alreadyActiveTitle')}</h2>
                        <p className="text-gray-600">{t('alreadyActiveMessage')}</p>
                        <Link
                            href="/login"
                            className="mt-4 px-6 py-2 text-white rounded-lg transition-colors font-medium"
                            style={{ backgroundColor: `rgb(var(--color-primary-500))` }}
                        >
                            {t('loginButton')}
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex-shrink-0 flex items-center self-center mb-4">
                            <img src={getImageUrl()} alt="Nitro" className="h-12 w-auto" />
                        </div>
                        <XCircleIcon className="h-16 w-16 text-red-500" />
                        <h2 className="text-2xl font-bold text-gray-800">{t('errorTitle')}</h2>
                        <p className="text-gray-600">{t('errorMessage')}</p>
                        <Link
                            href="/login"
                            className="mt-4 px-6 py-2 text-white rounded-lg transition-colors font-medium"
                            style={{ backgroundColor: `rgb(var(--color-primary-500))` }}
                        >
                            {t('backToLogin')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
