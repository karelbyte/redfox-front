export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  permissions: string[];
  status: boolean;
  created_at: string;
}

export interface UserRole {
  id: string;
  code: string;
  description: string;
  status: boolean;
  created_at: string;
}

export interface UserResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleIds: string[];
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  roleIds?: string[];
  status?: boolean;
}

export interface UserWithPermissionDescriptions {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  permission_descriptions: string[];
  status: boolean;
  created_at: string;
} 