export interface TransactionType {
  id: number;
  code: string;
  name: string;
  action: string;
}

export interface AccountStatementItem {
  id: number;
  trx_type_id: number;
  credit: string;
  debit: string;
  balance: string;
  loan_balance: string;
  currency: string;
  market_id: number;
  uniq_trx_no: string;
  trx_ref_id: number | null;
  ref_no: string | null;
  remarks: string | null;
  agent_id: number;
  staff_id: number | null;
  sub_agent_id: number | null;
  airline_pnr: string;
  pnr: string;
  trx_date: string;
  agent_sl_no: string;
  agent_name: string;
  sub_agent_name: string;
  approve_by: string;
  trx_type: TransactionType;
}

export interface AccountStatementFilters {
  agent: string;
  api_provider: number;
  from_date: string;
  market_id: number | null;
  page: number;
  per_page: number;
  ticket_number_pnr: string;
  to_date: string;
}

export interface AccountStatementResponse {
  code: number;
  data: AccountStatementItem[];
  flag: boolean;
  dataCount: number;
  from: number;
  to: number;
  current_page: number;
  last_page: number;
}