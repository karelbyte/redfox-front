'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTheme, ThemeType } from "@/context/ThemeContext";
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
    const { currentTheme, themes } = useTheme();

    const getImageUrl = (): string => {
        switch (currentTheme) {
            case "blue":
                return "/nitrob.png";
            case "red":
                return "/nitro.png";
            case "green-gray":
                return "/nitrog.png";
            case "gray":
                return "/nitrogy.png";
            case "brown":
                return "/nitrobw.png";
            default:
                return "/nitro.png";
        }
    };

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
            } catch (error) {
                setStatus('error');
            }
        };

        activateAccount();
    }, [token, router, t]);

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ backgroundColor: `rgb(var(--color-secondary-50))` }}
        >
            <div
                className="max-w-md w-full p-8 rounded-xl shadow-lg text-center"
                style={{
                    backgroundColor: "white",
                    border: `1px solid rgb(var(--color-secondary-200))`,
                }}
            >
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

                {status === 'success' && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex-shrink-0 flex items-center self-center mb-4">
                            <img src={getImageUrl()} alt="Nitro" className="h-12 w-auto" />
                        </div>
                        <CheckCircleIcon className="h-16 w-16 text-green-500" />
                        <h2 className="text-2xl font-bold text-gray-800">{t('successTitle')}</h2>
                        <p className="text-gray-600">{t('successMessage')}</p>
                        <Link
                            href="/login"
                            className="mt-4 px-6 py-2 text-white rounded-lg transition-colors font-medium"
                            style={{ backgroundColor: `rgb(var(--color-primary-500))` }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-600))`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-500))`;
                            }}
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
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-600))`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-500))`;
                            }}
                        >
                            {t('backToLogin')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
