export enum CertificationPackType {
  FACTURAAPI = 'FACTURAAPI',
  SAT = 'SAT',
}

export interface CertificationPack {
  id: string;
  type: CertificationPackType;
  name: string;
  description?: string | null;
  config: Record<string, any>;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CertificationPackFormData {
  type: CertificationPackType;
  name: string;
  description?: string;
  config: Record<string, any>;
  is_active?: boolean;
  is_default?: boolean;
}
