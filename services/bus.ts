import { logDateInfo } from '@/utils/date';
import { BusBookingDetailsResponse, BusBookingFilters, BusBookingResponse } from '../types/bus';
import { apiClient } from './api';

export const busService = {
  async getBookings(filters: BusBookingFilters): Promise<BusBookingResponse> {
    try {
      // Always use local timezone today's date
      const today = logDateInfo('Bus Bookings');
      
      // Override date filters with today's date
      const finalFilters = {
        ...filters,
        from_date: today, // Always send today's date (local timezone)
        to_date: today,   // Always send today's date (local timezone)
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
