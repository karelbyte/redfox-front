export interface EmailConfig {
  id: string;
  host: string;
  port: number;
  user: string;
  fromEmail: string;
  fromName: string;
  secure: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailConfigDto {
  host: string;
  port: number;
  user: string;
  password: string;
  fromEmail: string;
  fromName?: string;
  secure?: boolean;
}

export interface UpdateEmailConfigDto extends Partial<CreateEmailConfigDto> {}
