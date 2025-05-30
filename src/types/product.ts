import { Brand } from './brand';
import { Category } from './category';
import { Tax } from './tax';
import { MeasurementUnit } from './measurementUnit';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  weight: string;
  width: string;
  height: string;
  length: string;
  brand: Brand;
  category: Category;
  tax: Tax;
  measurement_unit: MeasurementUnit;
  is_active: boolean;
  is_featured: boolean;
  is_digital: boolean;
  images: string[];
  created_at: string;
} 