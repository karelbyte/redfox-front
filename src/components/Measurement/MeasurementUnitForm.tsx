import { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { measurementUnitsService, MeasurementUnitSuggestion } from '@/services/measurement-units.service';
import { certificationPackService } from '@/services/certification-packs.service';
import { toastService } from '@/services/toast.service';
import { MeasurementUnit } from '@/types/measurement-unit';
import { Input, Checkbox } from '@/components/atoms';

export interface MeasurementUnitFormProps {
  unit: MeasurementUnit | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface MeasurementUnitFormRef {
  submit: () => void;
}

interface FormData {
  code: string;
  description: string;
  status: boolean;
}

interface FormErrors {
  code?: string;
  description?: string;
}

const MeasurementUnitForm = forwardRef<MeasurementUnitFormRef, MeasurementUnitFormProps>(
  ({ unit, onSuccess, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.measurementUnits');
    const [formData, setFormData] = useState<FormData>({
      code: '',
      description: '',
      status: true,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [suggestions, setSuggestions] = useState<MeasurementUnitSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasActivePack, setHasActivePack] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (unit) {
        setFormData({
          code: unit.code,
          description: unit.description,
          status: unit.status,
        });
        setSuggestions([]);
      } else {
        setFormData({
          code: '',
          description: '',
          status: true,
        });
        setSuggestions([]);
      }
    }, [unit]);

    useEffect(() => {
      const checkActivePack = async () => {
        try {
          const activePack = await certificationPackService.getActive();
          setHasActivePack(!!activePack);
        } catch (error) {
          setHasActivePack(false);
        }
      };
      checkActivePack();

      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, []);

    useEffect(() => {
      if (typeof window === 'undefined') return;

      const handleClickOutside = (event: MouseEvent) => {
        if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
          setSuggestions([]);
        }
      };

      if (suggestions.length > 0) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [suggestions.length]);

    const validateForm = useCallback((): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      if (!formData.code.trim()) {
        newErrors.code = t('form.errors.codeRequired');
        isValid = false;
      }

      if (!formData.description.trim()) {
        newErrors.description = t('form.errors.descriptionRequired');
        isValid = false;
      }

      setErrors(newErrors);
      onValidChange?.(isValid);
      return isValid;
    }, [formData, onValidChange, t]);

    useEffect(() => {
      validateForm();
    }, [validateForm]);

    const handleDescriptionChange = (value: string) => {
      setFormData(prev => ({ ...prev, description: value }));
      
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!hasActivePack || !value.trim()) {
        setSuggestions([]);
        return;
      }

      searchTimeoutRef.current = setTimeout(async () => {
        if (value.trim().length >= 2) {
          setIsSearching(true);
          try {
            const results = await measurementUnitsService.searchFromPack(value.trim());
            setSuggestions(results);
          } catch (error) {
            setSuggestions([]);
          } finally {
            setIsSearching(false);
          }
        } else {
          setSuggestions([]);
        }
      }, 500);
    };

    const handleSuggestionClick = (suggestion: MeasurementUnitSuggestion) => {
      setFormData(prev => ({
        ...prev,
        code: suggestion.key,
        description: suggestion.description,
      }));
      setSuggestions([]);
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        onSavingChange?.(true);
        const data = {
          code: formData.code.trim(),
          description: formData.description.trim(),
          status: formData.status,
        };

        if (unit) {
          await measurementUnitsService.updateMeasurementUnit(unit.id, data);
          toastService.success(t('messages.unitUpdated'));
        } else {
          await measurementUnitsService.createMeasurementUnit(data);
          toastService.success(t('messages.unitCreated'));
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(unit ? t('messages.errorUpdating') : t('messages.errorCreating'));
        }
      } finally {
        onSavingChange?.(false);
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
    }));

    return (
      <form className="space-y-6">
        <div className="relative">
          <Input
            type="text"
            id="description"
            label={t('form.description')}
            required
            value={formData.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder={t('form.placeholders.description')}
            error={errors.description}
          />
          {isSearching && (
            <p className="text-xs text-gray-500 mt-1">
              {t('form.suggestions.searching')}
            </p>
          )}
          {suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
              style={{ 
                maxHeight: '200px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: `rgb(var(--color-primary-300)) transparent`,
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 8px;
                }
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                  background-color: rgb(var(--color-primary-300));
                  border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background-color: rgb(var(--color-primary-400));
                }
              `}</style>
              <div className="p-2 border-b border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-600 font-medium">
                  {t('form.suggestions.note')}
                </p>
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.key}-${index}`}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-900"
                >
                  <div className="font-medium text-sm">{suggestion.key}</div>
                  {suggestion.description && (
                    <div className="text-xs text-gray-500 mt-1">{suggestion.description}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <Input
          type="text"
          id="code"
          label={t('form.code')}
          required
          value={formData.code}
          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
          placeholder={t('form.placeholders.code')}
          error={errors.code}
        />

        <div className="flex items-center">
          <Checkbox
            id="status"
            label={t('form.active')}
            checked={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
          />
        </div>
      </form>
    );
  }
);

MeasurementUnitForm.displayName = 'MeasurementUnitForm';

export default MeasurementUnitForm; 