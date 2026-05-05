// HOOK PARA USAR TRADUCCIONES DEL MÓDULO EMPLEADOS CON I18N
import { useLocale } from 'next-intl';
import { getEmployeeTranslation } from './EmployeeTranslations.i18n';

export const useEmployeeTranslations = () => {
  // Usar i18n para detectar el idioma del usuario
  const locale = useLocale();
  
  return (key: string) => {
    // Forzar detección por URL si i18n no funciona
    let currentLocale = locale;
    if (typeof window !== 'undefined') {
      const urlPath = window.location.pathname;
      if (urlPath.includes('/es/')) {
        currentLocale = 'es';
      } else if (urlPath.includes('/en/')) {
        currentLocale = 'en';
      } else if (urlPath.includes('/zh/')) {
        currentLocale = 'zh';
      }
    }
    
    return getEmployeeTranslation(currentLocale, key);
  };
};
