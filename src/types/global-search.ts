export interface SearchResult {
  id: number;
  title: string;
  subtitle?: string;
  type: 'product' | 'client' | 'provider' | 'invoice' | 'purchase_order' | 'expense' | 'account_receivable';
  url: string;
  metadata?: any;
}

export interface SearchFilters {
  type?: string;
  limit?: number;
}