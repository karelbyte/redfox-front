import { api } from './api';
import { SearchResult } from '@/types/global-search';

export const globalSearchService = {
  async search(query: string, limit: number = 20): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const params = new URLSearchParams({
      q: query.trim(),
      limit: limit.toString(),
    });

    const response = await api.get(`/search?${params.toString()}`);
    return response.data;
  },

  async searchByBarcode(barcode: string): Promise<SearchResult[]> {
    if (!barcode || barcode.trim().length === 0) {
      return [];
    }

    const params = new URLSearchParams({
      barcode: barcode.trim(),
    });

    const response = await api.get(`/search/barcode?${params.toString()}`);
    return response.data;
  },
};