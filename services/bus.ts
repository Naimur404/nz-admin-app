import { logDateInfo } from '@/utils/date';
import { BusBookingDetailsResponse, BusBookingFilters, BusBookingResponse } from '../types/bus';
import { apiClient } from './api';

export const busService = {
  async getBookings(filters: BusBookingFilters): Promise<BusBookingResponse> {
    try {
      // Use today's date only as fallback if no dates provided
      const today = logDateInfo('Bus Bookings');
      
      // Use user-selected dates or fallback to today
      const finalFilters = {
        ...filters,
        from_date: filters.from_date || today, // Use user date or fallback to today
        to_date: filters.to_date || today,     // Use user date or fallback to today
      };
      
      console.log('Final bus booking request filters:', finalFilters);
      
      const response = await apiClient.get<BusBookingResponse>('/bus/bookings', {
        params: finalFilters,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching bus bookings:', error);
      throw error;
    }
  },

  async getBookingDetails(uniqueTransId: string): Promise<BusBookingDetailsResponse> {
    try {
      const response = await apiClient.get<BusBookingDetailsResponse>('/bus/booking-details', {
        params: { UniqueTransID: uniqueTransId },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  },
};
