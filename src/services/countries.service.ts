'use client';

import { api } from './api';
import { CountryProfile } from '@/types/country';

class CountriesService {
  /** Países soportados. Endpoint público: lo usa el registro. */
  async getAll(): Promise<CountryProfile[]> {
    return api.get<CountryProfile[]>('/countries');
  }

  /** Perfil del país de la organización en sesión. */
  async getOrganizationProfile(): Promise<CountryProfile> {
    return api.get<CountryProfile>('/countries/profile');
  }
}

export const countriesService = new CountriesService();
