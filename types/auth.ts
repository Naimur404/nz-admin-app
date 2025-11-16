export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  country_code: string;
  market_list_id: number;
  name: string;
  avatar: string | null;
  panel: string;
  user_type: string;
  email: string;
  contact: string;
  otp_status: number;
  is_vendor_allowed: number;
  sub_partner: any | null;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
  panel: string;
}
