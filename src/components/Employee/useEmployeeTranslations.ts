import { useLocale } from 'next-intl';
import { getEmployeeTranslation } from './EmployeeTranslations';

export const useEmployeeTranslations = () => {
  const locale = useLocale();
  
  return (key: string) => {
    return getEmployeeTranslation(locale, key);
  };
};
