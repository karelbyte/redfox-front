export interface ProductHistoryItem {
  id: string;
  product: {
    id: string;
    sku: string;
    description: string;
  };
  warehouse: {
    id: string;
    code: string;
    name: string;
  };
  operation_type: 'WAREHOUSE_OPENING' | 'RECEPTION' | 'PURCHASE' | 'TRANSFER_IN' | 'ADJUSTMENT_IN' | 'RETURN_IN' | 'SALE' | 'WITHDRAWAL' | 'TRANSFER_OUT' | 'ADJUSTMENT_OUT' | 'DETERIORATION' | 'RETURN_OUT' | 'DAMAGE';
  operation_id: string;
  quantity: number;
  current_stock: number;
  created_at: string;
}

 