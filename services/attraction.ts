import { AttractionBookingsResponse } from '@/types/attraction';
import { apiClient } from './api';

interface GetAttractionBookingsParams {
  from_date?: string;
  to_date?: string;
  booking_id_or_pnr?: string;
  agent_sl_or_name?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export const attractionService = {
  async getBookings(params: GetAttractionBookingsParams = {}): Promise<AttractionBookingsResponse> {
    try {
      const response = await apiClient.get<AttractionBookingsResponse>('/attractions/bookings', {
        params: {
          from_date: params.from_date || '',
          to_date: params.to_date || '',
          booking_id_or_pnr: params.booking_id_or_pnr || '',
          agent_sl_or_name: params.agent_sl_or_name || '',
          status: params.status || '',
          page: params.page || 1,
          per_page: params.per_page || 15,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching attraction bookings:', error);
      throw error;
    }
  },
};
