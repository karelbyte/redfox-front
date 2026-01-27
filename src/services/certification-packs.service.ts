import { api } from './api';
import { CertificationPack, CertificationPackFormData } from '@/types/certification-pack';

class CertificationPackService {
  async getAll(): Promise<CertificationPack[]> {
    const response = await api.get<CertificationPack[]>('/certification-packs');
    return response;
  }

  async getActive(): Promise<CertificationPack | null> {
    const response = await api.get<CertificationPack | null>('/certification-packs/active');
    return response;
  }

  async getById(id: string): Promise<CertificationPack> {
    const response = await api.get<CertificationPack>(`/certification-packs/${id}`);
    return response;
  }

  async create(data: CertificationPackFormData): Promise<CertificationPack> {
    const response = await api.post<CertificationPack>('/certification-packs', data);
    return response;
  }

  async update(id: string, data: Partial<CertificationPackFormData>): Promise<CertificationPack> {
    const response = await api.patch<CertificationPack>(`/certification-packs/${id}`, data);
    return response;
  }

  async setDefault(id: string): Promise<CertificationPack> {
    const response = await api.patch<CertificationPack>(`/certification-packs/${id}/set-default`, {});
    return response;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/certification-packs/${id}`);
  }
}

export const certificationPackService = new CertificationPackService();
