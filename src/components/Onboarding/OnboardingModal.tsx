'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usersService } from '@/services/users.service';
import { companySettingsService } from '@/services/company-settings.service';
import { certificationPackService } from '@/services/certification-packs.service';
import Btn from '@/components/atoms/Btn';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'welcome' | 'company' | 'pack' | 'packConfig' | 'complete';

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const t = useTranslations('onboarding');
  const commonT = useTranslations('common.actions');
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [isSaving, setIsSaving] = useState(false);
  
  // Company data
  const [companyData, setCompanyData] = useState({
    legal_name: '',
    tax_id: '',
    email: '',
    phone: '',
  });

  // Pack selection
  const [selectedPack, setSelectedPack] = useState<string>('');
  
  // Pack configuration
  const [packConfig, setPackConfig] = useState<Record<string, any>>({});
  
  const updatePackConfig = (key: string, value: any) => {
    setPackConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const availablePacks = [
    { id: 'FACTURA_GREEN', name: 'Factura Green' },
    { id: 'FACTURAAPI', name: 'Factura API' },
    { id: 'none', name: t('noPack') },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('welcome');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = async () => {
    if (currentStep === 'welcome') {
      setCurrentStep('company');
    } else if (currentStep === 'company') {
      await saveCompanyData();
      setCurrentStep('pack');
    } else if (currentStep === 'pack') {
      // Si seleccionó un pack real (no "none"), ir a configuración
      if (selectedPack && selectedPack !== 'none') {
        setCurrentStep('packConfig');
      } else {
        // Si seleccionó "none", saltar a complete
        setCurrentStep('complete');
      }
    } else if (currentStep === 'packConfig') {
      await savePackConfiguration();
      setCurrentStep('complete');
    }
  };

  const handleBack = () => {
    if (currentStep === 'company') {
      setCurrentStep('welcome');
    } else if (currentStep === 'pack') {
      setCurrentStep('company');
    } else if (currentStep === 'packConfig') {
      setCurrentStep('pack');
    } else if (currentStep === 'complete') {
      // Si llegó desde packConfig, volver ahí, sino a pack
      if (selectedPack && selectedPack !== 'none') {
        setCurrentStep('packConfig');
      } else {
        setCurrentStep('pack');
      }
    }
  };

  const handleSkip = async () => {
    try {
      await usersService.completeOnboarding();
      onClose();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Cerrar de todas formas aunque falle
      onClose();
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await usersService.completeOnboarding();
      onClose();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveCompanyData = async () => {
    if (!companyData.legal_name) return;
    
    setIsSaving(true);
    try {
      await companySettingsService.update({
        legalName: companyData.legal_name,
        taxId: companyData.tax_id || undefined,
        email: companyData.email || undefined,
        phone: companyData.phone || undefined,
      });
    } catch (error) {
      console.error('Error saving company data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const savePackConfiguration = async () => {
    if (!selectedPack || selectedPack === 'none') return;
    
    setIsSaving(true);
    try {
      await certificationPackService.create({
        type: selectedPack as any,
        config: packConfig,
        is_active: true,
      });
    } catch (error) {
      console.error('Error saving pack configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = ['welcome', 'company', 'pack', 'packConfig', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    
    // Si no hay pack seleccionado o es "none", ocultar el paso de packConfig
    const visibleSteps = (selectedPack && selectedPack !== 'none') 
      ? steps 
      : steps.filter(s => s !== 'packConfig');
    
    const visibleCurrentIndex = visibleSteps.indexOf(currentStep);

    return (
      <div className="flex justify-center mb-8">
        {visibleSteps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: index <= visibleCurrentIndex 
                  ? 'rgb(var(--color-primary-500))' 
                  : '#e5e7eb',
                color: index <= visibleCurrentIndex ? 'white' : '#6b7280',
              }}
            >
              {index + 1}
            </div>
            {index < visibleSteps.length - 1 && (
              <div
                style={{
                  width: '4rem',
                  height: '0.25rem',
                  backgroundColor: index < visibleCurrentIndex 
                    ? 'rgb(var(--color-primary-500))' 
                    : '#e5e7eb',
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderWelcomeStep = () => (
    <div className="text-center py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        {t('welcome.title')}
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        {t('welcome.description')}
      </p>
      <div className="flex justify-center gap-4">
        <Btn
          variant="outline"
          size="md"
          onClick={handleSkip}
        >
          {t('skipForNow')}
        </Btn>
        <Btn
          variant="primary"
          size="md"
          onClick={handleNext}
        >
          {t('getStarted')}
        </Btn>
      </div>
    </div>
  );

  const renderCompanyStep = () => (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {t('company.title')}
      </h2>
      <p className="text-gray-600 mb-6">
        {t('company.description')}
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('company.legalName')} *
          </label>
          <input
            type="text"
            value={companyData.legal_name}
            onChange={(e) => setCompanyData({ ...companyData, legal_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
            style={{
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgb(var(--color-primary-500))';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgb(var(--color-primary-100))';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
            }}
            placeholder={t('company.legalNamePlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('company.taxId')}
          </label>
          <input
            type="text"
            value={companyData.tax_id}
            onChange={(e) => setCompanyData({ ...companyData, tax_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
            style={{
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgb(var(--color-primary-500))';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgb(var(--color-primary-100))';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
            }}
            placeholder={t('company.taxIdPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('company.email')}
          </label>
          <input
            type="email"
            value={companyData.email}
            onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
            style={{
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgb(var(--color-primary-500))';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgb(var(--color-primary-100))';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
            }}
            placeholder={t('company.emailPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('company.phone')}
          </label>
          <input
            type="tel"
            value={companyData.phone}
            onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
            style={{
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgb(var(--color-primary-500))';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgb(var(--color-primary-100))';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
            }}
            placeholder={t('company.phonePlaceholder')}
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Btn
          variant="outline"
          size="md"
          onClick={handleBack}
        >
          {t('back')}
        </Btn>
        <Btn
          variant="primary"
          size="md"
          onClick={handleNext}
          disabled={!companyData.legal_name || isSaving}
          loading={isSaving}
        >
          {t('continue')}
        </Btn>
      </div>
    </div>
  );

  const renderPackStep = () => (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {t('pack.title')}
      </h2>
      <p className="text-gray-600 mb-6">
        {t('pack.description')}
      </p>

      <div className="space-y-3">
        {availablePacks.map((pack) => (
          <label
            key={pack.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              border: selectedPack === pack.id 
                ? '2px solid rgb(var(--color-primary-600))' 
                : '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: selectedPack === pack.id 
                ? 'rgb(var(--color-primary-50))' 
                : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (selectedPack !== pack.id) {
                e.currentTarget.style.borderColor = '#d1d5db';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPack !== pack.id) {
                e.currentTarget.style.borderColor = '#e5e7eb';
              }
            }}
          >
            <input
              type="radio"
              name="pack"
              value={pack.id}
              checked={selectedPack === pack.id}
              onChange={(e) => setSelectedPack(e.target.value)}
              className="w-4 h-4"
              style={{ accentColor: 'rgb(var(--color-primary-600))' }}
            />
            <span className="ml-3 text-gray-900 font-medium">{pack.name}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <Btn
          variant="outline"
          size="md"
          onClick={handleBack}
        >
          {t('back')}
        </Btn>
        <Btn
          variant="primary"
          size="md"
          onClick={handleNext}
          disabled={isSaving}
          loading={isSaving}
        >
          {t('continue')}
        </Btn>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center py-8">
      <div className="mb-6">
        <svg
          className="mx-auto h-16 w-16 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        {t('complete.title')}
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        {t('complete.description')}
      </p>
      <Btn
        variant="primary"
        size="lg"
        onClick={handleComplete}
        disabled={isSaving}
        loading={isSaving}
      >
        {t('complete.button')}
      </Btn>
    </div>
  );

  const renderPackConfigStep = () => {
    const packName = availablePacks.find(p => p.id === selectedPack)?.name || '';
    
    const renderConfigFields = () => {
      if (selectedPack === 'FACTURAAPI') {
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('packConfig.facturaApi.apiKey')} *
              </label>
              <input
                type="password"
                value={packConfig.api_key || ''}
                onChange={(e) => updatePackConfig('api_key', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                style={{ transition: 'all 0.2s' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(var(--color-primary-500))';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgb(var(--color-primary-100))';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder={t('packConfig.facturaApi.apiKeyPlaceholder')}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('packConfig.facturaApi.apiKeyHelp')}
              </p>
            </div>
          </div>
        );
      }

      if (selectedPack === 'FACTURA_GREEN') {
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('packConfig.facturaGreen.apiKey')} *
              </label>
              <input
                type="password"
                value={packConfig.api_key || ''}
                onChange={(e) => updatePackConfig('api_key', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                style={{ transition: 'all 0.2s' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(var(--color-primary-500))';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgb(var(--color-primary-100))';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder={t('packConfig.facturaGreen.apiKeyPlaceholder')}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('packConfig.facturaGreen.apiKeyHelp')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('packConfig.facturaGreen.tenantId')} *
              </label>
              <input
                type="text"
                value={packConfig.tenant_id || ''}
                onChange={(e) => updatePackConfig('tenant_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                style={{ transition: 'all 0.2s' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(var(--color-primary-500))';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgb(var(--color-primary-100))';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder={t('packConfig.facturaGreen.tenantIdPlaceholder')}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('packConfig.facturaGreen.tenantIdHelp')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('packConfig.facturaGreen.businessUuid')} *
              </label>
              <input
                type="text"
                value={packConfig.business_uuid || ''}
                onChange={(e) => updatePackConfig('business_uuid', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                style={{ transition: 'all 0.2s' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(var(--color-primary-500))';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgb(var(--color-primary-100))';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder={t('packConfig.facturaGreen.businessUuidPlaceholder')}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('packConfig.facturaGreen.businessUuidHelp')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('packConfig.facturaGreen.accountUuid')}
              </label>
              <input
                type="text"
                value={packConfig.account_uuid || '0000'}
                onChange={(e) => updatePackConfig('account_uuid', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                style={{ transition: 'all 0.2s' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(var(--color-primary-500))';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgb(var(--color-primary-100))';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder={t('packConfig.facturaGreen.accountUuidPlaceholder')}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('packConfig.facturaGreen.accountUuidHelp')}
              </p>
            </div>
          </div>
        );
      }

      return null;
    };

    const isValid = () => {
      if (selectedPack === 'FACTURAAPI') {
        return !!String(packConfig.api_key || '').trim();
      }
      if (selectedPack === 'FACTURA_GREEN') {
        return (
          !!String(packConfig.api_key || '').trim() &&
          !!String(packConfig.tenant_id || '').trim() &&
          !!String(packConfig.business_uuid || '').trim()
        );
      }
      return true;
    };

    return (
      <div className="py-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('packConfig.title', { packName })}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('packConfig.description')}
        </p>

        {renderConfigFields()}

        <div className="flex justify-between mt-8">
          <Btn
            variant="outline"
            size="md"
            onClick={handleBack}
          >
            {t('back')}
          </Btn>
          <Btn
            variant="primary"
            size="md"
            onClick={handleNext}
            disabled={!isValid() || isSaving}
            loading={isSaving}
          >
            {t('continue')}
          </Btn>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-6 py-8 shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {renderStepIndicator()}
          
          {currentStep === 'welcome' && renderWelcomeStep()}
          {currentStep === 'company' && renderCompanyStep()}
          {currentStep === 'pack' && renderPackStep()}
          {currentStep === 'packConfig' && renderPackConfigStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </div>
      </div>
    </div>
  );
}
