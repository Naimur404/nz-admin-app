import { ApiItem, ApiListResponse, OptionItem } from '@/types/common';
import { apiClient } from './api';

class ApiListService {
  async getApiList(): Promise<ApiItem[]> {
    try {
      const response = await apiClient.get<ApiListResponse>('/api-list');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching API list:', error);
      throw error;
    }
  }

  async getApiOptions(): Promise<OptionItem[]> {
    try {
      const apis = await this.getApiList();
      return apis.map(api => ({
        label: `${api.api_name} (${api.short_code})`,
        value: api.api_reference_code,
      }));
    } catch (error) {
      console.error('Error getting API options:', error);
      return [];
    }
  }

  async getActiveApiOptions(): Promise<OptionItem[]> {
    try {
      const apis = await this.getApiList();
      const activeApis = apis.filter(api => api.is_active === 1);
      return activeApis.map(api => ({
        label: `${api.api_name} (${api.short_code})`,
        value: api.api_reference_code,
      }));
    } catch (error) {
      console.error('Error getting active API options:', error);
      return [];
    }
  }
}

export const apiListService = new ApiListService();