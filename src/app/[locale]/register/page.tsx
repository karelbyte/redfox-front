'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme, ThemeType } from '@/context/ThemeContext';
import { useTranslations } from 'next-intl';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toastService } from '@/services/toast.service';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);
    const { currentTheme, setTheme, themes } = useTheme();
    const t = useTranslations('pages.register');
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password !== formData.password_confirmation) {
            toastService.error(t('passwordMismatch'));
            setLoading(false);
            return;
        }

        try {
            await authService.register(formData);
            toastService.success(t('success'));
            router.push('/login');
        } catch {
            // Error is handled in service
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (): string => {
        switch (currentTheme) {
            case 'blue':
                return '/nitrob.png';
            case 'red':
                return '/nitro.png';
            case 'green-gray':
                return '/nitrog.png';
            case 'gray':
                return '/nitrogy.png';
            case 'brown':
                return '/nitrobw.png';
            default:
                return '/nitro.png';
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ backgroundColor: `rgb(var(--color-secondary-50))` }}
        >
            <div
                className="max-w-md w-full space-y-8 p-10 rounded-xl shadow-lg"
                style={{
                    backgroundColor: 'white',
                    border: `1px solid rgb(var(--color-secondary-200))`,
                }}
            >
                {/* Selector de tema */}
                <div className="absolute top-4 right-4">
                    <select
                        value={currentTheme}
                        onChange={(e) => setTheme(e.target.value as ThemeType)}
                        className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                        style={
                            {
                                backgroundColor: 'white',
                                border: `1px solid rgb(var(--color-secondary-300))`,
                                color: `rgb(var(--color-secondary-800))`,
                                '--tw-ring-color': `rgb(var(--color-primary-500))`,
                            } as React.CSSProperties
                        }
                    >
                        {Object.entries(themes).map(([key, theme]) => (
                            <option key={key} value={key}>
                                {theme.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col space-y-2">
                    <div className="flex-shrink-0 flex items-center self-center my-2">
                        <img src={getImageUrl()} alt="Nitro" className="h-12 w-auto" />
                    </div>
                    <h2
                        className="text-center text-2xl font-bold"
                        style={{ color: `rgb(var(--color-primary-600))` }}
                    >
                        {t('title')}
                    </h2>
                    <p
                        className="text-center"
                        style={{ color: `rgb(var(--color-secondary-600))` }}
                    >
                        {t('subtitle')}
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium mb-2"
                            style={{ color: `rgb(var(--color-secondary-700))` }}
                        >
                            {t('name')}
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="appearance-none block w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                            style={
                                {
                                    border: `1px solid rgb(var(--color-secondary-300))`,
                                    '--tw-ring-color': `rgb(var(--color-primary-500))`,
                                    '--tw-ring-offset-color': 'white',
                                } as React.CSSProperties
                            }
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium mb-2"
                            style={{ color: `rgb(var(--color-secondary-700))` }}
                        >
                            {t('email')}
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="appearance-none block w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                            style={
                                {
                                    border: `1px solid rgb(var(--color-secondary-300))`,
                                    '--tw-ring-color': `rgb(var(--color-primary-500))`,
                                    '--tw-ring-offset-color': 'white',
                                } as React.CSSProperties
                            }
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium mb-2"
                            style={{ color: `rgb(var(--color-secondary-700))` }}
                        >
                            {t('password')}
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="appearance-none block w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                            style={
                                {
                                    border: `1px solid rgb(var(--color-secondary-300))`,
                                    '--tw-ring-color': `rgb(var(--color-primary-500))`,
                                    '--tw-ring-offset-color': 'white',
                                } as React.CSSProperties
                            }
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password_confirmation"
                            className="block text-sm font-medium mb-2"
                            style={{ color: `rgb(var(--color-secondary-700))` }}
                        >
                            {t('confirmPassword')}
                        </label>
                        <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            required
                            className="appearance-none block w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                            style={
                                {
                                    border: `1px solid rgb(var(--color-secondary-300))`,
                                    '--tw-ring-color': `rgb(var(--color-primary-500))`,
                                    '--tw-ring-offset-color': 'white',
                                } as React.CSSProperties
                            }
                            value={formData.password_confirmation}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3.5 px-4 text-base font-semibold rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                            style={
                                {
                                    backgroundColor: `rgb(var(--color-primary-500))`,
                                    border: `1px solid rgb(var(--color-primary-500))`,
                                    '--tw-ring-color': `rgb(var(--color-primary-500))`,
                                    '--tw-ring-offset-color': 'white',
                                } as React.CSSProperties
                            }
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                    {t('registering')}
                                </span>
                            ) : (
                                t('registerButton')
                            )}
                        </button>

                        <div className="text-center">
                            <Link
                                href="/login"
                                className="text-sm transition-colors"
                                style={{ color: `rgb(var(--color-primary-500))` }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = `rgb(var(--color-primary-600))`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = `rgb(var(--color-primary-500))`;
                                }}
                            >
                                {t('loginLink')}
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
