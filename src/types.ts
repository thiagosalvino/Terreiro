export interface Role {
  id: string;
  name: string;
  active: boolean;
}

export interface Orixa {
  id: string;
  name: string;
  active: boolean;
}

export interface Person {
  id: string;
  type: 'consulente' | 'medium';
  full_name: string;
  social_name: string | null;
  birth_date: string | null;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  zip_code: string | null;
  address: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  entry_date: string | null;
  role_id: string | null;
  orixa1_id: string | null;
  orixa2_id: string | null;
  orixa3_id: string | null;
  participation: 'umbanda' | 'candomble' | 'umbanda/candomble' | null;
  active: boolean;
  inactive_date: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'admin' | 'medium' | 'consulente' | 'user';
  status: 'pending' | 'approved' | 'denied';
}
