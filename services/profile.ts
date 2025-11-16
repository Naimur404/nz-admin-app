import { ProfileResponse } from '@/types/profile';
import { apiClient } from './api';

export const profileService = {
  async getUserProfile(): Promise<ProfileResponse> {
    try {
      console.log('Making API call to /auth/user-profile...');
      const response = await apiClient.get<ProfileResponse>('/auth/user-profile');
      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers);
      console.log('API Response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      throw error;
    }
  },
};