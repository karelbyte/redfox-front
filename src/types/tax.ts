// Definición del tipo de impuesto
export const TaxType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED'
} as const;

export type TaxType = typeof TaxType[keyof typeof TaxType];

// Interfaz principal del impuesto
export interface Tax {
  id: string;
  code: string;
  name: string;
  value: number;
  type: TaxType;
  isActive: boolean;
  createdAt: string;
} 