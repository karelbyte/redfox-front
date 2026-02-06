export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    totalPages: number;
    currentPage: number;
  };
} 