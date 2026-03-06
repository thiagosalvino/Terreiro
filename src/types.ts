export interface Role {
  id: number;
  name: string;
  active: number;
}

export interface Orixa {
  id: number;
  name: string;
  active: number;
}

export interface Person {
  id: number;
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
  role_id: number | null;
  orixa1_id: number | null;
  orixa2_id: number | null;
  orixa3_id: number | null;
  participation: 'umbanda' | 'candomble' | 'umbanda/candomble' | null;
  active: number;
  inactive_date: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}
