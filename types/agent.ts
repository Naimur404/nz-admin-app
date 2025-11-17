export interface AgentFilters {
  status: string;
  agent_info: string;
  partner: string;
  market_id: string;
  agent_category: string;
  agent_type: string;
  verified_status: string;
  activity_status: string;
  page: number;
  per_page: number;
}

export interface AgentDocument {
  id: number;
  agent_id: number;
  new_agent_id: number | null;
  market_id: number;
  name: string;
  required_document_id: number;
  file: string;
  is_validated: number;
}

export interface AgentAddress {
  email: string;
  currency: string;
  license: string | null;
  contact: string;
  address: string;
  zip_code: string;
  office_number: string;
  contact_number: string;
  opening_time: string | null;
  flight_info: string | null;
  is_default: number;
}

export interface AgentBalance {
  id: number;
  agent_id?: number;
  currency: string;
  market_id: number;
  balance: string;
  loan_balance?: string;
  credit_limit?: string;
  is_active: number;
  market_name?: string;
}

export interface AgentDetails {
  sub_partner_id: number | null;
  agent_type: number;
  agent_category: number;
  agent_profile: string;
  email: string;
  company_name: string;
  contact_person: string;
  iata_number: string | null;
  ssm_certificate: string | null;
  currency: string;
  market_id: number;
  reference: string | null;
  is_show_brand: number;
  is_validated: number;
  address: string;
  zip_code: string;
  market_email: string;
  office_number: string;
  contact_number: string;
  opening_time: string | null;
  flight_info: string | null;
  sl_no: string;
  status: number;
  activity: number;
  join_date: string;
  balance: string;
  loan_balance: string;
  loan_validity: string | null;
  credit_limit: string;
  available_markets: Array<{
    market_id: number;
    currency: string;
    is_active: number;
    is_default: number;
    market_name: string;
  }>;
  agent_addresses: AgentAddress[];
  agent_documents: AgentDocument[];
  partner: {
    country_code: string;
    company_name: string;
    director_name: string;
    office_email: string;
    state: string;
    partner_commision: string;
    kpp_ln_number: string;
    company_reg_number: string;
    director_phone_number: string;
    office_address: string;
    zipcode: string;
    reg_key: string;
    staff_id: number | null;
    contact_no: string;
    agreement_period: number;
    type: number;
    status: number;
    join_date: string;
    partner_code: string;
    attachments: any[];
  };
  agent_balances: AgentBalance[];
}

export interface AgentDetailsResponse {
  code: number;
  data: AgentDetails;
  otp_status: number;
  is_vendor_allowed: number;
}

export interface AgentItem {
  id: number;
  partner_id: number;
  sub_partner_id: number;
  agent_type: number;
  agent_category: number;
  agent_profile: string;
  email: string;
  company_name: string;
  contact_person: string;
  iata_number: string | null;
  ssm_certificate: string | null;
  currency: string;
  market_id: number;
  reference: string;
  is_show_brand: number;
  is_validated: number;
  market_list: string;
  otp_status: number;
  address: string;
  zip_code: string;
  market_email: string;
  office_number: string;
  contact_number: string;
  opening_time: string | null;
  flight_info: string | null;
  sl_no: string;
  status: number;
  activity: number;
  join_date: string;
  balance: string;
  loan_balance: string;
  loan_validity: string | null;
  credit_limit: string;
  available_markets: Array<{
    market_id: number;
    currency: string;
    is_active: number;
    is_default: number;
    market_name: string;
  }>;
  country: {
    country_code: string;
    country_name: string;
    currency_code: string;
    currency_name: string | null;
  };
  partner: {
    country_code: string;
    company_name: string;
    director_name: string;
    office_email: string;
    state: string;
    partner_commision: string;
    kpp_ln_number: string;
    company_reg_number: string;
    director_phone_number: string;
    office_address: string;
    zipcode: string;
    reg_key: string;
    staff_id: number | null;
    contact_no: string;
    agreement_period: number;
    type: number;
    status: number;
    join_date: string;
    partner_code: string;
  };
  agent_balances: Array<{
    id: number;
    currency: string;
    market_id: number;
    balance: string;
    is_active: number;
  }>;
  last_transaction: any;
}

export interface AgentListResponse {
  code: number;
  flag: boolean;
  data: AgentItem[];
  dataCount: number;
  from: number;
  to: number;
  current_page: number;
  last_page: number;
}

export interface Partner {
  id: number;
  company_name: string;
  partner_code: string;
}

export interface PartnerListResponse {
  code: number;
  data: Partner[];
}