"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { authService } from "@/services/auth.service";
import { toastService } from "@/services/toast.service";
import { Suspense } from "react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { currentTheme } = useTheme();
    const t = useTranslations('pages.resetPassword');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toastService.error(t('passwordsDontMatch'));
            return;
        }

        if (!token) {
            toastService.error(t('error'));
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(token, password);
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
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: `rgb(var(--color-secondary-700))` }}
                                >
                                    {t('newPassword')}
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
                                            "--tw-ring-color": `rgb(var(--color-primary-500))`,
                                            "--tw-ring-offset-color": "white",
                                        } as React.CSSProperties
                                    }
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: `rgb(var(--color-secondary-700))` }}
                                >
                                    {t('confirmPassword')}
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="appearance-none block w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                                    style={
                                        {
                                            border: `1px solid rgb(var(--color-secondary-300))`,
                                            "--tw-ring-color": `rgb(var(--color-primary-500))`,
                                            "--tw-ring-offset-color": "white",
                                        } as React.CSSProperties
                                    }
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={loading || !token}
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
                                        {t('updating')}
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
                            className="inline-block text-base font-semibold py-3 px-8 rounded-lg text-white transition-all duration-200 shadow-sm hover:shadow-md"
                            style={{
                                backgroundColor: `rgb(var(--color-primary-500))`,
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
