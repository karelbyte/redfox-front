export enum CertificationPackType {
  FACTURAAPI = 'FACTURAAPI',
  SAT = 'SAT',
}

export interface CertificationPack {
  id: string;
  type: CertificationPackType;
  config: Record<string, any>;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CertificationPackFormData {
  type: CertificationPackType;
  config: Record<string, any>;
  is_active?: boolean;
  is_default?: boolean;
}
