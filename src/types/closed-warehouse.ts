import { Currency } from './currency';

export interface ClosedWarehouse {
  id: string;
  code: string;
  name: string;
  currency?: Currency;
} 