'use client';

import { useEffect, useState } from 'react';
import { certificationPackService } from '@/services/certification-packs.service';
import { PackCapabilities } from '@/types/certification-pack';

/**
 * Lo que un PAC que no declara nada ofrece: es el comportamiento histórico y
 * también lo que se asume mientras la petición está en vuelo, para que la UI
 * no parpadee ocultando acciones que sí existen.
 */
const DEFAULT_CAPABILITIES: PackCapabilities = {
  productCatalog: true,
  customerCatalog: true,
  receipts: true,
  cancellation: true,
  documentDownload: true,
  documentSeries: false,
};

// Las capacidades solo cambian si se reconfigura el pack, así que basta con
// pedirlas una vez por sesión de navegación.
let cache: PackCapabilities | null = null;
let inFlight: Promise<PackCapabilities> | null = null;

async function loadCapabilities(): Promise<PackCapabilities> {
  if (cache) return cache;

  if (!inFlight) {
    inFlight = certificationPackService
      .getCapabilities()
      .then(({ capabilities }) => {
        cache = capabilities;
        return capabilities;
      })
      .catch(() => DEFAULT_CAPABILITIES)
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
}

export function usePackCapabilities(): {
  capabilities: PackCapabilities;
  loading: boolean;
} {
  const [capabilities, setCapabilities] = useState<PackCapabilities>(
    cache ?? DEFAULT_CAPABILITIES,
  );
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let active = true;

    loadCapabilities().then((resolved) => {
      if (active) {
        setCapabilities(resolved);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return { capabilities, loading };
}

/** Invalida la caché tras reconfigurar el pack de certificación. */
export function resetPackCapabilities(): void {
  cache = null;
}
