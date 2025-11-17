import { BookingOperationLogResponse } from '@/types/booking-operation-log';
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

  async getBookingOperationLog(uniqueTransId: string): Promise<BookingOperationLogResponse> {
    try {
      console.log('Getting bus booking operation log for BookingTransactionRef:', uniqueTransId);
      
      const requestData = {
        BookingTransactionRef: uniqueTransId,
      };

      const response = await apiClient.post('/admin/booking-operation-log', requestData);
      console.log('Bus booking operation log response:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('Error fetching bus booking operation log:', error);
      throw new Error('Failed to fetch bus booking operation log');
    }
  },
};
