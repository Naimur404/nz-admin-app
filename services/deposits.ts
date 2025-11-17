import { apiClient } from './api';

export interface DepositsParams {
  agent_type: number; // 1 for office, 2 for agent
  from_date: string; // YYYY-MM-DD format
  to_date: string; // YYYY-MM-DD format
  agent_id?: string;
  status?: string;
  market_id?: string;
  bank_name?: string;
  page: number;
  per_page: number;
}

export interface DepositItem {
  id: number;
  agent_id: number;
  market_list_id: number;
  sub_agent_id: number | null;
  transaction_id: number;
  type: number;
  issue_date: string;
  cheque_no: string | null;
  bank_name: string | null;
  bank_id: number | null;
  cheque_from: string | null;
  deposit_ac: string | null;
  reference_id: string;
  beneficiary_account_no: string | null;
  recipient_reference: string;
  cash_payment_to: string | null;
  beneficiary_name: string | null;
  bank_location: string | null;
  amount: string;
  currency: string;
  attachment: string | null;
  status: number;
  accept_or_reject_by: number;
  is_entry: number;
  remarks: string;
  agent_sl_no: string;
  agent_name: string;
  sub_agent_name: string;
  agent_mobile_no: string;
  partner_name: string;
  approve_by: string;
  payment_method: string;
  created: string;
}

export interface DepositsResponse {
  code: number;
  data: DepositItem[];
  dataCount: number;
  from: number;
  to: number;
  current_page: number;
  last_page: number;
}

export const depositsService = {
  getDeposits: async (params: DepositsParams): Promise<DepositsResponse> => {
    // Use different endpoints based on agent_type
    const endpoint = params.agent_type === 1 
      ? '/admin/office-agent-deposits'  // Office deposits
      : '/admin/agent-deposits';        // Agent deposits
    
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  },
  
  getOfficeDeposits: async (params: DepositsParams): Promise<DepositsResponse> => {
    const response = await apiClient.get('/admin/office-agent-deposits', { params });
    return response.data;
  },
  
  getAgentDeposits: async (params: DepositsParams): Promise<DepositsResponse> => {
    const response = await apiClient.get('/admin/agent-deposits', { params });
    return response.data;
  }
};