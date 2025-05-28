export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string | null;
  isActive: boolean;
  position: number;
  createdAt: string;
  children?: Category[];
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string | null;
  isActive: boolean;
  position: number;
  imageChanged?: boolean;
} 