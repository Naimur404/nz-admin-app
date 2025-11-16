// API List Types
export interface ApiItem {
  id: number;
  api_name: string;
  api_code: string;
  api_reference_code: string;
  currency_code: string;
  color_code: string;
  short_code: string;
  is_default: number;
  is_active: number;
  is_enable_for_b2c: number;
  pcc_country_code: string;
  timezone: string;
  is_ticket_vendor_allow: number;
  is_auto_ticket_allow: number;
  ticket_vendor_code: string | null;
  isprovideLastTicketTime: number;
  ispassport_required: number;
  extra_service_flags: string | null;
}

export interface ApiListResponse {
  code: number;
  data: ApiItem[];
}

// Staff List Types
export interface StaffItem {
  id: number;
  name: string;
  email: string;
}

export interface StaffListResponse {
  code: number;
  data: StaffItem[];
}

// Market List Types
export interface Country {
  id: number;
  country_code: string;
  country_name: string;
  currency_code: string;
  currency_name: string | null;
  dialcode: string;
}

export interface MarketItem {
  id: number;
  market_name: string;
  currency_code: string;
  timezone: string;
  country_id: number;
  is_active: number;
  is_allow_for_b2c: number;
  country_name: string;
  country: Country;
}

export interface MarketListResponse {
  code: number;
  data: MarketItem[];
  dataCount: number;
  from: number;
  to: number;
  current_page: number;
  last_page: number;
}

// Common option type for dropdowns
export interface OptionItem {
  label: string;
  value: string | number;
}