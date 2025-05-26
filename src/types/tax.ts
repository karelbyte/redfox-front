export type TaxType = 'PERCENTAGE' | 'FIXED';

export interface Tax {
  id: string;
  code: string;
  name: string;
  value: number;
  type: TaxType;
  isActive: boolean;
  createdAt: string;
} 