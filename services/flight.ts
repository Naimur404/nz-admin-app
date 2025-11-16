import { BookingOperationLogResponse } from '@/types/booking-operation-log';
import { FlightBookingFilters, FlightBookingsResponse, FlightBookingType } from '@/types/flight';
import { FlightBookingDetailsResponse } from '@/types/flight-details';
import { logDateInfo } from '@/utils/date';
import { apiClient } from './api';
import { bookingStatusService } from './booking-status';

export const flightService = {
  async getBookings(type: FlightBookingType, filters: FlightBookingFilters = {}): Promise<FlightBookingsResponse> {
    try {
      console.log(`Getting ${type} flight bookings with filters:`, filters);
      
      // Always use local timezone today's date
      const today = logDateInfo(`Flight Bookings (${type})`);
      
      // Convert status string to index if status filter is provided
      let statusValue = filters.status || '';
      if (statusValue && statusValue !== '') {
        try {
          const statuses = await bookingStatusService.getBookingStatuses();
          const statusIndex = bookingStatusService.getStatusIndex(statuses, statusValue);
          statusValue = statusIndex > 0 ? statusIndex.toString() : '';
        } catch (error) {
          console.warn('Failed to convert status to index, using string:', error);
        }
      }
      
      const requestData = {
        agent_sl_or_name: filters.agent_sl_or_name || '',
        airline_name: filters.airline_name || '',
        api_id: filters.api_id || '',
        booking_id_or_pnr: filters.booking_id_or_pnr || '',
        from_date: today,  // Always send today's date (local timezone)
        market_id: filters.market_id || null,
        page: filters.page || 1,
        per_page: filters.per_page || 10,
        staff: filters.staff || '',
        status: statusValue,
        ticket_no: filters.ticket_no || '',
        to_date: today,    // Always send today's date (local timezone)
      };

      console.log(`Final ${type} flight booking request data:`, requestData);
      
      const endpoint = `/admin/my-booking/${type}`;
      const response = await apiClient.post(endpoint, requestData);
      console.log(`${type} flight bookings response:`, response.data);

      return response.data;
    } catch (error: any) {
      console.error(`Error fetching ${type} flight bookings:`, error);
      throw new Error(`Failed to fetch ${type} flight bookings`);
    }
  },

  async getBookingDetails(bookingTransactionRef: string): Promise<FlightBookingDetailsResponse> {
    try {
      console.log('Getting flight booking details for BookingTransactionRef:', bookingTransactionRef);
      
      const requestData = {
        BookingTransactionRef: bookingTransactionRef,
      };

      const response = await apiClient.post('/admin/air-booking-details', requestData);
      console.log('Flight booking details response:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('Error fetching flight booking details:', error);
      throw new Error('Failed to fetch flight booking details');
    }
  },

  async getBookingOperationLog(bookingTransactionRef: string): Promise<BookingOperationLogResponse> {
    try {
      console.log('Getting booking operation log for BookingTransactionRef:', bookingTransactionRef);
      
      const requestData = {
        BookingTransactionRef: bookingTransactionRef,
      };

      const response = await apiClient.post('/admin/booking-operation-log', requestData);
      console.log('Booking operation log response:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('Error fetching booking operation log:', error);
      throw new Error('Failed to fetch booking operation log');
    }
  },
};