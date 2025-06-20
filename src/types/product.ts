import { Brand } from './brand';
import { Category } from './category';
import { Tax } from './tax';
import { MeasurementUnit } from './measurement-unit';
import { ProductType } from '@/components/Product/ProductForm';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  weight: number;
  width: number;
  height: number;
  length: number;
  brand: Brand | string;
  category: Category | string;
  tax: Tax | string;
  measurement_unit: MeasurementUnit | string;
  is_active: boolean;
  type: ProductType;
  images: string[];
  created_at: string;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  sku: string;
  weight: number;
  width: number;
  height: number;
  length: number;
  brand_id: string;
  category_id: string;
  tax_id: string;
  measurement_unit_id: string;
  is_active: boolean;
  type: ProductType;
} 