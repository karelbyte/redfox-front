import { api } from './api';
import { CertificationPack, CertificationPackFormData, CertificationPackEmitter } from '@/types/certification-pack';

class CertificationPackService {
  async getAll(): Promise<CertificationPack[]> {
    const response = await api.get<CertificationPack[]>('/certification-packs');
    return response;
  }

  async getActive(): Promise<CertificationPack | null> {
    const response = await api.get<CertificationPack | null>('/certification-packs/active');
    return response;
  }

  async getAvailableEmitters(): Promise<CertificationPackEmitter[]> {
    const response = await api.get<CertificationPackEmitter[]>('/certification-packs/available-emitters');
    return response;
  }

  async getById(id: string): Promise<CertificationPack> {
    const response = await api.get<CertificationPack>(`/certification-packs/${id}`);
    return response;
  }

  async create(data: CertificationPackFormData): Promise<CertificationPack> {
    const response = await api.post<CertificationPack>('/certification-packs', data as unknown as Record<string, unknown>);
    return response;
  }

  async update(id: string, data: Partial<CertificationPackFormData>): Promise<CertificationPack> {
    const response = await api.patch<CertificationPack>(`/certification-packs/${id}`, data as unknown as Record<string, unknown>);
    return response;
  }

  async setDefault(id: string): Promise<CertificationPack> {
    const response = await api.patch<CertificationPack>(`/certification-packs/${id}/set-default`, {});
    return response;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/certification-packs/${id}`);
  }

  async addEmitter(packId: string, emitter: Omit<CertificationPackEmitter, 'id'>): Promise<CertificationPackEmitter> {
    const response = await api.post<CertificationPackEmitter>(`/certification-packs/${packId}/emitters`, emitter);
    return response;
  }

  async updateEmitter(packId: string, emitterId: string, emitter: Omit<CertificationPackEmitter, 'id'>): Promise<CertificationPackEmitter> {
    const response = await api.patch<CertificationPackEmitter>(`/certification-packs/${packId}/emitters/${emitterId}`, emitter);
    return response;
  }

  async removeEmitter(packId: string, emitterId: string): Promise<void> {
    await api.delete(`/certification-packs/${packId}/emitters/${emitterId}`);
  }
}

export const certificationPackService = new CertificationPackService();
