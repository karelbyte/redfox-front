export interface Brand {
  id: string;
  code: string;
  description: string;
  img: string | null;
  isActive: boolean;
  created_at: string;
}

export interface BrandFormData {
  code: string;
  description: string;
  img: string | null;
  isActive: boolean;
  imageChanged?: boolean;
} 