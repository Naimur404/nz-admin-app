import { HotelBookingDetails, HotelBookingFilters, HotelBookingsResponse } from '@/types/hotel';
import { apiClient } from './api';

export const hotelService = {
  async getBookings(filters: HotelBookingFilters = {}): Promise<HotelBookingsResponse> {
    try {
      console.log('Getting hotel bookings with filters:', filters);
      
      const requestData = {
        from_date: filters.from_date || '',
        to_date: filters.to_date || '',
        booking_id_or_pnr: filters.booking_id_or_pnr || '',
        api_id: filters.api_id || '',
        staff_id: filters.staff_id || '',
        status: filters.status || '',
        page: filters.page || 1,
        per_page: filters.per_page || 10,
        platform_type: filters.platform_type || '',
        agent_sl_or_name: filters.agent_sl_or_name || '',
      };

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