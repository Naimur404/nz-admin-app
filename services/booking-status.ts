import { apiClient } from './api';
import { BookingStatusResponse, BookingStatusMap } from '../types/bus';

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

  // Clear cache if needed
  clearCache() {
    bookingStatusCache = null;
  },
};
