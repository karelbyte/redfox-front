import { api } from './api';

interface UserLanguageRequest {
  code: string;
}

export const userLanguageService = {
  async updateUserLanguage(languageCode: string): Promise<void> {
    try {
      await api.post<UserLanguageRequest>('/user-language', {
        code: languageCode
      });
    } catch (error) {
      console.error('Error updating user language:', error);
      // No lanzamos el error para no interrumpir el cambio de idioma
      // incluso si falla el envío al servidor
    }
  }
}; 