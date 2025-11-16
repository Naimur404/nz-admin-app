export interface FlightBooking {
  id: number;
  booking_type: string;
  agent_id: number;
  sub_agent_id: number | null;
  booking_trans_id: string;
  pnr: string | null;
  airline_pnrs: string | null;
  total_price_buying: string;
  total_price_selling: string;
  payable_amount: string;
  receipt_path: string | null;
  routes: string;
  is_entry: number;
  booking_ref_number: string | null;
  airline_name: string;
  plating_carrier: string;
  status: string;
  currency: string;
  journey_type: {
    value: string;
  };
  created_at: string;
  ticket_issue_date: string | null;
  pay_amount_from_customer: string;
  payment_method: string;
  remarks_for_payment: string | null;
  branch: string;
  profit: string;
  payment_status: string;
  agent_sl_no: string;
  agent_name: string;
  sub_agent_name: string;
  on_process: string;
  invoice_verify: string;
  brand: string;
  market_name: string;
  ticket_number: string;
  partner_name: string;
  booking_date: string;
  on_process_time: string | null;
  confrim_date: string | null;
  selling_price: string;
}

export interface FlightBookingsResponse {
  code: number;
  data: FlightBooking[];
  flag: boolean;
  dataCount: number;
  from: number;
  to: number;
  current_page: number;
  last_page: number;
}

export interface FlightBookingFilters {
  agent_sl_or_name?: string;
  airline_name?: string;
  api_id?: string;
  booking_id_or_pnr?: string;
  from_date?: string;
  market_id?: number | null;
  page?: number;
  per_page?: number;
  staff?: string;
  status?: string;
  ticket_no?: string;
  to_date?: string;
}

export type FlightBookingType = 'office' | 'agent';