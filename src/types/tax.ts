export type TaxType = 'PERCENTAGE' | 'FIXED';

export interface Tax {
  id: string;
  code: string;
  name: string;
  value: number;
  type: TaxType;
  is_active: boolean;
  createdAt: string;
  percentage: number;
} 