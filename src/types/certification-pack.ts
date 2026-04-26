export enum CertificationPackType {
  FACTURAAPI = 'FACTURAAPI',
  FACTURA_GREEN = 'FACTURA_GREEN',
}

export interface CertificationPackEmitter {
  id?: string;
  emitter: string;
  name: string;
  fav?: boolean;
  status?: string;
}

export interface CertificationPack {
  id: string;
  type: CertificationPackType;
  config: Record<string, any>;
  is_active: boolean;
  is_default: boolean;
  emitters?: CertificationPackEmitter[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CertificationPackFormData {
  type: CertificationPackType;
  config: Record<string, any>;
  is_active?: boolean;
  is_default?: boolean;
  emitters?: CertificationPackEmitter[];
}
