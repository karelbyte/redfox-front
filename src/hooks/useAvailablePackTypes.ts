'use client';

import { useEffect, useState } from 'react';
import { certificationPackService } from '@/services/certification-packs.service';
import { AvailablePackTypes, CertificationPackType } from '@/types/certification-pack';

/**
 * Packs de facturación que puede usar la organización, según su país y su
 * código de referido. La regla se resuelve en el backend: aquí solo se
 * consume, para que añadir un país no obligue a tocar el front.
 */
export function useAvailablePackTypes(): {
  types: CertificationPackType[];
  country: AvailablePackTypes['country'] | null;
  loading: boolean;
} {
  const [available, setAvailable] = useState<AvailablePackTypes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    certificationPackService
      .getAvailableTypes()
      .then((response) => {
        if (active) setAvailable(response);
      })
      .catch(() => {
        // Sin respuesta no se ofrece ningún pack: es preferible a ofrecer uno
        // que el país no admite y que el backend rechazaría al guardar.
        if (active) setAvailable(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    types: available?.types ?? [],
    country: available?.country ?? null,
    loading,
  };
}
