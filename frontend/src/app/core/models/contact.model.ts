export interface Contact {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  email: string | null;
  callCount: number;
  lastCallAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactListResponse {
  data: Contact[];
  total: number;
  page: number;
  limit: number;
}

export interface ContactRequest {
  phone: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
}
