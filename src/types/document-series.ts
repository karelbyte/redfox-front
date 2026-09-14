export enum DocumentType {
  FACTURA = 'FACTURA',
  BOLETA = 'BOLETA',
  NOTA_CREDITO = 'NOTA_CREDITO',
  NOTA_DEBITO = 'NOTA_DEBITO',
}

export interface DocumentSeries {
  id: string;
  document_type: DocumentType;
  /** Código de la serie tal como lo exige SUNAT: F001, B001... */
  series: string;
  /**
   * Último correlativo entregado. Es de solo lectura: la numeración no puede
   * tener huecos ni repeticiones, así que solo la mueve la emisión.
   */
  current_number: number;
  emitter_id?: string | null;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentSeriesFormData {
  document_type: DocumentType;
  series: string;
  emitter_id?: string;
  is_default?: boolean;
}

export interface UpdateDocumentSeriesData {
  is_active?: boolean;
  is_default?: boolean;
}
