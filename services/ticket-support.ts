import { DataCountResponse, TicketSupportFilters, TicketSupportResponse } from '@/types/ticket-support';
import { apiClient } from './api';

export const ticketSupportService = {
  async getTicketSupport(filters: TicketSupportFilters = {} as TicketSupportFilters): Promise<TicketSupportResponse> {
    try {
      console.log('Getting ticket support data with filters:', filters);
      
      // Set default values including today's date
      const today = new Date().toISOString().split('T')[0];
      
      const requestData = {
        agent_sl_or_name: filters.agent_sl_or_name || '',
        airline_name: filters.airline_name || '',
        api_id: filters.api_id || '',
        booking_id_or_pnr: filters.booking_id_or_pnr || '',
        from_date: filters.from_date || today,
        market_id: filters.market_id || '',
        page: filters.page || 1,
        per_page: filters.per_page || 20,
        platform_type: filters.platform_type || '',
        staff: filters.staff || null,
        status: filters.status || '',
        ticket_no: filters.ticket_no || '',
        to_date: filters.to_date || today,
      };

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