import { AttractionBookingDetailResponse, AttractionBookingsResponse } from '@/types/attraction';
import { logDateInfo } from '@/utils/date';
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
      // Always use local timezone today's date
      const today = logDateInfo('Attraction Bookings');
      
      const response = await apiClient.get<AttractionBookingsResponse>('/attractions/bookings', {
        params: {
          from_date: today, // Always send today's date (local timezone)
          to_date: today,   // Always send today's date (local timezone)
          booking_id_or_pnr: params.booking_id_or_pnr || '',
          agent_sl_or_name: params.agent_sl_or_name || '',
          status: params.status || '',
          page: params.page || 1,
          per_page: params.per_page || 15,
        },
      });
      
      console.log('Final attraction booking request params:', {
        from_date: today,
        to_date: today,
        booking_id_or_pnr: params.booking_id_or_pnr || '',
        agent_sl_or_name: params.agent_sl_or_name || '',
        status: params.status || '',
        page: params.page || 1,
        per_page: params.per_page || 15,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching attraction bookings:', error);
      throw error;
    }
  },

  async getBookingDetails(bookingTransId: string): Promise<AttractionBookingDetailResponse> {
    try {
      const response = await apiClient.get<AttractionBookingDetailResponse>(`/attractions/bookings/${bookingTransId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attraction booking details:', error);
      throw error;
    }
  },
};
