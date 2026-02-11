"use client";

import { useState } from "react";
import { useTheme, ThemeType } from "@/context/ThemeContext";
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { authService } from "@/services/auth.service";
import { toastService } from "@/services/toast.service";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { currentTheme, themes } = useTheme();
    const t = useTranslations('pages.forgotPassword');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setSuccess(true);
            toastService.success(t('success'));
        } catch (error) {
            toastService.error(t('error'));
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ backgroundColor: `rgb(var(--color-secondary-50))` }}
        >
            <div
                className="max-w-md w-full space-y-10 p-10 rounded-xl shadow-lg"
                style={{
                    backgroundColor: "white",
                    border: `1px solid rgb(var(--color-secondary-200))`,
                }}
            >
                <div className="flex flex-col space-y-2">
                    <div className="flex-shrink-0 flex items-center self-center my-4">
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

                {!success ? (
                    <form className="space-y-8" onSubmit={handleSubmit}>
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
                                        "--tw-ring-color": `rgb(var(--color-primary-500))`,
                                        "--tw-ring-offset-color": "white",
                                    } as React.CSSProperties
                                }
                                placeholder="ejemplo@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                        "--tw-ring-color": `rgb(var(--color-primary-500))`,
                                        "--tw-ring-offset-color": "white",
                                    } as React.CSSProperties
                                }
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                        {t('sending')}
                                    </span>
                                ) : (
                                    t('submit')
                                )}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium transition-colors hover:underline"
                                    style={{ color: `rgb(var(--color-primary-600))` }}
                                >
                                    {t('backToLogin')}
                                </Link>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6 text-center">
                        <div className="bg-green-50 p-4 rounded-lg text-green-800 text-sm">
                            {t('success')}
                        </div>
                        <Link
                            href="/login"
                            className="inline-block text-sm font-medium transition-colors hover:underline"
                            style={{ color: `rgb(var(--color-primary-600))` }}
                        >
                            {t('backToLogin')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
