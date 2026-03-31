import { API_BASE_URL } from '@/lib/config';

export interface ExpiringProduct {
  id: string;
  productName: string;
  productSku: string;
  warehouseName: string;
  quantity: number;
  batchNumber?: string;
  expirationDate: string;
  daysUntilExpiry: number;
  priority: 'urgent' | 'high' | 'medium';
}

export interface LowStockProduct {
  id: string;
  productName: string;
  productSku: string;
  currentStock: number;
  minStock: number;
  stockPercentage: number;
  priority: 'urgent' | 'high' | 'medium';
}

export interface InventoryAlertsResponse {
  expiringProducts: ExpiringProduct[];
  lowStockProducts: LowStockProduct[];
  totalAlerts: number;
  urgentAlerts: number;
}

class InventoryAlertsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Obtiene todas las alertas de inventario
   */
  async getInventoryAlerts(urgentDays?: number, warningDays?: number): Promise<InventoryAlertsResponse> {
    const params = new URLSearchParams();
    if (urgentDays) params.append('urgentDays', urgentDays.toString());
    if (warningDays) params.append('warningDays', warningDays.toString());

    const url = `${API_BASE_URL}/api/inventory-alerts${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener alertas de inventario');
    }

    return response.json();
  }

  /**
   * Obtiene solo productos próximos a vencer
   */
  async getExpiringProducts(urgentDays?: number, warningDays?: number): Promise<ExpiringProduct[]> {
    const params = new URLSearchParams();
    if (urgentDays) params.append('urgentDays', urgentDays.toString());
    if (warningDays) params.append('warningDays', warningDays.toString());

    const url = `${API_BASE_URL}/api/inventory-alerts/expiring${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener productos próximos a vencer');
    }

    return response.json();
  }

  /**
   * Obtiene solo productos con stock bajo
   */
  async getLowStockProducts(): Promise<LowStockProduct[]> {
    const response = await fetch(`${API_BASE_URL}/api/inventory-alerts/low-stock`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener productos con stock bajo');
    }

    return response.json();
  }

  /**
   * Genera alertas inmediatas
   */
  async generateImmediateAlerts(): Promise<{ message: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/api/inventory-alerts/generate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al generar alertas inmediatas');
    }

    return response.json();
  }

  /**
   * Genera alertas para un producto específico
   */
  async generateProductAlerts(productId: string): Promise<{ message: string; productId: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/api/inventory-alerts/generate/${productId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al generar alertas del producto');
    }

    return response.json();
  }

  /**
   * Obtiene el resumen de alertas para mostrar en el bell icon
   */
  async getAlertsSummary(): Promise<{ totalAlerts: number; urgentAlerts: number }> {
    try {
      const alerts = await this.getInventoryAlerts();
      return {
        totalAlerts: alerts.totalAlerts,
        urgentAlerts: alerts.urgentAlerts,
      };
    } catch (error) {
      console.error('Error obteniendo resumen de alertas:', error);
      return { totalAlerts: 0, urgentAlerts: 0 };
    }
  }

  /**
   * Formatea la fecha de vencimiento para mostrar
   */
  formatExpirationDate(date: string, locale: string = 'es'): string {
    const expirationDate = new Date(date);
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return locale === 'es' ? `Vencido hace ${Math.abs(diffDays)} día(s)` : `Expired ${Math.abs(diffDays)} day(s) ago`;
    } else if (diffDays === 0) {
      return locale === 'es' ? 'Vence hoy' : 'Expires today';
    } else if (diffDays === 1) {
      return locale === 'es' ? 'Vence mañana' : 'Expires tomorrow';
    } else {
      return locale === 'es' ? `Vence en ${diffDays} día(s)` : `Expires in ${diffDays} day(s)`;
    }
  }

  /**
   * Obtiene el color de prioridad para la UI
   */
  getPriorityColor(priority: 'urgent' | 'high' | 'medium'): string {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  /**
   * Obtiene el icono de prioridad
   */
  getPriorityIcon(priority: 'urgent' | 'high' | 'medium'): string {
    switch (priority) {
      case 'urgent':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '📋';
      default:
        return '📋';
    }
  }
}

export const inventoryAlertsService = new InventoryAlertsService();