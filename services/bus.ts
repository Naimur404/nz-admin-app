import { logDateInfo } from '@/utils/date';
import { BusBookingDetailsResponse, BusBookingFilters, BusBookingResponse } from '../types/bus';
import { apiClient } from './api';

export const busService = {
  async getBookings(filters: BusBookingFilters): Promise<BusBookingResponse> {
    try {
      console.log('Final bus booking request filters:', filters);
      
      const response = await apiClient.get<BusBookingResponse>('/bus/bookings', {
        params: filters,
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
