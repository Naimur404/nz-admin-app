import {
    AccountStatementFilters,
    AccountStatementResponse,
} from '../types/account-statement';
import {
    AirTicketSalesFilters,
    AirTicketSalesReportResponse,
    WalkingSalesFilters,
    WalkingSalesReportResponse
} from '../types/reports';
import { apiClient } from './api';

class ReportsService {
  async getAirTicketSalesReport(filters: AirTicketSalesFilters): Promise<AirTicketSalesReportResponse> {
    try {
      console.log('Air ticket sales report request filters:', filters);
      
      // Clean up filters - remove empty strings and null values
      const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      console.log('Cleaned filters for air ticket sales report:', cleanedFilters);

      // Use POST method instead of GET as required by the API
      const response = await apiClient.post('/admin/air-ticket-sales', cleanedFilters);
      
      console.log('Air ticket sales report response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching air ticket sales report:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      throw error;
    }
  }

  async getAccountStatement(filters: AccountStatementFilters): Promise<AccountStatementResponse> {
    try {
      console.log('Account statement request filters:', filters);
      
      // Clean up filters - remove empty strings and null values
      const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      console.log('Cleaned filters for account statement:', cleanedFilters);

      // Use POST method as required by the API
      const response = await apiClient.post('/admin/account-statement', cleanedFilters);
      
      console.log('Account statement response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching account statement:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      throw error;
    }
  }

  async getWalkingSalesReport(filters: WalkingSalesFilters): Promise<WalkingSalesReportResponse> {
    try {
      // Clean up filters - remove empty strings and null values
      const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      // Use POST method instead of GET
      const response = await apiClient.post('/admin/walking-sales-report', cleanedFilters);
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching walking sales report:', error);
      throw error;
    }
  }
}

export const reportsService = new ReportsService();