'use client';

import { api } from './api';
import {
  DocumentSeries,
  DocumentSeriesFormData,
  DocumentType,
  UpdateDocumentSeriesData,
} from '@/types/document-series';

class DocumentSeriesService {
  async getAll(documentType?: DocumentType): Promise<DocumentSeries[]> {
    const query = documentType ? `?document_type=${documentType}` : '';
    const response = await api.get<DocumentSeries[]>(`/document-series${query}`);
    return response;
  }

  async create(data: DocumentSeriesFormData): Promise<DocumentSeries> {
    const response = await api.post<DocumentSeries>(
      '/document-series',
      data as unknown as Record<string, unknown>,
    );
    return response;
  }

  async update(id: string, data: UpdateDocumentSeriesData): Promise<DocumentSeries> {
    const response = await api.patch<DocumentSeries>(
      `/document-series/${id}`,
      data as unknown as Record<string, unknown>,
    );
    return response;
  }
}

export const documentSeriesService = new DocumentSeriesService();
