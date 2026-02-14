import { api } from './api';
import { 
  Quotation, 
  QuotationFormData, 
  QuotationDetailFormData, 
  QuotationDetail, 
  PaginatedQuotationResponse, 
  PaginatedQuotationDetailsResponse, 
  ConvertToSaleResponse 
} from '@/types/quotation';

class QuotationService {
  async getQuotations(page?: number): Promise<PaginatedQuotationResponse> {
    const queryParam = page ? `?page=${page}` : '';
    const response = await api.get<PaginatedQuotationResponse>(`/quotations${queryParam}`);
    return response;
  }

  async createQuotation(data: QuotationFormData): Promise<Quotation> {
    const createData: Record<string, unknown> = {
      ...data,
      subtotal: 0,
      tax: 0,
      total: 0,
      status: 'draft'
    };
    const response = await api.post<Quotation>('/quotations', createData);
    return response;
  }

  async updateQuotation(id: string, data: QuotationFormData): Promise<Quotation> {
    const updateData: Record<string, unknown> = { ...data };
    const response = await api.put<Quotation>(`/quotations/${id}`, updateData);
    return response;
  }

  async deleteQuotation(id: string): Promise<void> {
    await api.delete(`/quotations/${id}`);
  }

  async convertToSale(id: string): Promise<ConvertToSaleResponse> {
    const response = await api.post<ConvertToSaleResponse>(`/quotations/${id}/convert-to-sale`, {});
    return response;
  }

  async getQuotationById(id: string): Promise<Quotation> {
    const response = await api.get<Quotation>(`/quotations/${id}`);
    return response;
  }

  async getQuotationDetails(quotationId: string, page?: number, limit?: number): Promise<PaginatedQuotationDetailsResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const queryParam = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<PaginatedQuotationDetailsResponse>(`/quotations/${quotationId}/details${queryParam}`);
    return response;
  }

  async addProductToQuotation(quotationId: string, data: QuotationDetailFormData): Promise<QuotationDetail> {
    const requestData: Record<string, unknown> = {
      product_id: data.product_id,
      quantity: data.quantity,
      price: data.price,
      discount_percentage: data.discount_percentage || 0,
      discount_amount: data.discount_amount || 0
    };
    const response = await api.post<QuotationDetail>(`/quotations/${quotationId}/details`, requestData);
    return response;
  }

  async updateQuotationDetail(quotationId: string, detailId: string, data: QuotationDetailFormData): Promise<QuotationDetail> {
    const requestData: Record<string, unknown> = {
      product_id: data.product_id,
      quantity: data.quantity,
      price: data.price,
      discount_percentage: data.discount_percentage || 0,
      discount_amount: data.discount_amount || 0
    };
    const response = await api.put<QuotationDetail>(`/quotations/${quotationId}/details/${detailId}`, requestData);
    return response;
  }

  async deleteQuotationDetail(quotationId: string, detailId: string): Promise<void> {
    await api.delete(`/quotations/${quotationId}/details/${detailId}`);
  }
}

export const quotationService = new QuotationService();