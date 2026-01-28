export interface CompanySettings {
  id: string;
  name: string | null;
  legalName: string | null;
  taxId: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanySettingsData {
  name?: string;
  legalName?: string;
  taxId?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}
