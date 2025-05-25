'use client';

interface MeasurementUnit {
  id: string;
  code: string;
  description: string;
  status: boolean;
  created_at: string;
}

interface PaginatedResponse {
  data: MeasurementUnit[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const measurementUnitsService = {
  async getMeasurementUnits(page: number = 1, limit: number = 10): Promise<PaginatedResponse> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/api/measurement-units?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener las unidades de medida');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async createMeasurementUnit(data: Omit<MeasurementUnit, 'id' | 'created_at'>): Promise<MeasurementUnit> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/measurement-units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear la unidad de medida');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async updateMeasurementUnit(id: string, data: Partial<MeasurementUnit>): Promise<MeasurementUnit> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/measurement-units/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la unidad de medida');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async deleteMeasurementUnit(id: string): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/measurement-units/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la unidad de medida');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
}; 