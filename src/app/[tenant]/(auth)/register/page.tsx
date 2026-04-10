'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations, useLocale } from 'next-intl';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toastService } from '@/services/toast.service';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import AuthThemeSelector from '@/components/AuthThemeSelector';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '', companyName: '', email: '',
    password: '', password_confirmation: '', referrer_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { currentTheme } = useTheme();
  const t = useTranslations('pages.register');
  const router = useRouter();
  const locale = useLocale();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordMismatch = formData.password.length > 0 && formData.password_confirmation.length > 0 && formData.password !== formData.password_confirmation;

  const COMPANY_NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]+$/;
  const companyNameError = formData.companyName.length > 0 && !COMPANY_NAME_REGEX.test(formData.companyName)
    ? t('companyNameInvalid')
    : formData.companyName.length > 0 && formData.companyName.trim().length < 3
    ? t('companyNameTooShort') : '';

  const slugPreview = formData.companyName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) { toastService.error(t('passwordMismatch')); return; }
    if (companyNameError) { toastService.error(companyNameError); return; }
    setLoading(true);
    try {
      await authService.register(formData);
      toastService.success(t('success'));
      router.push(`/${locale}/login`);
    } catch {}
    finally { setLoading(false); }
  };

  const getImageUrl = (): string => {
    const map: Record<string, string> = { blue: '/nitrob.png', red: '/nitro.png', 'green-gray': '/nitrog.png', gray: '/nitrogy.png', brown: '/nitrobw.png' };
    return map[currentTheme] || '/nitro.png';
  };

  const inputCls = "w-full px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 transition-colors";
  const inputStyle = (err: boolean): React.CSSProperties => ({
    border: err ? '1px solid #ef4444' : `1px solid rgb(var(--color-secondary-300))`,
    '--tw-ring-color': `rgb(var(--color-primary-400))`,
  } as React.CSSProperties);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: `rgb(var(--color-secondary-50))` }}>

      {/* Panel izquierdo — branding */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center p-16 relative overflow-hidden"
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
            {locale === 'zh' ? '立即开始您的免费试用' : locale === 'en' ? 'Start your free trial today' : 'Comienza tu prueba gratuita hoy'}
          </p>
          <div className="space-y-4 text-left">
            {[
              { icon: '🧾', es: 'Facturación CFDI 4.0 timbrada al instante', en: 'CFDI 4.0 invoicing in seconds', zh: '即时CFDI 4.0电子发票' },
              { icon: '📦', es: 'Inventario con estrategias FIFO, FEFO y promedio', en: 'Inventory with FIFO, FEFO & average', zh: '支持FIFO、FEFO和平均库存策略' },
              { icon: '🛒', es: 'Punto de venta con escáner de código de barras', en: 'POS with barcode scanner support', zh: '支持条形码扫描的销售终端' },
              { icon: '📊', es: 'Analytics y reportes en tiempo real', en: 'Real-time analytics & reports', zh: '实时分析与报告' },
              { icon: '🌐', es: 'Multi-idioma: Español, Inglés y Chino', en: 'Multi-language: ES, EN & ZH', zh: '多语言：西班牙语、英语和中文' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/10 rounded-xl px-4 py-3">
                <span className="text-xl flex-shrink-0">{f.icon}</span>
                <span className="text-white/90 text-sm leading-snug">
                  {locale === 'zh' ? f.zh : locale === 'en' ? f.en : f.es}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative overflow-y-auto">

        <AuthThemeSelector />

        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={getImageUrl()} alt="Nitro" className="h-10 w-auto" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: `rgb(var(--color-primary-700))` }}>
              {t('title')}
            </h2>
            <p className="text-sm" style={{ color: `rgb(var(--color-secondary-500))` }}>
              {t('subtitle')}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: `rgb(var(--color-secondary-700))` }}>{t('name')}</label>
              <input id="name" name="name" type="text" required className={inputCls} style={inputStyle(false)} value={formData.name} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium mb-1.5" style={{ color: `rgb(var(--color-secondary-700))` }}>{t('companyName')}</label>
              <input id="companyName" name="companyName" type="text" required className={inputCls} style={inputStyle(!!companyNameError)} value={formData.companyName} onChange={handleChange} />
              {companyNameError && <p className="mt-1 text-xs text-red-600">{companyNameError}</p>}
              {!companyNameError && slugPreview.length >= 3 && (
                <p className="mt-1 text-xs text-gray-400">{t('slugPreview')}: <span className="font-mono text-gray-600">{slugPreview}</span></p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: `rgb(var(--color-secondary-700))` }}>{t('email')}</label>
              <input id="email" name="email" type="email" required className={inputCls} style={inputStyle(false)} value={formData.email} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: `rgb(var(--color-secondary-700))` }}>{t('password')}</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} required className={`${inputCls} pr-12`} style={inputStyle(passwordMismatch)} value={formData.password} onChange={handleChange} />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium mb-1.5" style={{ color: `rgb(var(--color-secondary-700))` }}>{t('confirmPassword')}</label>
              <div className="relative">
                <input id="password_confirmation" name="password_confirmation" type={showConfirmPassword ? 'text' : 'password'} required className={`${inputCls} pr-12`} style={inputStyle(passwordMismatch)} value={formData.password_confirmation} onChange={handleChange} />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirmPassword(v => !v)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {passwordMismatch && <p className="mt-1 text-xs text-red-500">{t('passwordMismatch')}</p>}
            </div>

            <div>
              <label htmlFor="referrer_code" className="block text-sm font-medium mb-1.5" style={{ color: `rgb(var(--color-secondary-700))` }}>
                {locale === 'zh' ? '推荐码（可选）' : locale === 'en' ? 'Referral Code (optional)' : 'Código de referido (opcional)'}
              </label>
              <input id="referrer_code" name="referrer_code" type="text" maxLength={20} className={`${inputCls} uppercase`} style={inputStyle(false)} value={formData.referrer_code} onChange={handleChange}
                placeholder={locale === 'zh' ? '例：REF-X7K2M9' : locale === 'en' ? 'Ex: REF-X7K2M9' : 'Ej: REF-X7K2M9'} />
            </div>

            <button
              type="submit"
              disabled={loading || passwordMismatch}
              className="w-full py-3.5 text-base font-semibold rounded-lg text-white disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md mt-2"
              style={{ backgroundColor: `rgb(var(--color-primary-600))` }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  {t('registering')}
                </span>
              ) : t('registerButton')}
            </button>

            <div className="text-center">
              <Link href={`/${locale}/login`} className="text-sm font-semibold" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('loginLink')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
