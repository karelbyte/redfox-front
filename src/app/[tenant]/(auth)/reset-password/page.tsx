"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { authService } from "@/services/auth.service";
import { toastService } from "@/services/toast.service";
import { Suspense } from "react";
import AuthThemeSelector from "@/components/AuthThemeSelector";

function ResetPasswordForm() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { currentTheme } = useTheme();
  const t = useTranslations('pages.resetPassword');
  const locale = useLocale();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URL(window.location.href);
      setToken(urlParams.searchParams.get('token'));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toastService.error(t('passwordsDontMatch')); return; }
    if (!token) { toastService.error(t('error')); return; }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      toastService.success(t('success'));
    } catch {
      toastService.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (): string => {
    const map: Record<string, string> = { blue: '/nitrob.png', red: '/nitro.png', 'green-gray': '/nitrog.png', gray: '/nitrogy.png', brown: '/nitrobw.png' };
    return map[currentTheme] || '/nitro.png';
  };

  const inputStyle: React.CSSProperties = {
    border: `1px solid rgb(var(--color-secondary-300))`,
    '--tw-ring-color': `rgb(var(--color-primary-400))`,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: `rgb(var(--color-secondary-50))` }}>

      {/* Panel izquierdo */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 relative overflow-hidden"
        style={{ backgroundColor: `rgb(var(--color-primary-600))` }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="relative z-10 text-center max-w-sm">
          <div className="bg-white rounded-2xl p-4 inline-flex mb-8 shadow-sm">
            <img src={getImageUrl()} alt="Nitro" className="h-12 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Nitro Stock</h1>
          <p className="text-white/80 text-base">
            {locale === 'zh' ? '设置您的新密码' : locale === 'en' ? 'Set your new password' : 'Establece tu nueva contraseña'}
          </p>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative">

        <AuthThemeSelector />

        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-8">
            <img src={getImageUrl()} alt="Nitro" className="h-10 w-auto" />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2" style={{ color: `rgb(var(--color-primary-700))` }}>
              {t('title')}
            </h2>
            <p className="text-sm" style={{ color: `rgb(var(--color-secondary-500))` }}>
              {t('subtitle')}
            </p>
          </div>

          {!success ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: `rgb(var(--color-secondary-700))` }}>
                  {t('newPassword')}
                </label>
                <input
                  id="password" name="password" type="password" required
                  className="w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 transition-colors"
                  style={inputStyle} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: `rgb(var(--color-secondary-700))` }}>
                  {t('confirmPassword')}
                </label>
                <input
                  id="confirmPassword" name="confirmPassword" type="password" required
                  className="w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 transition-colors"
                  style={inputStyle} placeholder="••••••••"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-base font-semibold rounded-lg text-white disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ backgroundColor: `rgb(var(--color-primary-600))` }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    {t('updating')}
                  </span>
                ) : t('submit')}
              </button>

              <div className="text-center">
                <Link href={`/${locale}/login`} className="text-sm font-medium" style={{ color: `rgb(var(--color-primary-600))` }}>
                  {t('backToLogin')}
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-green-800 text-sm">
                {t('success')}
              </div>
              <Link
                href={`/${locale}/login`}
                className="inline-block text-base font-semibold py-3 px-8 rounded-lg text-white transition-all shadow-sm hover:shadow-md"
                style={{ backgroundColor: `rgb(var(--color-primary-600))` }}
              >
                {t('backToLogin')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
