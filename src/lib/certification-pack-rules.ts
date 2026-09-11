import { CertificationPackType } from '@/types/certification-pack';

const FACTURA_GREEN_REFERRER_CODE = 'FACTURAGREEN';

export function normalizeReferrerCode(code?: string | null): string {
  return (code || '').trim().toUpperCase();
}

export function getAllowedCertificationPackTypes(
  organizationReferrerCode?: string | null,
): CertificationPackType[] {
  if (
    normalizeReferrerCode(organizationReferrerCode) ===
    FACTURA_GREEN_REFERRER_CODE
  ) {
    return [CertificationPackType.FACTURA_GREEN];
  }

  return [
    CertificationPackType.FACTURAAPI,
    CertificationPackType.FACTURA_GREEN,
    CertificationPackType.FACTURA_SUNAT,
  ];
}

export function isFacturaGreenRestricted(
  organizationReferrerCode?: string | null,
): boolean {
  return (
    normalizeReferrerCode(organizationReferrerCode) ===
    FACTURA_GREEN_REFERRER_CODE
  );
}
