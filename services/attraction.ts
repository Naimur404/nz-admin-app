import { BookingOperationLogResponse } from '@/types/booking-operation-log';
import { AttractionBookingDetailResponse, AttractionBookingsResponse } from '@/types/attraction';
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
      const requestParams = {
        from_date: params.from_date || '', // Send empty string if not provided
        to_date: params.to_date || '',     // Send empty string if not provided
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

  async getBookingOperationLog(bookingTransId: string): Promise<BookingOperationLogResponse> {
    try {
      console.log('Getting attraction booking operation log for BookingTransactionRef:', bookingTransId);
      
      const requestData = {
        BookingTransactionRef: bookingTransId,
      };

      const response = await apiClient.post('/admin/booking-operation-log', requestData);
      console.log('Attraction booking operation log response:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('Error fetching attraction booking operation log:', error);
      throw new Error('Failed to fetch attraction booking operation log');
    }
  },
};
