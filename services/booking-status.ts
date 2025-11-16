import { BookingStatusMap, BookingStatusResponse } from '../types/bus';
import { apiClient } from './api';

let bookingStatusCache: BookingStatusMap | null = null;

export const bookingStatusService = {
  async getBookingStatuses(): Promise<BookingStatusMap> {
    try {
      // Return cached data if available
      if (bookingStatusCache) {
        return bookingStatusCache;
      }

      const response = await apiClient.get<BookingStatusResponse>('/booking-status');
      
      // Cache the data
      bookingStatusCache = response.data.data;
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching booking statuses:', error);
      throw error;
    }
  },

  // Get status label by value (e.g., "CONFIRMED" returns "CONFIRMED")
  getStatusLabel(statuses: BookingStatusMap, statusValue: string): string {
    return statusValue;
  },

  // Get all status values as array (for dropdowns)
  getStatusOptions(statuses: BookingStatusMap): Array<{ label: string; value: string }> {
    return Object.entries(statuses).map(([key, value]) => ({
      label: value,
      value: value, // Use the status name, not the index
    }));
  },

  // Get status options with index IDs for flight bookings
  getFlightStatusOptions(statuses: BookingStatusMap): Array<{ label: string; value: string; index: number }> {
    return Object.entries(statuses).map(([key, value], index) => ({
      label: value,
      value: value, // Display value
      index: index + 1, // Index starting from 1
    }));
  },

  // Get status index by status value
  getStatusIndex(statuses: BookingStatusMap, statusValue: string): number {
    const statusArray = Object.values(statuses);
    const index = statusArray.findIndex(status => status === statusValue);
    return index >= 0 ? index + 1 : 0; // Return 1-based index
  },

  // Clear cache if needed
  clearCache() {
    bookingStatusCache = null;
  },
};
