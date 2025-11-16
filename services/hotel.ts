import { HotelBookingDetails, HotelBookingFilters, HotelBookingsResponse } from '@/types/hotel';
import { logDateInfo } from '@/utils/date';
import { apiClient } from './api';

export const hotelService = {
  async getBookings(filters: HotelBookingFilters = {}): Promise<HotelBookingsResponse> {
    try {
      console.log('Getting hotel bookings with filters:', filters);
      
      // Always use local timezone today's date
      const today = logDateInfo('Hotel Bookings');
      
      const requestData = {
        from_date: today,  // Always send today's date (local timezone)
        to_date: today,    // Always send today's date (local timezone)
        booking_id_or_pnr: filters.booking_id_or_pnr || '',
        api_id: filters.api_id || '',
        staff_id: filters.staff_id || '',
        status: filters.status || '',
        page: filters.page || 1,
        per_page: filters.per_page || 10,
        platform_type: filters.platform_type || '',
        agent_sl_or_name: filters.agent_sl_or_name || '',
      };

      console.log('Final hotel booking request data:', requestData);
      
      const response = await apiClient.post('/admin/hotel-booking-list', requestData);
      console.log('Hotel bookings response:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('Error fetching hotel bookings:', error);
      throw new Error('Failed to fetch hotel bookings');
    }
  },

  async getBookingDetails(uniqueTransId: string): Promise<HotelBookingDetails> {
    try {
      console.log('Getting hotel booking details for transaction ID:', uniqueTransId);
      
      const response = await apiClient.get(`/admin/hotel-booking-details/${uniqueTransId}`);
      console.log('Hotel booking details response:', response.data);

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching hotel booking details:', error);
      throw new Error('Failed to fetch hotel booking details');
    }
  },
};