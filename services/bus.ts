import { apiClient } from './api';
import { BusBookingFilters, BusBookingResponse, BusBookingDetailsResponse } from '../types/bus';

export const busService = {
  async getBookings(filters: BusBookingFilters): Promise<BusBookingResponse> {
    try {
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
