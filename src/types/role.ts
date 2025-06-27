export interface Role {
  id: string;
  code: string;
  description: string;
  status: boolean;
  created_at: string;
}

export interface RoleFormData {
  code: string;
  description: string;
  status: boolean;
}

export interface RoleResponse {
  data: Role[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
} 