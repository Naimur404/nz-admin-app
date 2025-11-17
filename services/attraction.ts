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
      // Use today's date only as fallback if no dates provided
      const today = logDateInfo('Attraction Bookings');
      
      const requestParams = {
        from_date: params.from_date || today, // Use user date or fallback to today
        to_date: params.to_date || today,     // Use user date or fallback to today
        booking_id_or_pnr: params.booking_id_or_pnr || '',
        agent_sl_or_name: params.agent_sl_or_name || '',
        status: params.status || '',
        page: params.page || 1,
        per_page: params.per_page || 15,
      };
      
      console.log('Final attraction booking request params:', requestParams);
      
      const response = await apiClient.get<AttractionBookingsResponse>('/attractions/bookings', {
        params: requestParams,
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
