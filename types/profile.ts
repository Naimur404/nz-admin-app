export interface UserProfile {
  agent: any | null;
  api_user: any | null;
  avatar: string | null;
  contact: string;
  country_code: string;
  email: string;
  is_vendor_allowed: number;
  name: string;
  panel: string;
  partner: any | null;
  sub_agent: any | null;
  sub_partner: any | null;
  user_type: string;
}

export interface ProfileResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
}