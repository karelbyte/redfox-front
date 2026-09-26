"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import AuthThemeSelector from "@/components/AuthThemeSelector";

/** Cada punto del panel: su icono y la clave de su texto traducido. */
const FEATURES = [
  { icon: '🧾', key: 'features.invoicing' },
  { icon: '📦', key: 'features.inventory' },
  { icon: '🛒', key: 'features.pos' },
  { icon: '📊', key: 'features.analytics' },
  { icon: '🌐', key: 'features.languages' },
] as const;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithToken } = useAuth();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { currentTheme } = useTheme();
  const t = useTranslations('pages.login');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) handleAutoLogin(token);
  }, [searchParams]);

  const handleAutoLogin = async (token: string) => {
    const userParam = searchParams.get('user');
    let userData = null;
    if (userParam) {
      try { userData = JSON.parse(atob(userParam)); } catch {}
    }
    setLoading(true);
    try { await loginWithToken(token, userData); }
    catch {}
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await login(email, password); }
    catch {}
    finally { setLoading(false); }
  };

  const getImageUrl = (): string => {
    const map: Record<string, string> = { blue: '/nitrob.png', red: '/nitro.png', 'green-gray': '/nitrog.png', gray: '/nitrogy.png', brown: '/nitrobw.png' };
    return map[currentTheme] || '/nitro.png';
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: `rgb(var(--color-secondary-50))` }}>

      {/* Panel izquierdo — branding */}
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
          <h1 className="text-3xl font-bold text-white mb-3">Nitro stock</h1>
          <p className="text-white/80 mb-10 text-base">
            {t('tagline')}
          </p>
          <div className="space-y-4 text-left">
            {/* Los textos viven en los archivos de idioma; aquí solo el icono.
                El primero es deliberadamente neutro: esta pantalla se ve antes
                de iniciar sesión, así que todavía no se sabe en qué país opera
                la organización. */}
            {FEATURES.map((feature) => (
              <div key={feature.key} className="flex items-start gap-3 bg-white/10 rounded-xl px-4 py-3">
                <span className="text-xl flex-shrink-0">{feature.icon}</span>
                <span className="text-white/90 text-sm leading-snug">
                  {t(feature.key)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative">

        <AuthThemeSelector />

        <div className="w-full max-w-sm">
          {/* Logo mobile */}
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

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: `rgb(var(--color-secondary-700))` }}>
                {t('email')}
              </label>
              <input
                id="email" name="email" type="email" required
                className="w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 transition-colors"
                style={{ border: `1px solid rgb(var(--color-secondary-300))`, '--tw-ring-color': `rgb(var(--color-primary-400))` } as React.CSSProperties}
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: `rgb(var(--color-secondary-700))` }}>
                {t('password')}
              </label>
              <input
                id="password" name="password" type="password" required
                className="w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 transition-colors"
                style={{ border: `1px solid rgb(var(--color-secondary-300))`, '--tw-ring-color': `rgb(var(--color-primary-400))` } as React.CSSProperties}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Link href={`/${locale}/forgot-password`} className="text-sm transition-colors" style={{ color: `rgb(var(--color-primary-500))` }}>
                {t('forgotPassword')}
              </Link>
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
                  {t('loggingIn')}
                </span>
              ) : t('loginButton')}
            </button>

            <div className="text-center">
              <Link href={`/${locale}/register`} className="text-sm font-semibold" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('registerLink')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
