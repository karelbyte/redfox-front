export interface Template {
  id: string;
  userId: string;
  name: string;
  description?: string;
  entityType: string;
  data: Record<string, any>;
  isDefault: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateDto {
  name: string;
  entityType: string;
  data: Record<string, any>;
  description?: string;
  isDefault?: boolean;
}

export interface UpdateTemplateDto {
  name?: string;
  data?: Record<string, any>;
  description?: string;
}
