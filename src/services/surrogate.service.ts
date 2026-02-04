import { api } from './api';

export interface SurrogateResponse {
  id: string;
  code: string;
  prefix: string;
  suffix: string;
  next_number: number;
  padding: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  next_code?: string;
}

export interface NextCodeResponse {
  code: string;
  next_code: string;
  current_number: number;
}

export interface UpdateSurrogateData {
  prefix?: string;
  suffix?: string;
  next_number?: number;
  padding?: number;
  description?: string;
  is_active?: boolean;
}

class SurrogateService {
  private baseUrl = '/surrogates';

  async getAll(): Promise<SurrogateResponse[]> {
    const response: any = await api.get(this.baseUrl);
    return response;
  }

  async getByCode(code: string): Promise<SurrogateResponse> {
    const response: any = await api.get(`${this.baseUrl}/${code}`);
    return response;
  }

  async getNextCode(code: string): Promise<NextCodeResponse> {
    try {
      const response: any = await api.get(`${this.baseUrl}/${code}/next`);
      
      console.log('Full response:', response); // Debug log
      
      // El API service ya devuelve el JSON parseado directamente
      const data = response;
      
      // Verificar que la respuesta tenga la estructura esperada
      if (!data || typeof data !== 'object') {
        throw new Error(`Invalid response format: ${JSON.stringify(data)}`);
      }
      
      if (!data.next_code) {
        throw new Error(`Missing next_code in response: ${JSON.stringify(data)}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error in getNextCode:', error); // Debug log
      // Si es un error de red o del servidor, proporcionar más contexto
      if (error instanceof Error) {
        throw new Error(`Failed to get next code for '${code}': ${error.message}`);
      }
      throw error;
    }
  }

  async getNextAvailableCode(code: string): Promise<NextCodeResponse> {
    const response: any = await api.get(`${this.baseUrl}/${code}/next-available`);
    return response;
  }

  async useNextCode(code: string): Promise<NextCodeResponse> {
    try {
      const response: any = await api.post(`${this.baseUrl}/${code}/use`, {});
      
      console.log('Full response (useNextCode):', response); // Debug log
      
      // El API service ya devuelve el JSON parseado directamente
      const data = response;
      
      // Verificar que la respuesta tenga la estructura esperada
      if (!data || typeof data !== 'object') {
        throw new Error(`Invalid response format: ${JSON.stringify(data)}`);
      }
      
      if (!data.next_code) {
        throw new Error(`Missing next_code in response: ${JSON.stringify(data)}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error in useNextCode:', error); // Debug log
      // Si es un error de red o del servidor, proporcionar más contexto
      if (error instanceof Error) {
        throw new Error(`Failed to use next code for '${code}': ${error.message}`);
      }
      throw error;
    }
  }

  async update(code: string, data: UpdateSurrogateData): Promise<SurrogateResponse> {
    const response: any = await api.put(`${this.baseUrl}/${code}`, data as any);
    return response;
  }

  async reset(code: string, startNumber?: number): Promise<SurrogateResponse> {
    const url = startNumber 
      ? `${this.baseUrl}/${code}/reset?start=${startNumber}`
      : `${this.baseUrl}/${code}/reset`;
    const response: any = await api.post(url, {});
    return response;
  }

  // Método de conveniencia para generar y usar código de cliente
  async generateClientCode(): Promise<string> {
    const result = await this.useNextCode('client');
    return result.next_code;
  }

  // Método de conveniencia para obtener sugerencia sin usar
  async suggestClientCode(): Promise<string> {
    const result = await this.getNextCode('client');
    return result.next_code;
  }

  // Métodos de conveniencia para otros tipos
  async generateProductCode(): Promise<string> {
    const result = await this.useNextCode('product');
    return result.next_code;
  }

  async suggestProductCode(): Promise<string> {
    const result = await this.getNextCode('product');
    return result.next_code;
  }

  async generateInvoiceCode(): Promise<string> {
    const result = await this.useNextCode('invoice');
    return result.next_code;
  }

  async suggestInvoiceCode(): Promise<string> {
    const result = await this.getNextCode('invoice');
    return result.next_code;
  }
}

export const surrogateService = new SurrogateService();