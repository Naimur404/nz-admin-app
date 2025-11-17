export interface AirTicketSalesReportItem {
  id: number;
  booking_type: string;
  agent_id: number;
  market_id: number;
  booking_trans_id: string;
  currency: string;
  journey_type: string;
  airline_pnrs: string;
  total_price_buying: string;
  total_price_selling: string;
  payable_amount: string;
  routes: string;
  airline_name: string;
  plating_carrier: string;
  status: string;
  payment_id: number;
  created_at: string;
  ticket_issue_date: string | null;
  profit: string;
  payment_status: string;
  agent_sl_no: string;
  agent_name: string;
  on_process: string;
  brand: string;
  ticket_number: string;
  on_process_time: string | null;
  partner_name: string;
  booking_date: string;
  confrim_date: string | null;
}

export interface AirTicketSalesFilters {
  api_provider: string;
  booking_id_or_pnr: string;
  from_date: string;
  to_date: string;
  market_id: number | null;
  page: number;
  per_page: number;
}

export interface AirTicketSalesReportResponse {
  code: number;
  data: AirTicketSalesReportItem[];
  flag: boolean;
  dataCount: number;
  from: number;
  to: number;
  current_page: number;
  last_page: number;
}

export interface AgentAccountStatementItem {
  id: number;
  transaction_id: string;
  agent_id: number;
  agent_name: string;
  transaction_type: string;
  amount: string;
  currency: string;
  balance: string;
  description: string;
  created_at: string;
  status: string;
}

export interface AgentAccountStatementFilters {
  agent_id: number | null;
  transaction_type: string;
  from_date: string;
  to_date: string;
  page: number;
  per_page: number;
}

export interface AgentAccountStatementResponse {
  code: number;
  data: AgentAccountStatementItem[];
  flag: boolean;
  dataCount: number;
  from: number;
  to: number;
  current_page: number;
  last_page: number;
}

export interface WalkingSalesReportItem {
  id: number;
  booking_trans_id: string;
  agent_id: number;
  agent_name: string;
  customer_name: string;
  customer_phone: string;
  service_type: string;
  total_amount: string;
  currency: string;
  payment_method: string;
  payment_status: string;
  booking_date: string;
  created_at: string;
  status: string;
}

export interface WalkingSalesFilters {
  agent_id: number | null;
  service_type: string;
  payment_status: string;
  from_date: string;
  to_date: string;
  page: number;
  per_page: number;
}

export interface WalkingSalesReportResponse {
  code: number;
  data: WalkingSalesReportItem[];
  flag: boolean;
  dataCount: number;
  from: number;
  to: number;
  current_page: number;
  last_page: number;
}