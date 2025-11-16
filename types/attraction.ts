export interface AttractionPassenger {
  id: number;
  title: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  email: string;
  phone: string;
  country_code: string;
  document_number: string | null;
  is_lead_passenger: boolean;
  ticket_status: string;
  ticket_number: string | null;
  ticket_format: string | null;
}

export interface AttractionAgentInfo {
  sl_no: string;
  agent_name: string;
  email: string;
  agent_address: string | null;
  opening_hour: string | null;
  contact_number: string | null;
  flight_info: string | null;
  logo: string;
}

export interface AttractionBooking {
  booking_id: number;
  booking_trans_id: string;
  booking_ref_number: string;
  pnr: string;
  booking_status: string;
  status: string;
  product_name: string;
  package_name: string;
  category: string;
  visited_date: string;
  time_slot: string | null;
  remarks_for_payment: string | null;
  receipt_path: string | null;
  pay_amount_from_customer: string;
  payment_method: string;
  branch: string;
  total_passengers: number;
  total_price_selling: string;
  total_price_buying: string;
  currency: string;
  ticketing_time_limit: string;
  is_cancellable: boolean;
  is_ticket_ready: boolean;
  support_type: string;
  ticket_status: string;
  gateway_fee: string;
  created_at: string;
  refund_request_status: string | null;
  refund_time_limit: string | null;
  refund_amount: string;
  refund_charges: string;
  service_charge: string;
  refund_reason: string | null;
  support_date_time: string | null;
  support_staff: string;
  agent_info: AttractionAgentInfo;
  passengers: AttractionPassenger[];
}

export interface AttractionBookingsResponse {
  success: boolean;
  message: string;
  data: AttractionBooking[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  code: number;
}
