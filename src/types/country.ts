/** Identificador fiscal del cliente y campos que pide cada país. */
export interface CustomerTaxFields {
  document: {
    /** RFC en México, RUC o DNI en Perú. */
    kind: string;
    allowedLengths: number[];
    numericOnly: boolean;
  };
  /** Aplica el régimen fiscal (catálogo del SAT). */
  taxSystem: boolean;
  /** Aplica el uso del comprobante (catálogo del SAT). */
  invoiceUse: boolean;
}

export interface CountryProfile {
  /** ISO 3166-1 alpha-2. */
  code: string;
  name: string;
  /** Moneda local en ISO 4217. */
  currency: string;
  customerTaxFields: CustomerTaxFields;
}
