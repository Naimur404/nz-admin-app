export interface TicketSupport {
  id: number;
  booking_type: string;
  agent_id: number;
  sub_agent_id: number | null;
  booking_trans_id: string;
  pnr: string | null;
  airline_pnrs: string | null;
  total_price_buying: string;
  booking_ref_number: string | null;
  total_price_selling: string;
  payable_amount: string;
  routes: string;
  airline_name: string;
  plating_carrier: string;
  status: string;
  is_reschedule: number;
  currency: string;
  journey_type: {
    value: string;
  };
  created_at: string;
  support_type: string;
  ticket_issue_date: string | null;
  platform_type: string;
  is_reissue: number | null;
  profit: string;
  payment_status: string;
  is_refund: number;
  agent_sl_no: string;
  agent_name: string;
  sub_agent_name: string;
  on_process: string;
  brand: string;
  market_name: string;
  ticket_number: string;
  partner_name: string;
  agent_number: string;
  booking_date: string;
  on_process_time: string | null;
  confirm_date: string | null;
}

export interface TicketSupportFilters {
  agent_sl_or_name: string;
  airline_name: string;
  api_id: string;
  booking_id_or_pnr: string;
  from_date: string;
  market_id: string;
  page: number;
  per_page: number;
  platform_type: string;
  staff: string | null;
  status: string;
  ticket_no: string;
  to_date: string;
}

export interface TicketSupportResponse {
  code: number;
  data: TicketSupport[];
  flag: boolean;
  dataCount: number;
  total_pax: number;
  total_segment: number;
  total_reissue_pax: number;
  from: number;
  to: number;
  current_page: number;
  last_page: number;
}

export interface DataCountResponse {
  ticket_in_process: number;
  b2c_ticket_in_process: number;
  agent_deposit: number;
  agent_deposit_office: number;
  flight_info: number;
  group_fare_request: number;
  void_list: number;
  cancel_request: number;
  reissue_agent_accept: number;
  reissue_agent_request: number;
  refund_agent_accept: number;
  refund_agent_request: number;
  edit_passenger_request: number;
  total_pax: number;
  total_segment: number;
  total_reissue_pax: number;
}