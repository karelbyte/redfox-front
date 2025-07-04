"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme, ThemeType } from "@/context/ThemeContext";
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const [email, setEmail] = useState("admin@redfox.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { currentTheme, setTheme, themes } = useTheme();
  const t = useTranslations('pages.login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      // No necesitamos hacer router.push aquí porque el login ya lo hace
    } catch {
      // El error ya se maneja en el servicio de autenticación
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = () => {
    if (currentTheme === "blue") {
      return "/nitrob.png";
    } else if (currentTheme === "red") {
      return "/nitro.png";
    } else if (currentTheme === "green-gray") {
      return "/nitrog.png";
    }
    else if (currentTheme === "gray") {
      return "/nitrogy.png";
    } else if (currentTheme === "brown") {
      return "/nitrobw.png";
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
        {/* Selector de tema */}
        <div className="absolute top-4 right-4">
          <select
            value={currentTheme}
            onChange={(e) => setTheme(e.target.value as ThemeType)}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
            style={
              {
                backgroundColor: "white",
                border: `1px solid rgb(var(--color-secondary-300))`,
                color: `rgb(var(--color-secondary-800))`,
                "--tw-ring-color": `rgb(var(--color-primary-500))`,
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
          <div className="flex-shrink-0 flex items-center self-center my-4">
            <img src={getImageUrl()} alt="Nitro" className="h-12 w-auto" />
          </div>
          <h2
            className="text-center text-4xl font-bold"
            style={{ color: `rgb(var(--color-primary-600))` }}
          >
            {t('title')}
          </h2>
          <p
            className="text-center"
            style={{ color: `rgb(var(--color-secondary-600))` }}
          >
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-6">
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
                    "--tw-ring-color": `rgb(var(--color-primary-500))`,
                    "--tw-ring-offset-color": "white",
                  } as React.CSSProperties
                }
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
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
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-600))`;
                e.currentTarget.style.borderColor = `rgb(var(--color-primary-600))`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-500))`;
                e.currentTarget.style.borderColor = `rgb(var(--color-primary-500))`;
              }}
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  {t('loggingIn')}
                </span>
              ) : (
                t('loginButton')
              )}
            </button>

            <div className="text-center">
              <a
                href="#"
                className="text-sm transition-colors"
                style={{ color: `rgb(var(--color-primary-500))` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = `rgb(var(--color-primary-600))`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = `rgb(var(--color-primary-500))`;
                }}
              >
                {t('forgotPassword')}
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
