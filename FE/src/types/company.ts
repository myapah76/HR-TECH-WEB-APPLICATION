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
}

export interface CompanyMemberResponse {
  id: string
  userId: string
  email: string
  firstName: string
  lastName: string
  role: 'OWNER' | 'HR_MANAGER' | 'HR'
  createdAt: string
}
