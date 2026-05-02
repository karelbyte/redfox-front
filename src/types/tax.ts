export const TaxType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED'
} as const;

export type TaxType = typeof TaxType[keyof typeof TaxType];

export interface Tax {
  id: string;
  code: string;
  name: string;
  value: number;
  type: TaxType;
  isActive: boolean;
  createdAt: string;
} 