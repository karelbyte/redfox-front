export enum CertificationPackType {
  FACTURAAPI = 'FACTURAAPI',
  FACTURA_GREEN = 'FACTURA_GREEN',
  FACTURA_SUNAT = 'FACTURA_SUNAT',
}

/**
 * Lo que ofrece el PAC activo. Lo resuelve el backend, así que la UI no
 * necesita reconocer el tipo de pack para saber qué mostrar.
 */
export interface PackCapabilities {
  /** El PAC mantiene un catálogo de productos que hay que sincronizar. */
  productCatalog: boolean;
  /** El PAC mantiene un catálogo de clientes que hay que sincronizar. */
  customerCatalog: boolean;
  /** El PAC admite recibos de venta (el ticket autofacturable mexicano). */
  receipts: boolean;
  /** El PAC numera los comprobantes por serie y correlativo (SUNAT). */
  documentSeries: boolean;
  /** El PAC permite cancelar un comprobante ya emitido. */
  cancellation: boolean;
  /**
   * El PAC sirve el PDF y el XML por la API. Si es `false`, los documentos
   * pueden venir como URLs dentro de `pack_invoice_response`.
   */
  documentDownload: boolean;
}

/** Packs que el país de la organización admite. */
export interface AvailablePackTypes {
  country: { code: string; name: string; currency: string };
  types: CertificationPackType[];
}

export interface ActivePackCapabilities {
  type: CertificationPackType | null;
  capabilities: PackCapabilities;
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
  capabilities?: PackCapabilities;
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
