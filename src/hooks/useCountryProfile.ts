'use client';

import { useEffect, useState } from 'react';
import { countriesService } from '@/services/countries.service';
import { CountryProfile } from '@/types/country';

/**
 * Perfil del país mientras llega la respuesta: el de México, que es el
 * comportamiento que tenía el sistema antes de existir este concepto.
 */
const FALLBACK_PROFILE: CountryProfile = {
  code: 'MX',
  name: 'México',
  currency: 'MXN',
  customerTaxFields: {
    document: { kind: 'RFC', allowedLengths: [12, 13], numericOnly: false },
    taxSystem: true,
    invoiceUse: true,
  },
};

// El país de una organización no cambia, así que basta pedirlo una vez.
let cache: CountryProfile | null = null;
let inFlight: Promise<CountryProfile> | null = null;

async function loadProfile(): Promise<CountryProfile> {
  if (cache) return cache;

  if (!inFlight) {
    inFlight = countriesService
      .getOrganizationProfile()
      .then((profile) => {
        cache = profile;
        return profile;
      })
      .catch(() => FALLBACK_PROFILE)
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
}

export function useCountryProfile(): {
  country: CountryProfile;
  loading: boolean;
} {
  const [country, setCountry] = useState<CountryProfile>(cache ?? FALLBACK_PROFILE);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let active = true;

    loadProfile().then((profile) => {
      if (active) {
        setCountry(profile);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return { country, loading };
}
