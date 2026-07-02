import { CompanyRole } from '@/src/enums/company.enum'

export interface CompanyResponse {
  id: string;
  name: string;
  taxCode: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  status: string;
  industry?: string;
  size?: string;
}

export interface CompanyMemberResponse {
  id: string
  userId: string
  email: string
  firstName: string
  lastName: string
  role: CompanyRole
  createdAt: string
}

export interface GetCompaniesParams {
  keyword?: string
  page?: number
  size?: number
}
