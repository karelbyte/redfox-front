export enum ShipmentStatus {
  PENDING = 'PENDING',
  PACKING = 'PACKING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  FAILED = 'FAILED',
}

export interface Shipment {
  id: string;
  withdrawal_id: string;
  organization_id: string;
  shipping_address_id?: string | null;
  carrier: string;
  tracking_number?: string | null;
  tracking_url?: string | null;
  shipping_cost: number;
  status: ShipmentStatus;
  estimated_delivery_date?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateShipmentDto {
  shipping_address_id?: string;
  carrier: string;
  tracking_number?: string;
  tracking_url?: string;
  shipping_cost?: number;
  estimated_delivery_date?: string;
  notes?: string;
}

export interface UpdateShipmentDto {
  carrier?: string;
  tracking_number?: string;
  tracking_url?: string;
  shipping_cost?: number;
  status?: ShipmentStatus;
  estimated_delivery_date?: string;
  shipped_at?: string;
  delivered_at?: string;
  notes?: string;
}
