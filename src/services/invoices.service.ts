import { api } from './api';
import { 
  Invoice, 
  InvoiceFormData, 
  ConvertWithdrawalData, 
  PaginatedInvoiceResponse, 
  PaginatedInvoiceDetailsResponse,
  InvoiceDetailFormData,
  InvoiceDetail
} from '@/types/invoice';

class InvoiceService {
  async getInvoices(page?: number, limit?: number, term?: string): Promise<PaginatedInvoiceResponse> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (term) queryParams.append('term', term);
    
    const queryString = queryParams.toString();
    const response = await api.get<PaginatedInvoiceResponse>(`/invoices${queryString ? `?${queryString}` : ''}`);
    return response;
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return response;
  }

  async createInvoice(data: InvoiceFormData): Promise<Invoice> {
    const response = await api.post<Invoice>('/invoices', data);
    return response;
  }

  async updateInvoice(id: string, data: Partial<InvoiceFormData>): Promise<Invoice> {
    const response = await api.put<Invoice>(`/invoices/${id}`, data);
    return response;
  }

  async deleteInvoice(id: string): Promise<void> {
    await api.delete(`/invoices/${id}`);
  }

  async convertWithdrawalToInvoice(data: ConvertWithdrawalData): Promise<Invoice> {
    const response = await api.post<Invoice>('/invoices/convert-withdrawal', data);
    return response;
  }

  async generateCFDI(id: string): Promise<Invoice> {
    const response = await api.post<Invoice>(`/invoices/${id}/generate-cfdi`);
    return response;
  }

  async cancelCFDI(id: string, reason: string): Promise<Invoice> {
    const response = await api.post<Invoice>(`/invoices/${id}/cancel-cfdi`, { reason });
    return response;
  }

  async getInvoiceDetails(id: string, productId?: string): Promise<PaginatedInvoiceDetailsResponse> {
    const queryParams = new URLSearchParams();
    if (productId) queryParams.append('product_id', productId);
    
    const queryString = queryParams.toString();
    const response = await api.get<PaginatedInvoiceDetailsResponse>(`/invoices/${id}/details${queryString ? `?${queryString}` : ''}`);
    return response;
  }

  async addInvoiceDetail(id: string, data: InvoiceDetailFormData): Promise<InvoiceDetail> {
    const response = await api.post<InvoiceDetail>(`/invoices/${id}/details`, data);
    return response;
  }

  async updateInvoiceDetail(id: string, detailId: string, data: Partial<InvoiceDetailFormData>): Promise<InvoiceDetail> {
    const response = await api.put<InvoiceDetail>(`/invoices/${id}/details/${detailId}`, data);
    return response;
  }

  async deleteInvoiceDetail(id: string, detailId: string): Promise<void> {
    await api.delete(`/invoices/${id}/details/${detailId}`);
  }

  async downloadInvoicePDF(id: string): Promise<Blob> {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    });
    return response;
  }

  async downloadInvoiceXML(id: string): Promise<Blob> {
    const response = await api.get(`/invoices/${id}/xml`, {
      responseType: 'blob'
    });
    return response;
  }
}

export const invoiceService = new InvoiceService();
