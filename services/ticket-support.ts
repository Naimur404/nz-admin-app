import { DataCountResponse, TicketSupportFilters, TicketSupportResponse } from '@/types/ticket-support';
import { apiClient } from './api';

export const ticketSupportService = {
  async getTicketSupport(filters: TicketSupportFilters = {} as TicketSupportFilters): Promise<TicketSupportResponse> {
    try {
      console.log('Getting ticket support data with filters:', filters);
      
      // Build request data and exclude null/empty values
      const requestData: any = {
        page: filters.page || 1,
        per_page: filters.per_page || 20,
      };

      // Only add non-empty string fields
      if (filters.agent_sl_or_name && filters.agent_sl_or_name.trim()) {
        requestData.agent_sl_or_name = filters.agent_sl_or_name;
      }
      if (filters.airline_name && filters.airline_name.trim()) {
        requestData.airline_name = filters.airline_name;
      }
      if (filters.api_id && filters.api_id.trim()) {
        requestData.api_id = filters.api_id;
      }
      if (filters.booking_id_or_pnr && filters.booking_id_or_pnr.trim()) {
        requestData.booking_id_or_pnr = filters.booking_id_or_pnr;
      }
      if (filters.from_date && filters.from_date.trim()) {
        requestData.from_date = filters.from_date;
      }
      if (filters.to_date && filters.to_date.trim()) {
        requestData.to_date = filters.to_date;
      }
      if (filters.market_id && filters.market_id.trim()) {
        requestData.market_id = filters.market_id;
      }
      if (filters.platform_type && filters.platform_type.trim()) {
        requestData.platform_type = filters.platform_type;
      }
      if (filters.status && filters.status.trim()) {
        requestData.status = filters.status; // Now sends index number (1, 2, 3)
      }
      if (filters.ticket_no && filters.ticket_no.trim()) {
        requestData.ticket_no = filters.ticket_no;
      }
      if (filters.staff && filters.staff.trim()) {
        requestData.staff = filters.staff;
      }

      console.log('Final request data:', requestData);

      const response = await apiClient.post('/admin/ticket-support', requestData);
      console.log('Ticket support response:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('Error fetching ticket support data:', error);
      throw new Error('Failed to fetch ticket support data');
    }
  },

  async getDataCount(): Promise<DataCountResponse> {
    try {
      console.log('Getting data count');
      
      const response = await apiClient.get('/admin/data-count');
      console.log('Data count response:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('Error fetching data count:', error);
      throw new Error('Failed to fetch data count');
    }
  },
};